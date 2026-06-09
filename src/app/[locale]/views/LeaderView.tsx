"use client";
import { useMemo } from "react";
import { useConfigContext } from "@/app/contexts/ConfigContext";
import { useVulnerabilitiesContext } from "@/app/contexts/VulnerabilitiesContext";
import { useSlaOverdue } from "@/app/shared/hooks/useSlaOverdue";
import { DEPLOYMENT_AGE_DAYS } from "@/app/shared/constants/deploymentAge";
import {
  BodyShort,
  Loader,
  Box,
  Heading,
  VStack,
  HGrid,
  HStack,
  Detail,
  Link,
  Table,
  ToggleGroup,
} from "@navikt/ds-react";
import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { useTranslations } from "next-intl";
import { formatNumber } from "@/lib/format";
import { calculateDeploymentAge } from "@/app/utils/deploymentAge";
import FilterButton from "@/app/components/FilterButton";
import { useComplianceFilter } from "@/app/shared/hooks/useComplianceFilter";


export default function LeaderView() {
  const t = useTranslations("leaderView");
  const tTeam = useTranslations("teamMemberView");
  const tFilter = useTranslations("complianceFilter");
  const { isLoading: configLoading } = useConfigContext();
  const { data: vulnData, isLoading: dataLoading } = useVulnerabilitiesContext();
  const { data: slaData, isLoading: slaLoading } = useSlaOverdue();

  const deploymentAgeDays = DEPLOYMENT_AGE_DAYS;

  const { activeTeams, hasAppFilters, isFilterActive, showFiltered, setShowFiltered, applicationFilters } = useComplianceFilter();

  const filteredTeams = activeTeams;

  const teamStatistics = useMemo(() => {
    if (!vulnData || !slaData) return [];

    return filteredTeams.map((team) => {
      const teamSla = slaData.teams.find(t => t.teamSlug === team.team);

      // Calculate deployment compliance based on filtered workloads
      let deploymentsNeedingUpdate = 0;
      team.workloads?.forEach((workload) => {
        const ageInfo = calculateDeploymentAge(workload.lastDeploy, deploymentAgeDays);
        if (ageInfo.hasDeploymentInfo && !ageInfo.isCompliant) {
          deploymentsNeedingUpdate++;
        }
      });

      // When app filter is active, reconstruct SLA counts from overdueItems
      // because backend totals include all apps in the team
      let criticalOverdue = teamSla?.criticalOverdue || 0;
      let nonCriticalOverdue = teamSla?.nonCriticalOverdue || 0;
      let repositoriesOutOfSla = teamSla?.repositoriesOutOfSla || 0;
      let maxDaysOverdue = teamSla?.maxDaysOverdue || 0;

      // When filter is active, reconstruct SLA counts from overdueItems
      // Derive activeAppNames here to ensure consistency within this memo
      const activeAppNames = isFilterActive
        ? new Set(Object.keys(applicationFilters).filter((k) => applicationFilters[k]))
        : null;

      if (activeAppNames && teamSla) {
        const criticalItems = (teamSla.criticalOverdueItems ?? []).filter(
          (item) => activeAppNames.has(item.applicationName)
        );
        const nonCriticalItems = (teamSla.nonCriticalOverdueItems ?? []).filter(
          (item) => activeAppNames.has(item.applicationName)
        );
        const overdueApps = new Set([
          ...criticalItems.map((i) => i.applicationName),
          ...nonCriticalItems.map((i) => i.applicationName),
        ]);
        criticalOverdue = criticalItems.length;
        nonCriticalOverdue = nonCriticalItems.length;
        repositoriesOutOfSla = overdueApps.size;
        maxDaysOverdue = criticalItems.length > 0
          ? Math.max(...criticalItems.map((i) => i.workdaysOverdue))
          : 0;
      }

      return {
        teamName: team.team,
        workloadCount: team.workloads?.length || 0,
        criticalOverdue,
        nonCriticalOverdue,
        repositoriesOutOfSla,
        maxDaysOverdue,
        deploymentsNeedingUpdate,
      };
    });
  }, [filteredTeams, vulnData, slaData, deploymentAgeDays, isFilterActive, applicationFilters]);

  const sortedTeams = useMemo(() => {
    const sorted = [...teamStatistics];
    sorted.sort((a, b) => {
      if (b.criticalOverdue !== a.criticalOverdue) return b.criticalOverdue - a.criticalOverdue;
      if (b.nonCriticalOverdue !== a.nonCriticalOverdue) return b.nonCriticalOverdue - a.nonCriticalOverdue;
      return a.teamName.localeCompare(b.teamName);
    });
    return sorted;
  }, [teamStatistics]);

  const aggregateStats = useMemo(() => {
    if (!slaData) return null;

    const totalCriticalOverdue = teamStatistics.reduce((sum, t) => sum + t.criticalOverdue, 0);
    const totalNonCriticalOverdue = teamStatistics.reduce((sum, t) => sum + t.nonCriticalOverdue, 0);
    const totalRepositoriesOutOfSla = teamStatistics.reduce((sum, t) => sum + t.repositoriesOutOfSla, 0);
    const totalDeploymentsNeedingUpdate = teamStatistics.reduce((sum, t) => sum + t.deploymentsNeedingUpdate, 0);
    const totalWorkloads = teamStatistics.reduce((sum, t) => sum + t.workloadCount, 0);

    // For percentage: use total vulns from filtered teams' sla data as denominator
    const relevantSlaTeams = hasAppFilters
      ? slaData.teams.filter((t) => filteredTeams.some((ft) => ft.team === t.teamSlug))
      : slaData.teams;
    const totalVulnerabilities = relevantSlaTeams.reduce(
      (sum, t) => sum + (t.totalVulnerabilities || 0), 0
    );

    return {
      totalTeams: teamStatistics.length,
      totalWorkloads,
      totalCriticalOverdue,
      totalNonCriticalOverdue,
      totalRepositoriesOutOfSla,
      totalDeploymentsNeedingUpdate,
      percentageNeedingAttention:
        (totalCriticalOverdue + totalNonCriticalOverdue) > 0 && totalVulnerabilities > 0
          ? Math.round(((totalCriticalOverdue + totalNonCriticalOverdue) / totalVulnerabilities) * 100)
          : 0,
    };
  }, [teamStatistics, slaData, hasAppFilters, filteredTeams]);

  if (configLoading || dataLoading || slaLoading || !aggregateStats) {
    return (
      <Box paddingBlock={{ xs: "space-16", md: "space-24" }}>
        <main>
          <VStack gap="space-24">
            <div>
              <Heading size="large" level="1">
                {t("title")}
              </Heading>
              <BodyShort spacing>{t("loadingData")}</BodyShort>
            </div>
            <Box
              padding="space-24"
              borderRadius="8"
              background="neutral-soft"
              style={{ textAlign: "center" }}
            >
              <Loader size="large" title={t("loadingData")} />
            </Box>
          </VStack>
        </main>
      </Box>
    );
  }

  return (
    <Box paddingBlock={{ xs: "space-16", md: "space-24" }}>
      <main>
        <VStack gap="space-32">
          <div>
            <HStack justify="space-between" align="start">
              <Heading size="large" level="1" spacing>
                {t("title")}
              </Heading>
              <HStack gap="space-8" align="center">
                {hasAppFilters && (
                  <ToggleGroup
                    size="small"
                    value={showFiltered ? "filtered" : "all"}
                    onChange={(v) => setShowFiltered(v === "filtered")}
                  >
                    <ToggleGroup.Item value="filtered">{tFilter("showFiltered")}</ToggleGroup.Item>
                    <ToggleGroup.Item value="all">{tFilter("showAll")}</ToggleGroup.Item>
                  </ToggleGroup>
                )}
                <FilterButton />
              </HStack>
            </HStack>
            <BodyShort spacing>
              {t("description")}
            </BodyShort>
            <Box
              padding="space-12"
              borderRadius="8"
              background="info-soft"
            >
              <BodyShort size="small">
                {tTeam("basedOnRequirement")}{" "}
                <Link href="https://etterlevelse.ansatt.nav.no/krav/267/1" target="_blank">
                  K267.1 <ExternalLinkIcon aria-hidden />
                </Link>
              </BodyShort>
            </Box>
          </div>

          {/* Aggregate Summary */}
          <Box
            padding="space-16"
            borderRadius="8"
            background="neutral-soft"
          >
            <VStack gap="space-12">
              <Heading size="small" level="2">
                {tTeam("overview")}
              </Heading>
              <HGrid columns={{ xs: 2, sm: 3, lg: 5 }} gap="space-12">
                <Box>
                  <Detail>{tTeam("totalTeams")}</Detail>
                  <Heading size="medium" level="3">
                    {formatNumber(aggregateStats.totalTeams)}
                  </Heading>
                </Box>
                <Box>
                  <Detail>{tTeam("totalWorkloads")}</Detail>
                  <Heading size="medium" level="3">
                    {formatNumber(aggregateStats.totalWorkloads)}
                  </Heading>
                </Box>
                <Box>
                  <Detail>{tTeam("percentageNeedingAttention")}</Detail>
                  <Heading 
                    size="medium" 
                    level="3"
                    style={{ 
                      color: aggregateStats.percentageNeedingAttention > 20 
                        ? "var(--a-text-danger)" 
                        : aggregateStats.percentageNeedingAttention > 5 
                          ? "var(--a-text-warning)" 
                          : "var(--a-text-success)" 
                    }}
                  >
                    {formatNumber(aggregateStats.percentageNeedingAttention)}%
                  </Heading>
                </Box>
                <Box>
                  <Detail>{tTeam("criticalNeedsAttention")}</Detail>
                  <Heading 
                    size="medium" 
                    level="3"
                    style={{ 
                      color: aggregateStats.totalCriticalOverdue > 0 
                        ? "var(--a-text-danger)" 
                        : undefined
                    }}
                  >
                    {formatNumber(aggregateStats.totalCriticalOverdue)}
                  </Heading>
                </Box>
                <Box>
                  <Detail>{tTeam("nonCriticalNeedsAttention")}</Detail>
                  <Heading 
                    size="medium" 
                    level="3"
                    style={{ 
                      color: aggregateStats.totalNonCriticalOverdue > 0 
                        ? "var(--a-text-warning)" 
                        : undefined
                    }}
                  >
                    {formatNumber(aggregateStats.totalNonCriticalOverdue)}
                  </Heading>
                </Box>
              </HGrid>
            </VStack>
          </Box>

          {/* Team Table */}
          <Box
            padding="space-16"
            borderRadius="8"
            background="default"
            borderWidth="1"
            borderColor="neutral-subtle"
          >
            <VStack gap="space-12">
              <Heading size="medium" level="2">
                {t("teamsSection")}
              </Heading>
              <Table size="small">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell scope="col">{tTeam("team")}</Table.HeaderCell>
                    <Table.HeaderCell scope="col" align="right">{tTeam("totalWorkloads")}</Table.HeaderCell>
                    <Table.HeaderCell scope="col" align="right">{tTeam("criticalNeedsAttention")}</Table.HeaderCell>
                    <Table.HeaderCell scope="col" align="right">{tTeam("nonCriticalNeedsAttention")}</Table.HeaderCell>
                    <Table.HeaderCell scope="col" align="right">{tTeam("repositoriesNeedingAttention")}</Table.HeaderCell>
                    <Table.HeaderCell scope="col" align="right">{tTeam("deploymentsNeedingUpdate")}</Table.HeaderCell>
                    <Table.HeaderCell scope="col" align="right">{tTeam("maxWorkdaysOverdue")}</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {sortedTeams.map((team) => (
                    <Table.Row 
                      key={team.teamName}
                      style={{
                        borderLeft: team.criticalOverdue > 0 || team.nonCriticalOverdue > 0 
                          ? `4px solid ${team.criticalOverdue > 0 ? 'var(--a-border-danger)' : 'var(--a-border-warning)'}` 
                          : undefined,
                      }}
                    >
                      <Table.DataCell>
                        <BodyShort weight="semibold">{team.teamName}</BodyShort>
                      </Table.DataCell>
                      <Table.DataCell align="right">
                        {formatNumber(team.workloadCount)}
                      </Table.DataCell>
                      <Table.DataCell align="right">
                        <BodyShort 
                          weight={team.criticalOverdue > 0 ? "semibold" : undefined}
                          style={{ 
                            color: team.criticalOverdue > 0 
                              ? "var(--a-text-danger)" 
                              : undefined
                          }}
                        >
                          {formatNumber(team.criticalOverdue)}
                        </BodyShort>
                      </Table.DataCell>
                      <Table.DataCell align="right">
                        <BodyShort 
                          weight={team.nonCriticalOverdue > 0 ? "semibold" : undefined}
                          style={{ 
                            color: team.nonCriticalOverdue > 0 
                              ? "var(--a-text-warning)" 
                              : undefined
                          }}
                        >
                          {formatNumber(team.nonCriticalOverdue)}
                        </BodyShort>
                      </Table.DataCell>
                      <Table.DataCell align="right">
                        {formatNumber(team.repositoriesOutOfSla)}
                      </Table.DataCell>
                      <Table.DataCell align="right">
                        {team.deploymentsNeedingUpdate > 0 ? (
                          <BodyShort 
                            weight="semibold"
                            style={{ color: "var(--a-text-warning)" }}
                          >
                            {formatNumber(team.deploymentsNeedingUpdate)}
                          </BodyShort>
                        ) : (
                          formatNumber(team.deploymentsNeedingUpdate)
                        )}
                      </Table.DataCell>
                      <Table.DataCell align="right">
                        {team.maxDaysOverdue > 0 ? (
                          <BodyShort size="small">
                            {formatNumber(team.maxDaysOverdue)} {tTeam("workdays")}
                          </BodyShort>
                        ) : (
                          "-"
                        )}
                      </Table.DataCell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </VStack>
          </Box>

          {aggregateStats.totalCriticalOverdue === 0 && aggregateStats.totalNonCriticalOverdue === 0 && (
            <Box
              padding="space-24"
              borderRadius="8"
              background="success-soft"
              style={{ textAlign: "center" }}
            >
              <Heading size="medium" level="2">
                {tTeam("noCriticalOverdue")}
              </Heading>
              <BodyShort>
                {tTeam("noCriticalOverdueDescription")}
              </BodyShort>
            </Box>
          )}
        </VStack>
      </main>
    </Box>
  );
}
