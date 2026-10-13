import type { TeamSecurityStatus } from "@/app/types/securityStatus";

export function formatSince(sinceIso: string | undefined, locale: string = "nb"): string | null {
  if (!sinceIso) return null;

  try {
    const sinceDate = new Date(sinceIso);
    if (isNaN(sinceDate.getTime())) return null;

    const now = new Date();
    const diffMs = now.getTime() - sinceDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays <= 7) {
      const weekday = sinceDate.toLocaleDateString(locale === "nb" ? "nb-NO" : "en-US", { weekday: "long" });
      const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
      return locale === "nb" ? `siden ${capitalized.toLowerCase()}` : `since ${capitalized}`;
    }

    const month = sinceDate.toLocaleDateString(locale === "nb" ? "nb-NO" : "en-US", { month: "short" });
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    return locale === "nb" ? `siden ${capitalizedMonth.toLowerCase()}` : `since ${capitalizedMonth}`;
  } catch {
    return null;
  }
}

export function getLast6MonthsInfo(locale: string = "nb"): { initial: string; fullName: string }[] {
  const result: { initial: string; fullName: string }[] = [];
  const now = new Date();

  // 6 months ending in current month, oldest on the left
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const fullName = d.toLocaleDateString(locale === "nb" ? "nb-NO" : "en-US", { month: "long" });
    const capitalizedName = fullName.charAt(0).toUpperCase() + fullName.slice(1);
    const initial = capitalizedName.charAt(0);
    result.push({
      initial,
      fullName: capitalizedName,
    });
  }

  return result;
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
