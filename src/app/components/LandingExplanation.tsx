"use client";

import { BodyShort, Box, Detail, Heading, HGrid, HStack, Link, VStack } from "@navikt/ds-react";
import { BranchingIcon, DatabaseIcon, MegaphoneIcon } from "@navikt/aksel-icons";
import { useTranslations } from "next-intl";
import { DataSourceNote } from "@/app/shared/components/DataSourceNote";
import { SLACK_URL } from "./FeedbackButton";

type PurposeTab = "compliance" | "prioritization" | "github";

function PurposeCard({ tab }: { tab: PurposeTab }) {
  const t = useTranslations("welcome.explanation");
  const tData = useTranslations("dataSource");

  return (
    <Box
      as="section"
      aria-labelledby={`purpose-${tab}`}
      background="default"
      borderRadius="8"
      padding="space-12"
      height="100%"
      minWidth="0"
    >
      <VStack gap="space-8" height="100%">
        <Heading size="xsmall" level="3" id={`purpose-${tab}`}>{tData(`${tab}.title`)}</Heading>
        <BodyShort as="div" size="small" weight="semibold">{t(`cards.${tab}.question`)}</BodyShort>
        <Detail as="div" textColor="subtle">{t(`cards.${tab}.body`)}</Detail>
        <VStack gap="space-8" marginBlock="auto space-0" paddingBlock="space-8 space-0">
          <Box as="hr" borderWidth="1 0 0" borderColor="neutral-subtle" marginBlock="space-0" width="100%" />
          <Box minHeight={{ xs: "0", lg: "var(--ax-space-64)" }}>
            <Detail as="div" textColor="subtle">
              <strong>{tData("limitations")}:</strong>{" "}{t(`cards.${tab}.limitations`)}
            </Detail>
          </Box>
          <DataSourceNote tab={tab} compact />
        </VStack>
      </VStack>
    </Box>
  );
}

export function LandingExplanation() {
  const t = useTranslations("welcome.explanation");

  return (
    <VStack gap="space-28">
      <HStack as="header" gap="space-16" align="end" justify="space-between" wrap>
        <VStack gap="space-4">
          <Heading size="large" level="1">{t("title")}</Heading>
          <Detail as="div" textColor="subtle">{t("intro")}</Detail>
        </VStack>
        <Box asChild background="neutral-soft" borderRadius="full" paddingInline="space-12" paddingBlock="space-8" maxWidth="100%">
          <Link href={SLACK_URL} target="_blank" rel="noopener noreferrer" data-color="neutral">
            <HStack gap="space-8" align="center" wrap={false}>
              <MegaphoneIcon aria-hidden />
              <Detail as="span">{t("feedback")}</Detail>
            </HStack>
          </Link>
        </Box>
      </HStack>

      <VStack as="section" gap="space-8" aria-labelledby="data-purpose">
        <Heading size="medium" level="2" id="data-purpose">{t("purpose")}</Heading>
        <HGrid columns={{ xs: 1, lg: "minmax(0, 2fr) minmax(0, 1fr)" }} gap="space-16">
          <Box padding="space-12" background="neutral-soft" borderRadius="12">
            <VStack gap="space-12" height="100%">
              <HStack gap="space-8" align="center" wrap={false}>
                <DatabaseIcon aria-hidden />
                <Detail as="div">
                  <strong>{t("panels.nais.title")}</strong>{" "}
                  <Detail as="span" textColor="subtle">{t("panels.nais.description")}</Detail>
                </Detail>
              </HStack>
              <HGrid columns={{ xs: 1, md: 2 }} gap="space-12" flexGrow="1">
                <PurposeCard tab="compliance" />
                <PurposeCard tab="prioritization" />
              </HGrid>
            </VStack>
          </Box>
          <Box padding="space-12" background="neutral-soft" borderRadius="12">
            <VStack gap="space-12" height="100%">
              <HStack gap="space-8" align="center" wrap={false}>
                <BranchingIcon aria-hidden />
                <Detail as="div">
                  <strong>{t("panels.github.title")}</strong>{" "}
                  <Detail as="span" textColor="subtle">{t("panels.github.description")}</Detail>
                </Detail>
              </HStack>
              <HGrid columns={1} flexGrow="1">
                <PurposeCard tab="github" />
              </HGrid>
            </VStack>
          </Box>
        </HGrid>
      </VStack>
    </VStack>
  );
}
