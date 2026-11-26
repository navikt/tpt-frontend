"use client";

import { BodyShort, Box, Link, ReadMore, VStack } from "@navikt/ds-react";
import { useTranslations } from "next-intl";

export type DataSourceTab = "prioritization" | "vulnerabilities" | "github" | "compliance" | "goldenpath";

export function DataSourceNote({ tab, compact = false }: { tab: DataSourceTab; compact?: boolean }) {
  const t = useTranslations("dataSource");

  const disclosure = (
    <ReadMore header={t("about")} size="small">
      <VStack as="dl" gap="space-8" marginBlock="space-0">
        {(["usage", "limitations"] as const).map((field) => (
          <div key={field}>
            <BodyShort as="dt" size="small" weight="semibold">{t(field)}</BodyShort>
            <Box as="dd" marginInline="space-0">
              {t(`${tab}.${field}`)}
            </Box>
          </div>
        ))}
      </VStack>
      {tab === "compliance" && (
        <Box marginBlock="space-8">
          <Link href="https://etterlevelse.ansatt.nav.no/krav/267/3" target="_blank" rel="noopener noreferrer">
            {t("requirement")}
          </Link>
        </Box>
      )}
    </ReadMore>
  );

  if (compact) return disclosure;

  return (
    <Box padding="space-16" background="neutral-soft" borderRadius="8">
      <VStack gap="space-8">
        <BodyShort as="div" size="small">{t(`${tab}.summary`)}</BodyShort>
        {disclosure}
      </VStack>
    </Box>
  );
}
