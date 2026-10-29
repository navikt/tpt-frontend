"use client";

import { Accordion, BodyLong, Detail, Heading, VStack } from "@navikt/ds-react";
import { useLocale, useTranslations } from "next-intl";
import type { SecurityStatusMeasurement } from "@/app/types/securityStatus";

interface ComplianceMeasurementProps {
  measurement: SecurityStatusMeasurement;
  generatedAt: string;
}

export function ComplianceMeasurement({ measurement, generatedAt }: ComplianceMeasurementProps) {
  const t = useTranslations("complianceMeasurement");
  const locale = useLocale();
  const percentage = new Intl.NumberFormat("nb-NO", {
    style: "percent",
    maximumFractionDigits: 2,
  });
  const calculatedAt = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeStyle: "long",
    timeZone: measurement.timeZone,
  }).format(new Date(generatedAt));

  return (
    <VStack gap="space-8">
      <Accordion>
        <Accordion.Item>
          <Accordion.Header>{t("title")}</Accordion.Header>
          <Accordion.Content>
            <VStack gap="space-24">
              <Detail textColor="subtle">
                {t("calculatedAt", { timestamp: calculatedAt, timeZone: measurement.timeZone })}
              </Detail>
              <BodyLong>{t("intro")}</BodyLong>
              <VStack gap="space-8">
                <Heading size="small" level="3">{t("historyTitle")}</Heading>
                <BodyLong>{t("historyColours")}</BodyLong>
                <BodyLong>{t("historyFormula")}</BodyLong>
                <BodyLong>{t("dailyStatus")}</BodyLong>
                <BodyLong>{t("historyCoverage", { months: measurement.historyMonths })}</BodyLong>
                <BodyLong>{t("dailyTiming", { timeZone: measurement.timeZone })}</BodyLong>
              </VStack>
              <VStack gap="space-8">
                <Heading size="small" level="3">{t("exposureTitle")}</Heading>
                <BodyLong>{t("deadlines", {
                  critical: measurement.criticalWorkdays,
                  nonCritical: measurement.nonCriticalMonths,
                })}</BodyLong>
                <BodyLong>{t("exposureRules", { workdays: measurement.exposedRedWorkdays })}</BodyLong>
                <BodyLong>{t("workdays")}</BodyLong>
              </VStack>
              <VStack gap="space-8">
                <Heading size="small" level="3">{t("trendTitle")}</Heading>
                <BodyLong>{t("trendWindow", { days: measurement.trendWindowDays })}</BodyLong>
                <BodyLong>{t("trendStable", {
                  ratio: percentage.format(measurement.trendStableRatio),
                })}</BodyLong>
                <BodyLong>{t("trendRules", { days: measurement.trendWindowDays })}</BodyLong>
                <BodyLong>{t("trendChart")}</BodyLong>
              </VStack>
              <VStack gap="space-8">
                <Heading size="small" level="3">{t("maintenanceTitle")}</Heading>
                <BodyLong>{t("maintenanceAge", { days: measurement.deployMaxAgeDays })}</BodyLong>
                <BodyLong>{t("maintenanceRules", {
                  ratio: percentage.format(measurement.maintenanceYellowRatio),
                })}</BodyLong>
                <BodyLong>{t("maintenanceCoverage")}</BodyLong>
              </VStack>
              <VStack gap="space-8">
                <Heading size="small" level="3">{t("levelsTitle")}</Heading>
                <BodyLong>{t("levels", {
                  workdays: measurement.levelNewWorkdays,
                  months: measurement.levelChronicMonths,
                })}</BodyLong>
              </VStack>
              <VStack gap="space-8">
                <Heading size="small" level="3">{t("dataTitle")}</Heading>
                <BodyLong>{t("dataLimitations")}</BodyLong>
                <BodyLong>{t("freshness")}</BodyLong>
              </VStack>
            </VStack>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </VStack>
  );
}
