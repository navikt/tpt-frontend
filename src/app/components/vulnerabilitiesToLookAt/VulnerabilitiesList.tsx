import {VulnerabilitiesResponse, Workload} from "@/app/types/vulnerabilities";
import {Accordion, Link, LinkCard, Tag} from "@navikt/ds-react";
import WorkloadRiskScoreTags from "@/app/components/workload/WorkloadRiskScoreTags";

interface CompleteVulnerability {
    identifier: string;
    packageName: string;
    description?: string;
    vulnerabilityDetailsLink?: string;
    riskScore: number;
    workload: Workload;
    team: string;
}

export type VulnerableListProps = {
    isLoading: boolean;
    isOpen: boolean;
    data: VulnerabilitiesResponse | null;
    vulnerabilitiesName: string;
    maxThreshold: number;
    minThreshold: number;
};

const VulnerableList = ({
                            isLoading,
                            isOpen = true,
                            data,
                            vulnerabilitiesName,
                            maxThreshold,
                            minThreshold,
                        }: VulnerableListProps) => {
    const filteredVulnerabilities =
        data?.teams.flatMap((team) =>
            team.workloads.flatMap((workload) =>
                workload.vulnerabilities
                    .filter((vuln) => (vuln.riskScore < maxThreshold && vuln.riskScore >= minThreshold))
                    .map((vuln): CompleteVulnerability => (
                        {
                            identifier: vuln.identifier,
                            packageName: vuln.packageName,
                            description: vuln.description,
                            vulnerabilityDetailsLink: vuln.vulnerabilityDetailsLink,
                            riskScore: vuln.riskScore,
                            workload: workload,
                            team: team.team,
                        }
                    ))
            )
        ) || [];
    const vulnerabilitiesLength: string = isLoading ? "..." : "( " + filteredVulnerabilities.length.toString() + " stk)"

    return (
        <Accordion.Item defaultOpen={isOpen}>
            <Accordion.Header>{vulnerabilitiesName.charAt(0).toUpperCase() + vulnerabilitiesName.slice(1)} sårbarheter {vulnerabilitiesLength}</Accordion.Header>
            {
                isLoading ? (
                    <Accordion.Content>
                        <div>Laster {vulnerabilitiesName} sårbarheter...</div>
                    </Accordion.Content>
                ) : null
            }
            {
                !isLoading && filteredVulnerabilities.length === 0 ? (
                    <Accordion.Content>
                        🙌 Vi ser ingen {vulnerabilitiesName} sårbarheter du må fikse. 🙌
                    </Accordion.Content>
                ) : (
                    <Accordion.Content>
                        {filteredVulnerabilities.map((vuln, index) => (
                            <LinkCard
                                key={`${vuln.identifier}-${index}`}
                                style={{
                                    marginBottom: "1rem",
                                }}
                            >
                                <LinkCard.Title>
                                    <LinkCard.Anchor asChild>
                                        <Link href={`/${vuln.workload.id}/${vuln.identifier}`}>
                                            {vuln.workload.name}
                                        </Link>
                                    </LinkCard.Anchor>
                                </LinkCard.Title>

                                <LinkCard.Description>
                                    {vuln.packageName} har sårbarhet {vuln.identifier}.
                                    {vuln.workload.repository && (
                                        <>
                                            <br/>
                                            <a
                                                href={`https://www.github.com/${vuln.workload.repository}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {vuln.workload.repository}
                                            </a>
                                        </>
                                    )}
                                </LinkCard.Description>

                                <LinkCard.Footer>
                                    {vuln.workload.environment != null ? (
                                        <Tag
                                            size="small"
                                            variant={
                                                vuln.workload.environment?.includes("prod")
                                                    ? "success"
                                                    : "info"
                                            }
                                            style={{marginRight: "2em"}}
                                        >
                                            {vuln.workload.environment}
                                        </Tag>
                                    ) : ""}
                                    <WorkloadRiskScoreTags 
                                        vuln={vuln} 
                                    />
                                </LinkCard.Footer>
                            </LinkCard>
                        ))}
                    </Accordion.Content>
                )
            }
        </Accordion.Item>
    );
};
export default VulnerableList;