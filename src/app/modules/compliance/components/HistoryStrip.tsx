"use client";

import { Tooltip, VStack, Detail } from "@navikt/ds-react";
import { useTranslations, useLocale } from "next-intl";
import type { SecurityStatusColor } from "@/app/types/securityStatus";
import { getLast6MonthsInfo } from "../utils/complianceFormatters";

interface HistoryStripProps {
  history: SecurityStatusColor[];
  showInitials?: boolean;
  showCaption?: boolean;
}

const STATUS_COLOR_MAP: Record<SecurityStatusColor, string> = {
  green: "var(--ax-bg-success-strong, #06893A)",
  yellow: "var(--ax-border-warning-strong, #C77300)",
  red: "var(--ax-bg-danger-strong, #C30000)",
};

export function HistoryStrip({
  history,
  showInitials = false,
  showCaption = false,
}: HistoryStripProps) {
  const tStatus = useTranslations("complianceStatus");
  const tCompliance = useTranslations("compliance");
  const locale = useLocale();

  const months = getLast6MonthsInfo(locale);
  // Pad or slice history so it's always exactly 6 entries
  const paddedHistory = [...history];
  while (paddedHistory.length < 6) {
    paddedHistory.unshift("green");
  }
  const historySlice = paddedHistory.slice(-6);

  const summaryLabel = months
    .map((m, idx) => {
      const status = historySlice[idx] ?? "green";
      const statusText =
        status === "green"
          ? tStatus("onTrack")
          : status === "yellow"
            ? tStatus("needsAttention")
            : tStatus("actNow");
      return `${m.fullName}: ${statusText}`;
    })
    .join(", ");

  return (
    <VStack
      gap="space-4"
      align="center"
      aria-label={`${tCompliance("last6Months")}: ${summaryLabel}`}
    >
      {showInitials && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 14px)",
            gap: "3px",
            fontSize: "11px",
            fontWeight: 600,
            color: "var(--ax-text-subtle)",
            textAlign: "center",
            lineHeight: 1,
          }}
        >
          {months.map((m, idx) => (
            <span key={`init-${idx}-${m.fullName}`}>{m.initial}</span>
          ))}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 14px)",
          gap: "3px",
        }}
      >
        {months.map((m, idx) => {
          const status = historySlice[idx] ?? "green";
          const statusText =
            status === "green"
              ? tStatus("onTrack")
              : status === "yellow"
                ? tStatus("needsAttention")
                : tStatus("actNow");
          const tooltipContent = `${m.fullName}: ${statusText}`;

          return (
            <Tooltip key={`square-${idx}-${m.fullName}`} content={tooltipContent}>
              <span
                role="img"
                style={{
                  display: "inline-block",
                  width: "14px",
                  height: "14px",
                  borderRadius: "3px",
                  backgroundColor: STATUS_COLOR_MAP[status],
                  cursor: "default",
                }}
                aria-label={tooltipContent}
              />
            </Tooltip>
          );
        })}
      </div>

      {showCaption && (
        <Detail textColor="subtle">
          {tCompliance("last6Months")}
        </Detail>
      )}
    </VStack>
  );
}
