import { useMemo } from "react";
import { Repository } from "@/app/shared/types/vulnerabilities";

export interface RepositoryMetrics extends Repository {
  aggregateRiskScore: number;
  vulnerabilityCount: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
}

interface UseRepositoryMetricsProps {
  repositories: Repository[];
  highThreshold?: number;
  mediumThreshold?: number;
  lowThreshold?: number;
}

export function useRepositoryMetrics({
  repositories,
  highThreshold = 150,
  mediumThreshold = 75,
  lowThreshold = 30,
}: UseRepositoryMetricsProps): RepositoryMetrics[] {
  return useMemo(() => {
    return repositories.map((repository) => {
      const aggregateRiskScore = repository.vulnerabilities.reduce(
        (sum, vuln) => sum + vuln.riskScore,
        0
      );

      const vulnerabilityCount = repository.vulnerabilities.length;

      const highPriorityCount = repository.vulnerabilities.filter(
        (v) => v.riskScore >= highThreshold
      ).length;

      const mediumPriorityCount = repository.vulnerabilities.filter(
        (v) => v.riskScore >= mediumThreshold && v.riskScore < highThreshold
      ).length;

      const lowPriorityCount = repository.vulnerabilities.filter(
        (v) => v.riskScore >= lowThreshold && v.riskScore < mediumThreshold
      ).length;

      return {
        ...repository,
        aggregateRiskScore,
        vulnerabilityCount,
        highPriorityCount,
        mediumPriorityCount,
        lowPriorityCount,
      };
    });
  }, [repositories, highThreshold, mediumThreshold, lowThreshold]);
}
