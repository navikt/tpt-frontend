"use client";
import { useState } from "react";
import { useVulnerabilities } from "../hooks/useVulnerabilities";
import { Vulnerability, Workload } from "@/app/shared/types/vulnerabilities";
import { Link, LinkCard, Heading, BodyShort, HStack, Accordion, Button, Tag } from "@navikt/ds-react";
import WorkloadRiskScoreTags from "@/app/shared/components/WorkloadRiskScoreTags";
import { ChevronDownIcon, ChevronUpIcon } from "@navikt/aksel-icons";
import styles from "./VulnerabilitiesToLookAt.module.css";
import { useTranslations } from "next-intl";

interface WorkloadWithVulns {
    workload: Workload;
    team: string;
    vulnerabilities: Vulnerability[];
    environments: string[]; // Track all environments for merged workloads
}

interface VulnerabilitiesToLookAtProps {
    bucketName: string;
    minThreshold: number;
    maxThreshold: number;
    selectedTeams: string[];
}

const VulnerabilitiesToLookAt = ({ bucketName, minThreshold, maxThreshold, selectedTeams }: VulnerabilitiesToLookAtProps) => {
    const t = useTranslations();
    const { data, isLoading } = useVulnerabilities();
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

    const toggleAll = () => {
        const allIds = workloadsWithVulns.map(w => w.workload.id);
        const hasAnyOpen = allIds.some(id => expandedItems[id]);
        
        if (hasAnyOpen) {
            // Close all
            setExpandedItems({});
        } else {
            // Open all
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
            // Skip teams that are not selected (empty selection => show none)
            if (!selectedTeams.includes(team.team)) {
                return;
            }

            team.workloads.forEach((workload) => {
                const filteredVulns = workload.vulnerabilities.filter(
                    (vuln) => vuln.riskScore >= minThreshold && vuln.riskScore < maxThreshold
                );
                
                if (filteredVulns.length === 0) return;
                
                // Use workload name as the key for merging
                const key = workload.name;
                
                if (workloadMap.has(key)) {
                    // Merge with existing workload
                    const existing = workloadMap.get(key)!;
                    
                    // Add environment if not already present
                    if (workload.environment && !existing.environments.includes(workload.environment)) {
                        existing.environments.push(workload.environment);
                    }
                    
                    // Merge vulnerabilities (deduplicate by identifier)
                    filteredVulns.forEach(vuln => {
                        if (!existing.vulnerabilities.some(v => v.identifier === vuln.identifier)) {
                            existing.vulnerabilities.push(vuln);
                        }
                    });
                } else {
                    // Create new entry
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
            // Sort by total risk score descending
            const totalRiskA = a.vulnerabilities.reduce((sum, v) => sum + v.riskScore, 0);
            const totalRiskB = b.vulnerabilities.reduce((sum, v) => sum + v.riskScore, 0);
            return totalRiskB - totalRiskA;
        });
    })();

    const totalVulnCount = workloadsWithVulns.reduce(
        (sum, w) => sum + w.vulnerabilities.length,
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
                <Heading size="small">
                    {bucketName} ({totalVulnCount} {t("common.in")} {workloadsWithVulns.length} {t("common.applications")})
                </Heading>
                <Button
                    variant="tertiary"
                    size="small"
                    icon={Object.values(expandedItems).some(Boolean) ? <ChevronUpIcon aria-hidden /> : <ChevronDownIcon aria-hidden />}
                    onClick={toggleAll}
                >
                    {Object.values(expandedItems).some(Boolean) ? t("list.closeAll") : t("list.openAll")}
                </Button>
            </HStack>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {workloadsWithVulns.map((workloadGroup) => {
                    return (
                        <div
                            key={workloadGroup.workload.id}
                            className={styles.accordionWrapper}
                        >
                            <Accordion>
                                <Accordion.Item 
                                    open={expandedItems[workloadGroup.workload.id] || false}
                                    onOpenChange={() => toggleItem(workloadGroup.workload.id)}
                                >
                                    <Accordion.Header>
                                        <HStack gap="2" align="center" justify="space-between" style={{ width: "100%" }}>
                                            <span>
                                                {workloadGroup.workload.name} ({workloadGroup.vulnerabilities.length} {t("common.vulnerabilities")})
                                            </span>
                                            <HStack gap="2" align="center">
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
                                        {/* Group vulnerabilities by package name */}
                                        {Object.entries(
                                            workloadGroup.vulnerabilities.reduce((acc, vuln) => {
                                                const packageName = vuln.packageName;
                                                if (!acc[packageName]) {
                                                    acc[packageName] = [];
                                                }
                                                acc[packageName].push(vuln);
                                                return acc;
                                            }, {} as Record<string, Vulnerability[]>)
                                        )
                                        .sort((a, b) => b[1].length - a[1].length) // Sort by vulnerability count descending
                                        .map(([packageName, vulnerabilities]) => (
                                            <div key={packageName} style={{ marginBottom: "1rem" }}>
                                                <BodyShort weight="semibold" style={{ marginBottom: "0.5rem", color: "var(--ax-text-neutral-subtle)" }}>
                                                    {packageName} ({vulnerabilities.length} {t("common.vulnerabilities")})
                                                </BodyShort>
                                                {vulnerabilities.map((vuln, vulnIndex) => {
                                                    const maxDescriptionLength = 200;
                                                    const description = vuln.description 
                                                        ? (vuln.description.replace(/\n/g, " ").length > maxDescriptionLength 
                                                            ? vuln.description.replace(/\n/g, " ").substring(0, maxDescriptionLength) + "..." 
                                                            : vuln.description.replace(/\n/g, " "))
                                                        : null;
                                                    return (
                                                        <LinkCard
                                                            key={`${vuln.identifier}-${vulnIndex}`}
                                                            style={{ marginBottom: "0.5rem", marginLeft: "1rem" }}
                                                        >
                                                            <LinkCard.Title>
                                                                <HStack gap="2" align="center" justify="space-between" wrap>
                                                                    <LinkCard.Anchor asChild>
                                                                        <Link href={`/${workloadGroup.workload.id}/${vuln.identifier}`}>
                                                                            {vuln.identifier}{vuln.name ? ` - ${vuln.name}` : ""}
                                                                        </Link>
                                                                    </LinkCard.Anchor>
                                                                    <WorkloadRiskScoreTags 
                                                                        vuln={vuln}
                                                                    />
                                                                </HStack>
                                                            </LinkCard.Title>

                                                            {description && (
                                                                <LinkCard.Description>
                                                                    {description}
                                                                </LinkCard.Description>
                                                            )}
                                                        </LinkCard>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </Accordion.Content>
                                </Accordion.Item>
                            </Accordion>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VulnerabilitiesToLookAt;
