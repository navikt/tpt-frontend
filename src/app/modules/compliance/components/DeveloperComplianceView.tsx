"use client";

import { Box, Heading, BodyShort, Tag, HStack, VStack } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import type { TeamSecurityStatus } from "@/app/types/securityStatus";
import { ComplianceBanner } from "./ComplianceBanner";
import { TeamCard } from "./TeamCard";

interface DeveloperComplianceViewProps {
  teams: TeamSecurityStatus[];
}

export function DeveloperComplianceView({ teams }: DeveloperComplianceViewProps) {
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
            {t("developerTitle")}
          </Heading>
          <HStack gap="space-12" align="center">
            <BodyShort size="medium" textColor="subtle" style={{ fontSize: "18px" }}>
              {t("developerSubtitle", { teams: totalTeams, apps: totalApps })}
            </BodyShort>
            <Tag variant="moderate" data-color="neutral" size="small">
              {t("developerViewTag")}
            </Tag>
          </HStack>
        </VStack>

        {/* Info banner */}
        <ComplianceBanner />

        {/* Team cards */}
        <VStack gap="space-16">
          {teams.map((team) => (
            <TeamCard key={team.team} team={team} variant="5c" />
          ))}
        </VStack>
      </VStack>
    </Box>
  );
}
