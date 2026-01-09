export interface RiskScoreMultipliers {
  severity: number;
  exposure: number;
  kev: number;
  epss: number;
  production: number;
  old_build_days: number;
  old_build: number;
}

export interface Vulnerability {
  identifier: string;
  name?: string;
  packageName: string;
  description?: string;
  vulnerabilityDetailsLink?: string;
  riskScore: number;
  riskScoreMultipliers?: RiskScoreMultipliers;
}

export interface Workload {
  id: string;
  name: string;
  environment: string;
  environmentName?: string; // For backwards compatibility
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
