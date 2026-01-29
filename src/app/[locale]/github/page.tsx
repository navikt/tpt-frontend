"use client";
import { useState, useMemo } from "react";
import styles from "../page.module.css";
import GitHubVulnerabilitiesList from "../../modules/github/components/GitHubVulnerabilitiesList";
import GitHubVulnerabilitySummary, { BucketThreshold } from "../../modules/github/components/GitHubVulnerabilitySummary";
import { useGitHubVulnerabilities } from "../../modules/github/hooks/useGitHubVulnerabilities";
import { useConfig } from "../../shared/hooks/useConfig";
import { useTranslations } from "next-intl";
import { Box, HStack, BodyShort, Loader } from "@navikt/ds-react";

export default function GitHubPage() {
  const t = useTranslations();
  const { data, teamFilters, setTeamFilters } = useGitHubVulnerabilities();
  const { config, isLoading } = useConfig();
  
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
  
  // Create default bucket from config
  const defaultBucket = useMemo<BucketThreshold | null>(() => {
    if (!config) return null;
    return {
      name: t("buckets.highPriority"),
      minThreshold: config.thresholds.high,
      maxThreshold: Number.MAX_VALUE,
    };
  }, [config, t]);

  const [selectedBucket, setSelectedBucket] = useState<BucketThreshold | null>(null);

  // Use defaultBucket if no bucket is selected
  const activeBucket = selectedBucket || defaultBucket;

  // Calculate metadata
  const totalTeams = data?.teams.length || 0;
  const totalRepositories = data?.teams.reduce(
    (sum, team) => sum + (team.repositories?.length || 0),
    0
  ) || 0;
  const teamRepos = data?.teams.map((team) => ({
    team: team.team,
    repos: team.repositories?.length || 0,
  })) || [];

  // Show loading state while config is loading
  if (isLoading || !activeBucket) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div className={styles.intro}>
            <h1>{t("github.tab")}</h1>
            <p>{t("github.pageDescription")}</p>
            <Box
              padding="6"
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
            padding="4"
            borderRadius="4"
            background="neutral-soft"
            style={{ marginBottom: "1.5rem" }}
          >
            <HStack gap="6" wrap>
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
              {teamRepos.length > 0 && (
                <div style={{ flex: 1, minWidth: "300px" }}>
                  <BodyShort weight="semibold" size="small" style={{ color: "var(--ax-text-neutral-subtle)", marginBottom: "0.5rem" }}>
                    Repositories per team
                  </BodyShort>
                  <HStack gap="4" wrap>
                    {teamRepos.map((tr) => (
                      <BodyShort key={tr.team} size="small">
                        <span style={{ fontWeight: 500 }}>{tr.team}</span>: {tr.repos}
                      </BodyShort>
                    ))}
                  </HStack>
                </div>
              )}
            </HStack>
          </Box>

          <GitHubVulnerabilitySummary
            selectedBucket={activeBucket}
            onBucketSelect={setSelectedBucket}
            selectedTeams={selectedTeams}
            onTeamsChange={handleTeamsChange}
          />
          <GitHubVulnerabilitiesList
            selectedBucket={activeBucket}
            selectedTeams={selectedTeams}
          />
        </div>
      </main>
    </div>
  );
}
