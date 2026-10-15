export type SecurityStatusColor = "green" | "yellow" | "red";

export type SecurityLevel = "new" | "ongoing" | "chronic" | null;

export type TrendDirection = "worse" | "stable" | "improving";

export interface AppPastDeadline {
  app: string;
  workdaysOver: number;
}

export interface AppOverdueRebuild {
  app: string;
  daysOver: number;
}

export interface ExposedStatus {
  status: SecurityStatusColor;
  since?: string;
  appsPastDeadline: AppPastDeadline[];
}

export interface TrendStatus {
  status: SecurityStatusColor;
  since?: string;
  direction: TrendDirection;
  appsWithOverduePerMonth: number[]; // 6 entries, for the sparkline
}

export interface MaintenanceStatus {
  status: SecurityStatusColor;
  since?: string;
  upToDate: number;
  total: number;
  overdueRebuild: AppOverdueRebuild[];
}

export interface TeamSecurityStatus {
  team: string;
  applicationCount: number;
  level: SecurityLevel;
  history: SecurityStatusColor[]; // 6 entries, oldest first
  historyAvailableFrom?: string;
  exposed: ExposedStatus;
  trend: TrendStatus;
  maintenance: MaintenanceStatus;
}

export interface SecurityStatusResponse {
  teams: TeamSecurityStatus[];
  generatedAt: string;
}
