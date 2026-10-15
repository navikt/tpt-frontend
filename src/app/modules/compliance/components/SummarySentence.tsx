"use client";

import { HStack, VStack, BodyLong, BodyShort, Heading } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import type { TeamSecurityStatus } from "@/app/types/securityStatus";
import { LevelBadge } from "./LevelBadge";

interface SummarySentenceProps {
  teams: TeamSecurityStatus[];
  variant: "5a" | "5b" | "5c";
}

export function SummarySentence({ teams, variant }: SummarySentenceProps) {
  const t = useTranslations("complianceSummary");

  const totalTeams = teams.length;
  const offTrackTeams = teams.filter(
    (team) =>
      team.exposed.status !== "green" ||
      team.trend.status !== "green" ||
      team.maintenance.status !== "green"
  );

  const chronicCount = teams.filter((t) => t.level === "chronic").length;
  const ongoingCount = teams.filter((t) => t.level === "ongoing").length;
  const newCount = teams.filter((t) => t.level === "new").length;

  if (offTrackTeams.length === 0) {
    return (
      <Heading size="large" level="2">
        {t("allOnTrack", { total: totalTeams })}
      </Heading>
    );
  }

  // Find the worst team
  const worstTeam =
    teams.find((t) => t.level === "chronic") ||
    teams.find((t) => t.level === "ongoing") ||
    offTrackTeams[0];

  let sentenceNode: React.ReactNode = null;

  if (variant === "5a") {
    const isChronic = worstTeam?.level === "chronic";
    sentenceNode = (
      <BodyLong size="large" style={{ fontSize: "28px", lineHeight: "1.3" }}>
        <strong>
          {t("teamsNeedFollowUp", {
            count: offTrackTeams.length,
            total: totalTeams,
          })}{" "}
        </strong>
        {isChronic && worstTeam
          ? t("chronicDetail", { team: worstTeam.team })
          : worstTeam && worstTeam.exposed.appsPastDeadline.length > 0
            ? t("exposedDetail", {
                team: worstTeam.team,
                count: worstTeam.exposed.appsPastDeadline.length,
              })
            : worstTeam
              ? t("attentionDetail", { team: worstTeam.team })
              : ""}
      </BodyLong>
    );
  } else {
    // 5b and 5c
    const appsCount = worstTeam?.exposed.appsPastDeadline.length ?? 0;
    sentenceNode = (
      <BodyLong size="large" style={{ fontSize: "28px", lineHeight: "1.3" }}>
        <strong>
          {t("teamsNeedAttention", {
            count: offTrackTeams.length,
            total: totalTeams,
          })}{" "}
        </strong>
        {worstTeam && appsCount > 0
          ? t("teamPastDeadlineBacklogGrowing", {
              team: worstTeam.team,
              count: appsCount,
            })
          : worstTeam
            ? t("teamBacklogGrowing", { team: worstTeam.team })
            : ""}
      </BodyLong>
    );
  }

  return (
    <VStack gap="space-8">
      {sentenceNode}

      {variant === "5a" && (chronicCount > 0 || ongoingCount > 0 || newCount > 0) && (
        <HStack gap="space-12" align="center">
          {chronicCount > 0 && (
            <HStack gap="space-4" align="center">
              <BodyShort size="small" textColor="subtle">{chronicCount}</BodyShort>
              <LevelBadge level="chronic" size="small" />
            </HStack>
          )}
          {chronicCount > 0 && (ongoingCount > 0 || newCount > 0) && (
            <BodyShort size="small" textColor="subtle">·</BodyShort>
          )}

          {ongoingCount > 0 && (
            <HStack gap="space-4" align="center">
              <BodyShort size="small" textColor="subtle">{ongoingCount}</BodyShort>
              <LevelBadge level="ongoing" size="small" />
            </HStack>
          )}
          {ongoingCount > 0 && newCount > 0 && (
            <BodyShort size="small" textColor="subtle">·</BodyShort>
          )}

          {newCount > 0 && (
            <HStack gap="space-4" align="center">
              <BodyShort size="small" textColor="subtle">{newCount}</BodyShort>
              <LevelBadge level="new" size="small" />
            </HStack>
          )}
        </HStack>
      )}
    </VStack>
  );
}
