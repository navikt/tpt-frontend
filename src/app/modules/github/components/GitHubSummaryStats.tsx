"use client";

import { Box, HGrid, Heading, BodyShort } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import { formatNumber } from "@/lib/format";

interface GitHubSummaryStatsProps {
  repositoryCount: number;
  totalVulnerabilities: number;
  fixesReadyToMerge: number;
  criticalRepositories: number;
}

export function GitHubSummaryStats({
  repositoryCount,
  totalVulnerabilities,
  fixesReadyToMerge,
  criticalRepositories,
}: GitHubSummaryStatsProps) {
  const t = useTranslations("github.stats");

  return (
    <HGrid columns={{ xs: 1, sm: 2, lg: 4 }} gap="space-16">
      <StatCard label={t("repositories")} value={repositoryCount} />
      <StatCard label={t("totalVulnerabilities")} value={totalVulnerabilities} />
      <StatCard
        label={t("fixesReadyToMerge")}
        value={fixesReadyToMerge}
        valueColor={fixesReadyToMerge > 0 ? "var(--ax-color-green-700)" : undefined}
      />
      <StatCard
        label={t("criticalRepositories")}
        value={criticalRepositories}
        valueColor={criticalRepositories > 0 ? "var(--ax-color-red-600)" : "var(--ax-text-neutral-subtle)"}
      />
    </HGrid>
  );
}

function StatCard({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: number;
  valueColor?: string;
}) {
  return (
    <Box
      padding="space-16"
      borderRadius="8"
      style={{
        border: "1px solid var(--ax-border-neutral-subtle)",
        backgroundColor: "var(--ax-bg-default)",
      }}
    >
      <BodyShort
        size="small"
        style={{
          color: "var(--ax-text-neutral-subtle)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          fontWeight: 600,
          fontSize: "0.7rem",
          marginBottom: "0.5rem",
        }}
      >
        {label}
      </BodyShort>
      <Heading
        size="xlarge"
        level="2"
        style={{ color: valueColor ?? "var(--ax-text-default)" }}
      >
        {formatNumber(value)}
      </Heading>
    </Box>
  );
}
