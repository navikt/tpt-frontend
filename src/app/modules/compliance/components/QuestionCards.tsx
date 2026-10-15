"use client";

import { Box, Heading, HGrid, VStack, BodyShort } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import type { TeamSecurityStatus, SecurityStatusColor } from "@/app/types/securityStatus";
import { StatusTag } from "./StatusTag";

interface QuestionCardsProps {
  teams: TeamSecurityStatus[];
}

function getWorstStatus(
  statuses: { status: SecurityStatusColor }[]
): SecurityStatusColor {
  if (statuses.some((s) => s.status === "red")) return "red";
  if (statuses.some((s) => s.status === "yellow")) return "yellow";
  return "green";
}

export function QuestionCards({ teams }: QuestionCardsProps) {
  const t = useTranslations("complianceQuestions");

  const total = teams.length;

  // Question 1: Exposed
  const exposedStatuses = teams.map((t) => t.exposed);
  const q1Status = getWorstStatus(exposedStatuses);
  const teamsWithOverdue = teams.filter(
    (t) => t.exposed.appsPastDeadline.length > 0
  ).length;

  // Question 2: Trend
  const trendStatuses = teams.map((t) => t.trend);
  const q2Status = getWorstStatus(trendStatuses);
  const worseCount = teams.filter((t) => t.trend.direction === "worse").length;
  const betterCount = teams.filter(
    (t) => t.trend.direction === "improving"
  ).length;
  const stableCount = teams.filter((t) => t.trend.direction === "stable").length;

  // Question 3: Maintenance
  const maintStatuses = teams.map((t) => t.maintenance);
  const q3Status = getWorstStatus(maintStatuses);
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
            <StatusTag status={q1Status} size="small" />
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
            <StatusTag status={q2Status} size="small" />
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
            <StatusTag status={q3Status} size="small" />
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
