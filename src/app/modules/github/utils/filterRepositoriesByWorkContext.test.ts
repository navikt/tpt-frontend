import { describe, expect, it } from "vitest";
import type { Team } from "@/app/shared/types/vulnerabilities";
import {
  filterRepositoriesByWorkContext,
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
      }).map(({ nameWithOwner, team }) => ({ nameWithOwner, team }))
    ).toEqual([
      { nameWithOwner: "navikt/repo-a", team: "team-a" },
      { nameWithOwner: "navikt/shared", team: "team-a" },
      { nameWithOwner: "navikt/repo-b", team: "team-b" },
    ]);
  });

  it("lists a shared repository under the selected team", () => {
    expect(
      filterRepositoriesByWorkContext(githubTeams, applicationTeams, {
        teamFilters: { "team-b": true },
        applicationFilters: {},
      }).map(({ nameWithOwner, team }) => ({ nameWithOwner, team }))
    ).toEqual([
      { nameWithOwner: "navikt/repo-b", team: "team-b" },
      { nameWithOwner: "navikt/shared", team: "team-b" },
    ]);
  });
});
