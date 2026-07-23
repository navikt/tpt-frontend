import { useState, useMemo } from "react";
import { useVulnerabilitiesContext } from "@/app/contexts/VulnerabilitiesContext";

/**
 * Shared hook for compliance views (TeamMemberView, LeaderView).
 *
 * Provides:
 *  - `activeTeams`       — the teams to base all calculations on (filtered or all)
 *  - `hasAppFilters`     — whether any app filter is currently active
 *  - `hasTeamFilters`    — whether any team filter is currently active
 *  - `showFiltered`      — current toggle state
 *  - `setShowFiltered`   — toggle setter
 *  - `applicationFilters`— raw filter map from context (use to derive activeAppNames inside useMemos)
 */
export function useComplianceFilter() {
  const { data: vulnData, applicationFilters, teamFilters } = useVulnerabilitiesContext();
  const [showFiltered, setShowFiltered] = useState(true);

  const hasTeamFilters = Object.values(teamFilters).some((v) => v === true);
  const hasAppFilters  = Object.values(applicationFilters).some((v) => v === true);
  const isFilterActive = (hasTeamFilters || hasAppFilters) && showFiltered;

  const filteredTeams = useMemo(() => {
    if (!vulnData?.teams) return [];
    if (!isFilterActive) return vulnData.teams;

    // Step 1: filter by team
    const teamsAfterTeamFilter = hasTeamFilters
      ? vulnData.teams.filter((t) => teamFilters[t.team] === true)
      : vulnData.teams;

    // Step 2: filter workloads by app within remaining teams.
    // Teams with no matching workloads are kept (with empty workloads array)
    // so that callers can decide whether to show them (e.g. 0-bar in chart).
    if (!hasAppFilters) return teamsAfterTeamFilter;

    const activeAppNames = new Set(
      Object.keys(applicationFilters).filter((k) => applicationFilters[k])
    );
    return teamsAfterTeamFilter
      .map((team) => ({
        ...team,
        workloads: team.workloads.filter((w) => activeAppNames.has(w.name)),
      }));
  }, [vulnData, teamFilters, applicationFilters, isFilterActive, hasTeamFilters, hasAppFilters]);

  const allTeams = useMemo(() => vulnData?.teams ?? [], [vulnData]);
  const activeTeams = isFilterActive ? filteredTeams : allTeams;

  return {
    activeTeams,
    filteredTeams,
    allTeams,
    hasAppFilters,
    hasTeamFilters,
    isFilterActive,
    showFiltered,
    setShowFiltered,
    applicationFilters,
  };
}
