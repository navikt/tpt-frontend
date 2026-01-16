"use client";
import { useState, useMemo } from "react";
import VulnerabilitiesToLookAt from "@/app/components/vulnerabilitiesToLookAt/VulnerabilitiesToLookAt";
import VulnerabilitySummary, { BucketThreshold } from "@/app/components/vulnerabilitiesToLookAt/VulnerabilitySummary";
import { useConfig } from "@/app/hooks/useConfig";
import { useVulnerabilities } from "@/app/hooks/useVulnerabilities";
import { BodyShort, Loader, Box } from "@navikt/ds-react";

export default function Home() {
  const { config, isLoading } = useConfig();
  const [selectedTeams, setSelectedTeams] = useState<string[] | undefined>(undefined);
  const { data: vulnData } = useVulnerabilities();
  const effectiveSelectedTeams: string[] = selectedTeams ?? (vulnData?.teams ? Array.from(new Set(vulnData.teams.map((t) => t.team))) : []);
  
  // Create default bucket from config
  const defaultBucket = useMemo<BucketThreshold | null>(() => {
    if (!config) return null;
    return {
      name: "Superkritiske",
      minThreshold: config.thresholds.high,
      maxThreshold: Number.MAX_VALUE,
    };
  }, [config]);

  const [selectedBucket, setSelectedBucket] = useState<BucketThreshold | null>(null);

  // Use defaultBucket if no bucket is selected
  const activeBucket = selectedBucket || defaultBucket;

  // Show loading state while config is loading
  if (isLoading || !activeBucket) {
    return (
      <div style={{ marginTop: "2rem" }}>
        <main>
          <div>
            <h1>
              Sårbarhetsprioritering som gir <i>mening</i>
            </h1>
            <BodyShort spacing>
              Titt på ting er et prioriteringsverktøy ment for å filtrere bort
              støy og usikkerhet.
            </BodyShort>
            <BodyShort spacing>
              Ikke alle sårbarheter er født like og vi har gjort jobben for med
              deg å analysere og rangere de mest kritiske sårbarhetene i teamene
              du tilhører. Sårbarhetslisten hentes fra Nais API.
            </BodyShort>
          </div>
          <Box
            padding="6"
            borderRadius="medium"
            background="surface-subtle"
            style={{ marginBottom: "1.5rem", textAlign: "center" }}
          >
            <Loader size="large" title="Henter sårbarheter..." />
          </Box>
        </main>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "2rem" }}>
      <main>
        <div>
          <h1>
            Sårbarhetsprioritering som gir <i>mening</i>
          </h1>
          <BodyShort spacing>
            Titt på ting er et prioriteringsverktøy ment for å filtrere bort
            støy og usikkerhet.
          </BodyShort>
          <BodyShort spacing>
            Ikke alle sårbarheter er født like og vi har gjort jobben for med
            deg å analysere og rangere de mest kritiske sårbarhetene i teamene
            du tilhører. Sårbarhetslisten hentes fra Nais API.
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
