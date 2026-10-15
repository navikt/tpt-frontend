"use client";

import { Detail, HStack, VStack } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import type { SecurityLevel } from "@/app/types/securityStatus";
import { LevelBadge } from "./LevelBadge";

const LEVELS: NonNullable<SecurityLevel>[] = ["chronic", "ongoing", "new"];

export function LevelLegend() {
  const t = useTranslations("complianceLevel");

  return (
    <VStack gap="space-8">
      <Detail textColor="subtle">{t("exposedExplanation")}</Detail>
      <Detail weight="semibold">{t("legendTitle")}</Detail>
      <VStack gap="space-6">
        {LEVELS.map((level) => (
          <HStack key={level} gap="space-8" align="center" wrap={false}>
            <LevelBadge level={level} size="small" />
            <Detail textColor="subtle">{t(`${level}Detail`)}</Detail>
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
}
