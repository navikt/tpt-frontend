"use client";

import { useState } from "react";
import { Box, Heading, Button, HStack, VStack, BodyShort, Label, HGrid } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import type { TeamSecurityStatus } from "@/app/types/securityStatus";
import { StatusTag } from "./StatusTag";
import { LevelBadge } from "./LevelBadge";
import { HistoryStrip } from "./HistoryStrip";
import { TrendSparkline } from "./TrendSparkline";

interface TeamCardProps {
  team: TeamSecurityStatus;
  variant: "5b" | "5c";
}

export function TeamCard({ team, variant }: TeamCardProps) {
  const t = useTranslations("complianceCard");
  const tQuestions = useTranslations("complianceQuestions");
  const tTable = useTranslations("complianceTable");
  const tCompliance = useTranslations("compliance");

  const [showAllPastDeadline, setShowAllPastDeadline] = useState(false);
  const [showAllOverdueRebuild, setShowAllOverdueRebuild] = useState(false);

  const pastDeadlineApps = team.exposed.appsPastDeadline;
  const overdueRebuildApps = team.maintenance.overdueRebuild;

  const displayedPastDeadline = showAllPastDeadline
    ? pastDeadlineApps
    : pastDeadlineApps.slice(0, 5);

  const displayedOverdueRebuild = showAllOverdueRebuild
    ? overdueRebuildApps
    : overdueRebuildApps.slice(0, 5);

  return (
    <Box
      borderWidth="1"
      borderColor="neutral-subtle"
      borderRadius="12"
      padding="space-24"
      background="default"
    >
      <VStack gap="space-16">
        {/* Card header */}
        <HStack
          justify="space-between"
          align="start"
          wrap
          style={{
            paddingBottom: "16px",
            borderBottom: "1px solid var(--ax-border-subtle, #CFD3D8)",
          }}
        >
          <VStack gap="space-4">
            <HStack gap="space-8" align="center" wrap>
              <Heading size="medium" level="3">
                {team.team}
              </Heading>
              {team.level && <LevelBadge level={team.level} size="small" />}
            </HStack>
            <BodyShort size="medium" textColor="subtle">
              {t("applicationsCount", { count: team.applicationCount })}
            </BodyShort>
          </VStack>

          <VStack gap="space-4" align="end">
            <Label size="small" textColor="subtle">
              {tCompliance("monthlyHistory")}
            </Label>
            <HistoryStrip history={team.history} />
          </VStack>
        </HStack>

        {/* 3 Questions: each question and answer requires 2 lines */}
        <HGrid columns={{ xs: 1, md: 3 }} gap="space-24">
          {/* Question 1: Are we exposed right now? */}
          <VStack gap="space-8">
            <Heading size="xsmall" level="4" textColor="subtle">
              {tQuestions("areWeExposed")}
            </Heading>
            <VStack gap="space-4" align="start">
              <div>
                <StatusTag
                  status={team.exposed.status}
                  size="small"
                />
              </div>
              <BodyShort size="small">
                {team.exposed.appsPastDeadline.length === 0
                  ? t("noAppsPastDeadline")
                  : t("appsPastDeadlineCount", { count: team.exposed.appsPastDeadline.length })}
              </BodyShort>
            </VStack>
          </VStack>

          {/* Question 2: Is it getting better or worse? */}
          <VStack gap="space-8">
            <Heading size="xsmall" level="4" textColor="subtle">
              {tQuestions("isItGettingBetterOrWorse")}
            </Heading>
            <VStack gap="space-4" align="start">
              <div>
                <StatusTag
                  status={team.trend.status}
                  size="small"
                />
              </div>
              <TrendSparkline
                status={team.trend.status}
                direction={team.trend.direction}
                values={team.trend.appsWithOverduePerMonth}
              />
            </VStack>
          </VStack>

          {/* Question 3: Are we keeping up with basic maintenance? */}
          <VStack gap="space-8">
            <Heading size="xsmall" level="4" textColor="subtle">
              {tQuestions("areWeKeepingUpWithMaintenance")}
            </Heading>
            <VStack gap="space-4" align="start">
              <div>
                <StatusTag
                  status={team.maintenance.status}
                  size="small"
                />
              </div>
              <BodyShort size="small">
                {tTable("upToDateFraction", {
                  upToDate: team.maintenance.upToDate,
                  total: team.maintenance.total,
                })}
              </BodyShort>
            </VStack>
          </VStack>
        </HGrid>

        {/* 5c developer view: list applications past deadline */}
        {variant === "5c" && pastDeadlineApps.length > 0 && (
          <VStack
            gap="space-4"
            style={{
              marginTop: "8px",
              borderTop: "1px solid var(--ax-border-subtle, #E6E8EB)",
              paddingTop: "12px",
            }}
          >
            <Label size="small" textColor="subtle">
              {t("pastDeadlineSubheading")}
            </Label>
            {displayedPastDeadline.map((item) => (
              <HStack
                key={item.app}
                justify="space-between"
                align="center"
                gap="space-16"
                paddingBlock="space-8"
                style={{
                  borderTop: "1px solid var(--ax-border-subtle, #E6E8EB)",
                }}
              >
                <BodyShort weight="semibold">{item.app}</BodyShort>
                <BodyShort
                  weight="semibold"
                  style={{ color: "var(--ax-text-danger, #C30000)" }}
                >
                  {t("workdaysOver", { days: item.workdaysOver })}
                </BodyShort>
              </HStack>
            ))}

            {pastDeadlineApps.length > 5 && (
              <Button
                variant="tertiary"
                size="small"
                onClick={() => setShowAllPastDeadline((prev) => !prev)}
                style={{ alignSelf: "flex-start", marginTop: "4px" }}
              >
                {showAllPastDeadline ? t("showFewer") : t("showAll")}
              </Button>
            )}
          </VStack>
        )}

        {/* 5c developer view: list applications overdue for rebuild */}
        {variant === "5c" && overdueRebuildApps.length > 0 && (
          <VStack
            gap="space-4"
            style={{
              marginTop: "8px",
              borderTop: "1px solid var(--ax-border-subtle, #E6E8EB)",
              paddingTop: "12px",
            }}
          >
            <Label size="small" textColor="subtle">
              {t("overdueRebuildSubheading")}
            </Label>
            {displayedOverdueRebuild.map((item) => (
              <HStack
                key={item.app}
                justify="space-between"
                align="center"
                gap="space-16"
                paddingBlock="space-8"
                style={{
                  borderTop: "1px solid var(--ax-border-subtle, #E6E8EB)",
                }}
              >
                <BodyShort weight="semibold">{item.app}</BodyShort>
                <BodyShort
                  weight="semibold"
                  style={{ color: "var(--ax-text-danger, #C30000)" }}
                >
                  {t("daysOver", { days: item.daysOver })}
                </BodyShort>
              </HStack>
            ))}

            {overdueRebuildApps.length > 5 && (
              <Button
                variant="tertiary"
                size="small"
                onClick={() => setShowAllOverdueRebuild((prev) => !prev)}
                style={{ alignSelf: "flex-start", marginTop: "4px" }}
              >
                {showAllOverdueRebuild ? t("showFewer") : t("showAll")}
              </Button>
            )}
          </VStack>
        )}
      </VStack>
    </Box>
  );
}
