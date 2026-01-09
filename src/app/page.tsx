"use client";
import { useState, useEffect } from "react";
import VulnerabilitiesToLookAt from "@/app/components/vulnerabilitiesToLookAt/VulnerabilitiesToLookAt";
import VulnerabilitySummary, { BucketThreshold } from "@/app/components/vulnerabilitiesToLookAt/VulnerabilitySummary";
import { useConfig } from "@/app/hooks/useConfig";
import { BodyShort, Loader, Box, VStack } from "@navikt/ds-react";

export default function Home() {
  const { config, isLoading } = useConfig();
  const [selectedBucket, setSelectedBucket] = useState<BucketThreshold | null>(null);

  // Set default bucket when config loads
  useEffect(() => {
    if (config && !selectedBucket) {
      const defaultBucket: BucketThreshold = {
        name: "Superkritiske",
        minThreshold: config.thresholds.high,
        maxThreshold: Number.MAX_VALUE,
      };
      setSelectedBucket(defaultBucket);
    }
  }, [config, selectedBucket]);

  // Show loading state while config is loading
  if (isLoading || !selectedBucket) {
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
          selectedBucket={selectedBucket} 
          onBucketSelect={setSelectedBucket} 
        />
        <VulnerabilitiesToLookAt 
          bucketName={selectedBucket.name}
          minThreshold={selectedBucket.minThreshold}
          maxThreshold={selectedBucket.maxThreshold}
        />
      </main>
    </div>
  );
}
