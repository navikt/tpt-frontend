import { useState, useEffect, useCallback, useMemo, useRef, startTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { VulnerabilitiesResponse } from "@/app/shared/types/vulnerabilities";
import { useSyncEvents } from "@/app/shared/hooks/useSyncEvents";
import {
  getCachedItemEntry,
  setCachedItem,
  getKvItem,
  setKvItem,
  CACHE_KEYS,
  KV_KEYS,
} from "@/app/shared/utils/indexedDbCache";
import { needsRevalidation } from "@/app/shared/utils/cacheRevalidation";
import { deserializeFilters, serializeFilters } from "@/app/modules/vulnerabilities/utils/queryParamHelpers";

const GITHUB_PARAM_KEYS = {
  team: "team",
  repo: "repo",
} as const;

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [data, setData] = useState<VulnerabilitiesResponse | null>(null);

  const [isLoading, setIsLoading] = useState(() => !hasCacheSeed());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [teamFilters, setTeamFilters] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    return deserializeFilters(searchParams.get(GITHUB_PARAM_KEYS.team));
  });

  const [repositoryFilters, setRepositoryFilters] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    return deserializeFilters(searchParams.get(GITHUB_PARAM_KEYS.repo));
  });
  const [cveFilters, setCveFilters] = useState<Record<string, boolean>>({});

  const hasFetchedRef = useRef(false);
  const shouldSyncToUrlRef = useRef(false);
  const lastSyncedParamsRef = useRef<string>("");
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // Mark as initialized and detect whether URL already has filters
  useEffect(() => {
    const hasUrlFilters =
      searchParams.has(GITHUB_PARAM_KEYS.team) ||
      searchParams.has(GITHUB_PARAM_KEYS.repo);
    if (hasUrlFilters) {
      shouldSyncToUrlRef.current = true;
      lastSyncedParamsRef.current = searchParams.toString();
    }
    isInitializedRef.current = true;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset sync tracker on route change
  useEffect(() => {
    lastSyncedParamsRef.current = "";
  }, [pathname]);

  // Sync filters to URL (debounced 500ms)
  useEffect(() => {
    if (!isInitializedRef.current) return;
    if (!shouldSyncToUrlRef.current) return;

    if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);

    updateTimeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      const teamParam = serializeFilters(teamFilters);
      if (teamParam) params.set(GITHUB_PARAM_KEYS.team, teamParam);
      const repoParam = serializeFilters(repositoryFilters);
      if (repoParam) params.set(GITHUB_PARAM_KEYS.repo, repoParam);

      const newParamsString = params.toString();
      if (newParamsString !== lastSyncedParamsRef.current) {
        lastSyncedParamsRef.current = newParamsString;
        const newUrl = newParamsString
          ? `${window.location.pathname}?${newParamsString}`
          : window.location.pathname;
        router.replace(newUrl, { scroll: false });
      }
    }, 500);

    return () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
    };
  }, [teamFilters, repositoryFilters, router, pathname]);

  const fetchData = useCallback(async (isRefresh = false, showLoading = true) => {
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
      setTeamFilters({});
      setRepositoryFilters({});
      setCveFilters({});

    } catch (error) {
      console.error("Error fetching GitHub vulnerabilities data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

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
  useEffect(function initializeEffect() {
    if (hasFetchedRef.current) return;

    hasFetchedRef.current = true;

    (async () => {
      try {
        // Read from "forever cache" — no TTL check, only local app version
        const cached = await getCachedItemEntry<VulnerabilitiesResponse>(
          CACHE_KEYS.GITHUB,
        );

        // Use the swappable revalidation guard to decide if we need fresh data.
        // Matches old behaviour: stale cache is treated like no-cache for UX —
        // isLoading stays true and a loading spinner is shown.
        const shouldRevalidate = await needsRevalidation(
          cached?.meta ?? null,
          CACHE_MAX_AGE_MS,
        );

        if (cached) {
          setData(cached.data);
          setCacheSeed();
          setIsLoading(false);
        }

        // Load team preferences
        const savedTeams = await getKvItem<string[]>(KV_KEYS.GITHUB_TEAM_PREFERENCES);
        if (savedTeams && Array.isArray(savedTeams)) {
          setTeamFilters(Object.fromEntries(savedTeams.map(team => [team, true])));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allTeams = useMemo(
    () => data?.teams.map((team) => team.team) || [],
    [data]
  );

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
  const isDataStale = !oldestSyncedAt || now - new Date(oldestSyncedAt).getTime() > 24 * 60 * 60 * 1000;

  // Persist team filters to IndexedDB when they change
  useEffect(() => {
    const selectedTeams = Object.keys(teamFilters).filter(team => teamFilters[team] === true);
    setKvItem(KV_KEYS.GITHUB_TEAM_PREFERENCES, selectedTeams);
  }, [teamFilters]);

  const availableRepositories = useMemo(() => {
    const hasTeamFilters = Object.values(teamFilters).some((v) => v === true);
    return (
      data?.teams
        .filter((team) => !hasTeamFilters || teamFilters[team.team] === true)
        .flatMap((team) => team.repositories?.map((repo) => repo.nameWithOwner) || []) ||
      []
    );
  }, [data, teamFilters]);

  const availableCves = useMemo(() => {
    const hasTeamFilters = Object.values(teamFilters).some((v) => v === true);
    const hasRepositoryFilters = Object.values(repositoryFilters).some(
      (v) => v === true
    );
    return Array.from(
      new Set(
        data?.teams
          .filter((team) => !hasTeamFilters || teamFilters[team.team] === true)
          .flatMap((team) =>
            team.repositories
              ?.filter(
                (repo) =>
                  !hasRepositoryFilters ||
                  repositoryFilters[repo.nameWithOwner] === true
              )
              .flatMap((repo) =>
                repo.vulnerabilities.map((vuln) => vuln.identifier)
              ) || []
          ) || []
      )
    );
  }, [data, teamFilters, repositoryFilters]);

  useEffect(
    function cleanupRepositoryFilters() {
      if (!data) return;

      const validRepositories = new Set(availableRepositories);
      const currentRepositories = Object.keys(repositoryFilters).filter(
        (repo) => repositoryFilters[repo] === true
      );
      const hasInvalidRepos = currentRepositories.some(
        (repo) => !validRepositories.has(repo)
      );

      if (hasInvalidRepos) {
        const cleanedFilters = Object.fromEntries(
          Object.entries(repositoryFilters).filter(([repo]) =>
            validRepositories.has(repo)
          )
        );
        startTransition(() => setRepositoryFilters(cleanedFilters));
      }
    },
    [availableRepositories, teamFilters, data, repositoryFilters]
  );

  useEffect(
    function cleanupCveFilters() {
      if (!data) return;

      const validCves = new Set(availableCves);
      const currentCves = Object.keys(cveFilters).filter(
        (cve) => cveFilters[cve] === true
      );
      const hasInvalidCves = currentCves.some((cve) => !validCves.has(cve));

      if (hasInvalidCves) {
        const cleanedFilters = Object.fromEntries(
          Object.entries(cveFilters).filter(([cve]) => validCves.has(cve))
        );
        startTransition(() => setCveFilters(cleanedFilters));
      }
    },
    [availableCves, teamFilters, repositoryFilters, data, cveFilters]
  );

  return {
    data,
    isLoading,
    isRefreshing,
    isSyncing,
    refresh,
    isDataStale,
    oldestSyncedAt,
    teamFilters,
    setTeamFilters: (filters: Record<string, boolean>) => {
      shouldSyncToUrlRef.current = true;
      setTeamFilters(filters);
    },
    repositoryFilters,
    setRepositoryFilters: (filters: Record<string, boolean>) => {
      shouldSyncToUrlRef.current = true;
      setRepositoryFilters(filters);
    },
    cveFilters,
    setCveFilters,
    allTeams,
    availableRepositories,
    availableCves,
  };
};
