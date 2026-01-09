"use client";
import { useState } from "react";
import { useVulnerabilities } from "../../hooks/useVulnerabilities";
import { Vulnerability, Workload } from "@/app/types/vulnerabilities";
import { Link, LinkCard, Heading, BodyShort, HStack, Accordion, Button } from "@navikt/ds-react";
import WorkloadRiskScoreTags from "@/app/components/workload/WorkloadRiskScoreTags";
import { MenuElipsisVerticalIcon, ChevronDownIcon, ChevronUpIcon } from "@navikt/aksel-icons";
import styles from "./VulnerabilitiesToLookAt.module.css";

interface WorkloadWithVulns {
    workload: Workload;
    team: string;
    vulnerabilities: Vulnerability[];
}

interface VulnerabilitiesToLookAtProps {
    bucketName: string;
    minThreshold: number;
    maxThreshold: number;
}

const VulnerabilitiesToLookAt = ({ bucketName, minThreshold, maxThreshold }: VulnerabilitiesToLookAtProps) => {
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

    // Group vulnerabilities by workload
    const workloadsWithVulns: WorkloadWithVulns[] = (
        data?.teams.flatMap((team) =>
            team.workloads
                .map((workload) => ({
                    workload,
                    team: team.team,
                    vulnerabilities: workload.vulnerabilities.filter(
                        (vuln) => vuln.riskScore >= minThreshold && vuln.riskScore < maxThreshold
                    ),
                }))
                .filter((w) => w.vulnerabilities.length > 0)
        ) || []
    ).sort((a, b) => {
        // Sort by total risk score descending
        const totalRiskA = a.vulnerabilities.reduce((sum, v) => sum + v.riskScore, 0);
        const totalRiskB = b.vulnerabilities.reduce((sum, v) => sum + v.riskScore, 0);
        return totalRiskB - totalRiskA;
    });

    const totalVulnCount = workloadsWithVulns.reduce(
        (sum, w) => sum + w.vulnerabilities.length,
        0
    );

    if (isLoading) {
        return (
            <div style={{ marginTop: "1.5rem" }}>
                <Heading size="small" spacing>{bucketName}</Heading>
                <BodyShort>Laster sårbarheter...</BodyShort>
            </div>
        );
    }

    if (workloadsWithVulns.length === 0) {
        return (
            <div style={{ marginTop: "1.5rem" }}>
                <Heading size="small" spacing>{bucketName}</Heading>
                <BodyShort>🙌 Ingen sårbarheter i denne kategorien! 🙌</BodyShort>
            </div>
        );
    }

    return (
        <div style={{ marginTop: "1.5rem" }}>
            <HStack justify="space-between" align="center" style={{ marginBottom: "1rem" }}>
                <Heading size="small">
                    {bucketName} ({totalVulnCount} i {workloadsWithVulns.length} applikasjoner)
                </Heading>
                <Button
                    variant="tertiary"
                    size="small"
                    icon={Object.values(expandedItems).some(Boolean) ? <ChevronUpIcon aria-hidden /> : <ChevronDownIcon aria-hidden />}
                    onClick={toggleAll}
                >
                    {Object.values(expandedItems).some(Boolean) ? "Lukk alle" : "Åpne alle"}
                </Button>
            </HStack>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {workloadsWithVulns.map((workloadGroup, index) => {
                    const totalRisk = workloadGroup.vulnerabilities.reduce((sum, v) => sum + v.riskScore, 0);
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
                                                {workloadGroup.workload.name} ({workloadGroup.vulnerabilities.length} sårbarheter)
                                            </span>
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
                                </HStack>
                                    </Accordion.Header>
                                    <Accordion.Content>
                                        {workloadGroup.vulnerabilities.map((vuln, vulnIndex) => {
                                            const maxDescriptionLength = 150;
                                            const description = vuln.description 
                                                ? (vuln.description.replace(/\n/g, " ").length > maxDescriptionLength 
                                                    ? vuln.description.replace(/\n/g, " ").substring(0, maxDescriptionLength) + "..." 
                                                    : vuln.description.replace(/\n/g, " "))
                                                : null;
                                            return (
                                                <LinkCard
                                                    key={`${vuln.identifier}-${vulnIndex}`}
                                                    style={{ marginBottom: "0.5rem" }}
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
                                                                ingressTypes={workloadGroup.workload.ingressTypes}
                                                                environment={workloadGroup.workload.environment}
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
