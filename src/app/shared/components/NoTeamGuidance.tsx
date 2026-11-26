"use client";

import { BodyShort, Link, VStack } from "@navikt/ds-react";
import { useTranslations } from "next-intl";

export function NoTeamGuidance() {
  const t = useTranslations("noTeamView");

  return (
    <VStack gap="space-8">
      <VStack as="ol" gap="space-8" marginBlock="space-0" paddingInline="space-24">
        <BodyShort as="li">{t("checkMembership")}</BodyShort>
        <BodyShort as="li">{t("checkNaisTeam")}</BodyShort>
        <BodyShort as="li">{t("contactAppsec")}</BodyShort>
      </VStack>
      <Link href="https://teamkatalogen.nav.no" target="_blank" rel="noopener noreferrer">
        {t("teamkatalogen")}
      </Link>
      <Link href="https://console.nav.cloud.nais.io" target="_blank" rel="noopener noreferrer">
        {t("naisConsole")}
      </Link>
    </VStack>
  );
}
