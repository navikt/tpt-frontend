import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { VulnerabilitiesResponse } from "@/app/types/vulnerabilities";

const REFRESH_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const CACHE_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes
const LAST_REFRESH_STORAGE_KEY = "tpt-last-refresh-time";
const VULNERABILITIES_STORAGE_KEY = "tpt-vulnerabilities-data";
const CACHE_TIMESTAMP_STORAGE_KEY = "tpt-cache-timestamp";

// Helper to get last refresh time from localStorage
const getStoredLastRefreshTime = (): number | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(LAST_REFRESH_STORAGE_KEY);
  return stored ? parseInt(stored, 10) : null;
};

// Helper to store last refresh time in localStorage
const setStoredLastRefreshTime = (time: number) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LAST_REFRESH_STORAGE_KEY, time.toString());
};

// Helper to get cache timestamp from localStorage
const getStoredCacheTimestamp = (): number | null => {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(CACHE_TIMESTAMP_STORAGE_KEY);
  return stored ? parseInt(stored, 10) : null;
};

// Helper to store cache timestamp in localStorage
const setStoredCacheTimestamp = (time: number) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CACHE_TIMESTAMP_STORAGE_KEY, time.toString());
};

// Helper to get cached vulnerabilities data from localStorage
const getStoredVulnerabilities = (): VulnerabilitiesResponse | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(VULNERABILITIES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// Helper to store vulnerabilities data in localStorage
const setStoredVulnerabilities = (data: VulnerabilitiesResponse) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VULNERABILITIES_STORAGE_KEY, JSON.stringify(data));
    setStoredCacheTimestamp(Date.now());
  } catch (error) {
    console.warn("Failed to cache vulnerabilities data:", error);
  }
};

// Check if cache is expired (older than 30 minutes)
const isCacheExpired = (): boolean => {
  const cacheTimestamp = getStoredCacheTimestamp();
  if (!cacheTimestamp) return true;
  return Date.now() - cacheTimestamp > CACHE_MAX_AGE_MS;
};

export const useVulnerabilities = () => {
  const [data, setData] = useState<VulnerabilitiesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null);
  const [teamFilters, setTeamFilters] = useState<Record<string, boolean>>({});
  const [applicationFilters, setApplicationFilters] = useState<
    Record<string, boolean>
  >({});
  const [cveFilters, setCveFilters] = useState<Record<string, boolean>>({});
  const hasFetchedRef = useRef(false);

  // Load cached data and last refresh time from localStorage on mount
  useEffect(() => {
    const storedTime = getStoredLastRefreshTime();
    if (storedTime) {
      setLastRefreshTime(storedTime);
    }
    
    const cachedData = getStoredVulnerabilities();
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
      const url = bypassCache ? "/api/applications?bypassCache=true" : "/api/applications";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const responseData: VulnerabilitiesResponse = await response.json();
      setData(responseData);
      setStoredVulnerabilities(responseData);
      setTeamFilters({});
      setApplicationFilters({});
      setCveFilters({});
      if (bypassCache) {
        const now = Date.now();
        setLastRefreshTime(now);
        setStoredLastRefreshTime(now);
      }
    } catch (error) {
      console.error("Error fetching applications data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const refresh = useCallback(() => {
    const now = Date.now();
    const storedTime = getStoredLastRefreshTime();
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

  useEffect(function fetchVulnerabilitiesEffect() {
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

  const availableApplications = useMemo(() => {
    const hasTeamFilters = Object.values(teamFilters).some((v) => v === true);
    return (
      data?.teams
        .filter((team) => !hasTeamFilters || teamFilters[team.team] === true)
        .flatMap((team) => team.workloads.map((workload) => workload.name)) ||
      []
    );
  }, [data, teamFilters]);

  const availableCves = useMemo(() => {
    const hasTeamFilters = Object.values(teamFilters).some((v) => v === true);
    const hasApplicationFilters = Object.values(applicationFilters).some(
      (v) => v === true
    );
    return Array.from(
      new Set(
        data?.teams
          .filter((team) => !hasTeamFilters || teamFilters[team.team] === true)
          .flatMap((team) =>
            team.workloads
              .filter(
                (workload) =>
                  !hasApplicationFilters ||
                  applicationFilters[workload.name] === true
              )
              .flatMap((workload) =>
                workload.vulnerabilities.map((vuln) => vuln.identifier)
              )
          ) || []
      )
    );
  }, [data, teamFilters, applicationFilters]);

  useEffect(
    function cleanupApplicationFilters() {
      if (!data) return;

      const validApplications = new Set(availableApplications);
      const currentApplications = Object.keys(applicationFilters).filter(
        (app) => applicationFilters[app] === true
      );
      const hasInvalidApps = currentApplications.some(
        (app) => !validApplications.has(app)
      );

      if (hasInvalidApps) {
        const cleanedFilters = Object.fromEntries(
          Object.entries(applicationFilters).filter(([app]) =>
            validApplications.has(app)
          )
        );
        setApplicationFilters(cleanedFilters);
      }
    },
    [availableApplications, teamFilters, data, applicationFilters]
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
    [availableCves, teamFilters, applicationFilters, data, cveFilters]
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
    applicationFilters,
    setApplicationFilters,
    cveFilters,
    setCveFilters,
    allTeams,
    availableApplications,
    availableCves,
  };
};
