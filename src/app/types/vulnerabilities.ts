export interface RiskScoreFactor {
  name: string;
  contribution: number;
  percentage: number;
  multiplier: number;
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
  riskScoreBreakdown?: RiskScoreBreakdown;
}

export interface Workload {
  id: string;
  name: string;
  workloadType?: string;
  environment: string;
  repository?: string;
  ingressTypes?: string[];
  buildTime?: string;
  vulnerabilities: Vulnerability[];
}

export interface Repository {
  name: string;
  vulnerabilities: Vulnerability[];
}

export interface Team {
  team: string;
  workloads: Workload[];
  repositories?: Repository[];
}

export interface VulnerabilitiesResponse {
  teams: Team[];
}
