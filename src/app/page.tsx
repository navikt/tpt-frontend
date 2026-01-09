"use client";
import { useState } from "react";
import VulnerabilitiesToLookAt from "@/app/components/vulnerabilitiesToLookAt/VulnerabilitiesToLookAt";
import VulnerabilitySummary, { BucketThreshold } from "@/app/components/vulnerabilitiesToLookAt/VulnerabilitySummary";
import Link from "next/link";
import { BodyShort } from "@navikt/ds-react";

const DEFAULT_BUCKET: BucketThreshold = {
  name: "Superkritiske",
  minThreshold: 100,
  maxThreshold: Number.MAX_VALUE,
};

export default function Home() {
  const [selectedBucket, setSelectedBucket] = useState<BucketThreshold>(DEFAULT_BUCKET);

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
