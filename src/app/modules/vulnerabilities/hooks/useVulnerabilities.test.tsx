import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { VulnerabilitiesResponse } from "@/app/shared/types/vulnerabilities";
import VulnerabilitiesTable from "@/app/components/vulnerabilities/table/VulnerabilitiesTable";
import { __resetVulnerabilitiesState, useVulnerabilities } from "./useVulnerabilities";

const { searchParams, replace } = vi.hoisted(() => ({
  searchParams: new URLSearchParams(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
  usePathname: () => "/en/vulnerabilities",
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/app/shared/utils/indexedDbCache", () => ({
  getCachedItemEntry: vi.fn().mockResolvedValue(null),
  setCachedItem: vi.fn(),
  getKvItem: vi.fn().mockResolvedValue(null),
  setKvItem: vi.fn(),
  CACHE_KEYS: { VULNERABILITIES: "vulnerabilities" },
  KV_KEYS: { TEAM_PREFERENCES: "team-preferences" },
}));

vi.mock("@/app/shared/utils/cacheRevalidation", () => ({
  needsRevalidation: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/app/shared/hooks/useSyncEvents", () => ({
  useSyncEvents: () => ({ isSyncing: false }),
}));

const data: VulnerabilitiesResponse = {
  teams: [{
    team: "example-team",
    workloads: [{
      id: "workload-1",
      name: "example-app",
      environment: "prod-gcp",
      vulnerabilities: [{
        identifier: "CVE-2026-1234",
        packageName: "example-package",
        riskScore: 80,
      }],
    }],
  }],
};

describe("useVulnerabilities URL CVE filters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetVulnerabilitiesState();
    sessionStorage.clear();
    searchParams.delete("cve");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => data,
    }));
  });

  it.each([
    ["CVE-2026-111497", []],
    ["CVE-2026-1234", ["CVE-2026-1234"]],
    ["CVE-2026-1234,CVE-2026-111497", ["CVE-2026-1234"]],
  ])("preserves the query filter %s after loading workloads", async (query, expectedCves) => {
    searchParams.set("cve", query);
    let current: ReturnType<typeof useVulnerabilities> | undefined;

    function FilteredTable() {
      current = useVulnerabilities();
      return current.data ? <VulnerabilitiesTable {...current} data={current.data} /> : null;
    }

    render(<FilteredTable />);

    await waitFor(() => expect(current?.isLoading).toBe(false));
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 550));
    });

    expect(current?.cveFilters).toEqual(
      Object.fromEntries(query.split(",").map((cve) => [cve, true])),
    );
    expect(screen.getAllByRole("row")).toHaveLength(expectedCves.length + 1);
    for (const cve of expectedCves) {
      expect(screen.getByRole("cell", { name: cve })).toBeInTheDocument();
    }

    expect(replace).toHaveBeenCalled();
    const updatedUrl = new URL(replace.mock.lastCall?.[0], window.location.origin);
    expect(updatedUrl.searchParams.get("cve")).toBe(query);

    act(() => current?.setCveFilters({}));
    expect(screen.getByRole("cell", { name: "CVE-2026-1234" })).toBeInTheDocument();
  });

  it("still clears a CVE that no longer matches after changing teams", async () => {
    searchParams.set("cve", "CVE-2026-1234");
    const { result } = renderHook(() => useVulnerabilities());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setTeamFilters({ "another-team": true }));

    expect(result.current.cveFilters).toEqual({});
  });
});
