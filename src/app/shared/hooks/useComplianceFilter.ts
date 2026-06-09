import { useState, useMemo } from "react";
import { useVulnerabilitiesContext } from "@/app/contexts/VulnerabilitiesContext";

/**
 * Shared hook for compliance views (TeamMemberView, LeaderView).
 *
 * Provides:
 *  - `activeTeams`    — the teams to base all calculations on (filtered or all)
 *  - `hasAppFilters`  — whether any app filter is currently active
 *  - `activeAppNames` — Set of active app names (null when no filter)
 *  - `showFiltered`   — current toggle state
 *  - `setShowFiltered`— toggle setter
 */
export function useComplianceFilter() {
  const { data: vulnData, applicationFilters } = useVulnerabilitiesContext();
  const [showFiltered, setShowFiltered] = useState(true);

  const hasAppFilters = Object.values(applicationFilters).some((v) => v === true);

  const activeAppNames = useMemo(
    () =>
      hasAppFilters
        ? new Set(Object.keys(applicationFilters).filter((k) => applicationFilters[k]))
        : null,
    [applicationFilters, hasAppFilters]
  );

  const filteredTeams = useMemo(() => {
    if (!vulnData?.teams) return [];
    if (!activeAppNames) return vulnData.teams;
    return vulnData.teams
      .map((team) => ({
        ...team,
        workloads: team.workloads.filter((w) => activeAppNames.has(w.name)),
      }))
      .filter((team) => team.workloads.length > 0);
  }, [vulnData, activeAppNames]);

  const allTeams = useMemo(() => vulnData?.teams ?? [], [vulnData]);

  // When toggle is off (showFiltered=false) or no filter is active, use all teams
  const activeTeams = hasAppFilters && showFiltered ? filteredTeams : allTeams;

  return {
    activeTeams,
    filteredTeams,
    allTeams,
    hasAppFilters,
    activeAppNames: hasAppFilters && showFiltered ? activeAppNames : null,
    showFiltered,
    setShowFiltered,
  };
}
