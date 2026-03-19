export interface RiskScoreFactor {
  name: string;
  points: number;
  maxPoints: number;
  explanation: string;
  impact: "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

export interface RiskScoreBreakdown {
  factors: RiskScoreFactor[];
  totalScore: number;
  /** Whether the score was reduced by the suppression multiplier (0.2x). */
  suppressed?: boolean;
}

export interface Vulnerability {
  identifier: string;
  name?: string;
  packageName: string;
  /**
   * Raw PURL type identifying the package ecosystem (e.g., npm, maven, pypi, deb, rpm, apk, cargo, golang).
   * Available for both Nais and GitHub vulnerabilities. Use for fine-grained filtering/display within a group.
   */
  packageEcosystem?: string;
  /**
   * Coarse dependency category derived from the PURL type (backend-provided).
   * OS_PACKAGE — base image OS packages (deb, rpm, apk) fixable by updating the base image.
   * APPLICATION — application-level dependencies (npm, maven, pypi, cargo, golang, etc.).
   * CONTAINER — container image references (docker, oci).
   * UNKNOWN — type could not be determined.
   * When absent, falls back to client-side purl parsing of packageName.
   */
  dependencyCategory?: "OS_PACKAGE" | "APPLICATION" | "CONTAINER" | "UNKNOWN";
  description?: string;
  summary?: string;
  vulnerabilityDetailsLink?: string;
  riskScore: number;
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
  lastDeploy?: string;
  vulnerabilities: Vulnerability[];
}

export interface Repository {
  nameWithOwner: string;
  vulnerabilities: Vulnerability[];
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
