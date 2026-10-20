"use client";

import { useMemo, Suspense } from "react";
import { GitHubRepositoryList } from "../../modules/github/components/GitHubRepositoryList";
import { GitHubSummaryStats } from "../../modules/github/components/GitHubSummaryStats";
import { useGitHubVulnerabilities } from "../../modules/github/hooks/useGitHubVulnerabilities";
import { useRepositoryMetrics } from "../../modules/github/hooks/useRepositoryMetrics";
import { useConfigContext } from "../../contexts/ConfigContext";
import { useVulnerabilitiesContext } from "../../contexts/VulnerabilitiesContext";
import { filterRepositoriesByWorkContext } from "../../modules/github/utils/filterRepositoriesByWorkContext";
import { useTranslations } from "next-intl";
import { Box, BodyShort, Loader, VStack, Heading } from "@navikt/ds-react";

export default function GitHubPage() {
  return (
    <Suspense>
      <GitHubPageContent />
    </Suspense>
  );
}

function GitHubPageContent() {
  const t = useTranslations("github");
  const tHome = useTranslations("home");

  const {
    data,
    refresh,
    isRefreshing,
    isSyncing,
    isDataStale,
    isLoading: isGitHubLoading,
  } = useGitHubVulnerabilities();
  const {
    data: applicationData,
    teamFilters,
    applicationFilters,
  } = useVulnerabilitiesContext();

  const { config, isLoading: isConfigLoading } = useConfigContext();

  // Repositories are scoped by the global work context filter (navbar).
  const filteredRepositories = useMemo(
    () =>
      filterRepositoriesByWorkContext(
        data?.teams ?? [],
        applicationData?.teams ?? [],
        { teamFilters, applicationFilters }
      ).filter((repo) => repo.vulnerabilities.length > 0),
    [data, applicationData, teamFilters, applicationFilters]
  );

  const repositoryMetrics = useRepositoryMetrics({
    repositories: filteredRepositories,
    criticalThreshold: config?.thresholds.critical ?? 75,
    highThreshold: config?.thresholds.high ?? 50,
    mediumThreshold: config?.thresholds.medium ?? 25,
  });

  // Computed summary stats
  const totalVulnerabilities = repositoryMetrics.reduce(
    (sum, r) => sum + r.vulnerabilityCount,
    0
  );
  const fixesReadyToMerge = repositoryMetrics.reduce(
    (sum, r) => sum + r.fixesReadyCount,
    0
  );
  const criticalRepositories = repositoryMetrics.filter(
    (r) => r.riskLevel === "critical"
  ).length;

  if (isConfigLoading || isGitHubLoading) {
    return (
      <div style={{ marginTop: "2rem" }}>
        <Box
          padding="space-24"
          borderRadius="4"
          background="neutral-soft"
          style={{ textAlign: "center" }}
        >
          <Loader size="large" title={tHome("loadingVulnerabilities")} />
        </Box>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "2rem" }}>
      <VStack gap="space-32">
        {/* Page header */}
        <VStack gap="space-8" style={{ maxWidth: "640px" }}>
          <Heading size="xlarge" level="1">
            {t("pageTitle")}
          </Heading>
          <BodyShort style={{ color: "var(--ax-text-neutral-subtle)" }}>
            {t("pageSubtitle")}
          </BodyShort>
        </VStack>

        {/* Summary stats */}
        <GitHubSummaryStats
          repositoryCount={repositoryMetrics.length}
          totalVulnerabilities={totalVulnerabilities}
          fixesReadyToMerge={fixesReadyToMerge}
          criticalRepositories={criticalRepositories}
        />

        {/* Repository list with search and quick wins */}
        <GitHubRepositoryList
          repositories={repositoryMetrics}
          onRefresh={refresh}
          isRefreshing={isRefreshing}
          isSyncing={isSyncing}
          isDataStale={isDataStale}
        />
      </VStack>
    </div>
  );
}
