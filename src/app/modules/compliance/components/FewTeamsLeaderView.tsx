"use client";

import { Box, Heading, BodyShort, VStack } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import type { TeamSecurityStatus } from "@/app/types/securityStatus";
import { ComplianceBanner } from "./ComplianceBanner";
import { QuestionCards } from "./QuestionCards";
import { LevelLegend } from "./LevelLegend";
import { TeamCard } from "./TeamCard";
import { sortTeamsForLeader } from "../utils/complianceFormatters";

interface FewTeamsLeaderViewProps {
  teams: TeamSecurityStatus[];
}

export function FewTeamsLeaderView({ teams }: FewTeamsLeaderViewProps) {
  const t = useTranslations("compliance");

  const totalTeams = teams.length;
  const totalApps = teams.reduce((acc, team) => acc + team.applicationCount, 0);
  const sortedTeams = sortTeamsForLeader(teams);

  return (
    <Box
      paddingBlock={{ xs: "space-16", md: "space-24" }}
    >
      <VStack gap="space-24">
        {/* Header */}
        <VStack gap="space-6">
          <Heading size="xlarge" level="1">
            {t("areaTitle")}
          </Heading>
          <BodyShort size="medium" textColor="subtle" style={{ fontSize: "18px" }}>
            {t("areaSubtitle", { teams: totalTeams, apps: totalApps })}
          </BodyShort>
        </VStack>

        {/* Info banner */}
        <ComplianceBanner />

        {/* The three summary boxes */}
        <QuestionCards teams={teams} />

        {/* Separate box for each team, ordered chronic > ongoing > new > on-track */}
        <LevelLegend />
        <VStack gap="space-16">
          {sortedTeams.map((team) => (
            <TeamCard key={team.team} team={team} variant="5b" />
          ))}
        </VStack>
      </VStack>
    </Box>
  );
}
