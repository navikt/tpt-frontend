import { useMemo } from "react";
import { Repository } from "@/app/shared/types/vulnerabilities";

export type RiskLevel = "critical" | "high" | "medium" | "low" | "none";

export interface RepositoryMetrics extends Repository {
  aggregateRiskScore: number;
  vulnerabilityCount: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
  fixesReadyCount: number;
  riskLevel: RiskLevel;
}

interface UseRepositoryMetricsProps {
  repositories: Repository[];
  criticalThreshold?: number;
  highThreshold?: number;
  mediumThreshold?: number;
  lowThreshold?: number;
}

export function useRepositoryMetrics({
  repositories,
  criticalThreshold = 75,
  highThreshold = 50,
  mediumThreshold = 25,
  lowThreshold = 0,
}: UseRepositoryMetricsProps): RepositoryMetrics[] {
  return useMemo(() => {
    return repositories.map((repository) => {
      const aggregateRiskScore = repository.vulnerabilities.reduce(
        (sum, vuln) => sum + vuln.riskScore,
        0
      );

      const vulnerabilityCount = repository.vulnerabilities.length;

      const highPriorityCount = repository.vulnerabilities.filter(
        (v) => v.riskScore >= criticalThreshold
      ).length;

      const mediumPriorityCount = repository.vulnerabilities.filter(
        (v) => v.riskScore >= highThreshold && v.riskScore < criticalThreshold
      ).length;

      const lowPriorityCount = repository.vulnerabilities.filter(
        (v) => v.riskScore >= mediumThreshold && v.riskScore < highThreshold
      ).length;

      const fixesReadyCount = repository.vulnerabilities.filter(
        (v) => v.dependabotUpdatePullRequestUrl != null
      ).length;

      const riskLevel: RiskLevel =
        aggregateRiskScore >= criticalThreshold
          ? "critical"
          : aggregateRiskScore >= highThreshold
            ? "high"
            : aggregateRiskScore >= mediumThreshold
              ? "medium"
              : aggregateRiskScore > lowThreshold
                ? "low"
                : "none";

      return {
        ...repository,
        aggregateRiskScore,
        vulnerabilityCount,
        highPriorityCount,
        mediumPriorityCount,
        lowPriorityCount,
        fixesReadyCount,
        riskLevel,
      };
    });
  }, [repositories, criticalThreshold, highThreshold, mediumThreshold, lowThreshold]);
}
