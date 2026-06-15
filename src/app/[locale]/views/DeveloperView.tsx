"use client";
import { useState, useMemo } from "react";
import VulnerabilitiesToLookAt from "@/app/modules/vulnerabilities/components/VulnerabilitiesToLookAt";
import VulnerabilitySummary, { BucketThreshold } from "@/app/modules/vulnerabilities/components/VulnerabilitySummary";
import { useConfigContext } from "@/app/contexts/ConfigContext";
import { useVulnerabilitiesContext } from "@/app/contexts/VulnerabilitiesContext";
import { useUserPreferences } from "@/app/shared/hooks/useUserPreferences";
import { BodyShort, Loader, Box } from "@navikt/ds-react";
import { useTranslations } from "next-intl";

export default function DeveloperView({ detailBasePath }: { detailBasePath?: string }) {
  const t = useTranslations();
  const { config, isLoading } = useConfigContext();
  const { data: vulnData, teamFilters } = useVulnerabilitiesContext();
  const { preferences, updatePreferences } = useUserPreferences();
  
  const selectedTeams = useMemo(() => {
    const filtered = Object.keys(teamFilters).filter(team => teamFilters[team] === true);
    if (filtered.length === 0 && vulnData?.teams) {
      return Array.from(new Set(vulnData.teams.map((t) => t.team)));
    }
    return filtered;
  }, [teamFilters, vulnData]);

  const defaultBucket = useMemo<BucketThreshold | null>(() => {
    if (!config) return null;

    const { critical, high, medium } = config.thresholds;

    const allVulnerabilities =
      vulnData?.teams
        .filter((team) => selectedTeams.includes(team.team))
        .flatMap((team) => team.workloads.flatMap((w) => w.vulnerabilities)) ?? [];

    const criticalCount = allVulnerabilities.filter((v) => v.riskScore >= critical).length;
    const importantCount = allVulnerabilities.filter((v) => v.riskScore >= high && v.riskScore < critical).length;
    const whenTimeCount = allVulnerabilities.filter((v) => v.riskScore >= medium && v.riskScore < high).length;

    if (criticalCount > 0) {
      return { name: t("buckets.highPriority"), minThreshold: critical, maxThreshold: Number.MAX_VALUE };
    }
    if (importantCount > 0) {
      return { name: t("buckets.important"), minThreshold: high, maxThreshold: critical };
    }
    if (whenTimeCount > 0) {
      return { name: t("buckets.whenTime"), minThreshold: medium, maxThreshold: high };
    }
    return { name: t("buckets.highPriority"), minThreshold: critical, maxThreshold: Number.MAX_VALUE };
  }, [config, vulnData, selectedTeams, t]);

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
          showAllBuckets={preferences.showAllBuckets}
          onShowAllBucketsChange={(show) => updatePreferences({ showAllBuckets: show })}
        />
        <VulnerabilitiesToLookAt 
          bucketName={activeBucket.name}
          minThreshold={activeBucket.minThreshold}
          maxThreshold={activeBucket.maxThreshold}
          selectedTeams={selectedTeams}
          detailBasePath={detailBasePath}
        />
      </main>
    </div>
  );
}
