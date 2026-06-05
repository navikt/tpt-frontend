import { useState, useEffect, useCallback, useRef } from "react";
import { TeamsSlaResponse } from "@/app/types/admin";
import {
  getCachedItem,
  setCachedItem,
  CACHE_KEYS,
} from "@/app/shared/utils/indexedDbCache";

const CACHE_MAX_AGE_MS = 30 * 60 * 1000;

export function useTeamsSla() {
  const [data, setData] = useState<TeamsSlaResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/admin/teams/sla");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch teams SLA");
      }

      const responseData: TeamsSlaResponse = await response.json();
      setData(responseData);
      setCachedItem(CACHE_KEYS.ADMIN_SLA, responseData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    (async () => {
      const cached = await getCachedItem<TeamsSlaResponse>(
        CACHE_KEYS.ADMIN_SLA,
        CACHE_MAX_AGE_MS,
      );
      if (cached) {
        setData(cached);
        setIsLoading(false);
      }

      fetchData();
    })();
  }, [fetchData]);

  return {
    data,
    error,
    isLoading,
    mutate: fetchData,
  };
}
