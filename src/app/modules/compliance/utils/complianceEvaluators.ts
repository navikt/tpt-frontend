import type {
  SecurityStatusColor,
  SecurityLevel,
  TrendDirection,
  AppPastDeadline,
} from "@/app/types/securityStatus";

export interface EvaluationThresholds {
  exposedYellowMaxWorkdays: number;
  maintenanceYellowMinRatio: number;
  maintenanceRedMaxRatio: number;
  maintenanceMaxDeployAgeDays: number;
  offTrackNewMaxWorkdays: number;
  offTrackChronicMonths: number;
}

export const DEFAULT_EVALUATION_THRESHOLDS: EvaluationThresholds = {
  exposedYellowMaxWorkdays: 5,
  maintenanceYellowMinRatio: 0.75,
  maintenanceRedMaxRatio: 0.75,
  maintenanceMaxDeployAgeDays: 30,
  offTrackNewMaxWorkdays: 5,
  offTrackChronicMonths: 3,
};

/**
 * Question 1: Are we exposed right now?
 * - Green: 0 applications past deadline
 * - Yellow: 1 application past deadline, for under 5 workdays
 * - Red: 2 or more applications, or any issue >= 5 workdays over
 */
export function evaluateExposedStatus(
  appsPastDeadline: AppPastDeadline[],
  thresholds: EvaluationThresholds = DEFAULT_EVALUATION_THRESHOLDS
): SecurityStatusColor {
  if (appsPastDeadline.length === 0) {
    return "green";
  }

  const anyOver5Workdays = appsPastDeadline.some(
    (app) => app.workdaysOver >= thresholds.exposedYellowMaxWorkdays
  );

  if (appsPastDeadline.length === 1 && !anyOver5Workdays) {
    return "yellow";
  }

  return "red";
}

/**
 * Question 2: Is it getting better or worse? (Trend)
 * - Green: stable or improving
 * - Yellow: worse, and team currently has no issues past deadline
 * - Red: worse, and team has issues past deadline
 */
export function evaluateTrendStatus(
  direction: TrendDirection,
  hasAppsPastDeadline: boolean
): SecurityStatusColor {
  if (direction === "improving" || direction === "stable") {
    return "green";
  }

  if (direction === "worse") {
    return hasAppsPastDeadline ? "red" : "yellow";
  }

  return "green";
}

/**
 * Question 3: Are we keeping up with basic maintenance?
 * - Green: 100% of applications rebuilt and redeployed within 30 days
 * - Yellow: 75% or more
 * - Red: under 75%
 */
export function evaluateMaintenanceStatus(
  upToDate: number,
  total: number,
  thresholds: EvaluationThresholds = DEFAULT_EVALUATION_THRESHOLDS
): SecurityStatusColor {
  if (total === 0) return "green";
  if (upToDate >= total) return "green";

  const ratio = upToDate / total;
  if (ratio >= thresholds.maintenanceYellowMinRatio) {
    return "yellow";
  }

  return "red";
}

/**
 * Team Level Badge:
 * - Green across all 3 questions => null (no badge)
 * - Chronic: off track for 3 months or more, OR all 3 questions are red
 * - New: off track for under 5 workdays
 * - Ongoing: off track longer than New, OR 2 or more of the 3 questions are red
 */
export function evaluateTeamLevel(params: {
  exposedStatus: SecurityStatusColor;
  trendStatus: SecurityStatusColor;
  maintenanceStatus: SecurityStatusColor;
  offTrackDurationWorkdays?: number;
  offTrackDurationMonths?: number;
}): SecurityLevel {
  const {
    exposedStatus,
    trendStatus,
    maintenanceStatus,
    offTrackDurationWorkdays = 10,
    offTrackDurationMonths = 0,
  } = params;

  const statuses = [exposedStatus, trendStatus, maintenanceStatus];
  const allGreen = statuses.every((s) => s === "green");
  if (allGreen) return null;

  const redCount = statuses.filter((s) => s === "red").length;

  if (offTrackDurationMonths >= 3 || redCount === 3) {
    return "chronic";
  }

  if (offTrackDurationWorkdays < 5 && redCount < 2) {
    return "new";
  }

  return "ongoing";
}
