"use client";

import type { SecurityStatusColor, TrendDirection } from "@/app/types/securityStatus";
import { HStack, BodyShort } from "@navikt/ds-react";
import { useTranslations } from "next-intl";

interface TrendSparklineProps {
  status: SecurityStatusColor;
  direction: TrendDirection;
  values: number[]; // 6 values
}

const STATUS_COLOR_MAP: Record<SecurityStatusColor, string> = {
  green: "var(--ax-bg-success-strong, #06893A)",
  yellow: "var(--ax-border-warning-strong, #C77300)",
  red: "var(--ax-bg-danger-strong, #C30000)",
};

export function TrendSparkline({ status, direction, values }: TrendSparklineProps) {
  const t = useTranslations("complianceTrend");
  const tCompliance = useTranslations("compliance");

  // Ensure 6 values
  const normalizedValues = [...values];
  while (normalizedValues.length < 6) {
    normalizedValues.unshift(0);
  }
  const pointsData = normalizedValues.slice(-6);

  const maxVal = Math.max(1, ...pointsData);
  const minVal = 0;

  // X coords for 6 points from 4 to 92
  const xCoords = [4, 21.6, 39.2, 56.8, 74.4, 92];

  // Map to Y coords: 4 (highest) to 22 (lowest)
  const coords = pointsData.map((val, idx) => {
    const x = xCoords[idx] ?? 4;
    const ratio = (val - minVal) / maxVal;
    const y = 22 - ratio * 18;
    return { x, y: Number(y.toFixed(1)) };
  });

  const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const lastPoint = coords[coords.length - 1] ?? { x: 92, y: 22 };

  const strokeColor = STATUS_COLOR_MAP[status];

  const directionText =
    direction === "worse"
      ? t("gettingWorse")
      : direction === "improving"
        ? t("improving")
        : t("stable");

  const ariaLabel = `${directionText}. ${tCompliance("last6Months")}: ${pointsData.join(", ")}`;

  return (
    <HStack gap="space-8" align="center">
      <BodyShort size="small">
        {direction === "worse" && "↗ "}
        {direction === "stable" && "→ "}
        {direction === "improving" && "↘ "}
        {directionText}
      </BodyShort>
      <svg
        width="96"
        height="26"
        viewBox="0 0 96 26"
        fill="none"
        aria-label={ariaLabel}
        role="img"
      >
        <title>{ariaLabel}</title>
        <polyline
          points={polylinePoints}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx={lastPoint.x} cy={lastPoint.y} r="3" fill={strokeColor} />
      </svg>
    </HStack>
  );
}
