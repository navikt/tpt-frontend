export interface Vulnerability {
  identifier: string;
  severity: string;
  suppressed: boolean;
  hasKevEntry: boolean;
  epssScore: string | null;
  epssPercentile: string | null;
}

export interface Workload {
  name: string;
  ingressTypes: string[];
  vulnerabilities: Vulnerability[];
}

export interface Team {
  team: string;
  workloads: Workload[];
}

export interface VulnerabilitiesResponse {
  teams: Team[];
}
