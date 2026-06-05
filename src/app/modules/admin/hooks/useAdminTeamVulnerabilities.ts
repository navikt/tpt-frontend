import { useState, useEffect, useCallback, useRef } from "react";
import { VulnerabilitiesResponse } from "@/app/shared/types/vulnerabilities";
import { ApiError, handleApiError } from "@/app/shared/utils/errorHandling";
import {
  getCachedItemEntry,
  setCachedItem,
} from "@/app/shared/utils/indexedDbCache";
import { needsRevalidation } from "@/app/shared/utils/cacheRevalidation";

const CACHE_MAX_AGE_MS = 30 * 60 * 1000;

function cacheKey(teamSlug: string): string {
  return `admin-team-${teamSlug}`;
}

const ADMIN_TEAM_CACHE_SEED_PREFIX = "tpt-admin-team-";

function hasCacheSeed(teamSlug: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(ADMIN_TEAM_CACHE_SEED_PREFIX + teamSlug) === "1";
  } catch {
    return false;
  }
}

function setCacheSeed(teamSlug: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ADMIN_TEAM_CACHE_SEED_PREFIX + teamSlug, "1");
  } catch {
    // Ignore
  }
}

export function useAdminTeamVulnerabilities(teamSlug: string | null) {
  const [data, setData] = useState<VulnerabilitiesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(
    () => !teamSlug || !hasCacheSeed(teamSlug)
  );
  const [error, setError] = useState<ApiError | null>(null);
  const hasFetchedRef = useRef(false);

  const fetchData = useCallback(async (showLoading = true) => {
    if (!teamSlug) return;

    if (showLoading) setIsLoading(true);
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
                message: errorData.error || "errors.fetchVulnerabilitiesError",
                status: response.status,
                details: errorData.details,
                isReportable: errorData.isReportable ?? response.status >= 500,
              };

        setError(apiError);
        return;
      }

      const responseData: VulnerabilitiesResponse = await response.json();
      setData(responseData);
      setCacheSeed(teamSlug);
      setCachedItem(cacheKey(teamSlug), responseData);
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
    if (!teamSlug) return;
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    (async () => {
      const cached = await getCachedItemEntry<VulnerabilitiesResponse>(
        cacheKey(teamSlug),
      );

      if (cached) {
        setData(cached.data);
        setCacheSeed(teamSlug);
        setIsLoading(false);
      }

      const shouldRevalidate = await needsRevalidation(
        cached?.meta ?? null,
        CACHE_MAX_AGE_MS,
      );

      if (shouldRevalidate) {
        fetchData(!cached);
      } else {
        setIsLoading(false);
      }
    })();
  }, [teamSlug, fetchData]);

  return { data, isLoading, error };
}
