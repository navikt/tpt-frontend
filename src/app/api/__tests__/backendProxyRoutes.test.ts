// @vitest-environment node

import { getToken, requestOboToken } from "@navikt/oasis";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  mockSecurityStatusPayload,
  mockVulnerabilitiesPayload,
} from "@/app/mocks/mockPayloads";
import { GET as getTeamVulnerabilities } from "../admin/vulnerabilities/team/[teamSlug]/route";
import { GET as searchVulnerabilities } from "../admin/vulnerability-search/route";
import { POST as collect } from "../datacollector/collect/route";
import { GET as debug } from "../debug/route";
import { GET as refreshGithub } from "../github/refresh/route";
import { GET as getSecurityStatus } from "../security-status/route";

vi.mock("@navikt/oasis", () => ({
  getToken: vi.fn(),
  requestOboToken: vi.fn(),
}));

const fetchMock = vi.fn<typeof fetch>();

describe("backend proxy route variations", () => {
  beforeEach(() => {
    vi.stubEnv("MOCKS_ENABLED", "false");
    vi.stubEnv("LOCAL_DEV", "false");
    vi.stubEnv("TPT_BACKEND_URL", "http://backend");
    vi.stubEnv("TPT_BACKEND_SCOPE", "backend-scope");
    vi.stubGlobal("fetch", fetchMock);
    vi.mocked(getToken).mockReturnValue("access-token");
    vi.mocked(requestOboToken).mockResolvedValue({ ok: true, token: "backend-token" });
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it.each([
    ["", "/vulnerabilities/user"],
    ["?endpoint=github", "/vulnerabilities/github/user"],
    ["?endpoint=sla", "/sla/overdue"],
  ])("selects the debug endpoint for %s", async (query, path) => {
    fetchMock.mockResolvedValue(Response.json({ raw: true }));

    const response = await debug(new Request(`http://localhost/api/debug${query}`));

    expect(fetchMock.mock.calls[0]?.[0]).toBe(`http://backend${path}`);
    expect(await response.json()).toEqual({ raw: true });
  });

  it("encodes team slugs and keeps the response streamed", async () => {
    const backend = Response.json({ teams: [] });
    fetchMock.mockResolvedValue(backend);

    const response = await getTeamVulnerabilities(new Request("http://localhost/api/admin/team"), {
      params: Promise.resolve({ teamSlug: "team/a & b" }),
    });

    expect(fetchMock.mock.calls[0]?.[0]).toBe("http://backend/admin/vulnerabilities/team/team%2Fa%20%26%20b");
    expect(response.body).toBe(backend.body);
    expect(await response.json()).toEqual({ teams: [] });
  });

  it("does not fetch for an empty search query", async () => {
    const response = await searchVulnerabilities(new NextRequest("http://localhost/api/admin/vulnerability-search?q=%20"));

    expect(await response.json()).toEqual({ results: [], totalCount: 0 });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(requestOboToken).not.toHaveBeenCalled();
  });

  it("retains admin search filtering and the flattened result shape", async () => {
    fetchMock.mockResolvedValue(Response.json({
      teams: [{
        team: "example-team",
        workloads: [{
          id: "workload-id",
          name: "application",
          environment: "prod-gcp",
          repository: "example-org/application",
          vulnerabilities: [
            { identifier: "CVE-2026-1234", packageName: "example-package", riskScore: 80 },
            { identifier: "CVE-2026-5678", packageName: "other-package", riskScore: 10 },
          ],
        }],
      }],
    }));

    const response = await searchVulnerabilities(
      new NextRequest("http://localhost/api/admin/vulnerability-search?q=%20EXAMPLE-PACKAGE%20"),
    );

    expect(fetchMock.mock.calls[0]?.[0]).toBe("http://backend/api/vulnerabilities");
    expect(await response.json()).toEqual({
      results: [{
        identifier: "CVE-2026-1234",
        workloadName: "application",
        workloadId: "workload-id",
        team: "example-team",
        environment: "prod-gcp",
        repository: "example-org/application",
        riskScore: 80,
        packageName: "example-package",
      }],
      totalCount: 1,
    });
  });

  it("normalizes a bodyless GitHub refresh acknowledgement to the existing 202 JSON response", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 202 }));

    const response = await refreshGithub(new Request("http://localhost/api/github/refresh"));

    expect(fetchMock.mock.calls[0]?.[0]).toBe("http://backend/vulnerabilities/github/refresh");
    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({});
  });

  it("preserves a real collection acknowledgement without inventing a response body", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 202 }));

    const response = await collect(new Request("http://localhost/api/datacollector/collect", { method: "POST" }));

    expect(fetchMock.mock.calls[0]?.[0]).toBe("http://backend/datacollector");
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("POST");
    expect(response.status).toBe(202);
    expect(response.body).toBeNull();
  });

  it("keeps the existing debug mock selection without needing backend configuration", async () => {
    vi.stubEnv("MOCKS_ENABLED", "true");
    vi.stubEnv("TPT_BACKEND_URL", undefined);

    const response = await debug(new Request("http://localhost/api/debug?endpoint=github"));

    expect(await response.json()).toEqual(mockVulnerabilitiesPayload);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards security-status query parameters", async () => {
    fetchMock.mockResolvedValue(Response.json({ teams: [] }));

    const response = await getSecurityStatus(new Request("http://localhost/api/security-status?team=a&team=b"));

    expect(fetchMock.mock.calls[0]?.[0]).toBe("http://backend/security-status?team=a&team=b");
    expect(await response.json()).toEqual({ teams: [] });
  });

  it.each(["404", "network", "invalid JSON"])("keeps the local security-status mock fallback for %s", async (failure) => {
    vi.stubEnv("LOCAL_DEV", "true");
    if (failure === "network") fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    else fetchMock.mockResolvedValue(new Response("not JSON", { status: failure === "404" ? 404 : 200 }));

    const response = await getSecurityStatus(new Request("http://localhost/api/security-status"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(mockSecurityStatusPayload);
    expect(console.warn).toHaveBeenCalled();
  });

  it.each([
    ["false", 404],
    ["true", 503],
  ])("does not hide security-status HTTP failures in LOCAL_DEV=%s for status %i", async (localDev, status) => {
    vi.stubEnv("LOCAL_DEV", localDev);
    const problem = { title: "Backend failure", status };
    fetchMock.mockResolvedValue(Response.json(problem, { status }));

    const response = await getSecurityStatus(new Request("http://localhost/api/security-status"));

    expect(response.status).toBe(status);
    expect(await response.json()).toEqual({ ...problem, isReportable: status >= 500 });
  });

  it("does not replace an aborted local security-status request with mock success", async () => {
    vi.stubEnv("LOCAL_DEV", "true");
    fetchMock.mockRejectedValue(new DOMException("Aborted", "AbortError"));

    const response = await getSecurityStatus(new Request("http://localhost/api/security-status"));

    expect(response.status).toBe(499);
    expect(await response.json()).toMatchObject({ status: 499, isReportable: false });
    expect(console.warn).not.toHaveBeenCalled();
  });
});
