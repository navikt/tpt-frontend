import { useState, useEffect, useCallback } from "react";
import { VulnerabilitiesResponse } from "@/app/types/vulnerabilities";

export const useVulnerabilities = () => {
  const [data, setData] = useState<VulnerabilitiesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [teamFilters, setTeamFilters] = useState<Record<string, boolean>>({});
  const [applicationFilters, setApplicationFilters] = useState<
    Record<string, boolean>
  >({});
  const [cveFilters, setCveFilters] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (data) {
      const updatedApplicationFilters: Record<string, boolean> = {};
      data.teams.forEach((team) => {
        if (teamFilters[team.team] === true) {
          team.workloads.forEach((workload) => {
            updatedApplicationFilters[workload.name] = true;
          });
        }
      });
      setApplicationFilters(updatedApplicationFilters);
    }
  }, [teamFilters, data]);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/applications");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: VulnerabilitiesResponse = await response.json();
      setData(data);
      setTeamFilters(
        data.teams.reduce((acc, team) => {
          acc[team.team] = true;
          return acc;
        }, {} as Record<string, boolean>)
      );
      setApplicationFilters(
        data.teams.reduce((acc, team) => {
          team.workloads.forEach((workload) => {
            acc[workload.name] = true;
          });
          return acc;
        }, {} as Record<string, boolean>)
      );
      const allCves = new Set<string>();
      data.teams.forEach((team) => {
        team.workloads.forEach((workload) => {
          workload.vulnerabilities.forEach((vuln) => {
            allCves.add(vuln.identifier);
          });
        });
      });
      setCveFilters(
        Array.from(allCves).reduce((acc, cve) => {
          acc[cve] = true;
          return acc;
        }, {} as Record<string, boolean>)
      );
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching applications data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (data) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    isLoading,
    teamFilters,
    setTeamFilters,
    applicationFilters,
    setApplicationFilters,
    cveFilters,
    setCveFilters,
  };
};
