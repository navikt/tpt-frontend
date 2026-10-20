"use client";

import { useMemo } from "react";
import { Box, HStack, VStack, BodyShort, Button } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import { RepositoryMetrics } from "../hooks/useRepositoryMetrics";
import { formatNumber } from "@/lib/format";
import { getTeamRepositoryDisplayName } from "../utils/filterRepositoriesByWorkContext";

interface QuickWinsPanelProps {
  repositories: RepositoryMetrics[];
}

interface QuickWin {
  repoName: string;
  pullRequestUrl: string;
  pullRequestNumber?: string;
  dependencyNames: Set<string>;
  vulnerabilityIds: Set<string>;
  riskScore: number;
}

function extractDependencyName(raw: string): string {
  let name = raw.replace(/^pkg:[^/]+\//, "").split(/[?#]/, 1)[0] ?? raw;
  const versionIndex = name.lastIndexOf("@");
  if (versionIndex > 0) name = name.slice(0, versionIndex);
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
    score >= 25 ? "var(--ax-text-on-inverted)" : "var(--ax-text-on-inverted)";

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

  const { quickWins, totalQuickWins } = useMemo(() => {
    const groupedByPullRequest = new Map<string, QuickWin>();

    for (const repo of repositories) {
      for (const vulnerability of repo.vulnerabilities) {
        const pullRequestUrl = vulnerability.dependabotUpdatePullRequestUrl;
        if (pullRequestUrl == null) continue;

        const pullRequestNumber = pullRequestUrl.match(
          /\/pull\/(\d+)(?:[/?#]|$)/
        )?.[1];
        const key = JSON.stringify([
          repo.nameWithOwner,
          pullRequestNumber ?? pullRequestUrl,
        ]);
        const group = groupedByPullRequest.get(key) ?? {
          repoName: getTeamRepositoryDisplayName(repo),
          pullRequestUrl,
          pullRequestNumber,
          dependencyNames: new Set<string>(),
          vulnerabilityIds: new Set<string>(),
          riskScore: vulnerability.riskScore,
        };

        group.dependencyNames.add(
          extractDependencyName(vulnerability.packageName)
        );
        group.vulnerabilityIds.add(vulnerability.identifier);
        group.riskScore = Math.max(group.riskScore, vulnerability.riskScore);
        groupedByPullRequest.set(key, group);
      }
    }

    const all = [...groupedByPullRequest.values()].sort(
      (a, b) => b.riskScore - a.riskScore
    );
    return { quickWins: all.slice(0, 5), totalQuickWins: all.length };
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
      <HStack
        justify="space-between"
        align="center"
        style={{ marginBottom: "1rem" }}
      >
        <BodyShort
          weight="semibold"
          style={{ color: "var(--ax-text-success)" }}
        >
          {t("title")}
        </BodyShort>
        <BodyShort
          size="small"
          style={{ color: "var(--ax-text-neutral-subtle)" }}
        >
          {t("sortedByRisk", {
            shown: quickWins.length,
            total: totalQuickWins,
          })}
        </BodyShort>
      </HStack>

      <VStack gap="space-0">
        {quickWins.map((win, index) => (
          <HStack
            key={`${win.repoName}:${win.pullRequestUrl}`}
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
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.25rem",
                flexShrink: 0,
              }}
            >
              <BodyShort size="small">{t("riskScore")}</BodyShort>
              <RiskScoreBadge score={win.riskScore} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <BodyShort weight="semibold" size="small">
                {win.dependencyNames.size > 0
                  ? [...win.dependencyNames].join(", ")
                  : t("pullRequest")}
              </BodyShort>
              <BodyShort size="small">
                {win.vulnerabilityIds.size === 1
                  ? t("fixesOne")
                  : t("fixesMany", { count: win.vulnerabilityIds.size })}
              </BodyShort>
              <BodyShort
                size="small"
                style={{ color: "var(--ax-text-neutral-subtle)" }}
              >
                {win.repoName}
              </BodyShort>
            </div>

            <Button
              as="a"
              href={win.pullRequestUrl}
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
              {win.pullRequestNumber
                ? t("openPr", { number: win.pullRequestNumber })
                : t("openPrGeneric")}
            </Button>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}
