"use client";

import { Box, BodyShort, Tooltip } from "@navikt/ds-react";
import { InformationSquareIcon } from "@navikt/aksel-icons";
import { RiskScoreBreakdown } from "@/app/shared/types/vulnerabilities";
import { useTranslations } from "next-intl";

function InlineTooltipIcon({ factorKey }: { factorKey: string }) {
  const t = useTranslations("riskFactors.descriptions");
  let description: string | null = null;
  try {
    description = t(factorKey as Parameters<typeof t>[0]);
  } catch {
    description = null;
  }
  if (!description) return null;
  return (
    <Tooltip content={description} placement="right">
      <InformationSquareIcon
        aria-label={description}
        style={{ cursor: "help", color: "var(--ax-text-neutral-subtle)", flexShrink: 0 }}
        fontSize="1rem"
      />
    </Tooltip>
  );
}

interface RiskScoreBreakdownBarsProps {
  breakdown: RiskScoreBreakdown;
}

function getBarColor(impact: string): string {
  switch (impact) {
    case "CRITICAL":
      return "#c01b1b"; // red
    case "HIGH":
      return "#c25400"; // orange
    case "MEDIUM":
      return "#7a5000"; // amber
    case "LOW":
      return "#6b7280"; // gray
    default:
      return "#9ca3af";
  }
}

const EXCLUDED_FACTORS = new Set(["environment", "exposure"]);

export function RiskScoreBreakdownBars({ breakdown }: RiskScoreBreakdownBarsProps) {
  const t = useTranslations("riskFactors");
  const factors = breakdown.factors.filter((f) => !EXCLUDED_FACTORS.has(f.name));

  return (
    <Box
      padding="space-12"
      borderRadius="8"
      style={{
        border: "1px solid var(--ax-border-neutral-subtle)",
        backgroundColor: "var(--ax-bg-neutral-soft)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {factors.map((factor) => {
          const pct =
            factor.maxPoints > 0
              ? Math.min(100, Math.round((factor.points / factor.maxPoints) * 100))
              : 0;
          const barColor = getBarColor(factor.impact);

          return (
            <div
              key={factor.name}
              style={{ display: "flex", alignItems: "center", gap: "1rem" }}
            >
              {/* Label */}
              <div style={{ width: "160px", flexShrink: 0, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <BodyShort size="small" style={{ flex: 1 }}>
                  {t(factor.name as Parameters<typeof t>[0], { defaultValue: factor.name })}
                </BodyShort>
                <InlineTooltipIcon factorKey={factor.name} />
              </div>

              {/* Track rendered as a gradient: colored portion + grey remainder */}
              <div
                style={{
                  width: "160px",
                  flexShrink: 0,
                  height: "8px",
                  borderRadius: "4px",
                  background:
                    pct > 0
                      ? `linear-gradient(to right, ${barColor} ${pct}%, #d1d5db ${pct}%)`
                      : "#d1d5db",
                }}
              />

              {/* Explanation */}
              <BodyShort
                size="small"
                style={{ color: "var(--ax-text-neutral-subtle)", flex: 1 }}
              >
                {factor.explanation}
              </BodyShort>
            </div>
          );
        })}
      </div>
    </Box>
  );
}
