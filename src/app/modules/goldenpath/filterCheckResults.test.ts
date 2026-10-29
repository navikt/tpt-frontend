import { describe, expect, it } from "vitest";
import type { Team } from "@/app/shared/types/vulnerabilities";
import { filterGoldenPathChecks, getGoldenPathDisplayName } from "./filterCheckResults";
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

const appsecTeams: Team[] = [
  {
    team: "appsec",
    workloads: [
      {
        id: "appsec-github-watcher",
        name: "appsec-github-watcher",
        environment: "prod-gcp",
        repository: "navikt/tpt-graph",
        vulnerabilities: [],
      },
    ],
  },
];

const appsecCheck: RepoWithGroupedChecks = {
  name: "tpt-graph",
  owners: ["appsec"],
  good: [],
  bad: [],
};

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

  it("matches appsec workload filters to short Goldenpath repo names", () => {
    expect(
      filterGoldenPathChecks([appsecCheck], appsecTeams, {
        teamFilters: { appsec: true },
        applicationFilters: { "appsec-github-watcher": true },
      })
    ).toEqual([appsecCheck]);
  });

  it("matches applications when the workload repository includes an org", () => {
    expect(
      filterGoldenPathChecks([appsecCheck], appsecTeams, {
        teamFilters: {},
        applicationFilters: { "appsec-github-watcher": true },
      })
    ).toEqual([appsecCheck]);
  });

  it("matches teams using workload membership", () => {
    expect(
      filterGoldenPathChecks([appsecCheck], appsecTeams, {
        teamFilters: { appsec: true },
        applicationFilters: {},
      })
    ).toEqual([appsecCheck]);
  });
});

describe("getGoldenPathDisplayName", () => {
  it("prefixes the repository name with its owning team", () => {
    expect(
      getGoldenPathDisplayName({ name: "navikt/my-frontend", owners: ["product-team"] })
    ).toBe("product-team/my-frontend");
  });

  it("displays short Goldenpath repo names with their owning team", () => {
    expect(getGoldenPathDisplayName(appsecCheck)).toBe("appsec/tpt-graph");
  });

  it("falls back to the full GitHub name when no owner is known", () => {
    expect(getGoldenPathDisplayName({ name: "navikt/orphan", owners: [] })).toBe("navikt/orphan");
  });
});
