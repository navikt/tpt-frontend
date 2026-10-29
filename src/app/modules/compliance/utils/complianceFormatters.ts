import type { MonthlySecurityHistory, TeamSecurityStatus } from "@/app/types/securityStatus";

export function getOnTrackPercentage(month: MonthlySecurityHistory): number | null {
  const recordedDays = month.onTrackDays + month.needsAttentionDays + month.actNowDays;
  return recordedDays === 0 ? null : month.onTrackDays / recordedDays;
}

export function sortTeamsForLeader(teams: TeamSecurityStatus[]): TeamSecurityStatus[] {
  const levelPriority: Record<string, number> = {
    chronic: 3,
    ongoing: 2,
    new: 1,
  };

  return [...teams].sort((a, b) => {
    // 1. Level priority (chronic > ongoing > new > null)
    const aLevel = a.level ? (levelPriority[a.level] ?? 0) : 0;
    const bLevel = b.level ? (levelPriority[b.level] ?? 0) : 0;
    if (bLevel !== aLevel) return bLevel - aLevel;

    // 2. Count of red statuses
    const aRed = [a.exposed.status, a.trend.status, a.maintenance.status].filter(s => s === "red").length;
    const bRed = [b.exposed.status, b.trend.status, b.maintenance.status].filter(s => s === "red").length;
    if (bRed !== aRed) return bRed - aRed;

    // 3. Count of yellow statuses
    const aYellow = [a.exposed.status, a.trend.status, a.maintenance.status].filter(s => s === "yellow").length;
    const bYellow = [b.exposed.status, b.trend.status, b.maintenance.status].filter(s => s === "yellow").length;
    if (bYellow !== aYellow) return bYellow - aYellow;

    // 4. Team name
    return a.team.localeCompare(b.team);
  });
}
