export interface Vulnerability {
  identifier: string;
  severity: string;
  suppressed: boolean;
  hasKevEntry: boolean;
  epssScore: string | null;
  epssPercentile: string | null;
  riskScore: number;
}

export interface Workload {
  id: string;
  name: string;
  environmentName: string;
  ingressTypes: string[];
  buildTime: string;
  vulnerabilities: Vulnerability[];
}

export interface Team {
  team: string;
  workloads: Workload[];
}

export interface VulnerabilitiesResponse {
  teams: Team[];
}
