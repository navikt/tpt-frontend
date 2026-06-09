"use client";
import { useMemo } from "react";
import { useSlaOverdue } from "@/app/shared/hooks/useSlaOverdue";
import { useVulnerabilitiesContext } from "@/app/contexts/VulnerabilitiesContext";
import { useConfigContext } from "@/app/contexts/ConfigContext";
import { BodyShort, Loader, Box, Heading, VStack, HGrid, Table, Detail, Accordion, Link, HStack, ToggleGroup } from "@navikt/ds-react";
import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { useTranslations } from "next-intl";
import { formatNumber } from "@/lib/format";
import { calculateDeploymentAge } from "@/app/utils/deploymentAge";
import { DEPLOYMENT_AGE_DAYS } from "@/app/shared/constants/deploymentAge";
import FilterButton from "@/app/components/FilterButton";
import { useComplianceFilter } from "@/app/shared/hooks/useComplianceFilter";

export default function TeamMemberView() {
  const t = useTranslations("teamMemberView");
  const tFilter = useTranslations("complianceFilter");
  const { data: slaData, isLoading: slaLoading } = useSlaOverdue();
  const { data: vulnData, isLoading: vulnLoading } = useVulnerabilitiesContext();
  const { isLoading: configLoading } = useConfigContext();

  const deploymentAgeDays = DEPLOYMENT_AGE_DAYS;

  const { activeTeams, hasAppFilters, isFilterActive, showFiltered, setShowFiltered, applicationFilters } = useComplianceFilter();

  const filteredTeams = activeTeams;

  const overview = useMemo(() => {
    if (!vulnData || !vulnData.teams) return null;

    const totalTeams = filteredTeams.length;
    const totalWorkloads = filteredTeams.reduce(
      (sum, team) => sum + (team.workloads?.length || 0),
      0
    );
    const totalVulnerabilities = filteredTeams.reduce(
      (sum, team) =>
        sum +
        (team.workloads?.reduce(
          (workloadSum, workload) => workloadSum + (workload.vulnerabilities?.length || 0),
          0
        ) || 0),
      0
    );

    return {
      totalTeams,
      totalWorkloads,
      totalVulnerabilities,
    };
  }, [filteredTeams, vulnData]);

  const deploymentCompliance = useMemo(() => {
    if (!vulnData || !vulnData.teams) return null;

    let totalWorkloadsWithDeployInfo = 0;
    let nonCompliantWorkloads = 0;

    const teamDetails = filteredTeams.map((team) => {
      const workloadDetails = team.workloads?.map((workload) => {
        const ageInfo = calculateDeploymentAge(workload.lastDeploy, deploymentAgeDays);
        if (ageInfo.hasDeploymentInfo) {
          totalWorkloadsWithDeployInfo++;
          if (!ageInfo.isCompliant) {
            nonCompliantWorkloads++;
          }
        }
        return {
          ...workload,
          ageInfo,
        };
      }) || [];

      const teamNonCompliant = workloadDetails.filter(w => w.ageInfo?.hasDeploymentInfo && !w.ageInfo?.isCompliant).length;

      return {
        team: team.team,
        workloads: workloadDetails,
        nonCompliantCount: teamNonCompliant,
      };
    });

    return {
      totalWorkloadsWithDeployInfo,
      nonCompliantWorkloads,
      teamDetails: teamDetails.filter(t => t.nonCompliantCount > 0),
    };
  }, [filteredTeams, vulnData, deploymentAgeDays]);

  const filteredTeamSlugs = useMemo(
    () => new Set(filteredTeams.map((t) => t.team)),
    [filteredTeams]
  );

  const slaTotals = useMemo(() => {
    if (!slaData || !slaData.teams) return null;

    // Derive activeAppNames here to ensure consistency within this memo
    const activeAppNames = isFilterActive
      ? new Set(Object.keys(applicationFilters).filter((k) => applicationFilters[k]))
      : null;

    const relevantSlaTeams = activeAppNames
      ? slaData.teams.filter((t) => filteredTeamSlugs.has(t.teamSlug))
      : slaData.teams;

    const computedTeams = relevantSlaTeams.map((team) => {
      if (!activeAppNames) return team;

      const criticalItems = (team.criticalOverdueItems ?? []).filter(
        (item) => activeAppNames.has(item.applicationName)
      );
      const nonCriticalItems = (team.nonCriticalOverdueItems ?? []).filter(
        (item) => activeAppNames.has(item.applicationName)
      );

      const criticalAppSet = new Set(criticalItems.map((i) => i.applicationName));
      const nonCriticalAppSet = new Set(nonCriticalItems.map((i) => i.applicationName));
      const allOverdueApps = new Set([...criticalAppSet, ...nonCriticalAppSet]);

      return {
        ...team,
        criticalOverdue: criticalItems.length,
        nonCriticalOverdue: nonCriticalItems.length,
        repositoriesOutOfSla: allOverdueApps.size,
        maxDaysOverdue: criticalItems.length > 0
          ? Math.max(...criticalItems.map((i) => i.workdaysOverdue))
          : 0,
        criticalOverdueItems: criticalItems,
        nonCriticalOverdueItems: nonCriticalItems,
      };
    });

    const totalCriticalOverdue = computedTeams.reduce(
      (sum, team) => sum + (team.criticalOverdue || 0), 0
    );
    const totalNonCriticalOverdue = computedTeams.reduce(
      (sum, team) => sum + (team.nonCriticalOverdue || 0), 0
    );
    const totalCriticalWithinSla = computedTeams.reduce(
      (sum, team) => sum + (team.criticalWithinSla || 0), 0
    );
    const totalNonCriticalWithinSla = computedTeams.reduce(
      (sum, team) => sum + (team.nonCriticalWithinSla || 0), 0
    );
    const totalRepositoriesOutOfSla = computedTeams.reduce(
      (sum, team) => sum + (team.repositoriesOutOfSla || 0), 0
    );

    const totalVulnerabilities = totalCriticalOverdue + totalNonCriticalOverdue + totalCriticalWithinSla + totalNonCriticalWithinSla;
    const totalNeedingAttention = totalCriticalOverdue + totalNonCriticalOverdue;
    const percentageNeedingAttention = totalVulnerabilities > 0
      ? Math.round((totalNeedingAttention / totalVulnerabilities) * 100)
      : 0;

    return {
      totalCriticalOverdue,
      totalNonCriticalOverdue,
      totalCriticalWithinSla,
      totalNonCriticalWithinSla,
      totalRepositoriesOutOfSla,
      totalVulnerabilities,
      totalNeedingAttention,
      percentageNeedingAttention,
      relevantSlaTeams: computedTeams.filter(
        (t) => t.criticalOverdue > 0 || t.nonCriticalOverdue > 0
      ),
    };
  }, [slaData, filteredTeamSlugs, isFilterActive, applicationFilters]);

  if (slaLoading || vulnLoading || configLoading || !slaData || !slaTotals || !overview || !deploymentCompliance) {
    return (
      <Box paddingBlock={{ xs: "space-16", md: "space-24" }}>
        <main>
          <VStack gap="space-24">
            <div>
              <Heading size="large" level="1">
                {t("title")}
              </Heading>
              <BodyShort spacing>
                {t("description")}
              </BodyShort>
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
                {t("basedOnRequirement")}{" "}
                <Link href="https://etterlevelse.ansatt.nav.no/krav/267/1" target="_blank">
                  K267.1 <ExternalLinkIcon aria-hidden />
                </Link>
              </BodyShort>
            </Box>
          </div>

          <Box
            padding="space-16"
            borderRadius="8"
            background="neutral-soft"
          >
            <VStack gap="space-12">
              <Heading size="small" level="2">
                {t("overview")}
              </Heading>
              <HGrid columns={{ xs: 2, sm: 4 }} gap="space-16">
                <Box>
                  <Detail>{t("totalTeams")}</Detail>
                  <Heading size="medium" level="3">
                    {formatNumber(overview.totalTeams)}
                  </Heading>
                </Box>
                <Box>
                  <Detail>{t("totalWorkloads")}</Detail>
                  <Heading size="medium" level="3">
                    {formatNumber(overview.totalWorkloads)}
                  </Heading>
                </Box>
                <Box>
                  <Detail>{t("totalVulnerabilities")}</Detail>
                  <Heading size="medium" level="3">
                    {formatNumber(slaTotals.totalVulnerabilities)}
                  </Heading>
                </Box>
                <Box>
                  <Detail>{t("percentageNeedingAttention")}</Detail>
                  <Heading 
                    size="medium" 
                    level="3"
                    style={{ 
                      color: slaTotals.percentageNeedingAttention > 20 
                        ? "var(--a-text-danger)" 
                        : slaTotals.percentageNeedingAttention > 5 
                          ? "var(--a-text-warning)" 
                          : "var(--a-text-success)" 
                    }}
                  >
                    {formatNumber(slaTotals.percentageNeedingAttention)}%
                  </Heading>
                </Box>
              </HGrid>
            </VStack>
          </Box>

          <HGrid columns={{ xs: 1, sm: 2 }} gap="space-16">
            <Box
              padding="space-24"
              borderRadius="8"
              background="danger-soft"
              style={{
                borderLeft: "4px solid var(--a-surface-danger)",
              }}
            >
              <VStack gap="space-8">
                <BodyShort size="small" weight="semibold">
                  {t("criticalNeedsAttention")}
                </BodyShort>
                <Heading size="xlarge" level="2">
                  {formatNumber(slaTotals.totalCriticalOverdue)}
                </Heading>
              </VStack>
            </Box>

            <Box
              padding="space-24"
              borderRadius="8"
              background="warning-soft"
              style={{
                borderLeft: "4px solid var(--a-surface-warning)",
              }}
            >
              <VStack gap="space-8">
                <BodyShort size="small" weight="semibold">
                  {t("nonCriticalNeedsAttention")}
                </BodyShort>
                <Heading size="xlarge" level="2">
                  {formatNumber(slaTotals.totalNonCriticalOverdue)}
                </Heading>
              </VStack>
            </Box>
          </HGrid>

          <Box
            padding="space-24"
            borderRadius="8"
            background={deploymentCompliance.nonCompliantWorkloads > 0 ? "warning-soft" : "success-soft"}
            style={{
              borderLeft: deploymentCompliance.nonCompliantWorkloads > 0 
                ? "4px solid var(--a-surface-warning)" 
                : "4px solid var(--a-surface-success)",
            }}
          >
            <VStack gap="space-8">
              <BodyShort size="small" weight="semibold">
                {t("deploymentsNeedingUpdate")}
              </BodyShort>
              <Heading size="xlarge" level="2">
                {formatNumber(deploymentCompliance.nonCompliantWorkloads)}
              </Heading>
            </VStack>
          </Box>

          {deploymentCompliance.teamDetails.length > 0 && (
            <Box
              padding="space-24"
              borderRadius="8"
              background="default"
              borderWidth="1"
              borderColor="neutral-subtle"
            >
              <Heading size="medium" level="2" spacing>
                {t("teamDetails")}
              </Heading>
              <Accordion>
                {deploymentCompliance.teamDetails.map((teamDetail) => (
                  <Accordion.Item key={teamDetail.team}>
                    <Accordion.Header>
                      {t("team")}: {teamDetail.team} ({formatNumber(teamDetail.workloads.filter(w => w.ageInfo?.hasDeploymentInfo && !w.ageInfo?.isCompliant).length)} {t("application").toLowerCase()})
                    </Accordion.Header>
                    <Accordion.Content>
                      <VStack gap="space-16">
                        <Table size="small">
                          <Table.Header>
                            <Table.Row>
                              <Table.HeaderCell>{t("workloadName")}</Table.HeaderCell>
                              <Table.HeaderCell>{t("environment")}</Table.HeaderCell>
                              <Table.HeaderCell>{t("daysSinceDeployment")}</Table.HeaderCell>
                            </Table.Row>
                          </Table.Header>
                          <Table.Body>
                            {teamDetail.workloads
                              .filter(w => w.ageInfo?.hasDeploymentInfo && !w.ageInfo?.isCompliant)
                              .map((workload) => (
                                <Table.Row key={workload.id}>
                                  <Table.DataCell>{workload.name}</Table.DataCell>
                                  <Table.DataCell>{workload.environment}</Table.DataCell>
                                  <Table.DataCell>{formatNumber(workload.ageInfo?.daysSinceDeployment)}</Table.DataCell>
                                </Table.Row>
                              ))}
                          </Table.Body>
                        </Table>
                      </VStack>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Box>
          )}

          {slaTotals.relevantSlaTeams.length > 0 && (
            <Box
              padding="space-24"
              borderRadius="8"
              background="default"
              borderWidth="1"
              borderColor="neutral-subtle"
            >
              <Heading size="medium" level="2" spacing>
                {t("teamDetails")}
              </Heading>
              <Accordion>
                {slaTotals.relevantSlaTeams.map((team) => (
                  <Accordion.Item key={team.teamSlug}>
                    <Accordion.Header>
                      {t("team")}: {team.teamSlug} ({formatNumber(team.criticalOverdue + team.nonCriticalOverdue)} {t("totalVulnerabilities").toLowerCase()})
                    </Accordion.Header>
                    <Accordion.Content>
                      <VStack gap="space-16">

                        <HGrid columns={{ xs: 2, sm: 3, md: 4 }} gap="space-12">
                          <Box>
                            <Detail>{t("criticalNeedsAttention")}</Detail>
                            <BodyShort weight="semibold">{formatNumber(team.criticalOverdue)}</BodyShort>
                          </Box>
                          <Box>
                            <Detail>{t("nonCriticalNeedsAttention")}</Detail>
                            <BodyShort weight="semibold">{formatNumber(team.nonCriticalOverdue)}</BodyShort>
                          </Box>
                          <Box>
                            <Detail>{t("repositoriesNeedingAttention")}</Detail>
                            <BodyShort weight="semibold">{formatNumber(team.repositoriesOutOfSla)}</BodyShort>
                          </Box>
                          <Box>
                            <Detail>{t("maxWorkdaysOverdue")}</Detail>
                            <BodyShort weight="semibold">{formatNumber(team.maxDaysOverdue)} {t("workdays")}</BodyShort>
                          </Box>
                        </HGrid>

                        {team.criticalOverdueItems && team.criticalOverdueItems.length > 0 && (
                          <>
                            <Heading size="small" level="3" spacing>
                              {t("criticalNeedsAttentionTitle")}
                            </Heading>
                            <Table size="small" style={{ tableLayout: "fixed" }}>
                              <Table.Header>
                                <Table.Row>
                                  <Table.HeaderCell style={{ width: "50%" }}>{t("application")}</Table.HeaderCell>
                                  <Table.HeaderCell style={{ width: "25%" }}>{t("vulnerabilityCount")}</Table.HeaderCell>
                                  <Table.HeaderCell style={{ width: "25%" }}>{t("maxWorkdaysOverTarget")}</Table.HeaderCell>
                                </Table.Row>
                              </Table.Header>
                              <Table.Body>
                                {Object.entries(
                                  team.criticalOverdueItems.reduce((acc, item) => {
                                    const appName = item.applicationName;
                                    if (!acc[appName]) {
                                      acc[appName] = { count: 0, maxWorkdays: 0 };
                                    }
                                    acc[appName].count++;
                                    acc[appName].maxWorkdays = Math.max(
                                      acc[appName].maxWorkdays,
                                      item.workdaysOverdue
                                    );
                                    return acc;
                                  }, {} as Record<string, { count: number; maxWorkdays: number }>)
                                ).map(([appName, data]) => (
                                  <Table.Row key={appName}>
                                    <Table.DataCell>{appName}</Table.DataCell>
                                    <Table.DataCell>{formatNumber(data.count)}</Table.DataCell>
                                    <Table.DataCell>{formatNumber(data.maxWorkdays)}</Table.DataCell>
                                  </Table.Row>
                                ))}
                              </Table.Body>
                            </Table>
                          </>
                        )}

                        {team.nonCriticalOverdueItems && team.nonCriticalOverdueItems.length > 0 && (
                          <>
                            <Heading size="small" level="3" spacing>
                              {t("nonCriticalNeedsAttentionTitle")}
                            </Heading>
                            <Table size="small" style={{ tableLayout: "fixed" }}>
                              <Table.Header>
                                <Table.Row>
                                  <Table.HeaderCell style={{ width: "50%" }}>{t("application")}</Table.HeaderCell>
                                  <Table.HeaderCell style={{ width: "25%" }}>{t("vulnerabilityCount")}</Table.HeaderCell>
                                  <Table.HeaderCell style={{ width: "25%" }}>{t("maxWorkdaysOverTarget")}</Table.HeaderCell>
                                </Table.Row>
                              </Table.Header>
                              <Table.Body>
                                {Object.entries(
                                  team.nonCriticalOverdueItems.reduce((acc, item) => {
                                    const appName = item.applicationName;
                                    if (!acc[appName]) {
                                      acc[appName] = { count: 0, maxWorkdays: 0 };
                                    }
                                    acc[appName].count++;
                                    acc[appName].maxWorkdays = Math.max(
                                      acc[appName].maxWorkdays,
                                      item.workdaysOverdue
                                    );
                                    return acc;
                                  }, {} as Record<string, { count: number; maxWorkdays: number }>)
                                ).map(([appName, data]) => (
                                  <Table.Row key={appName}>
                                    <Table.DataCell>{appName}</Table.DataCell>
                                    <Table.DataCell>{formatNumber(data.count)}</Table.DataCell>
                                    <Table.DataCell>{formatNumber(data.maxWorkdays)}</Table.DataCell>
                                  </Table.Row>
                                ))}
                              </Table.Body>
                            </Table>
                          </>
                        )}
                      </VStack>
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Box>
          )}
        </VStack>
      </main>
    </Box>
  );
}
