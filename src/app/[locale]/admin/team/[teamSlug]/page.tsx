"use client";
import { use } from "react";
import Link from "next/link";
import { Box, Loader, VStack, Heading, BodyShort } from "@navikt/ds-react";
import { ChevronLeftIcon } from "@navikt/aksel-icons";
import { useTranslations, useLocale } from "next-intl";
import { useAdminTeamVulnerabilities } from "@/app/modules/admin/hooks/useAdminTeamVulnerabilities";
import { AdminTeamVulnerabilitiesProvider } from "@/app/contexts/AdminTeamVulnerabilitiesContext";
import { ErrorMessage } from "@/app/components/ErrorMessage";
import DeveloperView from "@/app/[locale]/views/DeveloperView";

interface AdminTeamPageProps {
  params: Promise<{ teamSlug: string }>;
}

export default function AdminTeamPage({ params }: AdminTeamPageProps) {
  const { teamSlug } = use(params);
  const t = useTranslations("admin");
  const tErrors = useTranslations("errors");
  const locale = useLocale();

  const { data, isLoading, error } = useAdminTeamVulnerabilities(teamSlug);

  if (error) {
    return (
      <Box paddingBlock="space-24">
        <Box paddingBlock="space-12">
          <Link
            href={`/${locale}/admin`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              color: "var(--a-text-action)",
              textDecoration: "none",
            }}
          >
            <ChevronLeftIcon aria-hidden />
            {t("backToAdmin")}
          </Link>
        </Box>
        <ErrorMessage
          error={error}
          title={tErrors("fetchVulnerabilitiesError")}
        />
      </Box>
    );
  }

  if (isLoading || !data) {
    return (
      <Box paddingBlock="space-24">
        <Box paddingBlock="space-12">
          <Link
            href={`/${locale}/admin`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              color: "var(--a-text-action)",
              textDecoration: "none",
            }}
          >
            <ChevronLeftIcon aria-hidden />
            {t("backToAdmin")}
          </Link>
        </Box>
        <Box
          paddingBlock="space-24"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <Loader size="large" title={t("loadingData")} />
        </Box>
      </Box>
    );
  }

  return (
    <Box paddingBlock="space-24">
      <VStack gap="space-8">
        <Box>
          <Link
            href={`/${locale}/admin`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              color: "var(--a-text-action)",
              textDecoration: "none",
            }}
          >
            <ChevronLeftIcon aria-hidden />
            {t("backToAdmin")}
          </Link>
        </Box>
        <Box>
          <Heading size="medium" level="1">
            {t("teamView.title", { teamSlug })}
          </Heading>
          <BodyShort style={{ opacity: 0.75 }}>
            {t("teamView.description")}
          </BodyShort>
        </Box>
      </VStack>
      <AdminTeamVulnerabilitiesProvider
        data={data}
        isLoading={isLoading}
        error={error}
      >
        <DeveloperView />
      </AdminTeamVulnerabilitiesProvider>
    </Box>
  );
}
