import { useState, useEffect } from "react";
import { ApiError, handleApiError } from "@/app/shared/utils/errorHandling";

export interface OverdueItem {
  cveId: string;
  applicationName: string;
  severity: string;
  daysOverdue: number;
  workdaysOverdue: number;
}

export interface TeamSla {
  teamSlug: string;
  criticalOverdue: number;
  nonCriticalOverdue: number;
  criticalWithinSla: number;
  nonCriticalWithinSla: number;
  totalVulnerabilities: number;
  repositoriesOutOfSla: number;
  maxDaysOverdue: number;
  criticalOverdueItems: OverdueItem[];
  nonCriticalOverdueItems: OverdueItem[];
}

export interface SlaOverdueData {
  teams: TeamSla[];
  totalOverdue: number;
  generatedAt: string;
}

export const useSlaOverdue = () => {
  const [data, setData] = useState<SlaOverdueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const fetchSlaData = async () => {
      try {
        setError(null);
        const response = await fetch("/api/sla/overdue");
        if (response.ok) {
          const slaData = await response.json();
          setData(slaData);
        } else {
          const errorData = await response.json().catch(() => ({}));
          const apiError: ApiError = {
            message: errorData.error || "errors.fetchSlaOverdueError",
            status: response.status,
          };
          setError(apiError);
        }
      } catch (err) {
        const apiError = handleApiError(err, "useSlaOverdue.fetchSlaData");
        setError(apiError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlaData();
  }, []);

  return { data, isLoading, error };
};
