import type { Repository, Team } from "@/app/shared/types/vulnerabilities";

interface WorkContextFilters {
  teamFilters: Record<string, boolean>;
  applicationFilters: Record<string, boolean>;
}

/** A GitHub repository together with the team it is listed under. */
export interface TeamRepository extends Repository {
  team: string;
}

export function filterRepositoriesByWorkContext(
  githubTeams: Team[],
  applicationTeams: Team[],
  { teamFilters, applicationFilters }: WorkContextFilters
): TeamRepository[] {
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
    applicationTeams
      .filter((team) => !hasTeamFilter || selectedTeams.has(team.team))
      .flatMap((team) => team.workloads)
      .filter(
        (workload) =>
          !hasApplicationFilter || selectedApplications.has(workload.name)
      )
      .map((workload) => workload.repository)
      .filter((repository): repository is string => Boolean(repository))
  );

  // A repository shared by several teams is listed once, under the first
  // matching team — same approach as workloads in the other views.
  const seen = new Set<string>();
  return githubTeams
    .filter((team) => !hasTeamFilter || selectedTeams.has(team.team))
    .flatMap((team) =>
      (team.repositories ?? []).map((repository) => ({
        ...repository,
        team: team.team,
      }))
    )
    .filter((repository) => {
      if (seen.has(repository.nameWithOwner)) return false;
      seen.add(repository.nameWithOwner);
      return true;
    })
    .filter(
      (repository) =>
        !hasApplicationFilter ||
        selectedRepositories.has(repository.nameWithOwner)
    );
}
