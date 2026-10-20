import { describe, expect, it } from "vitest";
import {
  mockGithubPayload,
  mockGoldenPathChecks,
  mockSecurityStatusPayload,
  mockSlaOverduePayload,
  mockVulnerabilitiesPayload,
} from "@/app/mocks/mockPayloads";

// mockVulnerabilitiesPayload (/api/applications) drives the global work context
// filter, so every other mock must use the same teams, applications and repositories.
const applicationsByTeam = new Map(
  mockVulnerabilitiesPayload.teams.map((team) => [
    team.team,
    new Set(team.workloads.map((workload) => workload.name)),
  ])
);
const repositoryOwner = new Map(
  mockVulnerabilitiesPayload.teams.flatMap((team) =>
    team.workloads
      .map((workload) => workload.repository)
      .filter((repository): repository is string => Boolean(repository))
      .map((repository) => [repository, team.team] as const)
  )
);

describe("mock payloads are consistent with mockVulnerabilitiesPayload", () => {
  it("GitHub repositories belong to the team that owns the workload", () => {
    for (const team of mockGithubPayload.teams) {
      for (const repository of team.repositories ?? []) {
        expect(repositoryOwner.get(repository.nameWithOwner), repository.nameWithOwner).toBe(team.team);
      }
    }
  });

  it("Golden path repositories have exactly one owner that owns the workload", () => {
    for (const repository of mockGoldenPathChecks) {
      expect(repository.repoOwners, repository.repoName).toHaveLength(1);
      expect(repositoryOwner.get(repository.repoName), repository.repoName).toBe(repository.repoOwners[0]);
    }
  });

  it("Security status covers every team with matching applications", () => {
    expect(mockSecurityStatusPayload.teams.map((team) => team.team).sort()).toEqual(
      [...applicationsByTeam.keys()].sort()
    );
    for (const team of mockSecurityStatusPayload.teams) {
      const applications = applicationsByTeam.get(team.team) ?? new Set<string>();
      expect(team.applicationCount, team.team).toBe(applications.size);
      expect(team.maintenance.total, team.team).toBe(applications.size);
      const referencedApps = [
        ...team.exposed.appsPastDeadline.map((item) => item.app),
        ...team.maintenance.overdueRebuild.map((item) => item.app),
      ];
      for (const app of referencedApps) {
        expect(applications.has(app), `${team.team}: ${app}`).toBe(true);
      }
    }
  });

  it("SLA overdue items reference applications owned by the team", () => {
    for (const team of mockSlaOverduePayload.teams) {
      const applications = applicationsByTeam.get(team.teamSlug) ?? new Set<string>();
      for (const item of [...team.criticalOverdueItems, ...team.nonCriticalOverdueItems]) {
        expect(applications.has(item.applicationName), `${team.teamSlug}: ${item.applicationName}`).toBe(true);
      }
    }
  });
});
