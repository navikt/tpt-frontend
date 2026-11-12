import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { VulnerabilitiesResponse } from "@/app/shared/types/vulnerabilities";
import { useSyncEvents } from "@/app/shared/hooks/useSyncEvents";
import {
  getCachedItemEntry,
  setCachedItem,
  CACHE_KEYS,
} from "@/app/shared/utils/indexedDbCache";
import { needsRevalidation } from "@/app/shared/utils/cacheRevalidation";

const CACHE_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes
const REFRESH_TIMEOUT_MS = 60 * 1000; // 1 minute fallback if SSE complete never arrives

const CACHE_SEED_FLAG = "tpt-gh-cache-seeded";

function hasCacheSeed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(CACHE_SEED_FLAG) === "1";
  } catch {
    return false;
  }
}

function setCacheSeed(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_SEED_FLAG, "1");
  } catch {
    // Ignore
  }
}

export const useGitHubVulnerabilities = () => {
  const [data, setData] = useState<VulnerabilitiesResponse | null>(null);

  const [isLoading, setIsLoading] = useState(() => !hasCacheSeed());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(false);

  const hasFetchedRef = useRef(false);
  const hasAutoRefreshedRef = useRef(false);
  const refreshInFlightRef = useRef(false);

  const fetchData = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setIsLoading(true);
        }

        const response = await fetch("/api/github");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const responseData: VulnerabilitiesResponse = await response.json();
        setData(responseData);
        setCacheSeed();
        setCachedItem(CACHE_KEYS.GITHUB, responseData);
      } catch (error) {
        console.error("Error fetching GitHub vulnerabilities data:", error);
        if (refreshInFlightRef.current) {
          setRefreshError(true);
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchDataRef = useRef(fetchData);
  useEffect(() => {
    fetchDataRef.current = fetchData;
  });

  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const completeRefresh = useCallback(async () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    await fetchDataRef.current(false);
    refreshInFlightRef.current = false;
    setIsRefreshing(false);
  }, []);

  const { isGitHubSyncing: isSyncing } = useSyncEvents({
    onSyncComplete: useCallback(() => {}, []),
    onGitHubSyncComplete: completeRefresh,
    onGitHubSyncError: useCallback(() => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      if (refreshInFlightRef.current) {
        console.error("GitHub sync event connection was interrupted");
        setRefreshError(true);
      }
      refreshInFlightRef.current = false;
      setIsRefreshing(false);
    }, []),
  });

  const refresh = useCallback(async () => {
    if (refreshInFlightRef.current) return;
    refreshInFlightRef.current = true;
    setIsRefreshing(true);
    setRefreshError(false);
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(completeRefresh, REFRESH_TIMEOUT_MS);
    try {
      const response = await fetch("/api/github/refresh");
      if (!response.ok) {
        throw new Error(`GitHub refresh failed: ${response.status}`);
      }
    } catch (error) {
      console.error("Error triggering GitHub refresh:", error);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      refreshInFlightRef.current = false;
      setRefreshError(true);
      setIsRefreshing(false);
    }
  }, [completeRefresh]);

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  // Initialize from IndexedDB and conditionally revalidate
  // biome-ignore lint/correctness/useExhaustiveDependencies: Initialize the cache and preferences only on mount.
  useEffect(function initializeEffect() {
    if (hasFetchedRef.current) return;

    hasFetchedRef.current = true;

    (async () => {
      try {
        // Read from "forever cache" — no TTL check, only local app version
        const cached = await getCachedItemEntry<VulnerabilitiesResponse>(
          CACHE_KEYS.GITHUB
        );

        const shouldRevalidate = await needsRevalidation(
          cached?.meta ?? null,
          CACHE_MAX_AGE_MS
        );

        if (cached) {
          setData(cached.data);
          setCacheSeed();
          setIsLoading(false);
        }

        if (shouldRevalidate) {
          fetchData(!cached);
        } else {
          setIsLoading(false);
        }
      } catch {
        // IndexedDB unavailable or read error — fall through to network fetch
        fetchData(true);
      }
    })();
  }, []);

  const oldestSyncedAt = useMemo(() => {
    if (!data?.teams.length) return undefined;
    const timestamps = data.teams
      .map((team) => team.lastSyncedAt)
      .filter((ts): ts is string => !!ts)
      .map((ts) => new Date(ts).getTime())
      .filter((ms) => !isNaN(ms));
    if (!timestamps.length) return undefined;
    return new Date(Math.min(...timestamps)).toISOString();
  }, [data]);

  const [now] = useState(() => Date.now());
  const isDataStale =
    !oldestSyncedAt ||
    now - new Date(oldestSyncedAt).getTime() > 24 * 60 * 60 * 1000;

  useEffect(() => {
    if (!data || isLoading || hasAutoRefreshedRef.current) return;
    hasAutoRefreshedRef.current = true;
    if (isDataStale && !isRefreshing && !isSyncing) {
      void refresh();
    }
  }, [data, isLoading, isDataStale, isRefreshing, isSyncing, refresh]);

  return {
    data,
    isLoading,
    isRefreshing,
    isSyncing,
    refreshError,
    refresh,
    isDataStale,
    oldestSyncedAt,
  };
};
