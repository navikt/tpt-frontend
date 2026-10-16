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

const NO_DATA_COLOR = "var(--ax-bg-neutral-moderate, #CFD3D8)";

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
  const missing = Math.max(0, 6 - paddedHistory.length);
  const historySlice: (SecurityStatusColor | null)[] = [
    ...Array<null>(missing).fill(null),
    ...paddedHistory,
  ].slice(-6);

  const getStatusText = (status: SecurityStatusColor | null | undefined) =>
    status === "green"
      ? tStatus("onTrack")
      : status === "yellow"
        ? tStatus("needsAttention")
        : status === "red"
          ? tStatus("actNow")
          : tStatus("noData");

  const summaryLabel = months
    .map((m, idx) => {
      const statusText = getStatusText(historySlice[idx]);
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
          const status = historySlice[idx] ?? null;
          const statusText = getStatusText(status);
          const tooltipContent = `${m.fullName}: ${statusText}`;

          return (
            <Tooltip key={`square-${idx}-${m.fullName}`} content={tooltipContent}>
              <span
                role="img"
                tabIndex={0}
                style={{
                  display: "inline-block",
                  width: "14px",
                  height: "14px",
                  borderRadius: "3px",
                  backgroundColor: status ? STATUS_COLOR_MAP[status] : NO_DATA_COLOR,
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
