export interface TeamOverview {
  teamSlug: string;
  totalVulnerabilities: number;
  criticalVulnerabilities: number;
  highVulnerabilities: number;
  mediumVulnerabilities: number;
  lowVulnerabilities: number;
  unknownVulnerabilities: number;
}

export interface TeamsOverviewResponse {
  teams: TeamOverview[];
  totalTeams: number;
  totalVulnerabilities: number;
  generatedAt: string;
}

export interface TeamSla {
  teamSlug: string;
  totalVulnerabilities: number;
  criticalOverdue: number;
  nonCriticalOverdue: number;
  criticalWithinSla: number;
  nonCriticalWithinSla: number;
}

export interface TeamsSlaResponse {
  teams: TeamSla[];
  totalTeams: number;
  totalOverdue: number;
  totalCriticalOverdue: number;
  totalNonCriticalOverdue: number;
  generatedAt: string;
}

export interface CvssDiscrepancy {
  cveId: string;
  nvdCvssV31Score: number;
  gcveCvssV31Score: number;
  nvdSeverity: string | null;
  gcveSeverity: string | null;
}

export interface GcveComparisonReport {
  totalTrackedCves: number;
  gcveCoveredCount: number;
  gcveMissingCount: number;
  gcveMissingSample: string[];
  cvssDiscrepancies: CvssDiscrepancy[];
  lastGcveSyncTimestamp: string | null;
}
