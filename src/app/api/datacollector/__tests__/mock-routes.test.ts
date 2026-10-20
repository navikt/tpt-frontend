import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RepoChecks } from "@/app/modules/goldenpath/useCheckResults";
import { GET as getChecks } from "../checks/route";
import { POST as triggerCollection } from "../collect/route";

describe("Golden Path mock routes", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns synthetic checks when mocks are enabled", async () => {
    vi.stubEnv("MOCKS_ENABLED", "true");

    const response = await getChecks(new NextRequest("http://localhost/api/datacollector/checks"));
    const checks: RepoChecks = await response.json();

    expect(response.status).toBe(200);
    expect(checks.map((repo) => repo.repoName)).toEqual([
      "example-org/golden-path-demo",
      "example-org/demo-api",
      "example-org/healthy-demo",
    ]);
    expect(checks.every((repo) => repo.repoOwners.length > 0)).toBe(true);
    expect(checks.find((repo) => repo.repoName === "example-org/golden-path-demo")?.results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "NeedsWork", severity: "HIGH" }),
        expect.objectContaining({ type: "AllGood" }),
      ]),
    );
  });

  it("does not trigger a real collection when mocks are enabled", async () => {
    vi.stubEnv("MOCKS_ENABLED", "true");

    const response = await triggerCollection(new NextRequest("http://localhost/api/datacollector/collect", {
      method: "POST",
    }));

    expect(response.status).toBe(202);
  });
});
