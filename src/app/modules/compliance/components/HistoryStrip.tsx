"use client";

import { BodyShort, HStack, Tooltip } from "@navikt/ds-react";
import { CheckmarkIcon, ExclamationmarkIcon, XMarkIcon } from "@navikt/aksel-icons";
import { useTranslations, useLocale } from "next-intl";
import type { MonthlySecurityHistory } from "@/app/types/securityStatus";
import { getMonthlyStatus, getOnTrackPercentage } from "../utils/complianceFormatters";

interface HistoryStripProps {
  history: MonthlySecurityHistory[];
}

const STATUS_APPEARANCE = {
  green: {
    backgroundColor: "var(--ax-bg-success-strong)",
    color: "var(--ax-text-success-contrast)",
    Icon: CheckmarkIcon,
  },
  yellow: {
    backgroundColor: "var(--ax-bg-warning-strong)",
    color: "var(--ax-text-warning-contrast)",
    Icon: ExclamationmarkIcon,
  },
  red: {
    backgroundColor: "var(--ax-bg-danger-strong)",
    color: "var(--ax-text-danger-contrast)",
    Icon: XMarkIcon,
  },
};

export function HistoryStrip({ history }: HistoryStripProps) {
  const t = useTranslations("complianceHistory");
  const tStatus = useTranslations("complianceStatus");
  const locale = useLocale();
  const monthFormat = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Oslo",
  });
  const percentageFormat = new Intl.NumberFormat("nb-NO", {
    style: "percent",
    maximumFractionDigits: 0,
  });
  if (history.length === 0) {
    return <BodyShort size="small">{tStatus("noData")}</BodyShort>;
  }

  return (
    <HStack gap="space-0" role="group" aria-label={t("label")}>
      {history.map((month) => {
        const status = getMonthlyStatus(month);
        const appearance = status === null ? null : STATUS_APPEARANCE[status];
        const Icon = appearance?.Icon;
        const percentage = getOnTrackPercentage(month);
        const recorded = month.onTrackDays + month.needsAttentionDays + month.actNowDays;
        const content = [
          t("monthStatus", {
            month: monthFormat.format(new Date(`${month.month}-01T12:00:00Z`)),
            status: status === null ? tStatus("noData") : t(status),
          }),
          percentage === null ? null : t("summary", {
            onTrack: month.onTrackDays,
            recorded,
            percentage: percentageFormat.format(percentage),
          }),
          t("breakdown", {
            green: month.onTrackDays,
            yellow: month.needsAttentionDays,
            red: month.actNowDays,
          }),
        ].filter(Boolean).join(" ");

        return (
          <Tooltip key={month.month} content={content} maxChar={300}>
            <button
              type="button"
              aria-label={content}
              style={{
                display: "grid",
                placeItems: "center",
                width: "var(--ax-space-24)",
                height: "var(--ax-space-24)",
                padding: 0,
                border: 0,
                background: "transparent",
                cursor: "help",
              }}
            >
              <span
                aria-hidden
                style={{
                  display: "grid",
                  placeItems: "center",
                  width: "var(--ax-space-16)",
                  height: "var(--ax-space-16)",
                  borderRadius: "var(--ax-radius-2)",
                  backgroundColor: appearance?.backgroundColor ?? "var(--ax-bg-neutral-moderate)",
                  color: appearance?.color,
                  border: "var(--ax-space-1) solid var(--ax-border-neutral)",
                  boxSizing: "border-box",
                }}
              >
                {Icon && <Icon aria-hidden style={{ width: "100%", height: "100%" }} />}
              </span>
            </button>
          </Tooltip>
        );
      })}
    </HStack>
  );
}
