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

  const hasFetchedRef = useRef(false);

  const fetchData = useCallback(
    async (isRefresh = false, showLoading = true) => {
      try {
        if (isRefresh) {
          setIsRefreshing(true);
        } else if (showLoading) {
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
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  const fetchDataRef = useRef(fetchData);
  useEffect(() => {
    fetchDataRef.current = fetchData;
  });

  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isGitHubSyncing: isSyncing } = useSyncEvents({
    onSyncComplete: useCallback(() => {}, []),
    onGitHubSyncComplete: useCallback(() => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      fetchDataRef.current(false, false);
    }, []),
    onGitHubSyncError: useCallback(() => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      setIsRefreshing(false);
    }, []),
  });

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => {
      refreshTimeoutRef.current = null;
      fetchDataRef.current(false, false);
    }, REFRESH_TIMEOUT_MS);
    try {
      await fetch("/api/github/refresh");
    } catch (error) {
      console.error("Error triggering GitHub refresh:", error);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      setIsRefreshing(false);
    }
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

        // Use the swappable revalidation guard to decide if we need fresh data.
        // Matches old behaviour: stale cache is treated like no-cache for UX —
        // isLoading stays true and a loading spinner is shown.
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
          fetchData(false, !cached);
        } else {
          setIsLoading(false);
        }
      } catch {
        // IndexedDB unavailable or read error — fall through to network fetch
        fetchData(false, true);
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

  return {
    data,
    isLoading,
    isRefreshing,
    isSyncing,
    refresh,
    isDataStale,
    oldestSyncedAt,
  };
};
