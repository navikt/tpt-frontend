import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PATCH as suppressCheck } from "../checks/[owner]/[repo]/[name]/route";

const params = Promise.resolve({ owner: "navikt", repo: "tpt-frontend", name: "example" });

describe("PATCH /api/datacollector/checks/[owner]/[repo]/[name]", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 400 for invalid JSON", async () => {
    const request = new NextRequest("http://localhost/api/datacollector/checks/navikt/tpt-frontend/example", {
      method: "PATCH",
      body: "{ invalid json",
    });

    const response = await suppressCheck(request, { params });

    expect(response.status).toBe(400);
  });

  it("returns 400 when suppress is not a boolean", async () => {
    const request = new NextRequest("http://localhost/api/datacollector/checks/navikt/tpt-frontend/example", {
      method: "PATCH",
      body: JSON.stringify({ suppress: "yes" }),
      headers: { "content-type": "application/json" },
    });

    const response = await suppressCheck(request, { params });

    expect(response.status).toBe(400);
  });

  it("returns 204 when mocks are enabled and the body is valid", async () => {
    vi.stubEnv("MOCKS_ENABLED", "true");
    const request = new NextRequest("http://localhost/api/datacollector/checks/navikt/tpt-frontend/example", {
      method: "PATCH",
      body: JSON.stringify({ suppress: true }),
      headers: { "content-type": "application/json" },
    });

    const response = await suppressCheck(request, { params });

    expect(response.status).toBe(204);
  });
});
