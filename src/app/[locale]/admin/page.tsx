"use client";

import { Box, Heading, BodyShort, VStack, Loader, Alert } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import { useTeamsOverview } from "@/app/modules/admin/hooks/useTeamsOverview";
import { useTeamsSla } from "@/app/modules/admin/hooks/useTeamsSla";
import { AdminSummaryCards } from "@/app/modules/admin/components/AdminSummaryCards";
import { SsvcBackfillButton } from "@/app/modules/admin/components/SsvcBackfillButton";
import { GcveComparisonButton } from "@/app/modules/admin/components/GcveComparisonButton";
import { TeamsOverviewTable } from "@/app/modules/admin/components/TeamsOverviewTable";
import { TeamsSlaTable } from "@/app/modules/admin/components/TeamsSlaTable";
import { VulnerabilitySearch } from "@/app/modules/admin/components/VulnerabilitySearch";

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

  return (
    <Box paddingBlock="space-24">
      <VStack gap="space-32">
        <Box>
          <Heading size="large" level="1">
            {t("title")}
          </Heading>
          <BodyShort style={{ opacity: 0.75 }}>{t("description")}</BodyShort>
        </Box>

        {overviewData || slaData ? (
          <AdminSummaryCards
            totalTeams={overviewData?.totalTeams ?? 0}
            totalVulnerabilities={overviewData?.totalVulnerabilities ?? 0}
            totalOverdue={slaData?.totalOverdue}
            totalCriticalOverdue={slaData?.totalCriticalOverdue}
          />
        ) : null}

        <Box>
          <VulnerabilitySearch />
        </Box>

        <Box>
          <Heading size="medium" level="2" style={{ marginBottom: "1rem" }}>
            {t("teamsOverview")}
          </Heading>
          {overviewLoading ? (
            <Loader size="small" title={t("loadingData")} />
          ) : overviewError ? (
            <Alert variant="warning" size="small">
              {tErrors("fetchTeamsOverviewError")}
            </Alert>
          ) : overviewData ? (
            <TeamsOverviewTable teams={overviewData.teams} />
          ) : null}
        </Box>

        <Box>
          <Heading size="medium" level="2" style={{ marginBottom: "1rem" }}>
            {t("slaCompliance")}
          </Heading>
          {slaLoading ? (
            <Loader size="small" title={t("loadingData")} />
          ) : slaError ? (
            <Alert variant="warning" size="small">
              {tErrors("fetchTeamsSlaError")}
            </Alert>
          ) : slaData ? (
            <TeamsSlaTable teams={slaData.teams} />
          ) : null}
        </Box>

        <Box>
          <Heading size="medium" level="2" style={{ marginBottom: "1rem" }}>
            {t("operations")}
          </Heading>
          <VStack gap="space-16">
            <SsvcBackfillButton />
            <GcveComparisonButton />
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}
