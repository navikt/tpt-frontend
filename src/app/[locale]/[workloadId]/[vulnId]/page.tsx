"use client";
import {useVulnerabilities} from "@/app/modules/vulnerabilities/hooks/useVulnerabilities";
import {useParams} from "next/navigation";
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
import {
    getRiskFactors,
    getSeverityColor,
    getSeverityIconColor
} from "@/app/shared/utils/riskFactors";
import {useTranslations} from "next-intl";

function getIconForFactor(iconName: string): React.ReactNode {
    switch (iconName) {
        case "bug":
            return <BugIcon aria-hidden fontSize="1.5rem"/>;
        case "globe":
            return <GlobeIcon aria-hidden fontSize="1.5rem"/>;
        case "xmark-octagon":
            return <XMarkOctagonFillIcon aria-hidden fontSize="1.5rem"/>;
        case "exclamation-triangle":
            return <ExclamationmarkTriangleFillIcon aria-hidden fontSize="1.5rem"/>;
        case "cloud":
            return <CloudIcon aria-hidden fontSize="1.5rem"/>;
        case "clock":
            return <ClockIcon aria-hidden fontSize="1.5rem"/>;
        default:
            return <CheckmarkCircleFillIcon aria-hidden fontSize="1.5rem"/>;
    }
}

export default function WorkloadDetailPage() {
    const t = useTranslations();
    const params = useParams();
    const workloadId = params.workloadId as string;
    const vulnId = params.vulnId as string;
    const {data, isLoading} = useVulnerabilities();

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
        return <div>{t("common.loading")}...</div>;
    }

    if (!workloadData || !vulnerabilityData) {
        return (
            <div style={{marginTop: "2rem"}}>
                <Heading size="large" spacing>
                    {!workloadData
                        ? t("vulnerabilityDetail.workloadNotFound")
                        : t("vulnerabilityDetail.vulnerabilityNotFound")}
                </Heading>
                <BodyShort>
                    <Link href="/">{t("vulnerabilityDetail.backToHome")}</Link>
                </BodyShort>
            </div>
        );
    }

    const riskFactors = getRiskFactors(vulnerabilityData, (key: string) => t(key));

    const riscSumColorVariant = vulnerabilityData.riskScore >= 100
        ? "danger"
        : vulnerabilityData.riskScore >= 50
            ? "warning"
            : "success";

    return (
        <div style={{marginTop: "2rem", maxWidth: "800px"}}>
            <Link onClick={() => history.back()} href="/" style={{marginBottom: "1rem", display: "inline-block"}}>
                {t("vulnerabilityDetail.back")}
            </Link>

            {/* Vulnerability Header */}
            <Box
                padding="6"
                borderRadius="medium"
                background="surface-subtle"
                style={{marginBottom: "1.5rem"}}
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
                            {t("vulnerabilityDetail.riskScoreLabel")} {Math.round(vulnerabilityData.riskScore)}
                        </Tag>
                    </HStack>

                    {vulnerabilityData.name && (
                        <Heading size="small">{vulnerabilityData.name}</Heading>
                    )}

                    {vulnerabilityData.description && (
                        <BodyShort style={{whiteSpace: "pre-wrap"}}>
                            {vulnerabilityData.description.matchAll(/\n/g).toArray().length < 12
                                ? (
                                    vulnerabilityData.description
                                ) : (
                                    <>
                                        {vulnerabilityData.description.split("\n", 8).join("\n")}
                                            <ReadMore header={t("vulnerabilityDetail.descriptionShowMore")}>
                                            {vulnerabilityData.description.split("\n").slice(8).join("\n")}
                                        </ReadMore>
                                    </>
                                )}
                        </BodyShort>
                    )}

                    <HStack gap="4" wrap>
                        <BodyShort size="small">
                            <b>{t("vulnerabilityDetail.package")}</b> {vulnerabilityData.packageName}
                        </BodyShort>
                        {vulnerabilityData.vulnerabilityDetailsLink && (
                            <DSLink
                                href={vulnerabilityData.vulnerabilityDetailsLink}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {t("vulnerabilityDetail.cveLink")}
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
                style={{marginBottom: "1.5rem"}}
            >
                <HStack gap="6" wrap>
                    <BodyShort size="small">
                        <b>{t("vulnerabilityDetail.application")}</b> {workloadData.name}
                    </BodyShort>
                    <BodyShort size="small">
                        <b>{t("vulnerabilityDetail.team")}</b> {workloadData.team}
                    </BodyShort>
                    <BodyShort size="small">
                        <b>{t("vulnerabilityDetail.environment")}</b> {workloadData.environment}
                    </BodyShort>
                    {workloadData.repository && (
                        <DSLink
                            href={`https://github.com/${workloadData.repository}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{fontSize: "0.875rem"}}
                        >
                            <HStack gap="1" align="center">
                                <BranchingIcon aria-hidden/>
                                {t("vulnerabilityDetail.github")}
                            </HStack>
                        </DSLink>
                    )}
                    {workloadData.workloadType && (
                        <DSLink
                            href={`https://console.nav.cloud.nais.io/team/${workloadData.team}/${workloadData.environment}/${workloadData.workloadType}/${workloadData.name}/vulnerabilities`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{fontSize: "0.875rem"}}
                        >
                            <HStack gap="1" align="center">
                                <CloudIcon aria-hidden/>
                                {t("vulnerabilityDetail.naisConsole")}
                            </HStack>
                        </DSLink>
                    )}
                </HStack>
            </Box>

            {/* Risk Score Explanation */}
            <Heading size="medium" spacing>
                {t("vulnerabilityDetail.riskScoreWhy")}
            </Heading>

            {/* Base Score Box */}
            {vulnerabilityData.riskScoreBreakdown && (
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
                                <BodyShort weight="semibold" size="large">{t("vulnerabilityDetail.baseScoreTitle")}</BodyShort>
                                <BodyShort size="small" style={{color: "var(--ax-text-neutral-subtle)"}}>
                                    {t("vulnerabilityDetail.baseScoreDescription")}
                                </BodyShort>
                            </VStack>
                            <Heading size="large" level="3">
                                {Math.round(vulnerabilityData.riskScoreBreakdown.baseScore)}</Heading>
                        </HStack>
                    </Box>

                    {riskFactors.length > 0 ? (
                        <VStack gap="3" style={{marginBottom: "1.5rem"}}>
                            {riskFactors
                                .sort((a, b) => {
                                    const severityOrder = {high: 0, medium: 1, low: 2, info: 3};
                                    return severityOrder[a.severity] - severityOrder[b.severity];
                                })
                                .map((factor, index) => (
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
                                            <div style={{color: getSeverityIconColor(factor.severity)}}>
                                                {getIconForFactor(factor.iconName)}
                                            </div>
                                            <VStack gap="1" style={{flex: 1}}>
                                                <HStack gap="2" align="end">
                                                    <BodyShort weight="semibold" style={{flexGrow: 1}}>
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
                                                        style={{width: "4em"}}
                                                    >
                                                        {factor.contribution > 0 ? "+" : ""}{Math.round(factor.contribution)}
                                                    </Tag>
                                                    <Tag
                                                        variant="info"
                                                        size="xsmall"
                                                        style={{width: "4em"}}
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
                        <Alert variant="info" style={{marginBottom: "1.5rem"}}>
                            {t("vulnerabilityDetail.noRiskFactors")}
                        </Alert>
                    )}
                    <Box
                        padding="4"
                        borderRadius="medium"
                        style={{
                            backgroundColor: "var(--a-surface-" + riscSumColorVariant + "-subtle)",
                            border: "2px solid var(--a-border-" + riscSumColorVariant + ")",
                            marginBottom: "1rem",
                        }}
                    >
                        <HStack gap="4" align="center" justify="space-between">
                            <VStack gap="1">
                                <BodyShort weight="semibold" size="large">{t("vulnerabilityDetail.riskScoreLabel")}</BodyShort>
                                <BodyShort size="small" style={{color: "var(--ax-text-neutral-subtle)"}}>
                                    {t("vulnerabilityDetail.riskScoreSummaryDescription")}
                                </BodyShort>
                            </VStack>
                            <Heading size="large" level="3">
                                {Math.round(vulnerabilityData.riskScore)}</Heading>
                        </HStack>
                    </Box>
                </>
            )}

        </div>
    );
}
