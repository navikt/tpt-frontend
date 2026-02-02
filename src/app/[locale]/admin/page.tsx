"use client";

import { Box, Heading, BodyShort, VStack, Loader } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import { useTeamsOverview } from "@/app/modules/admin/hooks/useTeamsOverview";
import { useTeamsSla } from "@/app/modules/admin/hooks/useTeamsSla";
import { AdminSummaryCards } from "@/app/modules/admin/components/AdminSummaryCards";
import { TeamsOverviewTable } from "@/app/modules/admin/components/TeamsOverviewTable";
import { TeamsSlaTable } from "@/app/modules/admin/components/TeamsSlaTable";
import { ErrorMessage } from "@/app/components/ErrorMessage";

export default function AdminPage() {
  const t = useTranslations("admin");
  const tErrors = useTranslations("errors");

  const {
    data: overviewData,
    error: overviewError,
    isLoading: overviewLoading,
  } = useTeamsOverview();

  const {
    data: slaData,
    error: slaError,
    isLoading: slaLoading,
  } = useTeamsSla();

  if (overviewError) {
    return (
      <ErrorMessage
        error={overviewError}
        title={tErrors("fetchTeamsOverviewError")}
      />
    );
  }

  if (slaError) {
    return (
      <ErrorMessage
        error={slaError}
        title={tErrors("fetchTeamsSlaError")}
      />
    );
  }

  if (overviewLoading || slaLoading || !overviewData || !slaData) {
    return (
      <Box
        paddingBlock="space-24"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <Loader size="large" title={t("loadingData")} />
      </Box>
    );
  }

  return (
    <Box paddingBlock="space-24">
      <VStack gap="space-32">
        <Box>
          <Heading size="large" level="1">
            {t("title")}
          </Heading>
          <BodyShort style={{ opacity: 0.75 }}>{t("description")}</BodyShort>
        </Box>

        <AdminSummaryCards
          totalTeams={overviewData.totalTeams}
          totalVulnerabilities={overviewData.totalVulnerabilities}
          totalOverdue={slaData.totalOverdue}
          totalCriticalOverdue={slaData.totalCriticalOverdue}
        />

        <Box>
          <Heading size="medium" level="2" style={{ marginBottom: "1rem" }}>
            {t("teamsOverview")}
          </Heading>
          <TeamsOverviewTable teams={overviewData.teams} />
        </Box>

        <Box>
          <Heading size="medium" level="2" style={{ marginBottom: "1rem" }}>
            {t("slaCompliance")}
          </Heading>
          <TeamsSlaTable teams={slaData.teams} />
        </Box>
      </VStack>
    </Box>
  );
}
