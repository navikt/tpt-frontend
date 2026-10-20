import { describe, expect, it } from "vitest";
import type { Team } from "@/app/shared/types/vulnerabilities";
import { filterGoldenPathChecks } from "./filterCheckResults";
import type { RepoWithGroupedChecks } from "./useCheckResults";

const teams: Team[] = [
  {
    team: "product-team",
    workloads: [
      {
        id: "frontend",
        name: "my-frontend",
        environment: "prod-gcp",
        repository: "navikt/my-frontend",
        vulnerabilities: [],
      },
    ],
  },
  {
    team: "product-team-subteam",
    workloads: [
      {
        id: "backend",
        name: "my-backend",
        environment: "prod-gcp",
        repository: "navikt/my-backend",
        vulnerabilities: [],
      },
    ],
  },
];

const checks: RepoWithGroupedChecks[] = [
  {
    name: "navikt/my-frontend",
    owners: ["product-team"],
    good: [],
    bad: [],
  },
  {
    name: "navikt/my-backend",
    owners: ["product-team", "product-team-subteam"],
    good: [],
    bad: [],
  },
];

describe("filterGoldenPathChecks", () => {
  it("returns all repositories without an active work context", () => {
    expect(
      filterGoldenPathChecks(checks, teams, {
        teamFilters: {},
        applicationFilters: {},
      })
    ).toEqual(checks);
  });

  it("treats subteams as independent owners", () => {
    expect(
      filterGoldenPathChecks(checks, teams, {
        teamFilters: { "product-team-subteam": true },
        applicationFilters: {},
      })
    ).toEqual([checks[1]]);
  });

  it("maps selected applications to their repositories", () => {
    expect(
      filterGoldenPathChecks(checks, teams, {
        teamFilters: {},
        applicationFilters: { "my-frontend": true },
      })
    ).toEqual([checks[0]]);
  });

  it("requires both the selected owner and application to match", () => {
    expect(
      filterGoldenPathChecks(checks, teams, {
        teamFilters: { "product-team-subteam": true },
        applicationFilters: { "my-frontend": true },
      })
    ).toEqual([]);
  });
});
