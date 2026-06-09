import { useState, useMemo } from "react";
import { useVulnerabilitiesContext } from "@/app/contexts/VulnerabilitiesContext";

/**
 * Shared hook for compliance views (TeamMemberView, LeaderView).
 *
 * Provides:
 *  - `activeTeams`       — the teams to base all calculations on (filtered or all)
 *  - `hasAppFilters`     — whether any app filter is currently active
 *  - `showFiltered`      — current toggle state
 *  - `setShowFiltered`   — toggle setter
 *  - `applicationFilters`— raw filter map from context (use to derive activeAppNames inside useMemos)
 */
export function useComplianceFilter() {
  const { data: vulnData, applicationFilters } = useVulnerabilitiesContext();
  const [showFiltered, setShowFiltered] = useState(true);

  const hasAppFilters = Object.values(applicationFilters).some((v) => v === true);
  const isFilterActive = hasAppFilters && showFiltered;

  const filteredTeams = useMemo(() => {
    if (!vulnData?.teams) return [];
    if (!isFilterActive) return vulnData.teams;
    const activeAppNames = new Set(
      Object.keys(applicationFilters).filter((k) => applicationFilters[k])
    );
    return vulnData.teams
      .map((team) => ({
        ...team,
        workloads: team.workloads.filter((w) => activeAppNames.has(w.name)),
      }))
      .filter((team) => team.workloads.length > 0);
  }, [vulnData, applicationFilters, isFilterActive]);

  const allTeams = useMemo(() => vulnData?.teams ?? [], [vulnData]);
  const activeTeams = isFilterActive ? filteredTeams : allTeams;

  return {
    activeTeams,
    filteredTeams,
    allTeams,
    hasAppFilters,
    isFilterActive,
    showFiltered,
    setShowFiltered,
    applicationFilters,
  };
}
