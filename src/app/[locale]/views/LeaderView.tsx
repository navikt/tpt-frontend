"use client";
import { useMemo, useState } from "react";
import { useConfig } from "@/app/shared/hooks/useConfig";
import { useVulnerabilities } from "@/app/modules/vulnerabilities/hooks/useVulnerabilities";
import {
  BodyShort,
  Loader,
  Box,
  Heading,
  VStack,
  HGrid,
  Table,
  Tag,
} from "@navikt/ds-react";
import { useTranslations } from "next-intl";

interface TeamStats {
  teamName: string;
  workloadCount: number;
  totalVulnerabilities: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  veryLowPriority: number;
}

export default function LeaderView() {
  const t = useTranslations("leaderView");
  const { config, isLoading: configLoading } = useConfig();
  const { data: vulnData, isLoading: dataLoading } = useVulnerabilities();
  const [sortBy, setSortBy] = useState<keyof TeamStats>("highPriority");
  const [sortDesc, setSortDesc] = useState(true);

  const teamStatistics = useMemo(() => {
    if (!vulnData || !config) return [];

    return vulnData.teams.map((team) => {
      const allVulnerabilities = team.workloads.flatMap((workload) =>
        workload.vulnerabilities
      );

      const highPriority = allVulnerabilities.filter(
        (v) => v.riskScore >= config.thresholds.high
      ).length;

      const mediumPriority = allVulnerabilities.filter(
        (v) =>
          v.riskScore >= config.thresholds.medium &&
          v.riskScore < config.thresholds.high
      ).length;

      const lowPriority = allVulnerabilities.filter(
        (v) =>
          v.riskScore >= config.thresholds.low &&
          v.riskScore < config.thresholds.medium
      ).length;

      const veryLowPriority = allVulnerabilities.filter(
        (v) => v.riskScore < config.thresholds.low
      ).length;

      return {
        teamName: team.team,
        workloadCount: team.workloads.length,
        totalVulnerabilities: allVulnerabilities.length,
        highPriority,
        mediumPriority,
        lowPriority,
        veryLowPriority,
      };
    });
  }, [vulnData, config]);

  const sortedTeams = useMemo(() => {
    const sorted = [...teamStatistics];
    sorted.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDesc
          ? bVal.localeCompare(aVal)
          : aVal.localeCompare(bVal);
      }
      return sortDesc ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
    });
    return sorted;
  }, [teamStatistics, sortBy, sortDesc]);

  const aggregateStats = useMemo(() => {
    return teamStatistics.reduce(
      (acc, team) => ({
        totalTeams: acc.totalTeams + 1,
        totalWorkloads: acc.totalWorkloads + team.workloadCount,
        totalVulnerabilities:
          acc.totalVulnerabilities + team.totalVulnerabilities,
        highPriority: acc.highPriority + team.highPriority,
        mediumPriority: acc.mediumPriority + team.mediumPriority,
        lowPriority: acc.lowPriority + team.lowPriority,
        veryLowPriority: acc.veryLowPriority + team.veryLowPriority,
      }),
      {
        totalTeams: 0,
        totalWorkloads: 0,
        totalVulnerabilities: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0,
        veryLowPriority: 0,
      }
    );
  }, [teamStatistics]);

  const handleSort = (column: keyof TeamStats) => {
    if (sortBy === column) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(column);
      setSortDesc(true);
    }
  };

  if (configLoading || dataLoading) {
    return (
      <Box paddingBlock={{ xs: "space-16", md: "space-24" }}>
        <main>
          <VStack gap="6">
            <div>
              <Heading size="large" level="1">
                {t("title")}
              </Heading>
              <BodyShort spacing>{t("loadingData")}</BodyShort>
            </div>
            <Box
              padding="space-24"
              borderRadius="large"
              background="surface-subtle"
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
        <VStack gap="8">
          <div>
            <Heading size="large" level="1" spacing>
              {t("title")}
            </Heading>
            <BodyShort spacing>
              {t("description")}
            </BodyShort>
          </div>

          {/* Aggregate Summary */}
          <Box
            padding="space-24"
            borderRadius="large"
            background="surface-subtle"
          >
            <VStack gap="4">
              <Heading size="medium" level="2">
                {t("total")}
              </Heading>
              <HGrid columns={{ xs: 2, sm: 3, lg: 5 }} gap="4">
                <div>
                  <BodyShort size="small" textColor="subtle">
                    {t("teams")}
                  </BodyShort>
                  <Heading size="large" level="3">
                    {aggregateStats.totalTeams}
                  </Heading>
                </div>
                <div>
                  <BodyShort size="small" textColor="subtle">
                    {t("applications")}
                  </BodyShort>
                  <Heading size="large" level="3">
                    {aggregateStats.totalWorkloads}
                  </Heading>
                </div>
                <div>
                  <BodyShort size="small" textColor="subtle">
                    {t("vulnerabilities")}
                  </BodyShort>
                  <Heading size="large" level="3">
                    {aggregateStats.totalVulnerabilities}
                  </Heading>
                </div>
                <div>
                  <BodyShort size="small" textColor="subtle">
                    {t("highPriority")}
                  </BodyShort>
                  <Heading size="large" level="3" style={{ color: "var(--ax-text-danger-subtle)" }}>
                    {aggregateStats.highPriority}
                  </Heading>
                </div>
                <div>
                  <BodyShort size="small" textColor="subtle">
                    {t("mediumPriority")}
                  </BodyShort>
                  <Heading size="large" level="3" style={{ color: "var(--a-text-warning)" }}>
                    {aggregateStats.mediumPriority}
                  </Heading>
                </div>
              </HGrid>
            </VStack>
          </Box>

          {/* Team Breakdown Table */}
          <Box
            padding="space-24"
            borderRadius="large"
            background="surface-default"
            borderWidth="1"
            borderColor="border-subtle"
          >
            <VStack gap="4">
              <Heading size="medium" level="2">
                {t("teamsSection")}
              </Heading>
              <Table size="small">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell
                      scope="col"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("teamName")}
                    >
                      {t("teamName")} {sortBy === "teamName" && (sortDesc ? "↓" : "↑")}
                    </Table.HeaderCell>
                    <Table.HeaderCell
                      scope="col"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("workloadCount")}
                    >
                      {t("apps")} {sortBy === "workloadCount" && (sortDesc ? "↓" : "↑")}
                    </Table.HeaderCell>
                    <Table.HeaderCell
                      scope="col"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("totalVulnerabilities")}
                    >
                      {t("totalVulns")} {sortBy === "totalVulnerabilities" && (sortDesc ? "↓" : "↑")}
                    </Table.HeaderCell>
                    <Table.HeaderCell
                      scope="col"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("highPriority")}
                    >
                      {t("high")} {sortBy === "highPriority" && (sortDesc ? "↓" : "↑")}
                    </Table.HeaderCell>
                    <Table.HeaderCell
                      scope="col"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("mediumPriority")}
                    >
                      {t("medium")} {sortBy === "mediumPriority" && (sortDesc ? "↓" : "↑")}
                    </Table.HeaderCell>
                    <Table.HeaderCell
                      scope="col"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleSort("lowPriority")}
                    >
                      {t("low")} {sortBy === "lowPriority" && (sortDesc ? "↓" : "↑")}
                    </Table.HeaderCell>
                    <Table.HeaderCell scope="col">{t("status")}</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {sortedTeams.map((team) => (
                    <Table.Row key={team.teamName}>
                      <Table.DataCell>
                        <strong>{team.teamName}</strong>
                      </Table.DataCell>
                      <Table.DataCell>{team.workloadCount}</Table.DataCell>
                      <Table.DataCell>{team.totalVulnerabilities}</Table.DataCell>
                      <Table.DataCell>
                        {team.highPriority > 0 ? (
                          <span style={{ color: "var(--ax-text-danger-subtle)", fontWeight: "600" }}>
                            {team.highPriority}
                          </span>
                        ) : (
                          team.highPriority
                        )}
                      </Table.DataCell>
                      <Table.DataCell>
                        {team.mediumPriority > 0 ? (
                          <span style={{ color: "var(--a-text-warning)", fontWeight: "600" }}>
                            {team.mediumPriority}
                          </span>
                        ) : (
                          team.mediumPriority
                        )}
                      </Table.DataCell>
                      <Table.DataCell>{team.lowPriority + team.veryLowPriority}</Table.DataCell>
                      <Table.DataCell>
                        {team.highPriority > 0 ? (
                          <Tag variant="error" size="small">
                            {t("statusRequiresAction")}
                          </Tag>
                        ) : team.mediumPriority > 0 ? (
                          <Tag variant="warning" size="small">
                            {t("statusFollowUp")}
                          </Tag>
                        ) : (
                          <Tag variant="success" size="small">
                            {t("statusOk")}
                          </Tag>
                        )}
                      </Table.DataCell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </VStack>
          </Box>

          {aggregateStats.highPriority === 0 && (
            <Box
              padding="space-24"
              borderRadius="large"
              background="surface-success-subtle"
              style={{ textAlign: "center" }}
            >
              <Heading size="medium" level="2">
                {t("noCriticalVulnerabilities")}
              </Heading>
              <BodyShort>
                {t("noCriticalDescription")}
              </BodyShort>
            </Box>
          )}
        </VStack>
      </main>
    </Box>
  );
}
