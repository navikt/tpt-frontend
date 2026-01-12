export interface RiskScoreMultipliers {
  severity?: number; // Optional: now comes from riskScoreBreakdown
  exposure: number;
  kev: number;
  epss: number;
  production: number;
  old_build_days: number;
  old_build: number;
}

export interface RiskScoreFactor {
  name: string;
  contribution: number;
  percentage: number;
  explanation: string;
  impact: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface RiskScoreBreakdown {
  baseScore: number;
  factors: RiskScoreFactor[];
  totalScore: number;
}

export interface Vulnerability {
  identifier: string;
  name?: string;
  packageName: string;
  description?: string;
  vulnerabilityDetailsLink?: string;
  riskScore: number;
  riskScoreMultipliers?: RiskScoreMultipliers;
  riskScoreBreakdown?: RiskScoreBreakdown;
}

export interface Workload {
  id: string;
  name: string;
  environment: string;
  repository?: string;
  ingressTypes?: string[];
  buildTime?: string;
  vulnerabilities: Vulnerability[];
}

export interface Team {
  team: string;
  workloads: Workload[];
}

export interface VulnerabilitiesResponse {
  teams: Team[];
}
