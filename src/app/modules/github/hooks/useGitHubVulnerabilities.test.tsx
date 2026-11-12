import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { VulnerabilitiesResponse } from "@/app/shared/types/vulnerabilities";
import { useSyncEvents } from "@/app/shared/hooks/useSyncEvents";
import { getCachedItemEntry } from "@/app/shared/utils/indexedDbCache";
import { needsRevalidation } from "@/app/shared/utils/cacheRevalidation";
import { useGitHubVulnerabilities } from "./useGitHubVulnerabilities";

vi.mock("@/app/shared/hooks/useSyncEvents", () => ({
  useSyncEvents: vi.fn(),
}));

vi.mock("@/app/shared/utils/indexedDbCache", () => ({
  getCachedItemEntry: vi.fn(),
  setCachedItem: vi.fn(),
  CACHE_KEYS: { GITHUB: "github" },
}));

vi.mock("@/app/shared/utils/cacheRevalidation", () => ({
  needsRevalidation: vi.fn(),
}));

function dataSyncedAt(lastSyncedAt?: string): VulnerabilitiesResponse {
  return {
    teams: [{ team: "example-team", workloads: [], repositories: [], lastSyncedAt }],
  };
}

function syncCallbacks() {
  const options = vi.mocked(useSyncEvents).mock.lastCall?.[0];
  if (!options) throw new Error("Sync event subscription is missing");
  return options;
}

describe("useGitHubVulnerabilities sync", () => {
  const fetchMock = vi.fn<typeof fetch>();
  const staleData = dataSyncedAt("2020-01-01T00:00:00Z");

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    vi.stubGlobal("fetch", fetchMock);
    vi.mocked(getCachedItemEntry).mockResolvedValue(null);
    vi.mocked(needsRevalidation).mockResolvedValue(true);
    vi.mocked(useSyncEvents).mockReturnValue({
      isSyncing: false,
      isGitHubSyncing: false,
    });
    fetchMock.mockImplementation(async (url) =>
      url === "/api/github/refresh"
        ? Response.json({}, { status: 202 })
        : Response.json(staleData)
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("automatically syncs stale data once and keeps it visible until fresh data arrives", async () => {
    const { result, rerender } = renderHook(() => useGitHubVulnerabilities());

    await waitFor(() => expect(result.current.isRefreshing).toBe(true));
    expect(result.current.data).toEqual(staleData);
    expect(result.current.isLoading).toBe(false);
    expect(fetchMock).toHaveBeenCalledWith("/api/github/refresh");

    const freshData = dataSyncedAt(new Date().toISOString());
    fetchMock.mockResolvedValueOnce(Response.json(freshData));
    await act(async () => {
      await syncCallbacks().onGitHubSyncComplete?.();
    });

    expect(result.current.data).toEqual(freshData);
    expect(result.current.isRefreshing).toBe(false);
    rerender();
    expect(fetchMock.mock.calls.filter(([url]) => url === "/api/github/refresh")).toHaveLength(1);
  });

  it("syncs stale GitHub data even when the browser cache is recent", async () => {
    vi.mocked(getCachedItemEntry).mockResolvedValue({
      data: staleData,
      meta: { updatedAt: Date.now(), appVersion: "test" },
    });
    vi.mocked(needsRevalidation).mockResolvedValue(false);

    const { result } = renderHook(() => useGitHubVulnerabilities());

    await waitFor(() => expect(result.current.isRefreshing).toBe(true));
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith("/api/github/refresh");

    await act(async () => {
      await syncCallbacks().onGitHubSyncComplete?.();
    });
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.isDataStale).toBe(true);
    expect(fetchMock.mock.calls.filter(([url]) => url === "/api/github/refresh")).toHaveLength(1);
  });

  it("does not automatically sync fresh data", async () => {
    fetchMock.mockResolvedValue(Response.json(dataSyncedAt(new Date().toISOString())));
    const { result } = renderHook(() => useGitHubVulnerabilities());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isRefreshing).toBe(false);
    expect(fetchMock).not.toHaveBeenCalledWith("/api/github/refresh");
  });

  it("automatically syncs data without a sync timestamp", async () => {
    fetchMock.mockImplementation(async (url) =>
      url === "/api/github/refresh"
        ? Response.json({}, { status: 202 })
        : Response.json(dataSyncedAt())
    );
    const { result } = renderHook(() => useGitHubVulnerabilities());

    await waitFor(() => expect(result.current.isRefreshing).toBe(true));
    expect(fetchMock).toHaveBeenCalledWith("/api/github/refresh");
  });

  it("does not start a duplicate sync when one is already running", async () => {
    vi.mocked(useSyncEvents).mockReturnValue({
      isSyncing: false,
      isGitHubSyncing: true,
    });
    const { result } = renderHook(() => useGitHubVulnerabilities());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetchMock).not.toHaveBeenCalledWith("/api/github/refresh");
  });

  it("keeps refresh progress active when cache revalidation finishes during a sync", async () => {
    vi.mocked(getCachedItemEntry).mockResolvedValue({
      data: staleData,
      meta: { updatedAt: 0, appVersion: "test" },
    });
    let resolveRevalidation: (response: Response) => void = () => {
      throw new Error("Revalidation request has not started");
    };
    fetchMock.mockImplementation((url) =>
      url === "/api/github/refresh"
        ? Promise.resolve(Response.json({}, { status: 202 }))
        : new Promise<Response>((resolve) => {
            resolveRevalidation = resolve;
          })
    );
    const { result } = renderHook(() => useGitHubVulnerabilities());

    await waitFor(() => expect(result.current.isRefreshing).toBe(true));
    await act(async () => resolveRevalidation(Response.json(staleData)));

    expect(result.current.isRefreshing).toBe(true);
    expect(result.current.data).toEqual(staleData);
  });

  it("reports a rejected refresh without automatically retrying and allows a manual retry", async () => {
    const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockImplementation(async (url) =>
      url === "/api/github/refresh"
        ? Response.json({}, { status: 503 })
        : Response.json(staleData)
    );
    const { result, rerender } = renderHook(() => useGitHubVulnerabilities());

    await waitFor(() => expect(result.current.refreshError).toBe(true));
    expect(result.current.isRefreshing).toBe(false);
    expect(errorLog).toHaveBeenCalled();
    rerender();
    expect(fetchMock.mock.calls.filter(([url]) => url === "/api/github/refresh")).toHaveLength(1);

    fetchMock.mockResolvedValueOnce(Response.json({}, { status: 202 }));
    await act(async () => result.current.refresh());
    expect(result.current.refreshError).toBe(false);
    expect(result.current.isRefreshing).toBe(true);
  });

  it("reports an interrupted sync and stops showing refresh progress", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { result } = renderHook(() => useGitHubVulnerabilities());

    await waitFor(() => expect(result.current.isRefreshing).toBe(true));
    act(() => syncCallbacks().onGitHubSyncError?.());

    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.refreshError).toBe(true);
  });

  it("re-fetches data if the completion event never arrives", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useGitHubVulnerabilities());
    await act(async () => {});
    expect(result.current.isRefreshing).toBe(true);

    const freshData = dataSyncedAt(new Date().toISOString());
    fetchMock.mockResolvedValueOnce(Response.json(freshData));
    await act(async () => vi.advanceTimersByTimeAsync(60_000));

    expect(result.current.data).toEqual(freshData);
    expect(result.current.isRefreshing).toBe(false);
  });
});
