"use client";
import React, { useState } from "react";
import { useVulnerabilitiesContext } from "@/app/contexts/VulnerabilitiesContext";
import { Vulnerability, Workload } from "@/app/shared/types/vulnerabilities";
import { Link, LinkCard, Heading, BodyShort, HStack, Accordion, Button, Tag, ToggleGroup, Tooltip } from "@navikt/ds-react";
import { ChevronDownIcon, ChevronUpIcon } from "@navikt/aksel-icons";
import styles from "./VulnerabilitiesToLookAt.module.css";
import { useTranslations } from "next-intl";
import {
  groupByRemediationAction,
  getPackageDisplayName,
  countOsVulnerabilities,
  RemediationGroup,
} from "@/app/shared/utils/packageClassification";
import { useUserPreferences } from "@/app/shared/hooks/useUserPreferences";

interface WorkloadWithVulns {
    workload: Workload;
    team: string;
    vulnerabilities: Vulnerability[];
    environments: string[];
}

interface VulnerabilitiesToLookAtProps {
    bucketName: string;
    minThreshold: number;
    maxThreshold: number;
    selectedTeams: string[];
}

const VulnerabilitiesToLookAt = ({ bucketName, minThreshold, maxThreshold, selectedTeams }: VulnerabilitiesToLookAtProps) => {
    const t = useTranslations();
    const { data, isLoading } = useVulnerabilitiesContext();
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
    const { preferences, updatePreferences } = useUserPreferences();
    const grouping = preferences.vulnerabilityGrouping ?? "action";

    const toggleAll = () => {
        const allIds = workloadsWithVulns.map(w => w.workload.id);
        const hasAnyOpen = allIds.some(id => expandedItems[id]);
        
        if (hasAnyOpen) {
            setExpandedItems({});
        } else {
            const newExpanded: Record<string, boolean> = {};
            allIds.forEach(id => newExpanded[id] = true);
            setExpandedItems(newExpanded);
        }
    };

    const toggleItem = (workloadId: string) => {
        setExpandedItems(prev => ({
            ...prev,
            [workloadId]: !prev[workloadId]
        }));
    };

    // Group vulnerabilities by workload, merging identical workloads from different environments
    const workloadsWithVulns: WorkloadWithVulns[] = (() => {
        const workloadMap = new Map<string, WorkloadWithVulns>();
        
        data?.teams.forEach((team) => {
            if (!selectedTeams.includes(team.team)) return;

            team.workloads.forEach((workload) => {
                const filteredVulns = workload.vulnerabilities.filter(
                    (vuln) => vuln.riskScore >= minThreshold && vuln.riskScore < maxThreshold
                );
                
                if (filteredVulns.length === 0) return;
                
                const key = workload.name;
                
                if (workloadMap.has(key)) {
                    const existing = workloadMap.get(key)!;
                    if (workload.environment && !existing.environments.includes(workload.environment)) {
                        existing.environments.push(workload.environment);
                    }
                    filteredVulns.forEach(vuln => {
                        if (!existing.vulnerabilities.some(v => v.identifier === vuln.identifier)) {
                            existing.vulnerabilities.push(vuln);
                        }
                    });
                } else {
                    workloadMap.set(key, {
                        workload,
                        team: team.team,
                        vulnerabilities: filteredVulns,
                        environments: workload.environment ? [workload.environment] : [],
                    });
                }
            });
        });
        
        return Array.from(workloadMap.values()).sort((a, b) => {
            const maxRiskA = Math.max(...a.vulnerabilities.map(v => v.riskScore));
            const maxRiskB = Math.max(...b.vulnerabilities.map(v => v.riskScore));
            return maxRiskB - maxRiskA;
        });
    })();

    const totalVulnCount = workloadsWithVulns.reduce(
        (sum, w) => sum + w.vulnerabilities.length,
        0
    );

    const totalOsVulnCount = workloadsWithVulns.reduce(
        (sum, w) => sum + countOsVulnerabilities(w.vulnerabilities),
        0
    );

    if (isLoading) {
        return (
            <div style={{ marginTop: "1.5rem" }}>
                <Heading size="small" spacing>{bucketName}</Heading>
                <BodyShort>{t("common.loading")} {t("common.vulnerabilities")}...</BodyShort>
            </div>
        );
    }

    if (workloadsWithVulns.length === 0) {
        return (
            <div style={{ marginTop: "1.5rem" }}>
                <Heading size="small" spacing>{bucketName}</Heading>
                <BodyShort>{t("list.noVulnerabilities")}</BodyShort>
            </div>
        );
    }

    return (
        <div style={{ marginTop: "1.5rem" }}>
            <HStack justify="space-between" align="center" style={{ marginBottom: "1rem" }}>
                <div>
                    <Heading size="small">
                        {bucketName} ({totalVulnCount} {t("common.in")} {workloadsWithVulns.length} {t("common.applications")})
                    </Heading>
                    {grouping === "action" && totalOsVulnCount > 0 && (
                        <BodyShort size="small" style={{ color: "var(--ax-text-neutral-subtle)", marginTop: "0.25rem" }}>
                            {t("list.fixableByRebuild", { count: totalOsVulnCount })}
                        </BodyShort>
                    )}
                </div>
                <HStack gap="space-8" align="center">
                    <ToggleGroup
                        size="small"
                        value={grouping}
                        onChange={(val) => updatePreferences({ vulnerabilityGrouping: val as "action" | "package" })}
                    >
                        <Tooltip content={t("list.viewByAction")}>
                            <ToggleGroup.Item value="action">{t("list.viewByAction")}</ToggleGroup.Item>
                        </Tooltip>
                        <Tooltip content={t("list.viewByPackage")}>
                            <ToggleGroup.Item value="package">{t("list.viewByPackage")}</ToggleGroup.Item>
                        </Tooltip>
                    </ToggleGroup>
                    <Button
                        variant="tertiary"
                        size="small"
                        icon={Object.values(expandedItems).some(Boolean) ? <ChevronUpIcon aria-hidden /> : <ChevronDownIcon aria-hidden />}
                        onClick={toggleAll}
                    >
                        {Object.values(expandedItems).some(Boolean) ? t("list.closeAll") : t("list.openAll")}
                    </Button>
                </HStack>
            </HStack>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {workloadsWithVulns.map((workloadGroup) => (
                    <div key={workloadGroup.workload.id} className={styles.accordionWrapper}>
                        <Accordion>
                            <Accordion.Item
                                open={expandedItems[workloadGroup.workload.id] || false}
                                onOpenChange={() => toggleItem(workloadGroup.workload.id)}
                            >
                                <Accordion.Header>
                                    <HStack gap="space-8" align="center" justify="space-between" style={{ width: "100%" }}>
                                        <BodyShort weight="semibold">
                                            {workloadGroup.workload.name} {t("list.vulnerabilitiesInWorkload", { count: workloadGroup.vulnerabilities.length })}
                                        </BodyShort>
                                        <HStack gap="space-8" align="center">
                                            {workloadGroup.workload.repository && (
                                                <a
                                                    href={`https://www.github.com/${workloadGroup.workload.repository}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className={styles.githubLink}
                                                >
                                                    GitHub
                                                </a>
                                            )}
                                            {workloadGroup.environments.map((env) => (
                                                <Tag
                                                    key={env}
                                                    variant={env.startsWith("prod-") ? "warning" : "info"}
                                                    size="xsmall"
                                                >
                                                    {env}
                                                </Tag>
                                            ))}
                                        </HStack>
                                    </HStack>
                                </Accordion.Header>
                                <Accordion.Content>
                                    {grouping === "action"
                                        ? <ActionGroupedContent vulnerabilities={workloadGroup.vulnerabilities} workload={workloadGroup.workload} />
                                        : <PackageGroupedContent vulnerabilities={workloadGroup.vulnerabilities} workload={workloadGroup.workload} />
                                    }
                                </Accordion.Content>
                            </Accordion.Item>
                        </Accordion>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Action-grouped view ──────────────────────────────────────────────────────

interface ContentProps {
    vulnerabilities: Vulnerability[];
    workload: Workload;
}

const ActionGroupedContent = ({ vulnerabilities, workload }: ContentProps) => {
    const groups = groupByRemediationAction(vulnerabilities);

    return (
        <div>
            {groups.map((group) => (
                <RemediationGroupSection
                    key={group.category}
                    group={group}
                    workload={workload}
                />
            ))}
        </div>
    );
};

interface RemediationGroupSectionProps {
    group: RemediationGroup;
    workload: Workload;
}

const RemediationGroupSection = ({ group, workload }: RemediationGroupSectionProps) => {
    const t = useTranslations();
    const [expanded, setExpanded] = useState(group.category === "app-dependency");

    const isOsRebuild = group.category === "os-rebuild";
    const uniquePackages = Array.from(new Set(group.vulnerabilities.map(v => v.packageName)));

    const label = isOsRebuild ? t("list.rebuildBaseImage") : t("list.updateDependencies");
    const description = isOsRebuild ? t("list.rebuildBaseImageDescription") : t("list.updateDependenciesDescription");
    const summaryKey = isOsRebuild ? "list.osPackageSummary" : "list.appPackageSummary";

    return (
        <div style={{ marginBottom: "1rem" }}>
            <button
                onClick={() => setExpanded(prev => !prev)}
                style={{
                    width: "100%",
                    textAlign: "left",
                    background: "var(--ax-bg-neutral-moderate)",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.75rem 1rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.5rem",
                }}
            >
                <HStack gap="space-8" align="center">
                    <BodyShort weight="semibold">{label}</BodyShort>
                    <Tag variant={isOsRebuild ? "warning" : "info"} size="xsmall">
                        {t(summaryKey, {
                            vulnCount: group.vulnerabilities.length,
                            pkgCount: uniquePackages.length,
                        })}
                    </Tag>
                </HStack>
                {expanded ? <ChevronUpIcon aria-hidden /> : <ChevronDownIcon aria-hidden />}
            </button>

            {expanded && (
                <div style={{ marginTop: "0.5rem", paddingLeft: "1rem" }}>
                    <BodyShort size="small" style={{ color: "var(--ax-text-neutral-subtle)", marginBottom: "0.75rem" }}>
                        {description}
                    </BodyShort>
                    <PackageGroupedContent
                        vulnerabilities={group.vulnerabilities}
                        workload={workload}
                    />
                </div>
            )}
        </div>
    );
};

// ── Package-grouped view (existing behaviour) ────────────────────────────────

const PackageGroupedContent = ({ vulnerabilities, workload }: ContentProps) => {
    const t = useTranslations();

    const byPackage = Object.entries(
        vulnerabilities.reduce((acc, vuln) => {
            const key = vuln.packageName;
            if (!acc[key]) acc[key] = [];
            acc[key].push(vuln);
            return acc;
        }, {} as Record<string, Vulnerability[]>)
    ).sort((a, b) => b[1].length - a[1].length);

    return (
        <div>
            {byPackage.map(([packageName, vulns]) => (
                <div key={packageName} style={{ marginBottom: "1rem" }}>
                    <BodyShort
                        weight="semibold"
                        style={{ marginBottom: "0.5rem", color: "var(--ax-text-neutral-subtle)" }}
                    >
                        {getPackageDisplayName(packageName)} {t("list.vulnerabilitiesInPackage", { count: vulns.length })}
                    </BodyShort>
                    {vulns.map((vuln, vulnIndex) => {
                        const maxDescriptionLength = 200;
                        const description = vuln.description
                            ? (vuln.description.replace(/\n/g, " ").length > maxDescriptionLength
                                ? vuln.description.replace(/\n/g, " ").substring(0, maxDescriptionLength) + "..."
                                : vuln.description.replace(/\n/g, " "))
                            : null;
                        return (
                            <LinkCard
                                key={`${vuln.identifier}-${vulnIndex}`}
                                style={{
                                    marginBottom: "0.25rem",
                                    marginLeft: "1rem",
                                    "--__axc-link-card-padding-block": "var(--ax-space-8)",
                                    "--__axc-link-card-padding-inline": "var(--ax-space-12)",
                                } as React.CSSProperties}
                            >
                                <LinkCard.Title>
                                    <LinkCard.Anchor asChild>
                                        <Link href={`/${workload.id}/${vuln.identifier}`}>
                                            <BodyShort size="small">{vuln.identifier}</BodyShort>
                                        </Link>
                                    </LinkCard.Anchor>
                                </LinkCard.Title>
                                {description && (
                                    <LinkCard.Description>
                                        <BodyShort size="small">{description}</BodyShort>
                                    </LinkCard.Description>
                                )}
                            </LinkCard>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default VulnerabilitiesToLookAt;
