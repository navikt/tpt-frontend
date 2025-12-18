import { useState, useEffect, useCallback, useMemo } from "react";
import { VulnerabilitiesResponse } from "@/app/types/vulnerabilities";

export const useVulnerabilities = () => {
  const [data, setData] = useState<VulnerabilitiesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [teamFilters, setTeamFilters] = useState<Record<string, boolean>>({});
  const [applicationFilters, setApplicationFilters] = useState<
    Record<string, boolean>
  >({});
  const [cveFilters, setCveFilters] = useState<Record<string, boolean>>({});

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/applications");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: VulnerabilitiesResponse = await response.json();
      setData(data);
      setTeamFilters({});
      setApplicationFilters({});
      setCveFilters({});
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching applications data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(function fetchVulnerabilitiesEffect() {
    if (data) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
