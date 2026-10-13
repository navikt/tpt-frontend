"use client";

import { Box, Heading, HGrid, VStack, BodyShort } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import type { TeamSecurityStatus, SecurityStatusColor } from "@/app/types/securityStatus";
import { StatusTag } from "./StatusTag";

interface QuestionCardsProps {
  teams: TeamSecurityStatus[];
}

function getWorstStatusAndEarliestSince(
  statuses: { status: SecurityStatusColor; since?: string }[]
): { worstStatus: SecurityStatusColor; earliestSince?: string } {
  const hasRed = statuses.some((s) => s.status === "red");
  const hasYellow = statuses.some((s) => s.status === "yellow");

  const worstStatus: SecurityStatusColor = hasRed
    ? "red"
    : hasYellow
      ? "yellow"
      : "green";

  if (worstStatus === "green") {
    return { worstStatus: "green" };
  }

  // Find earliest since among those with the worst status
  const withDates = statuses
    .filter((s) => s.status === worstStatus && !!s.since)
    .map((s) => ({ ...s, time: new Date(s.since!).getTime() }))
    .filter((s) => !isNaN(s.time))
    .sort((a, b) => a.time - b.time);

  return {
    worstStatus,
    earliestSince: withDates[0]?.since,
  };
}

export function QuestionCards({ teams }: QuestionCardsProps) {
  const t = useTranslations("complianceQuestions");

  const total = teams.length;

  // Question 1: Exposed
  const exposedStatuses = teams.map((t) => t.exposed);
  const q1Agg = getWorstStatusAndEarliestSince(exposedStatuses);
  const teamsWithOverdue = teams.filter(
    (t) => t.exposed.appsPastDeadline.length > 0
  ).length;

  // Question 2: Trend
  const trendStatuses = teams.map((t) => t.trend);
  const q2Agg = getWorstStatusAndEarliestSince(trendStatuses);
  const worseCount = teams.filter((t) => t.trend.direction === "worse").length;
  const betterCount = teams.filter(
    (t) => t.trend.direction === "improving"
  ).length;
  const stableCount = teams.filter((t) => t.trend.direction === "stable").length;

  // Question 3: Maintenance
  const maintStatuses = teams.map((t) => t.maintenance);
  const q3Agg = getWorstStatusAndEarliestSince(maintStatuses);
  const behindMaintCount = teams.filter((t) => t.maintenance.status !== "green").length;

  return (
    <HGrid columns={{ xs: 1, md: 3 }} gap="space-24">
      {/* Question 1 */}
      <Box
        borderWidth="1"
        borderColor="neutral-subtle"
        borderRadius="12"
        padding="space-24"
        background="default"
      >
        <VStack gap="space-16">
          <Heading size="medium" level="2">
            {t("areWeExposed")}
          </Heading>
          <div>
            <StatusTag status={q1Agg.worstStatus} since={q1Agg.earliestSince} size="small" />
          </div>
          <BodyShort size="small">
            {teamsWithOverdue === 0
              ? t("noTeamsPastDeadline")
              : t("teamsHavePastDeadline", { count: teamsWithOverdue, total })}
          </BodyShort>
        </VStack>
      </Box>

      {/* Question 2 */}
      <Box
        borderWidth="1"
        borderColor="neutral-subtle"
        borderRadius="12"
        padding="space-24"
        background="default"
      >
        <VStack gap="space-16">
          <Heading size="medium" level="2">
            {t("isItGettingBetterOrWorse")}
          </Heading>
          <div>
            <StatusTag status={q2Agg.worstStatus} since={q2Agg.earliestSince} size="small" />
          </div>
          <BodyShort size="small">
            {t("trendComparison", {
              worse: worseCount,
              better: betterCount,
              stable: stableCount,
            })}
          </BodyShort>
        </VStack>
      </Box>

      {/* Question 3 */}
      <Box
        borderWidth="1"
        borderColor="neutral-subtle"
        borderRadius="12"
        padding="space-24"
        background="default"
      >
        <VStack gap="space-16">
          <Heading size="medium" level="2">
            {t("areWeKeepingUpWithMaintenance")}
          </Heading>
          <div>
            <StatusTag status={q3Agg.worstStatus} since={q3Agg.earliestSince} size="small" />
          </div>
          <BodyShort size="small">
            {behindMaintCount === 0
              ? t("allTeamsOnMaintenance")
              : t("teamsBehindOnMaintenance", { count: behindMaintCount, total })}
          </BodyShort>
        </VStack>
      </Box>
    </HGrid>
  );
}
