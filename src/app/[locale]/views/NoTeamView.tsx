"use client";

import { Heading, BodyShort, VStack } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import { NoTeamGuidance } from "@/app/shared/components/NoTeamGuidance";

export default function NoTeamView() {
  const t = useTranslations("noTeamView");

  return (
    <VStack
      gap="space-16"
      paddingBlock={{ xs: "space-16", md: "space-24" }}
      paddingInline={{ xs: "space-16", md: "space-40" }}
    >
      <Heading size="large" level="1">{t("title")}</Heading>
      <BodyShort as="div">{t("description")}</BodyShort>
      <NoTeamGuidance />
    </VStack>
  );
}
