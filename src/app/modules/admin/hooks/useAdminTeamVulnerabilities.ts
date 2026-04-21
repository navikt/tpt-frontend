import { useState, useEffect, useCallback } from "react";
import { VulnerabilitiesResponse } from "@/app/shared/types/vulnerabilities";
import { ApiError, handleApiError } from "@/app/shared/utils/errorHandling";

export function useAdminTeamVulnerabilities(teamSlug: string | null) {
  const [data, setData] = useState<VulnerabilitiesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    if (!teamSlug) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/vulnerabilities/team/${encodeURIComponent(teamSlug)}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        const apiError: ApiError =
          errorData.type || errorData.title || errorData.detail
            ? {
                message: errorData.title || "errors.fetchVulnerabilitiesError",
                status: response.status,
                details: errorData.detail,
                isReportable: errorData.isReportable ?? response.status >= 500,
                problemDetails: errorData,
              }
            : {
                message:
                  errorData.error || "errors.fetchVulnerabilitiesError",
                status: response.status,
                details: errorData.details,
                isReportable: errorData.isReportable ?? response.status >= 500,
              };

        setError(apiError);
        return;
      }

      const responseData: VulnerabilitiesResponse = await response.json();
      setData(responseData);
    } catch (err) {
      const apiError = handleApiError(
        err,
        "useAdminTeamVulnerabilities.fetchData",
        { teamSlug }
      );
      setError(apiError);
    } finally {
      setIsLoading(false);
    }
  }, [teamSlug]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error };
}
