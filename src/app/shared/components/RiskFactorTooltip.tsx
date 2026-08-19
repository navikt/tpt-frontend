"use client";

import { Tooltip } from "@navikt/ds-react";
import { InformationSquareIcon } from "@navikt/aksel-icons";
import { useTranslations } from "next-intl";

interface RiskFactorTooltipProps {
  factorKey: string;
  label: string;
}

export function RiskFactorTooltip({ factorKey, label }: RiskFactorTooltipProps) {
  const t = useTranslations("riskFactors.descriptions");
  let description: string | null = null;
  try {
    description = t(factorKey as Parameters<typeof t>[0]);
  } catch {
    description = null;
  }

  if (!description) return <span>{label}</span>;

  return (
    <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", width: "fit-content" }}>
      <span>{label}</span>
      <Tooltip content={description} placement="right">
        <InformationSquareIcon
          aria-label={description}
          style={{ cursor: "help", color: "var(--ax-text-neutral-subtle)", flexShrink: 0 }}
          fontSize="1rem"
        />
      </Tooltip>
    </span>
  );
}
