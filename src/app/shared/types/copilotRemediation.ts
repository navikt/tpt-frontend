export type CopilotRemediationStatus = "PENDING" | "STARTED";

export interface CopilotRemediation {
  repository: string;
  vulnerabilityIdentifier: string;
  packageName?: string;
  status: CopilotRemediationStatus;
  taskUrl?: string;
  requestedAt: string;
}

export interface CopilotRemediationsResponse {
  enabled: boolean;
  remediations: CopilotRemediation[];
}

export interface CopilotRemediationStartRequest {
  repository: string;
  vulnerabilityIdentifier: string;
  packageName?: string;
  workloadId?: string;
  returnPath: string;
  force: boolean;
}

export interface CopilotRemediationStartResponse {
  authorizeUrl?: string;
  existingTaskUrl?: string;
}

export interface CopilotRemediationCallbackResponse {
  taskUrl?: string;
  returnPath: string;
  alreadyStarted: boolean;
}

export type CopilotOutcome = "started" | "alreadyStarted" | "cancelled" | "error";
