"use client";
import { useState } from "react";
import styles from "../page.module.css";
import GitHubVulnerabilitiesList from "../../components/github/GitHubVulnerabilitiesList";
import GitHubVulnerabilitySummary, { BucketThreshold } from "../../components/github/GitHubVulnerabilitySummary";
import { useGitHubVulnerabilities } from "../../hooks/useGitHubVulnerabilities";
import { useTranslations } from "next-intl";
import { Box, HStack, BodyShort } from "@navikt/ds-react";

export default function GitHubPage() {
  const t = useTranslations();
  const { data } = useGitHubVulnerabilities();
  const [selectedBucket, setSelectedBucket] = useState<BucketThreshold>({
    name: t("buckets.highPriority"),
    minThreshold: 150,
    maxThreshold: Number.MAX_VALUE,
  });
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

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
            borderRadius="medium"
            background="surface-subtle"
            style={{ marginBottom: "1.5rem" }}
          >
            <HStack gap="6" wrap>
              <div>
                <BodyShort weight="semibold" size="small" style={{ color: "var(--a-text-subtle)" }}>
                  {t("github.metadata.teams")}
                </BodyShort>
                <BodyShort size="large" weight="semibold">
                  {totalTeams}
                </BodyShort>
              </div>
              <div>
                <BodyShort weight="semibold" size="small" style={{ color: "var(--a-text-subtle)" }}>
                  {t("github.metadata.repositories")}
                </BodyShort>
                <BodyShort size="large" weight="semibold">
                  {totalRepositories}
                </BodyShort>
              </div>
              {teamRepos.length > 0 && (
                <div style={{ flex: 1, minWidth: "300px" }}>
                  <BodyShort weight="semibold" size="small" style={{ color: "var(--a-text-subtle)", marginBottom: "0.5rem" }}>
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
            selectedBucket={selectedBucket}
            onBucketSelect={setSelectedBucket}
            selectedTeams={selectedTeams}
            onTeamsChange={setSelectedTeams}
          />
          <GitHubVulnerabilitiesList
            selectedBucket={selectedBucket}
            selectedTeams={selectedTeams}
          />
        </div>
      </main>
    </div>
  );
}
