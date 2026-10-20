import type { Team } from "@/app/shared/types/vulnerabilities";

interface WorkContextFilters {
  teamFilters: Record<string, boolean>;
  applicationFilters: Record<string, boolean>;
}

/** Minimal shape needed to filter a repository by the global work context. */
export interface OwnedRepository {
  /** Full GitHub name, e.g. "navikt/my-repo" */
  name: string;
  /** Teams that own the repository */
  owners: string[];
}

export function filterGoldenPathChecks<T extends OwnedRepository>(
  checks: T[],
  teams: Team[],
  { teamFilters, applicationFilters }: WorkContextFilters
): T[] {
  const selectedTeams = new Set(
    Object.keys(teamFilters).filter((team) => teamFilters[team] === true)
  );
  const selectedApplications = new Set(
    Object.keys(applicationFilters).filter(
      (application) => applicationFilters[application] === true
    )
  );
  const hasTeamFilter = selectedTeams.size > 0;
  const hasApplicationFilter = selectedApplications.size > 0;

  const selectedRepositories = new Set(
    teams
      .filter((team) => !hasTeamFilter || selectedTeams.has(team.team))
      .flatMap((team) => team.workloads)
      .filter(
        (workload) =>
          !hasApplicationFilter || selectedApplications.has(workload.name)
      )
      .map((workload) => workload.repository)
      .filter((repository): repository is string => Boolean(repository))
  );

  return checks.filter((repository) => {
    const matchesTeam =
      !hasTeamFilter ||
      repository.owners.some((owner) => selectedTeams.has(owner));
    const matchesApplication =
      !hasApplicationFilter || selectedRepositories.has(repository.name);

    return matchesTeam && matchesApplication;
  });
}
