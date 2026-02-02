"use client";

import { HGrid, Box, Heading, BodyShort } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import { formatNumber } from "@/lib/format";

interface AdminSummaryCardsProps {
  totalTeams: number;
  totalVulnerabilities: number;
  totalOverdue?: number;
  totalCriticalOverdue?: number;
}

export function AdminSummaryCards({
  totalTeams,
  totalVulnerabilities,
  totalOverdue,
  totalCriticalOverdue,
}: AdminSummaryCardsProps) {
  const t = useTranslations("admin");

  return (
    <HGrid columns={{ xs: 1, sm: 2, md: 4 }} gap="space-16">
      <Box
        background="neutral-soft"
        padding="space-16"
      >
        <BodyShort size="small" style={{ opacity: 0.75 }}>
          {t("totalTeams")}
        </BodyShort>
        <Heading size="large" level="2">
          {formatNumber(totalTeams)}
        </Heading>
      </Box>

      <Box
        background="neutral-soft"
        padding="space-16"
      >
        <BodyShort size="small" style={{ opacity: 0.75 }}>
          {t("totalVulnerabilities")}
        </BodyShort>
        <Heading size="large" level="2">
          {formatNumber(totalVulnerabilities)}
        </Heading>
      </Box>

      {totalOverdue !== undefined && (
        <Box
          background="warning-soft"
          padding="space-16"
        >
          <BodyShort size="small" style={{ opacity: 0.75 }}>
            {t("totalOverdue")}
          </BodyShort>
          <Heading size="large" level="2">
            {formatNumber(totalOverdue)}
          </Heading>
        </Box>
      )}

      {totalCriticalOverdue !== undefined && (
        <Box
          background="danger-soft"
          padding="space-16"
        >
          <BodyShort size="small" style={{ opacity: 0.75 }}>
            {t("totalCriticalOverdue")}
          </BodyShort>
          <Heading size="large" level="2">
            {formatNumber(totalCriticalOverdue)}
          </Heading>
        </Box>
      )}
    </HGrid>
  );
}
