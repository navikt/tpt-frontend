"use client";

import { useMemo, useState, Suspense } from "react";
import { GitHubRepositoryList } from "../../modules/github/components/GitHubRepositoryList";
import { GitHubFilterModal } from "../../modules/github/components/GitHubFilterModal";
import { GitHubSummaryStats } from "../../modules/github/components/GitHubSummaryStats";
import { useGitHubVulnerabilities } from "../../modules/github/hooks/useGitHubVulnerabilities";
import { useRepositoryMetrics } from "../../modules/github/hooks/useRepositoryMetrics";
import { useConfigContext } from "../../contexts/ConfigContext";
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
    teamFilters,
    setTeamFilters,
    repositoryFilters,
    setRepositoryFilters,
    refresh,
    isRefreshing,
    isSyncing,
    isDataStale,
    isLoading: isGitHubLoading,
  } = useGitHubVulnerabilities();

  const { config, isLoading: isConfigLoading } = useConfigContext();
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Derive selected teams and repos from filter records
  const selectedTeams = useMemo(() => {
    const filtered = Object.keys(teamFilters).filter((k) => teamFilters[k] === true);
    if (filtered.length === 0 && data?.teams) {
      return Array.from(new Set(data.teams.map((t) => t.team)));
    }
    return filtered;
  }, [teamFilters, data]);

  const selectedRepositories = useMemo(() => {
    return Object.keys(repositoryFilters ?? {}).filter(
      (k) => (repositoryFilters as Record<string, boolean>)[k] === true
    );
  }, [repositoryFilters]);

  const handleTeamsChange = (teams: string[]) => {
    setTeamFilters(Object.fromEntries(teams.map((t) => [t, true])));
  };

  const handleRepositoriesChange = (repos: string[]) => {
    setRepositoryFilters(Object.fromEntries(repos.map((r) => [r, true])));
  };

  // Build a map of team -> lastSyncedAt for the filter modal
  const teamLastSyncedAt = useMemo(
    () =>
      Object.fromEntries(
        (data?.teams ?? []).map((team) => [team.team, team.lastSyncedAt])
      ) as Record<string, string | undefined>,
    [data]
  );

  // All available options for the filter modal
  const allTeams = useMemo(
    () => Array.from(new Set(data?.teams.map((t) => t.team) ?? [])).sort(),
    [data]
  );

  const allRepositories = useMemo(
    () =>
      Array.from(
        new Set(
          data?.teams.flatMap((t) => (t.repositories ?? []).map((r) => r.nameWithOwner)) ?? []
        )
      ).sort(),
    [data]
  );

  // Count active filters for the badge on the Filter button
  const activeFilterCount =
    (teamFilters ? Object.values(teamFilters).filter(Boolean).length : 0) +
    (repositoryFilters ? Object.values(repositoryFilters as Record<string, boolean>).filter(Boolean).length : 0);

  // Derive filtered repos: team filter first, then repo filter
  const filteredRepositories = useMemo(() => {
    if (!data) return [];

    const seen = new Set<string>();
    return data.teams
      .filter((team) => selectedTeams.length === 0 || selectedTeams.includes(team.team))
      .flatMap((team) => team.repositories ?? [])
      .filter((repo) => {
        if (seen.has(repo.nameWithOwner)) return false;
        seen.add(repo.nameWithOwner);
        return true;
      })
      .filter((repo) => repo.vulnerabilities.length > 0)
      .filter(
        (repo) =>
          selectedRepositories.length === 0 ||
          selectedRepositories.includes(repo.nameWithOwner)
      );
  }, [data, selectedTeams, selectedRepositories]);

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

        {/* Repository list with search, filter, quick wins */}
        <GitHubRepositoryList
          repositories={repositoryMetrics}
          onFilterClick={() => setFilterModalOpen(true)}
          activeFilterCount={activeFilterCount}
          onRefresh={refresh}
          isRefreshing={isRefreshing}
          isSyncing={isSyncing}
          isDataStale={isDataStale}
        />
      </VStack>

      <GitHubFilterModal
        open={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        allTeams={allTeams}
        teamLastSyncedAt={teamLastSyncedAt}
        selectedTeams={selectedTeams}
        onTeamsChange={handleTeamsChange}
        allRepositories={allRepositories}
        selectedRepositories={selectedRepositories}
        onRepositoriesChange={handleRepositoriesChange}
      />
    </div>
  );
}
