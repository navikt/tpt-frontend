"use client";
import { useMemo } from "react";
import styles from "../page.module.css";
import { GitHubRepositoryList } from "../../modules/github/components/GitHubRepositoryList";
import { GitHubTeamFilterModal } from "../../modules/github/components/GitHubTeamFilterModal";
import { useGitHubVulnerabilities } from "../../modules/github/hooks/useGitHubVulnerabilities";
import { useRepositoryMetrics } from "../../modules/github/hooks/useRepositoryMetrics";
import { useConfig } from "../../shared/hooks/useConfig";
import { useTranslations } from "next-intl";
import { Box, HStack, BodyShort, Loader, Button, VStack, Heading, HGrid } from "@navikt/ds-react";
import { useState } from "react";

export default function GitHubPage() {
  const t = useTranslations();
  const { data, teamFilters, setTeamFilters } = useGitHubVulnerabilities();
  const { config, isLoading } = useConfig();
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  
  // Compute selected teams from teamFilters
  const selectedTeams = useMemo(() => {
    const filtered = Object.keys(teamFilters).filter(team => teamFilters[team] === true);
    // If no filters are set, show all teams
    if (filtered.length === 0 && data?.teams) {
      return Array.from(new Set(data.teams.map((t) => t.team)));
    }
    return filtered;
  }, [teamFilters, data]);

  const handleTeamsChange = (teams: string[]) => {
    const newFilters = Object.fromEntries(teams.map(team => [team, true]));
    setTeamFilters(newFilters);
  };

  // Get filtered repositories
  const filteredRepositories = useMemo(() => {
    if (!data) return [];
    
    return data.teams
      .filter((team) => selectedTeams.length === 0 || selectedTeams.includes(team.team))
      .flatMap((team) => team.repositories || [])
      .filter((repo) => repo.vulnerabilities.length > 0);
  }, [data, selectedTeams]);

  const repositoryMetrics = useRepositoryMetrics({
    repositories: filteredRepositories,
    highThreshold: config?.thresholds.high ?? 150,
    mediumThreshold: config?.thresholds.medium ?? 75,
    lowThreshold: config?.thresholds.low ?? 30,
  });

  // Calculate team statistics
  const teamStatistics = useMemo(() => {
    if (!data) return [];
    
    return data.teams
      .filter((team) => selectedTeams.length === 0 || selectedTeams.includes(team.team))
      .map((team) => {
        const repos = team.repositories || [];
        const totalVulns = repos.reduce((sum, repo) => sum + repo.vulnerabilities.length, 0);
        const totalRiskScore = repos.reduce((sum, repo) => 
          sum + repo.vulnerabilities.reduce((s, v) => s + v.riskScore, 0), 0
        );
        
        return {
          name: team.team,
          repositoryCount: repos.length,
          vulnerabilityCount: totalVulns,
          avgRiskScore: repos.length > 0 ? Math.round(totalRiskScore / repos.length) : 0,
        };
      })
      .sort((a, b) => b.avgRiskScore - a.avgRiskScore);
  }, [data, selectedTeams]);

  // Calculate metadata
  const totalTeams = data?.teams.length || 0;
  const totalRepositories = data?.teams.reduce(
    (sum, team) => sum + (team.repositories?.length || 0),
    0
  ) || 0;

  const allTeams = data?.teams.map((t) => t.team) || [];

  // Show loading state while config is loading
  if (isLoading) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.intro}>
            <h1>{t("github.tab")}</h1>
            <p>{t("github.pageDescription")}</p>
            <Box
              padding="space-24"
              borderRadius="4"
              background="neutral-soft"
              style={{ marginBottom: "1.5rem", textAlign: "center" }}
            >
              <Loader size="large" title={t("home.loadingVulnerabilities")} />
            </Box>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.intro}>
          <h1>{t("github.tab")}</h1>
          <p>
            {t("github.pageDescription")}
          </p>

          {/* Metadata Section */}
          <Box
            padding="space-16"
            borderRadius="4"
            background="neutral-soft"
            style={{ marginBottom: "1.5rem" }}
          >
            <HStack gap="space-24" wrap justify="space-between" align="center">
              <HStack gap="space-24" wrap>
                <div>
                  <BodyShort weight="semibold" size="small" style={{ color: "var(--ax-text-neutral-subtle)" }}>
                    {t("github.metadata.teams")}
                  </BodyShort>
                  <BodyShort size="large" weight="semibold">
                    {totalTeams}
                  </BodyShort>
                </div>
                <div>
                  <BodyShort weight="semibold" size="small" style={{ color: "var(--ax-text-neutral-subtle)" }}>
                    {t("github.metadata.repositories")}
                  </BodyShort>
                  <BodyShort size="large" weight="semibold">
                    {totalRepositories}
                  </BodyShort>
                </div>
              </HStack>
              
              <Button
                variant="secondary"
                size="small"
                onClick={() => setFilterModalOpen(true)}
              >
                {t("github.filterTeams")} ({selectedTeams.length > 0 ? selectedTeams.length : "alle"})
              </Button>
            </HStack>
          </Box>

          {/* Team Statistics */}
          {teamStatistics.length > 0 && (
            <Box
              padding="space-16"
              borderRadius="4"
              background="neutral-soft"
              style={{ marginBottom: "1.5rem" }}
            >
              <VStack gap="space-12">
                <Heading size="small" level="3">
                  {t("github.overview.teamStatistics")}
                </Heading>
                <HGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="space-12">
                  {teamStatistics.map((team) => (
                    <Box
                      key={team.name}
                      padding="space-12"
                      borderRadius="4"
                      background="neutral-soft"
                      style={{
                        border: "1px solid var(--a-border-subtle)",
                      }}
                    >
                      <VStack gap="space-4">
                        <BodyShort weight="semibold">{team.name}</BodyShort>
                        <BodyShort size="small" style={{ color: "var(--a-text-subtle)" }}>
                          {team.repositoryCount} {t("github.overview.repositoriesShort")} · {team.vulnerabilityCount} {t("github.overview.vulnerabilitiesShort")}
                        </BodyShort>
                        <BodyShort size="small">
                          {t("github.overview.avgRisk")}: <span style={{ fontWeight: 600 }}>{team.avgRiskScore}</span>
                        </BodyShort>
                      </VStack>
                    </Box>
                  ))}
                </HGrid>
              </VStack>
            </Box>
          )}

          <Box paddingBlock="space-16">
            <GitHubRepositoryList repositories={repositoryMetrics} />
          </Box>

          <GitHubTeamFilterModal
            open={filterModalOpen}
            onClose={() => setFilterModalOpen(false)}
            allTeams={allTeams}
            selectedTeams={selectedTeams}
            onTeamsChange={handleTeamsChange}
          />
        </div>
      </main>
    </div>
  );
}
