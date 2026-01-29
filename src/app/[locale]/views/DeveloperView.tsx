"use client";
import { useState, useMemo } from "react";
import VulnerabilitiesToLookAt from "@/app/modules/vulnerabilities/components/VulnerabilitiesToLookAt";
import VulnerabilitySummary, { BucketThreshold } from "@/app/modules/vulnerabilities/components/VulnerabilitySummary";
import { useConfig } from "@/app/shared/hooks/useConfig";
import { useVulnerabilities } from "@/app/modules/vulnerabilities/hooks/useVulnerabilities";
import { useUserPreferences } from "@/app/shared/hooks/useUserPreferences";
import { BodyShort, Loader, Box } from "@navikt/ds-react";
import { useTranslations } from "next-intl";

export default function DeveloperView() {
  const t = useTranslations();
  const { config, isLoading } = useConfig();
  const { data: vulnData, teamFilters, setTeamFilters } = useVulnerabilities();
  const { preferences, updatePreferences } = useUserPreferences();
  
  const selectedTeams = useMemo(() => {
    const filtered = Object.keys(teamFilters).filter(team => teamFilters[team] === true);
    if (filtered.length === 0 && vulnData?.teams) {
      return Array.from(new Set(vulnData.teams.map((t) => t.team)));
    }
    return filtered;
  }, [teamFilters, vulnData]);

  const handleTeamsChange = (teams: string[]) => {
    const newFilters = Object.fromEntries(teams.map(team => [team, true]));
    setTeamFilters(newFilters);
  };
  
  const defaultBucket = useMemo<BucketThreshold | null>(() => {
    if (!config) return null;
    return {
      name: t("buckets.highPriority"),
      minThreshold: config.thresholds.high,
      maxThreshold: Number.MAX_VALUE,
    };
  }, [config, t]);

  const [selectedBucket, setSelectedBucket] = useState<BucketThreshold | null>(null);

  const activeBucket = selectedBucket || defaultBucket;

  if (isLoading || !activeBucket) {
    return (
      <div style={{ marginTop: "2rem" }}>
        <main>
          <div>
            <h1 dangerouslySetInnerHTML={{ __html: t.raw("home.title") }} />
            <BodyShort spacing>
              {t("home.description1")}
            </BodyShort>
            <BodyShort spacing>
              {t("home.description2")}
            </BodyShort>
          </div>
          <Box
            padding="space-24"
            borderRadius="4"
            background="neutral-soft"
            style={{ marginBottom: "1.5rem", textAlign: "center" }}
          >
            <Loader size="large" title={t("home.loadingVulnerabilities")} />
          </Box>
        </main>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "2rem" }}>
      <main>
        <div>
          <h1 dangerouslySetInnerHTML={{ __html: t.raw("home.title") }} />
          <BodyShort spacing>
            {t("home.description1")}
          </BodyShort>
          <BodyShort spacing>
            {t("home.description2")}
          </BodyShort>
        </div>
        <VulnerabilitySummary 
          selectedBucket={activeBucket} 
          onBucketSelect={setSelectedBucket}
          selectedTeams={selectedTeams}
          onTeamsChange={handleTeamsChange}
          showAllBuckets={preferences.showAllBuckets}
          onShowAllBucketsChange={(show) => updatePreferences({ showAllBuckets: show })}
        />
        <VulnerabilitiesToLookAt 
          bucketName={activeBucket.name}
          minThreshold={activeBucket.minThreshold}
          maxThreshold={activeBucket.maxThreshold}
          selectedTeams={selectedTeams}
        />
      </main>
    </div>
  );
}
