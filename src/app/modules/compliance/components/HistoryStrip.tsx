"use client";

import { BodyShort, Detail, HStack, ReadMore, VStack } from "@navikt/ds-react";
import { useTranslations, useLocale } from "next-intl";
import type { MonthlySecurityHistory } from "@/app/types/securityStatus";
import { getOnTrackPercentage } from "../utils/complianceFormatters";

interface HistoryStripProps {
  history: MonthlySecurityHistory[];
}

export function HistoryStrip({ history }: HistoryStripProps) {
  const t = useTranslations("complianceHistory");
  const tStatus = useTranslations("complianceStatus");
  const locale = useLocale();
  const monthFormat = new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
    timeZone: "Europe/Oslo",
  });
  const percentageFormat = new Intl.NumberFormat("nb-NO", {
    style: "percent",
    maximumFractionDigits: 0,
  });
  const dateFormat = new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "Europe/Oslo",
  });

  if (history.length === 0) {
    return <BodyShort size="small">{tStatus("noData")}</BodyShort>;
  }

  return (
    <VStack gap="space-8">
      <Detail textColor="subtle">{t("caption")}</Detail>
      <HStack gap="space-12" wrap>
        {history.map((month) => {
          const percentage = getOnTrackPercentage(month);
          return (
            <VStack key={month.month} gap="space-2" align="center">
              <Detail>{monthFormat.format(new Date(`${month.month}-01T12:00:00Z`))}</Detail>
              <BodyShort size="small" weight="semibold">
                {percentage === null ? tStatus("noData") : percentageFormat.format(percentage)}
                {month.provisional && " *"}
              </BodyShort>
            </VStack>
          );
        })}
      </HStack>
      {history.some((month) => month.provisional) && (
        <Detail textColor="subtle">{t("monthToDate")}</Detail>
      )}
      <ReadMore header={t("details")} size="small">
        <VStack gap="space-12">
          {history.map((month) => {
            const recorded = month.onTrackDays + month.needsAttentionDays + month.actNowDays;
            const percentage = getOnTrackPercentage(month);
            return (
              <VStack key={month.month} gap="space-4">
                <BodyShort size="small" weight="semibold">
                  {monthFormat.format(new Date(`${month.month}-01T12:00:00Z`))}
                </BodyShort>
                <BodyShort size="small">
                  {percentage === null
                    ? tStatus("noData")
                    : t("summary", {
                        onTrack: month.onTrackDays,
                        recorded,
                        percentage: percentageFormat.format(percentage),
                      })}
                </BodyShort>
                <BodyShort size="small">
                  {t("breakdown", {
                    green: month.onTrackDays,
                    yellow: month.needsAttentionDays,
                    red: month.actNowDays,
                  })}
                </BodyShort>
                <BodyShort size="small">
                  {t("coverage", {
                    through: dateFormat.format(new Date(`${month.throughDate}T12:00:00Z`)),
                    missing: month.missingDays,
                  })}
                </BodyShort>
              </VStack>
            );
          })}
        </VStack>
      </ReadMore>
    </VStack>
  );
}
