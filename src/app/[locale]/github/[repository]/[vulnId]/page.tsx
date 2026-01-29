"use client";
import { useParams } from "next/navigation";
import { useGitHubVulnerabilities } from "@/app/modules/github/hooks/useGitHubVulnerabilities";
import { Vulnerability } from "@/app/shared/types/vulnerabilities";
import Link from "next/link";
import {
  Heading,
  BodyShort,
  Link as DSLink,
  Box,
  VStack,
  HStack,
  Tag,
  Alert,
  ReadMore,
} from "@navikt/ds-react";
import {
  XMarkOctagonFillIcon,
  ExclamationmarkTriangleFillIcon,
  CheckmarkCircleFillIcon,
  BranchingIcon,
  GlobeIcon,
  ClockIcon,
  BugIcon,
} from "@navikt/aksel-icons";
import {
  getRiskFactors,
  getSeverityColor,
  getSeverityIconColor,
  RiskFactor,
} from "@/app/shared/utils/riskFactors";
import { useTranslations } from "next-intl";

function getIconForFactor(iconName: string): React.ReactNode {
  switch (iconName) {
    case "bug":
      return <BugIcon aria-hidden fontSize="1.5rem" />;
    case "globe":
      return <GlobeIcon aria-hidden fontSize="1.5rem" />;
    case "xmark-octagon":
      return <XMarkOctagonFillIcon aria-hidden fontSize="1.5rem" />;
    case "exclamation-triangle":
      return <ExclamationmarkTriangleFillIcon aria-hidden fontSize="1.5rem" />;
    case "clock":
      return <ClockIcon aria-hidden fontSize="1.5rem" />;
    default:
      return <CheckmarkCircleFillIcon aria-hidden fontSize="1.5rem" />;
  }
}

export default function GitHubVulnerabilityDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const repository = decodeURIComponent(params.repository as string);
  const vulnId = params.vulnId as string;
  const { data, isLoading } = useGitHubVulnerabilities();

  interface TeamRepo {
    team: string;
    repo: {
      nameWithOwner: string;
      vulnerabilities: Vulnerability[];
    };
  }

  // Find the vulnerability across all teams and repositories
  const teamAndRepo = data?.teams.reduce(
    (acc: TeamRepo | null, team) => {
      if (acc) return acc;
      const repo = team.repositories?.find((r) => r.nameWithOwner === repository);
      return repo ? { team: team.team, repo } : null;
    },
    null
  );

  const vulnerability = teamAndRepo?.repo?.vulnerabilities.find(
    (v: Vulnerability) => v.identifier === vulnId
  ) as Vulnerability | undefined;

  if (isLoading) {
    return <div>{t("common.loading")}...</div>;
  }

  if (!vulnerability || !teamAndRepo) {
    return (
      <div style={{ marginTop: "2rem" }}>
        <Heading size="large" spacing>
          {!teamAndRepo ? "Repository not found" : "Vulnerability not found"}
        </Heading>
        <BodyShort>
          <Link href="/github">← Back</Link>
        </BodyShort>
      </div>
    );
  }

  const riskFactors = getRiskFactors(vulnerability, (key: string) => {
    return t(key);
  });

  const riskSumColorVariant =
    vulnerability.riskScore >= 100
      ? "danger"
      : vulnerability.riskScore >= 50
      ? "warning"
      : "success";

  return (
    <div style={{ marginTop: "2rem", maxWidth: "800px" }}>
      <Link
        onClick={() => history.back()}
        href="/github"
        style={{ marginBottom: "1rem", display: "inline-block" }}
      >
        ← Back
      </Link>

      {/* Vulnerability Header */}
      <Box
        padding="6"
        borderRadius="medium"
        background="surface-subtle"
        style={{ marginBottom: "1.5rem" }}
      >
        <VStack gap="4">
          <HStack gap="4" align="center" justify="space-between" wrap>
            <Heading size="large">{vulnerability.identifier}</Heading>
            <Tag
              variant={
                vulnerability.riskScore >= 100
                  ? "error"
                  : vulnerability.riskScore >= 50
                  ? "warning"
                  : "success"
              }
              size="medium"
            >
              Risk score: {Math.round(vulnerability.riskScore)}
            </Tag>
          </HStack>

          {vulnerability.name && (
            <Heading size="small">{vulnerability.name}</Heading>
          )}

          {vulnerability.description && (
            <BodyShort style={{ whiteSpace: "pre-wrap" }}>
              {vulnerability.description.split("\n").length < 12 ? (
                vulnerability.description
              ) : (
                <>
                  {vulnerability.description.split("\n", 8).join("\n")}
                  <ReadMore header="See the rest of the description...">
                    {vulnerability.description.split("\n").slice(8).join("\n")}
                  </ReadMore>
                </>
              )}
            </BodyShort>
          )}

          <HStack gap="4" wrap>
            {vulnerability.packageName && (
              <BodyShort size="small">
                <b>Package:</b> {vulnerability.packageName}
              </BodyShort>
            )}
            {vulnerability.vulnerabilityDetailsLink && (
              <DSLink
                href={vulnerability.vulnerabilityDetailsLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Link to CVE →
              </DSLink>
            )}
            {vulnerability.dependabotUpdatePullRequestUrl && (
              <DSLink
                href={vulnerability.dependabotUpdatePullRequestUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Dependabot fix available →
              </DSLink>
            )}
          </HStack>
        </VStack>
      </Box>

      {/* Repository Context */}
      <Box
        padding="4"
        borderRadius="medium"
        background="surface-subtle"
        style={{ marginBottom: "1.5rem" }}
      >
        <HStack gap="6" wrap>
          <BodyShort size="small">
            <b>Repository:</b> {repository}
          </BodyShort>
          <BodyShort size="small">
            <b>Team:</b> {teamAndRepo.team}
          </BodyShort>
          <DSLink
            href={`https://github.com/${repository}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "0.875rem" }}
          >
            <HStack gap="1" align="center">
              <BranchingIcon aria-hidden />
              GitHub
            </HStack>
          </DSLink>
        </HStack>
      </Box>

      {/* Risk Score Explanation */}
      <Heading size="medium" spacing>
        Why this risk score?
      </Heading>

      {/* Base Score Box */}
      {vulnerability.riskScoreBreakdown && (
        <>
          <Box
            padding="4"
            borderRadius="medium"
            style={{
              backgroundColor: "var(--ax-bg-info-soft)",
              border: "2px solid var(--ax-border-info)",
              marginBottom: "1rem",
            }}
          >
            <HStack gap="4" align="center" justify="space-between">
              <VStack gap="1">
                <BodyShort weight="semibold" size="large">
                  Base Score
                </BodyShort>
                <BodyShort
                  size="small"
                  style={{ color: "var(--ax-text-neutral-subtle)" }}
                >
                  Based on CVE severity (CVSS)
                </BodyShort>
              </VStack>
              <Heading size="large" level="3">
                {Math.round(vulnerability.riskScoreBreakdown.baseScore)}
              </Heading>
            </HStack>
          </Box>

          {riskFactors.length > 0 ? (
            <VStack gap="3" style={{ marginBottom: "1.5rem" }}>
              {riskFactors
                .sort((a: RiskFactor, b: RiskFactor) => {
                  const severityOrder = { high: 0, medium: 1, low: 2, info: 3 };
                  return severityOrder[a.severity] - severityOrder[b.severity];
                })
                .map((factor: RiskFactor, index: number) => (
                  <Box
                    key={index}
                    padding="4"
                    borderRadius="medium"
                    style={{
                      backgroundColor: getSeverityColor(factor.severity),
                      border: "1px solid var(--ax-border-neutral-subtle)",
                    }}
                  >
                    <HStack gap="4" align="start">
                      <div style={{ color: getSeverityIconColor(factor.severity) }}>
                        {getIconForFactor(factor.iconName)}
                      </div>
                      <VStack gap="1" style={{ flex: 1 }}>
                        <HStack gap="2" align="end">
                          <BodyShort weight="semibold" style={{ flexGrow: 1 }}>
                            {factor.name}
                          </BodyShort>
                          <Tag
                            variant={
                              !factor.isNegative
                                ? "success" // Reducing risk
                                : factor.severity === "high"
                                ? "error" // High negative impact
                                : factor.severity === "medium"
                                ? "warning" // Medium negative impact
                                : "info"
                            }
                            size="xsmall"
                            style={{ width: "4em" }}
                          >
                            {factor.contribution > 0 ? "+" : ""}
                            {Math.round(factor.contribution)}
                          </Tag>
                          <Tag
                            variant="info"
                            size="xsmall"
                            style={{ width: "4em" }}
                          >
                            {factor.multiplier}x
                          </Tag>
                        </HStack>
                        <BodyShort size="small">{factor.description}</BodyShort>
                      </VStack>
                    </HStack>
                  </Box>
                ))}
            </VStack>
          ) : (
            <Alert variant="info" style={{ marginBottom: "1.5rem" }}>
              No risk factors identified for this vulnerability.
            </Alert>
          )}
          <Box
            padding="4"
            borderRadius="medium"
            style={{
              backgroundColor: `var(--a-surface-${riskSumColorVariant}-subtle)`,
              border: `2px solid var(--a-border-${riskSumColorVariant})`,
              marginBottom: "1rem",
            }}
          >
            <HStack gap="4" align="center" justify="space-between">
              <VStack gap="1">
                <BodyShort weight="semibold" size="large">
                  Risk Score:
                </BodyShort>
                <BodyShort
                  size="small"
                  style={{ color: "var(--ax-text-neutral-subtle)" }}
                >
                  Total
                </BodyShort>
              </VStack>
              <Heading size="large" level="3">
                {Math.round(vulnerability.riskScore)}
              </Heading>
            </HStack>
          </Box>
        </>
      )}
    </div>
  );
}
