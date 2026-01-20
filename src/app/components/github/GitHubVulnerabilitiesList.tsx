"use client";
import { useState } from "react";
import { useGitHubVulnerabilities } from "../../hooks/useGitHubVulnerabilities";
import { Vulnerability } from "@/app/types/vulnerabilities";
import { Link, LinkCard, Heading, BodyShort, HStack, Accordion, Button } from "@navikt/ds-react";
import WorkloadRiskScoreTags from "@/app/components/workload/WorkloadRiskScoreTags";
import { ChevronDownIcon, ChevronUpIcon } from "@navikt/aksel-icons";
import { useTranslations } from "next-intl";
import { BucketThreshold } from "./GitHubVulnerabilitySummary";

interface RepositoryWithVulns {
  repository: {
    name: string;
  };
  team: string;
  vulnerabilities: Vulnerability[];
}

interface GitHubVulnerabilitiesListProps {
  selectedBucket: BucketThreshold;
  selectedTeams: string[];
}

const GitHubVulnerabilitiesList = ({ selectedBucket, selectedTeams }: GitHubVulnerabilitiesListProps) => {
  const t = useTranslations();
  const { data, isLoading } = useGitHubVulnerabilities();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleAll = () => {
    const allIds = repositoriesWithVulns.map(r => r.repository.name);
    const hasAnyOpen = allIds.some(id => expandedItems[id]);
    
    if (hasAnyOpen) {
      setExpandedItems({});
    } else {
      const newExpanded: Record<string, boolean> = {};
      allIds.forEach(id => newExpanded[id] = true);
      setExpandedItems(newExpanded);
    }
  };

  const toggleItem = (repositoryName: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [repositoryName]: !prev[repositoryName]
    }));
  };

  // Group vulnerabilities by repository
  const repositoriesWithVulns: RepositoryWithVulns[] = (() => {
    const repositoryMap = new Map<string, RepositoryWithVulns>();
    
    data?.teams.forEach((team) => {
      // Skip teams that are not selected (empty selection => show all)
      if (selectedTeams.length > 0 && !selectedTeams.includes(team.team)) {
        return;
      }

      team.repositories?.forEach((repository) => {
        const filteredVulns = repository.vulnerabilities.filter(
          (vuln) => vuln.riskScore >= selectedBucket.minThreshold && vuln.riskScore < selectedBucket.maxThreshold
        );
        
        if (filteredVulns.length === 0) return;
        
        // Use repository name as the key
        const key = repository.name;
        
        if (repositoryMap.has(key)) {
          // Merge with existing repository
          const existing = repositoryMap.get(key)!;
          
          // Merge vulnerabilities (deduplicate by identifier)
          filteredVulns.forEach(vuln => {
            if (!existing.vulnerabilities.some(v => v.identifier === vuln.identifier)) {
              existing.vulnerabilities.push(vuln);
            }
          });
        } else {
          // Create new entry
          repositoryMap.set(key, {
            repository,
            team: team.team,
            vulnerabilities: filteredVulns,
          });
        }
      });
    });
    
    return Array.from(repositoryMap.values()).sort((a, b) => {
      // Sort by total risk score descending
      const totalRiskA = a.vulnerabilities.reduce((sum, v) => sum + v.riskScore, 0);
      const totalRiskB = b.vulnerabilities.reduce((sum, v) => sum + v.riskScore, 0);
      return totalRiskB - totalRiskA;
    });
  })();

  const totalVulnCount = repositoriesWithVulns.reduce(
    (sum, r) => sum + r.vulnerabilities.length,
    0
  );

  if (isLoading) {
    return (
      <div style={{ marginTop: "1.5rem" }}>
        <Heading size="small" spacing>{selectedBucket.name}</Heading>
        <BodyShort>{t("common.loading")} {t("common.vulnerabilities")}...</BodyShort>
      </div>
    );
  }

  if (repositoriesWithVulns.length === 0) {
    return (
      <div style={{ marginTop: "1.5rem" }}>
        <Heading size="small" spacing>{selectedBucket.name}</Heading>
        <BodyShort>{t("list.noVulnerabilities")}</BodyShort>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <HStack justify="space-between" align="center" style={{ marginBottom: "1rem" }}>
        <Heading size="small">
          {selectedBucket.name} ({totalVulnCount} {t("common.in")} {repositoriesWithVulns.length} {t("github.repositories")})
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
        {repositoriesWithVulns.map((repoGroup) => {
          return (
            <div key={repoGroup.repository.name}>
              <Accordion>
                <Accordion.Item 
                  open={expandedItems[repoGroup.repository.name] || false}
                  onOpenChange={() => toggleItem(repoGroup.repository.name)}
                >
                  <Accordion.Header>
                    <HStack gap="2" align="center" justify="space-between" style={{ width: "100%" }}>
                      <span>
                        {repoGroup.repository.name} ({repoGroup.vulnerabilities.length} {t("common.vulnerabilities")})
                      </span>
                      <HStack gap="2" align="center">
                        <a
                          href={`https://www.github.com/${repoGroup.repository.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ textDecoration: "none" }}
                        >
                          GitHub
                        </a>
                      </HStack>
                    </HStack>
                  </Accordion.Header>
                  <Accordion.Content>
                    {/* Group vulnerabilities by package name */}
                    {Object.entries(
                      repoGroup.vulnerabilities.reduce((acc, vuln) => {
                        const packageName = vuln.packageName || "Unknown Package";
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
                        <BodyShort weight="semibold" style={{ marginBottom: "0.5rem", color: "var(--a-text-subtle)" }}>
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
                                    <Link href={`/github/${encodeURIComponent(repoGroup.repository.name)}/${vuln.identifier}`}>
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

export default GitHubVulnerabilitiesList;
