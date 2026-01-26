import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { VulnerabilitiesResponse } from "@/app/shared/types/vulnerabilities";
import {
  getStoredNumber,
  setStoredNumber,
  getStoredJSON,
  setStoredJSON,
  TEAM_PREFERENCES_KEY,
} from "@/app/shared/utils/storageHelpers";

const REFRESH_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const CACHE_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes
const LAST_REFRESH_STORAGE_KEY = "tpt-last-refresh-time";
const VULNERABILITIES_STORAGE_KEY = "tpt-vulnerabilities-data";
const CACHE_TIMESTAMP_STORAGE_KEY = "tpt-cache-timestamp";

// Check if cache is expired (older than 30 minutes)
const isCacheExpired = (): boolean => {
  const cacheTimestamp = getStoredNumber(CACHE_TIMESTAMP_STORAGE_KEY);
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
  const [environmentFilters, setEnvironmentFilters] = useState<
    Record<string, boolean>
  >({});
  const [cveFilters, setCveFilters] = useState<Record<string, boolean>>({});
  const [packageNameFilters, setPackageNameFilters] = useState<
    Record<string, boolean>
  >({});
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

    // Load saved team preferences
    const savedTeams = getStoredJSON<string[]>(TEAM_PREFERENCES_KEY);
    if (savedTeams && Array.isArray(savedTeams)) {
      const teamFiltersObj = Object.fromEntries(savedTeams.map(team => [team, true]));
      setTeamFilters(teamFiltersObj);
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
      setStoredJSON(VULNERABILITIES_STORAGE_KEY, responseData);
      setStoredNumber(CACHE_TIMESTAMP_STORAGE_KEY, Date.now());
      setTeamFilters({});
      setApplicationFilters({});
      setEnvironmentFilters({});
      setCveFilters({});
      setPackageNameFilters({});
      if (bypassCache) {
        const now = Date.now();
        setLastRefreshTime(now);
        setStoredNumber(LAST_REFRESH_STORAGE_KEY, now);
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

  // Persist team filters to localStorage when they change
  useEffect(() => {
    const selectedTeams = Object.keys(teamFilters).filter(team => teamFilters[team] === true);
    setStoredJSON(TEAM_PREFERENCES_KEY, selectedTeams);
  }, [teamFilters]);

  const availableEnvironments = useMemo(() => {
    const hasTeamFilters = Object.values(teamFilters).some((v) => v === true);
    return Array.from(
      new Set(
        data?.teams
          .filter((team) => !hasTeamFilters || teamFilters[team.team] === true)
          .flatMap((team) =>
            team.workloads.map((workload) => workload.environment)
          ) || []
      )
    );
  }, [data, teamFilters]);


  const availableApplications = useMemo(() => {
    const hasTeamFilters = Object.values(teamFilters).some((v) => v === true);
    const hasEnvironmentFilters = Object.values(environmentFilters).some((v) => v === true);
    return Array.from(
      new Set(data?.teams
        .filter((team) => !hasTeamFilters || teamFilters[team.team] === true)
        .flatMap((team) => team.workloads
          .filter((workload) => !hasEnvironmentFilters || environmentFilters[workload.environment] === true)
          .map((workload) => workload.name))) ||
      []
    );
  }, [data, teamFilters, environmentFilters]);

  const availableCves = useMemo(() => {
    const hasTeamFilters = Object.values(teamFilters).some((v) => v === true);
    const hasApplicationFilters = Object.values(applicationFilters).some(
      (v) => v === true
    );
    const hasEnvironmentFilters = Object.values(environmentFilters).some((v) => v === true);
    return Array.from(
      new Set(
        data?.teams
          .filter((team) => !hasTeamFilters || teamFilters[team.team] === true)
          .flatMap((team) =>
            team.workloads
              .filter(
                (workload) =>
                  (!hasApplicationFilters ||
                  applicationFilters[workload.name] === true) &&
                  (!hasEnvironmentFilters ||
                  environmentFilters[workload.environment] === true)
              )
              .flatMap((workload) =>
                workload.vulnerabilities.map((vuln) => vuln.identifier)
              )
          ) || []
      )
    );
  }, [data, teamFilters, applicationFilters, environmentFilters]);

  const availablePackageNames = useMemo(() => {
    const hasTeamFilters = Object.values(teamFilters).some((v) => v === true);
    const hasApplicationFilters = Object.values(applicationFilters).some(
      (v) => v === true
    );
    const hasCveFilters = Object.values(cveFilters).some((v) => v === true);
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
                workload.vulnerabilities
                  .filter(
                    (vuln) =>
                      !hasCveFilters || cveFilters[vuln.identifier] === true
                  )
                  .map((vuln) => vuln.packageName)
              )
          ) || []
      )
    );
  }, [data, teamFilters, applicationFilters, cveFilters]);

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
    function cleanupEnvironmentFilters() {
      if (!data) return;

      const validEnvironments = new Set(availableEnvironments);
      const currentEnvironments = Object.keys(environmentFilters).filter(
        (env) => environmentFilters[env] === true
      );
      const hasInvalidEnvs = currentEnvironments.some(
        (env) => !validEnvironments.has(env)
      );

      if (hasInvalidEnvs) {
        const cleanedFilters = Object.fromEntries(
          Object.entries(environmentFilters).filter(([env]) =>
            validEnvironments.has(env)
          )
        );
        setEnvironmentFilters(cleanedFilters);
      }
    },
    [availableEnvironments, applicationFilters, data, environmentFilters]
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

  useEffect(
    function cleanupPackageNameFilters() {
      if (!data) return;

      const validPackageNames = new Set(availablePackageNames);
      const currentPackageNames = Object.keys(packageNameFilters).filter(
        (pkg) => packageNameFilters[pkg] === true
      );
      const hasInvalidPackages = currentPackageNames.some(
        (pkg) => !validPackageNames.has(pkg)
      );

      if (hasInvalidPackages) {
        const cleanedFilters = Object.fromEntries(
          Object.entries(packageNameFilters).filter(([pkg]) =>
            validPackageNames.has(pkg)
          )
        );
        setPackageNameFilters(cleanedFilters);
      }
    },
    [availablePackageNames, teamFilters, applicationFilters, cveFilters, data, packageNameFilters]
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
    environmentFilters,
    setEnvironmentFilters,
    availableEnvironments,
    cveFilters,
    setCveFilters,
    allTeams,
    availableApplications,
    availableCves,
    packageNameFilters,
    setPackageNameFilters,
    availablePackageNames,
  };
};
