"use client";

import { Box, HStack, VStack, BodyShort, Heading, Link as AkselLink, Chips, Accordion } from "@navikt/ds-react";
import { CheckmarkCircleFillIcon, XMarkOctagonFillIcon, QuestionmarkDiamondFillIcon, ExternalLinkIcon } from "@navikt/aksel-icons";
import { RepositoryMetrics } from "../hooks/useRepositoryMetrics";
import { formatNumber } from "@/lib/format";
import { useTranslations } from "next-intl";
import styles from "./GitHubRepositoryListItem.module.css";

interface GitHubRepositoryListItemProps {
  repository: RepositoryMetrics;
}

function getRiskLevel(
  score: number
): "critical" | "high" | "medium" | "low" | "none" {
  if (score >= 300) return "critical";
  if (score >= 150) return "high";
  if (score >= 75) return "medium";
  if (score >= 30) return "low";
  return "none";
}

function getRiskColor(level: "critical" | "high" | "medium" | "low" | "none") {
  switch (level) {
    case "critical":
      return "var(--a-surface-danger)";
    case "high":
      return "var(--a-surface-danger-subtle)";
    case "medium":
      return "var(--a-surface-warning-subtle)";
    case "low":
      return "var(--a-surface-warning-subtle-hover)";
    case "none":
      return "var(--a-surface-success-subtle)";
  }
}

function getRiskLabel(
  level: "critical" | "high" | "medium" | "low" | "none",
  t: (key: string) => string
): string {
  return t(`riskLevel.${level}`);
}

function SecurityMetricItem({ 
  label, 
  value, 
  icon, 
  color 
}: { 
  label: string; 
  value: string; 
  icon: React.ReactNode; 
  color: string;
}) {
  return (
    <HStack gap="space-8" align="center">
      <Box style={{ color, display: "flex", alignItems: "center" }}>
        {icon}
      </Box>
      <div>
        <BodyShort size="small" style={{ color: "var(--a-text-subtle)" }}>
          {label}
        </BodyShort>
        <BodyShort size="small" weight="semibold">
          {value}
        </BodyShort>
      </div>
    </HStack>
  );
}

export function GitHubRepositoryListItem({ repository }: GitHubRepositoryListItemProps) {
  const t = useTranslations("github");
  const riskLevel = getRiskLevel(repository.aggregateRiskScore);
  const riskColor = getRiskColor(riskLevel);
  const riskLabel = getRiskLabel(riskLevel, t);

  // Determine distroless status
  const getDistrolessStatus = () => {
    if (repository.usesDistroless === true) {
      return {
        label: t("repository.distrolessImage"),
        value: `${t("repository.yes")} ✓`,
        icon: <CheckmarkCircleFillIcon fontSize="1.25rem" />,
        color: "var(--a-icon-success)",
      };
    } else if (repository.usesDistroless === false) {
      return {
        label: t("repository.distrolessImage"),
        value: t("repository.no"),
        icon: <XMarkOctagonFillIcon fontSize="1.25rem" />,
        color: "var(--a-icon-danger)",
      };
    } else {
      return {
        label: t("repository.distrolessImage"),
        value: t("repository.unknown"),
        icon: <QuestionmarkDiamondFillIcon fontSize="1.25rem" />,
        color: "var(--a-icon-info)",
      };
    }
  };

  const distrolessStatus = getDistrolessStatus();
  const hasSecurityMetrics = repository.usesDistroless !== undefined && repository.usesDistroless !== null;

  return (
    <div 
      className={styles.accordionWrapper}
      style={{
        borderLeft: `6px solid ${riskColor}`,
      }}
    >
      <Accordion>
        <Accordion.Item>
          <Accordion.Header>
            <HStack justify="space-between" align="center" gap="space-12" style={{ width: "100%" }}>
              <VStack gap="space-4">
                <Heading size="small" level="3">
                  {repository.nameWithOwner}
                </Heading>

                <HStack gap="space-16" align="center">
                  <HStack gap="space-4" align="center">
                    <BodyShort size="small" weight="semibold">
                      {t("repository.riskScore")}:
                    </BodyShort>
                    <BodyShort
                      size="small"
                      style={{
                        color: riskColor,
                        fontWeight: 600,
                      }}
                    >
                      {formatNumber(repository.aggregateRiskScore)}
                    </BodyShort>
                    <BodyShort
                      size="small"
                      style={{
                        color: "var(--a-text-subtle)",
                        fontSize: "0.75rem",
                      }}
                    >
                      ({riskLabel})
                    </BodyShort>
                  </HStack>

                  <HStack gap="space-4" align="center">
                    <BodyShort size="small" weight="semibold">
                      {t("repository.vulnerabilities")}:
                    </BodyShort>
                    <BodyShort size="small">
                      {repository.vulnerabilityCount}
                    </BodyShort>
                  </HStack>
                </HStack>
              </VStack>
            </HStack>
          </Accordion.Header>
          <Accordion.Content>
            <VStack gap="space-12">
              {/* Security Metrics */}
              <Box
                padding="space-8"
                borderRadius="8"
                background="neutral-soft"
                style={{
                  borderLeft: "4px solid var(--a-border-info)",
                }}
              >
              <VStack gap="space-8">
                <Heading size="xsmall" level="4">
                  {t("repository.securityMetrics")}
                </Heading>
                
                {hasSecurityMetrics ? (
                  <HStack gap="space-16" wrap>
                    <SecurityMetricItem
                      label={distrolessStatus.label}
                      value={distrolessStatus.value}
                      icon={distrolessStatus.icon}
                      color={distrolessStatus.color}
                    />
                    <SecurityMetricItem
                      label={t("repository.codeScanning")}
                      value={t("repository.comingSoon")}
                      icon={<QuestionmarkDiamondFillIcon fontSize="1.25rem" />}
                      color="var(--a-icon-info)"
                    />
                    <SecurityMetricItem
                      label={t("repository.lockFiles")}
                      value={t("repository.comingSoon")}
                      icon={<QuestionmarkDiamondFillIcon fontSize="1.25rem" />}
                      color="var(--a-icon-info)"
                    />
                  </HStack>
                ) : (
                  <BodyShort size="small" style={{ color: "var(--a-text-subtle)" }}>
                    {t("repository.comingSoon")}: {t("repository.codeScanning")}, {t("repository.distrolessImage")}, {t("repository.lockFiles")}
                  </BodyShort>
                )}
              </VStack>
            </Box>

            {/* Vulnerability List */}
            <Box
              padding="space-8"
              borderRadius="8"
              background="neutral-soft"
            >
              <VStack gap="space-8">
                <Heading size="xsmall" level="4">
                  {t("repository.vulnerabilityList")} ({repository.vulnerabilities.length})
                </Heading>
                <VStack gap="space-6">
                  {repository.vulnerabilities
                    .sort((a, b) => b.riskScore - a.riskScore)
                    .map((vuln) => {
                      const vulnRiskLevel = getRiskLevel(vuln.riskScore);
                      const vulnRiskColor = getRiskColor(vulnRiskLevel);
                      
                      return (
                        <Box
                          key={vuln.identifier}
                          padding="space-8"
                          borderRadius="4"
                          background="neutral-soft"
                          style={{
                            borderLeft: "3px solid var(--a-border-strong)",
                          }}
                        >
                          <VStack gap="space-4">
                            <HStack justify="space-between" align="start" gap="space-12">
                              <VStack gap="space-4" style={{ flex: 1 }}>
                                <HStack gap="space-8" align="center" wrap>
                                  <BodyShort weight="semibold" size="small">
                                    {vuln.identifier}
                                  </BodyShort>
                                  <Chips size="small">
                                    <Chips.Removable
                                      variant="neutral"
                                      style={{
                                        backgroundColor: vulnRiskColor,
                                        color: "white",
                                        fontWeight: 600,
                                        fontSize: "0.75rem",
                                      }}
                                    >
                                      {formatNumber(vuln.riskScore)}
                                    </Chips.Removable>
                                  </Chips>
                                </HStack>
                                <BodyShort size="small" style={{ color: "var(--a-text-subtle)" }}>
                                  {t("repository.package")}: {vuln.packageName}
                                </BodyShort>
                                {vuln.summary && (
                                  <BodyShort size="small">{vuln.summary}</BodyShort>
                                )}
                              </VStack>
                              
                              <HStack gap="space-8">
                                {vuln.dependabotUpdatePullRequestUrl && (
                                  <AkselLink
                                    href={vuln.dependabotUpdatePullRequestUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <HStack gap="space-4" align="center">
                                      <BodyShort size="small">{t("repository.openPR")}</BodyShort>
                                      <ExternalLinkIcon fontSize="1rem" />
                                    </HStack>
                                  </AkselLink>
                                )}
                                {vuln.vulnerabilityDetailsLink && (
                                  <AkselLink
                                    href={vuln.vulnerabilityDetailsLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <HStack gap="space-4" align="center">
                                      <BodyShort size="small">{t("repository.viewDetails")}</BodyShort>
                                      <ExternalLinkIcon fontSize="1rem" />
                                    </HStack>
                                  </AkselLink>
                                )}
                              </HStack>
                            </HStack>
                          </VStack>
                        </Box>
                      );
                    })}
                </VStack>
              </VStack>
            </Box>
            </VStack>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}
