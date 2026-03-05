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

/** Slim summary returned by GET /vulnerabilities/user */
export interface VulnerabilitySummary {
  identifier: string;
  name?: string;
  packageName: string;
  description?: string;
  riskScore: number;
}

/** Full detail returned by GET /vulnerabilities/workload/{workloadId}/{identifier} */
export interface VulnerabilityDetail extends VulnerabilitySummary {
  packageEcosystem?: string;
  summary?: string;
  vulnerabilityDetailsLink?: string;
  riskScoreBreakdown?: RiskScoreBreakdown;
  dependencyScope?: string;
  dependabotUpdatePullRequestUrl?: string;
  publishedAt?: string;
  cvssScore?: number;
}

export interface Workload {
  id: string;
  name: string;
  workloadType?: string;
  environment: string;
  repository?: string;
  ingressTypes?: string[];
  buildTime?: string;
  lastDeploy?: string;
  vulnerabilities: VulnerabilitySummary[];
}

export interface Repository {
  nameWithOwner: string;
  vulnerabilities: VulnerabilitySummary[];
  usesDistroless?: boolean | null;
}

export interface Team {
  team: string;
  workloads: Workload[];
  repositories?: Repository[];
}

export interface VulnerabilitiesResponse {
  userRole?: string;
  teams: Team[];
}
