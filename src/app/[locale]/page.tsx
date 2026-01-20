"use client";
import { useState, useMemo } from "react";
import VulnerabilitiesToLookAt from "@/app/components/vulnerabilitiesToLookAt/VulnerabilitiesToLookAt";
import VulnerabilitySummary, { BucketThreshold } from "@/app/components/vulnerabilitiesToLookAt/VulnerabilitySummary";
import { useConfig } from "@/app/hooks/useConfig";
import { useVulnerabilities } from "@/app/hooks/useVulnerabilities";
import { BodyShort, Loader, Box } from "@navikt/ds-react";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations();
  const { config, isLoading } = useConfig();
  const [selectedTeams, setSelectedTeams] = useState<string[] | undefined>(undefined);
  const { data: vulnData } = useVulnerabilities();
  const effectiveSelectedTeams: string[] = selectedTeams ?? (vulnData?.teams ? Array.from(new Set(vulnData.teams.map((t) => t.team))) : []);
  
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

  // Show loading state while config is loading
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
            padding="6"
            borderRadius="medium"
            background="surface-subtle"
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
          selectedTeams={effectiveSelectedTeams}
          onTeamsChange={setSelectedTeams}
        />
        <VulnerabilitiesToLookAt 
          bucketName={activeBucket.name}
          minThreshold={activeBucket.minThreshold}
          maxThreshold={activeBucket.maxThreshold}
          selectedTeams={effectiveSelectedTeams}
        />
      </main>
    </div>
  );
}
