"use client";
import { useMemo, useState, ReactNode } from "react";
import {
  VulnerabilitiesContext,
  VulnerabilitiesContextType,
} from "@/app/contexts/VulnerabilitiesContext";
import { VulnerabilitiesResponse } from "@/app/shared/types/vulnerabilities";
import { ApiError } from "@/app/shared/utils/errorHandling";

interface AdminTeamVulnerabilitiesProviderProps {
  children: ReactNode;
  data: VulnerabilitiesResponse | null;
  isLoading: boolean;
  error: ApiError | null;
}

export function AdminTeamVulnerabilitiesProvider({
  children,
  data,
  isLoading,
  error,
}: AdminTeamVulnerabilitiesProviderProps) {
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

  const allTeams = useMemo(
    () => data?.teams.map((team) => team.team) ?? [],
    [data]
  );

  const availableEnvironments = useMemo(() => {
    const hasTeamFilters = Object.values(teamFilters).some((v) => v === true);
    return Array.from(
      new Set(
        data?.teams
          .filter(
            (team) => !hasTeamFilters || teamFilters[team.team] === true
          )
          .flatMap((team) =>
            team.workloads.map((workload) => workload.environment)
          ) ?? []
      )
    );
  }, [data, teamFilters]);

  const availableApplications = useMemo(() => {
    const hasTeamFilters = Object.values(teamFilters).some((v) => v === true);
    const hasEnvironmentFilters = Object.values(environmentFilters).some(
      (v) => v === true
    );
    return Array.from(
      new Set(
        data?.teams
          .filter(
            (team) => !hasTeamFilters || teamFilters[team.team] === true
          )
          .flatMap((team) =>
            team.workloads
              .filter(
                (workload) =>
                  !hasEnvironmentFilters ||
                  environmentFilters[workload.environment] === true
              )
              .map((workload) => workload.name)
          ) ?? []
      )
    );
  }, [data, teamFilters, environmentFilters]);

  const availableCves = useMemo(() => {
    const hasTeamFilters = Object.values(teamFilters).some((v) => v === true);
    const hasApplicationFilters = Object.values(applicationFilters).some(
      (v) => v === true
    );
    const hasEnvironmentFilters = Object.values(environmentFilters).some(
      (v) => v === true
    );
    return Array.from(
      new Set(
        data?.teams
          .filter(
            (team) => !hasTeamFilters || teamFilters[team.team] === true
          )
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
          ) ?? []
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
          .filter(
            (team) => !hasTeamFilters || teamFilters[team.team] === true
          )
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
          ) ?? []
      )
    );
  }, [data, teamFilters, applicationFilters, cveFilters]);

  const value: VulnerabilitiesContextType = {
    data,
    isLoading,
    isRefreshing: false,
    error,
    refresh: () => false,
    canRefresh: false,
    timeUntilRefresh: 0,
    teamFilters,
    setTeamFilters,
    applicationFilters,
    setApplicationFilters,
    environmentFilters,
    setEnvironmentFilters,
    cveFilters,
    setCveFilters,
    packageNameFilters,
    setPackageNameFilters,
    allTeams,
    availableEnvironments,
    availableApplications,
    availableCves,
    availablePackageNames,
  };

  return (
    <VulnerabilitiesContext.Provider value={value}>
      {children}
    </VulnerabilitiesContext.Provider>
  );
}
