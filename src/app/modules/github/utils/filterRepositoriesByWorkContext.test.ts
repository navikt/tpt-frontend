import { describe, expect, it } from "vitest";
import type { Team } from "@/app/shared/types/vulnerabilities";
import {
  filterRepositoriesByWorkContext,
  getRepositoryName,
  getTeamRepositoryDisplayName,
} from "./filterRepositoriesByWorkContext";

const applicationTeams: Team[] = [
  {
    team: "team-a",
    workloads: [
      {
        id: "app-a",
        name: "app-a",
        environment: "prod-gcp",
        repository: "navikt/repo-a",
        vulnerabilities: [],
      },
    ],
  },
  {
    team: "team-b",
    workloads: [
      {
        id: "app-b",
        name: "app-b",
        environment: "prod-gcp",
        repository: "navikt/repo-b",
        vulnerabilities: [],
      },
    ],
  },
];

const githubTeams: Team[] = [
  {
    team: "team-a",
    workloads: [],
    repositories: [
      { nameWithOwner: "navikt/repo-a", vulnerabilities: [] },
      { nameWithOwner: "navikt/shared", vulnerabilities: [] },
    ],
  },
  {
    team: "team-b",
    workloads: [],
    repositories: [
      { nameWithOwner: "navikt/repo-b", vulnerabilities: [] },
      { nameWithOwner: "navikt/shared", vulnerabilities: [] },
    ],
  },
];

describe("filterRepositoriesByWorkContext", () => {
  it("returns unique repositories without a work context", () => {
    expect(
      filterRepositoriesByWorkContext(githubTeams, applicationTeams, {
        teamFilters: {},
        applicationFilters: {},
      }).map((repository) => repository.nameWithOwner)
    ).toEqual(["navikt/repo-a", "navikt/shared", "navikt/repo-b"]);
  });

  it("filters repositories by team", () => {
    expect(
      filterRepositoriesByWorkContext(githubTeams, applicationTeams, {
        teamFilters: { "team-b": true },
        applicationFilters: {},
      }).map((repository) => repository.nameWithOwner)
    ).toEqual(["navikt/repo-b", "navikt/shared"]);
  });

  it("maps applications to GitHub repositories", () => {
    expect(
      filterRepositoriesByWorkContext(githubTeams, applicationTeams, {
        teamFilters: {},
        applicationFilters: { "app-a": true },
      }).map((repository) => repository.nameWithOwner)
    ).toEqual(["navikt/repo-a"]);
  });

  it("attaches the owning team, using the first matching team for shared repositories", () => {
    expect(
      filterRepositoriesByWorkContext(githubTeams, applicationTeams, {
        teamFilters: {},
        applicationFilters: {},
      }).map(getTeamRepositoryDisplayName)
    ).toEqual(["team-a/repo-a", "team-a/shared", "team-b/repo-b"]);
  });

  it("lists a shared repository under the selected team", () => {
    expect(
      filterRepositoriesByWorkContext(githubTeams, applicationTeams, {
        teamFilters: { "team-b": true },
        applicationFilters: {},
      }).map(getTeamRepositoryDisplayName)
    ).toEqual(["team-b/repo-b", "team-b/shared"]);
  });
});

describe("getRepositoryName", () => {
  it("strips the GitHub owner", () => {
    expect(getRepositoryName("navikt/repo-a")).toBe("repo-a");
  });

  it("returns the input when there is no owner", () => {
    expect(getRepositoryName("repo-a")).toBe("repo-a");
  });
});
