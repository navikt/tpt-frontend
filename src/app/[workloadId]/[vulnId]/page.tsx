"use client";
import { useVulnerabilities } from "../../hooks/useVulnerabilities";
import { useParams } from "next/navigation";
import {
    Heading,
    BodyShort,
    Link as DSLink,
    Box,
    VStack,
    HStack,
    Tag,
    Alert,
} from "@navikt/ds-react";
import Link from "next/link";
import {
    XMarkOctagonFillIcon,
    ExclamationmarkTriangleFillIcon,
    CheckmarkCircleFillIcon,
    BranchingIcon,
    GlobeIcon,
    ClockIcon,
    CloudIcon,
    BugIcon,
} from "@navikt/aksel-icons";
import type { Vulnerability, Workload } from "../../types/vulnerabilities";

interface RiskFactor {
    name: string;
    description: string;
    multiplier: number;
    isActive: boolean;
    icon: React.ReactNode;
    severity: "high" | "medium" | "low";
}

function getRiskFactors(
    vuln: Vulnerability,
    workload: Workload & { team: string }
): RiskFactor[] {
    const multipliers = vuln.riskScoreMultipliers;
    if (!multipliers) return [];

    const ingressTypes = workload.ingressTypes || [];
    const exposureType =
        ingressTypes.includes("external")
            ? "ekstern (internett)"
            : ingressTypes.includes("authenticated")
                ? "autentisert"
                : ingressTypes.includes("internal")
                    ? "intern"
                    : "ingen";

    return [
        {
            name: "Grunnrisiko fra CVE",
            description: `Sårbarheten har en grunnrisiko på ${multipliers.severity} basert på CVSS-score.`,
            multiplier: multipliers.severity,
            isActive: true,
            icon: <BugIcon aria-hidden fontSize="1.5rem" />,
            severity: multipliers.severity >= 7 ? "high" : multipliers.severity >= 4 ? "medium" : "low",
        },
        {
            name: "Eksponering",
            description: `Applikasjonen har ${exposureType} ingress, noe som ${multipliers.exposure > 1 ? "øker" : "ikke øker"} risikoen.`,
            multiplier: multipliers.exposure,
            isActive: multipliers.exposure > 1,
            icon: <GlobeIcon aria-hidden fontSize="1.5rem" />,
            severity: multipliers.exposure >= 1.5 ? "high" : multipliers.exposure > 1 ? "medium" : "low",
        },
        {
            name: "KEV (Known Exploited Vulnerability)",
            description: "Sårbarheten er aktivt utnyttet i naturen og er oppført i CISAs KEV-katalog.",
            multiplier: multipliers.kev,
            isActive: multipliers.kev > 1,
            icon: <XMarkOctagonFillIcon aria-hidden fontSize="1.5rem" />,
            severity: "high",
        },
        {
            name: "EPSS (Exploit Prediction)",
            description: `Høy sannsynlighet (${Math.round((multipliers.epss - 1) * 100)}% økning) for at sårbarheten utnyttes de neste 30 dagene.`,
            multiplier: multipliers.epss,
            isActive: multipliers.epss > 1,
            icon: <ExclamationmarkTriangleFillIcon aria-hidden fontSize="1.5rem" />,
            severity: multipliers.epss >= 1.5 ? "high" : "medium",
        },
        {
            name: "Produksjonsmiljø",
            description: "Sårbarheten finnes i et produksjonsmiljø, noe som øker konsekvensene ved utnyttelse.",
            multiplier: multipliers.production,
            isActive: multipliers.production > 1,
            icon: <CloudIcon aria-hidden fontSize="1.5rem" />,
            severity: "medium",
        },
        {
            name: "Gammelt bygg",
            description: `Bygget er ${multipliers.old_build_days} dager gammelt. Eldre bygg kan mangle sikkerhetsoppdateringer.`,
            multiplier: multipliers.old_build,
            isActive: multipliers.old_build > 1,
            icon: <ClockIcon aria-hidden fontSize="1.5rem" />,
            severity: multipliers.old_build >= 1.3 ? "medium" : "low",
        },
    ];
}

function getSeverityColor(severity: "high" | "medium" | "low"): string {
    switch (severity) {
        case "high":
            return "var(--a-surface-danger-subtle)";
        case "medium":
            return "var(--a-surface-warning-subtle)";
        case "low":
            return "var(--a-surface-success-subtle)";
    }
}

function getSeverityIconColor(severity: "high" | "medium" | "low"): string {
    switch (severity) {
        case "high":
            return "var(--a-icon-danger)";
        case "medium":
            return "var(--a-icon-warning)";
        case "low":
            return "var(--a-icon-success)";
    }
}

export default function WorkloadDetailPage() {
    const params = useParams();
    const workloadId = params.workloadId as string;
    const vulnId = params.vulnId as string;
    const { data, isLoading } = useVulnerabilities();

    const workloadData = data?.teams
        .flatMap((team) =>
            team.workloads.map((workload) => ({
                ...workload,
                team: team.team,
            }))
        )
        .find((w) => w.id === workloadId);

    const vulnerabilityData = workloadData?.vulnerabilities.find(
        (v) => v.identifier === vulnId
    );

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!workloadData || !vulnerabilityData) {
        return (
            <div style={{ marginTop: "2rem" }}>
                <Heading size="large" spacing>
                    {!workloadData ? "Workload ikke funnet" : "Sårbarhet ikke funnet"}
                </Heading>
                <BodyShort>
                    <Link href="/">Tilbake til forsiden</Link>
                </BodyShort>
            </div>
        );
    }

    const riskFactors = getRiskFactors(vulnerabilityData, workloadData);
    const activeFactors = riskFactors.filter((f) => f.isActive);

    return (
        <div style={{ marginTop: "2rem", maxWidth: "800px" }}>
            <Link href="/" style={{ marginBottom: "1rem", display: "inline-block" }}>
                ← Tilbake
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
                        <Heading size="large">{vulnerabilityData.identifier}</Heading>
                        <Tag
                            variant={
                                vulnerabilityData.riskScore >= 100
                                    ? "error"
                                    : vulnerabilityData.riskScore >= 50
                                        ? "warning"
                                        : "success"
                            }
                            size="medium"
                        >
                            Risikoscore: {Math.round(vulnerabilityData.riskScore)}
                        </Tag>
                    </HStack>

                    {vulnerabilityData.name && (
                        <Heading size="small">{vulnerabilityData.name}</Heading>
                    )}

                    {vulnerabilityData.description && (
                        <BodyShort>{vulnerabilityData.description}</BodyShort>
                    )}

                    <HStack gap="4" wrap>
                        <BodyShort size="small">
                            <b>Pakke:</b> {vulnerabilityData.packageName}
                        </BodyShort>
                        {vulnerabilityData.vulnerabilityDetailsLink && (
                            <DSLink
                                href={vulnerabilityData.vulnerabilityDetailsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Les mer om sårbarheten →
                            </DSLink>
                        )}
                    </HStack>
                </VStack>
            </Box>

            {/* Workload Context */}
            <Box
                padding="4"
                borderRadius="medium"
                background="surface-subtle"
                style={{ marginBottom: "1.5rem" }}
            >
                <HStack gap="6" wrap>
                    <BodyShort size="small">
                        <b>Applikasjon:</b> {workloadData.name}
                    </BodyShort>
                    <BodyShort size="small">
                        <b>Team:</b> {workloadData.team}
                    </BodyShort>
                    <BodyShort size="small">
                        <b>Miljø:</b> {workloadData.environment}
                    </BodyShort>
                    {workloadData.repository && (
                        <DSLink
                            href={`https://github.com/${workloadData.repository}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: "0.875rem" }}
                        >
                            <HStack gap="1" align="center">
                                <BranchingIcon aria-hidden />
                                GitHub
                            </HStack>
                        </DSLink>
                    )}
                </HStack>
            </Box>

            {/* Risk Score Explanation */}
            <Heading size="medium" spacing>
                Hvorfor denne risikoscoren?
            </Heading>

            {activeFactors.length > 0 ? (
                <VStack gap="3" style={{ marginBottom: "1.5rem" }}>
                    {activeFactors
                        .sort((a, b) => {
                            const severityOrder = { high: 0, medium: 1, low: 2 };
                            return severityOrder[a.severity] - severityOrder[b.severity];
                        })
                        .map((factor, index) => (
                            <Box
                                key={index}
                                padding="4"
                                borderRadius="medium"
                                style={{
                                    backgroundColor: getSeverityColor(factor.severity),
                                    border: "1px solid var(--a-border-subtle)",
                                }}
                            >
                                <HStack gap="4" align="start">
                                    <div style={{ color: getSeverityIconColor(factor.severity) }}>
                                        {factor.icon}
                                    </div>
                                    <VStack gap="1" style={{ flex: 1 }}>
                                        <HStack gap="2" align="center" justify="space-between">
                                            <BodyShort weight="semibold">{factor.name}</BodyShort>
                                            <Tag
                                                variant={
                                                    factor.severity === "high"
                                                        ? "error"
                                                        : factor.severity === "medium"
                                                            ? "warning"
                                                            : "success"
                                                }
                                                size="xsmall"
                                            >
                                                {factor.multiplier > 1
                                                    ? `${factor.multiplier}x`
                                                    : `${factor.multiplier}`}
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
                    Ingen risikofaktorer er identifisert for denne sårbarheten.
                </Alert>
            )}

            {/* Inactive factors (not contributing to score) */}
            {riskFactors.filter((f) => !f.isActive && f.name !== "Grunnrisiko fra CVE").length > 0 && (
                <>
                    <Heading size="small" spacing>
                        Faktorer som ikke bidrar til økt risiko
                    </Heading>
                    <VStack gap="2" style={{ marginBottom: "1.5rem" }}>
                        {riskFactors
                            .filter((f) => !f.isActive && f.name !== "Grunnrisiko fra CVE")
                            .map((factor, index) => (
                                <HStack key={index} gap="2" align="center">
                                    <CheckmarkCircleFillIcon
                                        aria-hidden
                                        style={{ color: "var(--a-icon-success)" }}
                                    />
                                    <BodyShort size="small" style={{ color: "var(--a-text-subtle)" }}>
                                        {factor.name}
                                    </BodyShort>
                                </HStack>
                            ))}
                    </VStack>
                </>
            )}
        </div>
    );
}
