"use client";

import {
  Box,
  Heading,
  Table,
  Accordion,
  HStack,
  VStack,
  BodyShort,
} from "@navikt/ds-react";
import { CheckmarkCircleFillIcon } from "@navikt/aksel-icons";
import { useTranslations } from "next-intl";
import type { TeamSecurityStatus } from "@/app/types/securityStatus";
import { StatusTag } from "./StatusTag";
import { LevelBadge } from "./LevelBadge";
import { HistoryStrip } from "./HistoryStrip";
import { sortTeamsForLeader } from "../utils/complianceFormatters";

interface TeamsFollowUpTableProps {
  teams: TeamSecurityStatus[];
  collapseOnTrack?: boolean;
}

export function TeamsFollowUpTable({
  teams,
  collapseOnTrack = true,
}: TeamsFollowUpTableProps) {
  const t = useTranslations("complianceTable");
  const tQuestions = useTranslations("complianceQuestions");
  const tTrend = useTranslations("complianceTrend");

  // If collapseOnTrack is false, show all teams in the main table ordered by leader priority
  // (chronic > ongoing > new > on-track).
  const displayTeams = collapseOnTrack
    ? sortTeamsForLeader(
        teams.filter(
          (team) =>
            team.exposed.status !== "green" ||
            team.trend.status !== "green" ||
            team.maintenance.status !== "green"
        )
      )
    : sortTeamsForLeader(teams);

  const onTrackTeams = collapseOnTrack
    ? [...teams.filter(
        (team) =>
          team.exposed.status === "green" &&
          team.trend.status === "green" &&
          team.maintenance.status === "green"
      )].sort((a, b) => a.team.localeCompare(b.team))
    : [];

  const renderTeamRow = (team: TeamSecurityStatus) => {
    const exposedText =
      team.exposed.appsPastDeadline.length === 0
        ? t("nonePastDeadline")
        : t("appsPastDeadlineCount", {
            count: team.exposed.appsPastDeadline.length,
          });

    const trendText =
      team.trend.direction === "worse"
        ? `↗ ${tTrend("gettingWorse")}`
        : team.trend.direction === "improving"
          ? `↘ ${tTrend("improving")}`
          : `→ ${tTrend("stable")}`;

    const maintText = t("upToDateFraction", {
      upToDate: team.maintenance.upToDate,
      total: team.maintenance.total,
    });

    return (
      <Table.Row key={team.team}>
        <Table.HeaderCell scope="row">
          <HStack gap="space-8" align="center" wrap>
            <BodyShort size="medium" weight="semibold">
              {team.team}
            </BodyShort>
            {team.level && <LevelBadge level={team.level} size="small" />}
          </HStack>
        </Table.HeaderCell>

        <Table.DataCell>
          <HistoryStrip history={team.history} />
        </Table.DataCell>

        <Table.DataCell>
          <VStack gap="space-4" align="start">
            <StatusTag
              status={team.exposed.status}
              size="small"
            />
            <BodyShort size="small">{exposedText}</BodyShort>
          </VStack>
        </Table.DataCell>

        <Table.DataCell>
          <VStack gap="space-4" align="start">
            <StatusTag
              status={team.trend.status}
              size="small"
            />
            <BodyShort size="small">{trendText}</BodyShort>
          </VStack>
        </Table.DataCell>

        <Table.DataCell>
          <VStack gap="space-4" align="start">
            <StatusTag
              status={team.maintenance.status}
              size="small"
            />
            <BodyShort size="small">{maintText}</BodyShort>
          </VStack>
        </Table.DataCell>
      </Table.Row>
    );
  };

  return (
    <Box
      borderWidth="1"
      borderColor="neutral-subtle"
      borderRadius="12"
      padding="space-24"
      background="default"
    >
      <VStack gap="space-16">
        <Heading size="medium" level="2">
          {t("title")}
        </Heading>

        <div style={{ overflowX: "auto" }}>
          <Table style={{ minWidth: "900px" }}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell scope="col">{t("teamHeader")}</Table.HeaderCell>
                <Table.HeaderCell scope="col">{t("monthlyHistoryHeader")}</Table.HeaderCell>
                <Table.HeaderCell scope="col">
                  {tQuestions("areWeExposed")}
                </Table.HeaderCell>
                <Table.HeaderCell scope="col">
                  {tQuestions("isItGettingBetterOrWorse")}
                </Table.HeaderCell>
                <Table.HeaderCell scope="col">
                  {tQuestions("areWeKeepingUpWithMaintenance")}
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {displayTeams.map(renderTeamRow)}
            </Table.Body>
          </Table>
        </div>

        {/* Collapsible on-track teams */}
        {collapseOnTrack && onTrackTeams.length > 0 && (
          <Accordion>
            <Accordion.Item>
              <Accordion.Header>
                <HStack gap="space-8" align="center">
                  <CheckmarkCircleFillIcon
                    style={{
                      color: "var(--ax-bg-success-strong, #06893A)",
                      fontSize: "20px",
                    }}
                    aria-hidden
                  />
                  <BodyShort weight="semibold">
                    {t("teamsOnTrackCount", { count: onTrackTeams.length })}:{" "}
                    <span style={{ fontWeight: 400 }}>
                      {onTrackTeams.map((t) => t.team).join(", ")}
                    </span>
                  </BodyShort>
                </HStack>
              </Accordion.Header>
              <Accordion.Content>
                <div style={{ overflowX: "auto" }}>
                  <Table size="small" style={{ minWidth: "800px" }}>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell scope="col">{t("teamHeader")}</Table.HeaderCell>
                        <Table.HeaderCell scope="col">{t("monthlyHistoryHeader")}</Table.HeaderCell>
                        <Table.HeaderCell scope="col">{tQuestions("areWeExposed")}</Table.HeaderCell>
                        <Table.HeaderCell scope="col">{tQuestions("isItGettingBetterOrWorse")}</Table.HeaderCell>
                        <Table.HeaderCell scope="col">{tQuestions("areWeKeepingUpWithMaintenance")}</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {onTrackTeams.map(renderTeamRow)}
                    </Table.Body>
                  </Table>
                </div>
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        )}
      </VStack>
    </Box>
  );
}
