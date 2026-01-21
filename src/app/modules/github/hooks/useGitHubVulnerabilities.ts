import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { VulnerabilitiesResponse } from "@/app/shared/types/vulnerabilities";
import {
  getStoredNumber,
  setStoredNumber,
  getStoredJSON,
  setStoredJSON,
} from "@/app/shared/utils/storageHelpers";

const REFRESH_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const CACHE_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes
const LAST_REFRESH_STORAGE_KEY = "tpt-last-refresh-github";
const VULNERABILITIES_STORAGE_KEY = "tpt-github-vulnerabilities-data";
const CACHE_TIMESTAMP_STORAGE_KEY = "tpt-github-cache-timestamp";

// Check if cache is expired (older than 30 minutes)
const isCacheExpired = (): boolean => {
  const cacheTimestamp = getStoredNumber(CACHE_TIMESTAMP_STORAGE_KEY);
  if (!cacheTimestamp) return true;
  return Date.now() - cacheTimestamp > CACHE_MAX_AGE_MS;
};

export const useGitHubVulnerabilities = () => {
  const [data, setData] = useState<VulnerabilitiesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null);
  const [teamFilters, setTeamFilters] = useState<Record<string, boolean>>({});
  const [repositoryFilters, setRepositoryFilters] = useState<
    Record<string, boolean>
  >({});
  const [cveFilters, setCveFilters] = useState<Record<string, boolean>>({});
  const hasFetchedRef = useRef(false);

  // Load cached data and last refresh time from localStorage on mount
  useEffect(() => {
    const storedTime = getStoredNumber(LAST_REFRESH_STORAGE_KEY);
    if (storedTime) {
      setLastRefreshTime(storedTime);
    }
    
    const cachedData = getStoredJSON<VulnerabilitiesResponse>(VULNERABILITIES_STORAGE_KEY);
    if (cachedData && !isCacheExpired()) {
      setData(cachedData);
    }
  }, []);

  const fetchData = useCallback(async (bypassCache = false) => {
    try {
      if (bypassCache) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      const url = bypassCache ? "/api/github?bypassCache=true" : "/api/github";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const responseData: VulnerabilitiesResponse = await response.json();
      setData(responseData);
      setStoredJSON(VULNERABILITIES_STORAGE_KEY, responseData);
      setStoredNumber(CACHE_TIMESTAMP_STORAGE_KEY, Date.now());
      setTeamFilters({});
      setRepositoryFilters({});
      setCveFilters({});
      if (bypassCache) {
        const now = Date.now();
        setLastRefreshTime(now);
        setStoredNumber(LAST_REFRESH_STORAGE_KEY, now);
      }
    } catch (error) {
      console.error("Error fetching GitHub vulnerabilities data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const refresh = useCallback(() => {
    const now = Date.now();
    const storedTime = getStoredNumber(LAST_REFRESH_STORAGE_KEY);
    if (storedTime && now - storedTime < REFRESH_COOLDOWN_MS) {
      return false; // Cooldown not elapsed
    }
    fetchData(true);
    return true;
  }, [fetchData]);

  const canRefresh = useMemo(() => {
    if (!lastRefreshTime) return true;
    return Date.now() - lastRefreshTime >= REFRESH_COOLDOWN_MS;
  }, [lastRefreshTime]);

  const timeUntilRefresh = useMemo(() => {
    if (!lastRefreshTime) return 0;
    const elapsed = Date.now() - lastRefreshTime;
    return Math.max(0, REFRESH_COOLDOWN_MS - elapsed);
  }, [lastRefreshTime]);

  useEffect(function fetchGitHubVulnerabilitiesEffect() {
    // Skip if already fetched in this session
    if (hasFetchedRef.current) return;
    
    // If we have valid cached data, don't fetch
    if (data && !isCacheExpired()) return;
    
    // Fetch data (cache is missing or expired)
    hasFetchedRef.current = true;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const allTeams = useMemo(
    () => data?.teams.map((team) => team.team) || [],
    [data]
  );

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
        setRepositoryFilters(cleanedFilters);
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
        setCveFilters(cleanedFilters);
      }
    },
    [availableCves, teamFilters, repositoryFilters, data, cveFilters]
  );

  return {
    data,
    isLoading,
    isRefreshing,
    refresh,
    canRefresh,
    timeUntilRefresh,
    teamFilters,
    setTeamFilters,
    repositoryFilters,
    setRepositoryFilters,
    cveFilters,
    setCveFilters,
    allTeams,
    availableRepositories,
    availableCves,
  };
};
