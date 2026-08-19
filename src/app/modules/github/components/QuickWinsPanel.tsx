"use client";

import { useMemo } from "react";
import { Box, HStack, VStack, BodyShort, Button } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import { RepositoryMetrics } from "../hooks/useRepositoryMetrics";
import { formatNumber } from "@/lib/format";

interface QuickWinsPanelProps {
  repositories: RepositoryMetrics[];
}

/** Strip PURL prefix and version suffix — "pkg:npm/axios@1.2.3" → "axios" */
function extractPackageName(raw: string): string {
  // Remove "pkg:ecosystem/" prefix
  let name = raw.replace(/^pkg:[^/]+\//, "");
  // For Go-style paths like "github.com/gin-gonic/gin@v1.9.1" keep the last path segment
  const atIdx = name.indexOf("@");
  if (atIdx !== -1) name = name.slice(0, atIdx);
  // For paths like "github.com/foo/bar" take the last segment
  const slashIdx = name.lastIndexOf("/");
  if (slashIdx !== -1) name = name.slice(slashIdx + 1);
  return name;
}

function RiskScoreBadge({ score }: { score: number }) {
  const bgColor =
    score >= 75
      ? "var(--ax-color-red-600)"
      : score >= 50
        ? "var(--ax-color-orange-600)"
        : score >= 25
          ? "var(--ax-color-yellow-600)"
          : "var(--ax-color-gray-600)";

  const textColor =
    score >= 25
      ? "var(--ax-text-on-inverted)"
      : "var(--ax-text-on-inverted)";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "2.5rem",
        height: "2.5rem",
        borderRadius: "8px",
        backgroundColor: bgColor,
        color: textColor,
        fontWeight: 700,
        fontSize: "0.85rem",
        flexShrink: 0,
      }}
    >
      {formatNumber(score)}
    </div>
  );
}

export function QuickWinsPanel({ repositories }: QuickWinsPanelProps) {
  const t = useTranslations("github.quickWins");

  const quickWins = useMemo(() => {
    return repositories
      .flatMap((repo) =>
        repo.vulnerabilities
          .filter((v) => v.dependabotUpdatePullRequestUrl != null)
          .map((v) => ({ ...v, repoName: repo.nameWithOwner }))
      )
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [repositories]);

  if (quickWins.length === 0) return null;

  return (
    <Box
      padding="space-20"
      borderRadius="8"
      style={{
        border: "1px solid var(--ax-border-success)",
        backgroundColor: "var(--ax-bg-success-soft)",
      }}
    >
      <HStack justify="space-between" align="center" style={{ marginBottom: "1rem" }}>
        <BodyShort weight="semibold" style={{ color: "var(--ax-text-success)" }}>
          {t("title")}
        </BodyShort>
        <BodyShort size="small" style={{ color: "var(--ax-text-neutral-subtle)" }}>
          {t("sortedByRisk")}
        </BodyShort>
      </HStack>

      <VStack gap="space-0">
        {quickWins.map((win, index) => (
          <HStack
            key={`${win.identifier}:${win.repoName}:${index}`}
            align="center"
            gap="space-16"
            style={{
              paddingBlock: "0.6rem",
              borderBottom:
                index < quickWins.length - 1
                  ? "1px solid var(--ax-border-success-subtle)"
                  : undefined,
            }}
          >
            <RiskScoreBadge score={win.riskScore} />

            <div style={{ flex: 1, minWidth: 0 }}>
              <HStack gap="space-8" align="baseline" wrap>
                <BodyShort weight="semibold" size="small">
                  {win.identifier}
                </BodyShort>
                {win.packageName && (
                  <BodyShort size="small" style={{ color: "var(--ax-text-neutral-subtle)" }}>
                    · {extractPackageName(win.packageName)}
                  </BodyShort>
                )}
              </HStack>
              <BodyShort size="small" style={{ color: "var(--ax-text-neutral-subtle)" }}>
                {win.repoName}
              </BodyShort>
            </div>

            <Button
              as="a"
              href={win.dependabotUpdatePullRequestUrl!}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="small"
              style={{
                whiteSpace: "nowrap",
                borderColor: "var(--ax-border-success)",
                color: "var(--ax-text-success)",
              }}
            >
              {t("mergeFixPr")}
            </Button>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
