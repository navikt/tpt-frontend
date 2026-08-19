"use client";

import { useState, useMemo } from "react";
import { Box, HStack, VStack, BodyShort, Link as AkselLink, Tag, Accordion } from "@navikt/ds-react";
import { RepositoryMetrics } from "../hooks/useRepositoryMetrics";
import { formatNumber } from "@/lib/format";
import { useTranslations } from "next-intl";
import { RiskScoreBreakdownBars } from "./RiskScoreBreakdownBars";
import styles from "./GitHubRepositoryListItem.module.css";

/** Strip PURL prefix and version — "pkg:npm/axios@1.2.3" → "axios" */
function extractPackageName(raw: string): string {
  let name = raw.replace(/^pkg:[^/]+\//, "");
  const atIdx = name.indexOf("@");
  if (atIdx !== -1) name = name.slice(0, atIdx);
  const slashIdx = name.lastIndexOf("/");
  if (slashIdx !== -1) name = name.slice(slashIdx + 1);
  return name;
}

interface GitHubRepositoryListItemProps {
  repository: RepositoryMetrics;
  rank: number;
}

function getRiskColor(level: string): string {
  switch (level) {
    case "critical":
      return "var(--ax-color-red-600)";
    case "high":
      return "var(--ax-color-orange-600)";
    case "medium":
      return "var(--ax-color-yellow-700)";
    case "low":
      return "var(--ax-color-gray-500)";
    default:
      return "var(--ax-color-gray-400)";
  }
}

function VulnRiskBadge({ score }: { score: number }) {
  const color =
    score >= 75
      ? "var(--ax-color-red-600)"
      : score >= 50
        ? "var(--ax-color-orange-600)"
        : score >= 25
          ? "var(--ax-color-yellow-700)"
          : "var(--ax-color-gray-600)";

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "2.5rem",
        height: "2.5rem",
        borderRadius: "8px",
        backgroundColor: color,
        color: "white",
        fontWeight: 700,
        fontSize: "0.85rem",
        flexShrink: 0,
      }}
    >
      {formatNumber(score)}
    </div>
  );
}

function VulnerabilityRow({
  vuln,
  isLast,
}: {
  vuln: RepositoryMetrics["vulnerabilities"][number];
  isLast: boolean;
}) {
  const t = useTranslations("github.repository");
  const [showBreakdown, setShowBreakdown] = useState(false);

  return (
    <div
      style={{
        paddingBlock: "0.75rem",
        paddingInline: "0.75rem",
        borderBottom: isLast ? undefined : "1px solid var(--ax-border-neutral-subtle)",
      }}
    >
      <HStack gap="space-16" align="start">
        <VulnRiskBadge score={vuln.riskScore} />

        <VStack gap="space-4" style={{ flex: 1, minWidth: 0 }}>
          <HStack gap="space-8" align="center" wrap>
            <BodyShort weight="semibold" size="small">
              {vuln.identifier}
            </BodyShort>
            {vuln.packageEcosystem && (
              <Tag variant="neutral" size="xsmall">
                {vuln.packageEcosystem.toUpperCase()}
              </Tag>
            )}
            {vuln.dependabotUpdatePullRequestUrl && (
              <AkselLink
                href={vuln.dependabotUpdatePullRequestUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--ax-color-green-700)", fontWeight: 600, fontSize: "0.875rem" }}
              >
                {t("openPR")}
              </AkselLink>
            )}
          </HStack>

          {vuln.summary && (
            <BodyShort size="small" style={{ color: "var(--ax-text-neutral-subtle)" }}>
              {vuln.summary}
            </BodyShort>
          )}

          <HStack gap="space-12" align="center">
            {vuln.vulnerabilityDetailsLink && (
              <AkselLink
                href={vuln.vulnerabilityDetailsLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "0.8125rem" }}
              >
                {t("viewDetails")}
              </AkselLink>
            )}
            {vuln.riskScoreBreakdown && (
              <button
                onClick={() => setShowBreakdown((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  color: "var(--ax-text-action)",
                  fontSize: "0.8125rem",
                  textDecoration: "underline",
                }}
              >
                {showBreakdown ? t("hideScoreBreakdown") : t("whyThisScore")}
              </button>
            )}
          </HStack>

          {showBreakdown && vuln.riskScoreBreakdown && (
            <Box paddingBlock="space-8">
              <RiskScoreBreakdownBars breakdown={vuln.riskScoreBreakdown} />
            </Box>
          )}
        </VStack>
      </HStack>
    </div>
  );
}

interface PackageGroup {
  key: string;
  packageName: string;
  packageEcosystem?: string;
  vulnerabilities: RepositoryMetrics["vulnerabilities"];
}

function PackageGroupAccordion({ group }: { group: PackageGroup }) {
  const tRepo = useTranslations("github.repository");

  const sortedVulns = useMemo(
    () => [...group.vulnerabilities].sort((a, b) => b.riskScore - a.riskScore),
    [group.vulnerabilities]
  );

  const label = group.packageEcosystem
    ? `${extractPackageName(group.packageName)} (${group.packageEcosystem.toUpperCase()})`
    : extractPackageName(group.packageName);

  return (
    <div className={styles.packageGroupWrapper}>
      <Accordion>
        <Accordion.Item>
          <Accordion.Header>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%" }}>
              <BodyShort weight="semibold" size="small" style={{ flexShrink: 0 }}>
                {label}
              </BodyShort>
              <BodyShort size="small" style={{ color: "var(--ax-text-neutral-subtle)" }}>
                {tRepo("vulnerabilityCount", { count: group.vulnerabilities.length })}
              </BodyShort>
            </div>
          </Accordion.Header>
          <Accordion.Content>
            <div>
              {sortedVulns.map((vuln, index) => (
                <VulnerabilityRow
                  key={`${vuln.identifier}:${vuln.packageName}:${index}`}
                  vuln={vuln}
                  isLast={index === sortedVulns.length - 1}
                />
              ))}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

export function GitHubRepositoryListItem({ repository, rank }: GitHubRepositoryListItemProps) {
  const t = useTranslations("github");
  const tRepo = useTranslations("github.repository");
  const riskColor = getRiskColor(repository.riskLevel);

  const packageGroups: PackageGroup[] = useMemo(() => {
    const groups = new Map<string, PackageGroup>();

    for (const vuln of repository.vulnerabilities) {
      const key = `${vuln.packageName}:${vuln.packageEcosystem ?? "unknown"}`;
      const existing = groups.get(key);
      if (existing) {
        existing.vulnerabilities.push(vuln);
      } else {
        groups.set(key, {
          key,
          packageName: vuln.packageName,
          packageEcosystem: vuln.packageEcosystem,
          vulnerabilities: [vuln],
        });
      }
    }

    return Array.from(groups.values()).sort(
      (a, b) =>
        b.vulnerabilities.length - a.vulnerabilities.length ||
        a.packageName.localeCompare(b.packageName)
    );
  }, [repository.vulnerabilities]);

  const fixesLabel =
    repository.fixesReadyCount === 1
      ? tRepo("fixReady")
      : repository.fixesReadyCount > 1
        ? tRepo("fixesReady", { count: repository.fixesReadyCount })
        : null;

  return (
    <div
      className={styles.accordionWrapper}
      style={{ borderLeft: `6px solid ${riskColor}` }}
    >
      <Accordion className={styles.packageAccordion}>
        <Accordion.Item>
          <Accordion.Header>
            {/* Single-line header: rank · name (N vulns) · GitHub link · [fix badge] · LEVEL score */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%", minWidth: 0 }}>
              <BodyShort
                size="small"
                style={{ color: "var(--ax-text-neutral-subtle)", minWidth: "1.25rem", flexShrink: 0 }}
              >
                {rank}
              </BodyShort>

              <BodyShort weight="semibold" style={{ flexShrink: 0 }}>
                {repository.nameWithOwner}
              </BodyShort>

              <BodyShort size="small" style={{ color: "var(--ax-text-neutral-subtle)", flexShrink: 0 }}>
                ({tRepo("vulnerabilityCount", { count: repository.vulnerabilityCount })})
              </BodyShort>

              <a
                href={`https://github.com/${repository.nameWithOwner}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={styles.githubLink}
              >
                GitHub ↗
              </a>

              {/* Push right side to the far end */}
              <div style={{ flex: 1 }} />

              {/* Right block: fix badge + score — both right-aligned, score centered in its column */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                {fixesLabel && (
                  <Tag variant="success" size="small">
                    {fixesLabel}
                  </Tag>
                )}

                <div style={{ textAlign: "center", minWidth: "3.5rem" }}>
                  <BodyShort
                    size="small"
                    weight="semibold"
                    style={{ color: riskColor, fontSize: "0.7rem", letterSpacing: "0.04em", lineHeight: 1 }}
                  >
                    {t(`riskLevel.${repository.riskLevel}`)}
                  </BodyShort>
                  <BodyShort
                    weight="semibold"
                    style={{ color: riskColor, fontSize: "1.25rem", lineHeight: 1.1 }}
                  >
                    {formatNumber(repository.aggregateRiskScore)}
                  </BodyShort>
                </div>
              </div>
            </div>
          </Accordion.Header>

          <Accordion.Content>
            <Box paddingBlock="space-8">
              {packageGroups.map((group) => (
                <PackageGroupAccordion key={group.key} group={group} />
              ))}
            </Box>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}
