"use client";

import { Box, BodyShort, Link, HStack } from "@navikt/ds-react";
import { ExternalLinkIcon } from "@navikt/aksel-icons";
import { useTranslations } from "next-intl";

export function ComplianceBanner() {
  const t = useTranslations("compliance");

  return (
    <Box
      background="info-soft"
      padding="space-12"
      borderRadius="8"
    >
      <HStack align="center" gap="space-8">
        <BodyShort size="medium">
          {t("targetsBasedOn")}{" "}
          <Link
            href="https://etterlevelse.ansatt.nav.no/krav/267/2"
            target="_blank"
            rel="noopener noreferrer"
            inlineText
          >
            K267.2 <ExternalLinkIcon aria-hidden />
          </Link>
        </BodyShort>
      </HStack>
    </Box>
  );
}
