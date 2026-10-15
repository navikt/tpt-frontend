"use client";

import { Box, Heading, BodyShort, VStack } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import type { TeamSecurityStatus } from "@/app/types/securityStatus";
import { ComplianceBanner } from "./ComplianceBanner";
import { QuestionCards } from "./QuestionCards";
import { LevelLegend } from "./LevelLegend";
import { TeamsFollowUpTable } from "./TeamsFollowUpTable";

interface ManyTeamsLeaderViewProps {
  teams: TeamSecurityStatus[];
}

export function ManyTeamsLeaderView({ teams }: ManyTeamsLeaderViewProps) {
  const t = useTranslations("compliance");

  const totalTeams = teams.length;
  const totalApps = teams.reduce((acc, team) => acc + team.applicationCount, 0);

  return (
    <Box
      paddingBlock={{ xs: "space-16", md: "space-24" }}
    >
      <VStack gap="space-24">
        {/* Header */}
        <VStack gap="space-6">
          <Heading size="xlarge" level="1">
            {t("sectionTitle")}
          </Heading>
          <BodyShort size="medium" textColor="subtle" style={{ fontSize: "18px" }}>
            {t("sectionSubtitle", { teams: totalTeams, apps: totalApps })}
          </BodyShort>
        </VStack>

        {/* Info banner */}
        <ComplianceBanner />

        {/* 5a Overview */}
        <QuestionCards teams={teams} />
        <LevelLegend />
        <TeamsFollowUpTable teams={teams} />
      </VStack>
    </Box>
  );
}
