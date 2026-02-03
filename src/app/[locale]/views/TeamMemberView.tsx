"use client";
import { useMemo } from "react";
import { useSlaOverdue } from "@/app/shared/hooks/useSlaOverdue";
import { useVulnerabilities } from "@/app/modules/vulnerabilities/hooks/useVulnerabilities";
import { BodyShort, Loader, Box, Heading, VStack, HGrid, Table, Detail } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import { formatNumber } from "@/lib/format";

export default function TeamMemberView() {
  const t = useTranslations("teamMemberView");
  const { data: slaData, isLoading: slaLoading } = useSlaOverdue();
  const { data: vulnData, isLoading: vulnLoading } = useVulnerabilities();

  const overview = useMemo(() => {
    if (!vulnData || !vulnData.teams) return null;

    const totalTeams = vulnData.teams.length;
    const totalWorkloads = vulnData.teams.reduce(
      (sum, team) => sum + (team.workloads?.length || 0),
      0
    );
    const totalVulnerabilities = vulnData.teams.reduce(
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
  }, [vulnData]);

  const slaTotals = useMemo(() => {
    if (!slaData || !slaData.teams) return null;

    const totalCriticalOverdue = slaData.teams.reduce(
      (sum, team) => sum + (team.criticalOverdue || 0),
      0
    );
    const totalNonCriticalOverdue = slaData.teams.reduce(
      (sum, team) => sum + (team.nonCriticalOverdue || 0),
      0
    );
    const totalCriticalWithinSla = slaData.teams.reduce(
      (sum, team) => sum + (team.criticalWithinSla || 0),
      0
    );
    const totalNonCriticalWithinSla = slaData.teams.reduce(
      (sum, team) => sum + (team.nonCriticalWithinSla || 0),
      0
    );
    const totalRepositoriesOutOfSla = slaData.teams.reduce(
      (sum, team) => sum + (team.repositoriesOutOfSla || 0),
      0
    );

    return {
      totalCriticalOverdue,
      totalNonCriticalOverdue,
      totalCriticalWithinSla,
      totalNonCriticalWithinSla,
      totalRepositoriesOutOfSla,
    };
  }, [slaData]);

  if (slaLoading || vulnLoading || !slaData || !slaTotals || !overview) {
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
            <Heading size="large" level="1" spacing>
              {t("title")}
            </Heading>
            <BodyShort spacing>
              {t("description")}
            </BodyShort>
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
              <HGrid columns={{ xs: 1, sm: 3 }} gap="space-16">
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
                    {formatNumber(overview.totalVulnerabilities)}
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
                  {t("criticalOverdue")}
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
                  {t("nonCriticalOverdue")}
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
            background="default"
            borderWidth="1"
            borderColor="neutral-subtle"
          >
            <VStack gap="space-24">
              <Heading size="medium" level="2">
                {t("withinSla")}
              </Heading>

              <HGrid columns={{ xs: 1, sm: 2 }} gap="space-16">
                <Box
                  padding="space-16"
                  borderRadius="4"
                  background="success-soft"
                >
                  <VStack gap="space-8">
                    <BodyShort size="small" weight="semibold">
                      {t("criticalWithinSla")}
                    </BodyShort>
                    <Heading size="large" level="3">
                      {formatNumber(slaTotals.totalCriticalWithinSla)}
                    </Heading>
                  </VStack>
                </Box>

                <Box
                  padding="space-16"
                  borderRadius="4"
                  background="info-soft"
                >
                  <VStack gap="space-8">
                    <BodyShort size="small" weight="semibold">
                      {t("nonCriticalWithinSla")}
                    </BodyShort>
                    <Heading size="large" level="3">
                      {formatNumber(slaTotals.totalNonCriticalWithinSla)}
                    </Heading>
                  </VStack>
                </Box>
              </HGrid>
            </VStack>
          </Box>

          {slaTotals.totalCriticalOverdue === 0 && (
            <Box
              padding="space-24"
              borderRadius="8"
              background="success-soft"
              style={{ textAlign: "center" }}
            >
              <Heading size="medium" level="2">
                {t("noCriticalOverdue")}
              </Heading>
              <BodyShort>
                {t("noCriticalOverdueDescription")}
              </BodyShort>
            </Box>
          )}

          {slaData.teams.map((team) => (
            <Box
              key={team.teamSlug}
              padding="space-24"
              borderRadius="8"
              background="default"
              borderWidth="1"
              borderColor="neutral-subtle"
            >
              <VStack gap="space-16">
                <Heading size="medium" level="2">
                  {t("team")}: {team.teamSlug}
                </Heading>

                <HGrid columns={{ xs: 2, sm: 3, md: 4 }} gap="space-12">
                  <Box>
                    <Detail>{t("criticalOverdue")}</Detail>
                    <BodyShort weight="semibold">{formatNumber(team.criticalOverdue)}</BodyShort>
                  </Box>
                  <Box>
                    <Detail>{t("nonCriticalOverdue")}</Detail>
                    <BodyShort weight="semibold">{formatNumber(team.nonCriticalOverdue)}</BodyShort>
                  </Box>
                  <Box>
                    <Detail>{t("repositoriesOutOfSla")}</Detail>
                    <BodyShort weight="semibold">{formatNumber(team.repositoriesOutOfSla)}</BodyShort>
                  </Box>
                  <Box>
                    <Detail>{t("maxDaysOverdue")}</Detail>
                    <BodyShort weight="semibold">{formatNumber(team.maxDaysOverdue)} {t("days")}</BodyShort>
                  </Box>
                </HGrid>

                {team.criticalOverdueItems && team.criticalOverdueItems.length > 0 && (
                  <Box>
                    <Heading size="small" level="3" spacing>
                      {t("criticalOverdueItemsTitle")}
                    </Heading>
                    <Table size="small">
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>{t("cveId")}</Table.HeaderCell>
                          <Table.HeaderCell>{t("application")}</Table.HeaderCell>
                          <Table.HeaderCell>{t("severity")}</Table.HeaderCell>
                          <Table.HeaderCell>{t("daysOverdue")}</Table.HeaderCell>
                          <Table.HeaderCell>{t("workdaysOverdue")}</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {team.criticalOverdueItems.map((item, idx) => (
                          <Table.Row key={`${item.cveId}-${idx}`}>
                            <Table.DataCell>{item.cveId}</Table.DataCell>
                            <Table.DataCell>{item.applicationName}</Table.DataCell>
                            <Table.DataCell>{item.severity}</Table.DataCell>
                            <Table.DataCell>{formatNumber(item.daysOverdue)}</Table.DataCell>
                            <Table.DataCell>{formatNumber(item.workdaysOverdue)}</Table.DataCell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </Box>
                )}

                {team.nonCriticalOverdueItems && team.nonCriticalOverdueItems.length > 0 && (
                  <Box>
                    <Heading size="small" level="3" spacing>
                      {t("nonCriticalOverdueItemsTitle")}
                    </Heading>
                    <Table size="small">
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>{t("cveId")}</Table.HeaderCell>
                          <Table.HeaderCell>{t("application")}</Table.HeaderCell>
                          <Table.HeaderCell>{t("severity")}</Table.HeaderCell>
                          <Table.HeaderCell>{t("daysOverdue")}</Table.HeaderCell>
                          <Table.HeaderCell>{t("workdaysOverdue")}</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {team.nonCriticalOverdueItems.map((item, idx) => (
                          <Table.Row key={`${item.cveId}-${idx}`}>
                            <Table.DataCell>{item.cveId}</Table.DataCell>
                            <Table.DataCell>{item.applicationName}</Table.DataCell>
                            <Table.DataCell>{item.severity}</Table.DataCell>
                            <Table.DataCell>{formatNumber(item.daysOverdue)}</Table.DataCell>
                            <Table.DataCell>{formatNumber(item.workdaysOverdue)}</Table.DataCell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </Box>
                )}
              </VStack>
            </Box>
          ))}
        </VStack>
      </main>
    </Box>
  );
}
