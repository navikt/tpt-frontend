import { useState, useEffect, useCallback } from "react";
import { ApiError, handleApiError } from "@/app/shared/utils/errorHandling";
import { withSeriesTrend } from "@/app/modules/compliance/utils/complianceEvaluators";
import type { SecurityStatusResponse } from "@/app/types/securityStatus";

export function useSecurityStatus() {
  const [data, setData] = useState<SecurityStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/security-status");
      if (response.ok) {
        const json: SecurityStatusResponse = await response.json();
        setData({ ...json, teams: json.teams.map(withSeriesTrend) });
      } else {
        const errorData = await response.json().catch(() => ({}));
        const apiError: ApiError = {
          message: errorData.error || "errors.fetchSecurityStatusError",
          status: response.status,
        };
        setError(apiError);
      }
    } catch (err) {
      const apiError = handleApiError(err, "useSecurityStatus.fetchData");
      setError(apiError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}
