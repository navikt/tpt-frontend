"use client";
import { useState } from "react";
import { useGitHubVulnerabilities } from "../hooks/useGitHubVulnerabilities";
import { Vulnerability, Repository } from "@/app/shared/types/vulnerabilities";
import { Link, LinkCard, Heading, BodyShort, HStack, Accordion, Button, Tag } from "@navikt/ds-react";
import WorkloadRiskScoreTags from "@/app/shared/components/WorkloadRiskScoreTags";
import { ChevronDownIcon, ChevronUpIcon } from "@navikt/aksel-icons";
import { useTranslations } from "next-intl";
import { BucketThreshold } from "./GitHubVulnerabilitySummary";

interface RepositoryWithVulns {
  repository: Repository;
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
    const allIds = repositoriesWithVulns.map(r => r.repository.nameWithOwner);
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
        const key = repository.nameWithOwner;
        
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
            <div key={repoGroup.repository.nameWithOwner}>
              <Accordion>
                <Accordion.Item 
                  open={expandedItems[repoGroup.repository.nameWithOwner] || false}
                  onOpenChange={() => toggleItem(repoGroup.repository.nameWithOwner)}
                >
                  <Accordion.Header>
                    <HStack gap="space-8" align="center" justify="space-between" style={{ width: "100%" }}>
                      <span>
                        {repoGroup.repository.nameWithOwner} ({repoGroup.vulnerabilities.length} {t("common.vulnerabilities")})
                      </span>
                      <HStack gap="space-8" align="center">
                        <a
                          href={`https://www.github.com/${repoGroup.repository.nameWithOwner}`}
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
                    {/* Group vulnerabilities by scope > ecosystem */}
                    {Object.entries(
                      repoGroup.vulnerabilities.reduce((acc, vuln) => {
                        const scope = vuln.dependencyScope || "Unknown Scope";
                        const ecosystem = vuln.packageEcosystem || "Unknown Ecosystem";
                        const key = `${scope}|||${ecosystem}`;
                        if (!acc[key]) {
                          acc[key] = [];
                        }
                        acc[key].push(vuln);
                        return acc;
                      }, {} as Record<string, Vulnerability[]>)
                    )
                    .sort((a, b) => b[1].length - a[1].length) // Sort by vulnerability count descending
                    .map(([key, vulnerabilities]) => {
                      const [scope, ecosystem] = key.split('|||');
                      return (
                        <div key={key} style={{ marginBottom: "1rem" }}>
                          <BodyShort weight="semibold" style={{ marginBottom: "0.5rem", color: "var(--ax-text-neutral-subtle)" }}>
                            {scope} / {ecosystem} ({vulnerabilities.length} {t("common.vulnerabilities")})
                          </BodyShort>
                          {vulnerabilities.map((vuln, vulnIndex) => {
                            const displayText = vuln.summary || vuln.description;
                            const maxDescriptionLength = 200;
                            const truncatedText = displayText 
                              ? (displayText.replace(/\n/g, " ").length > maxDescriptionLength 
                                ? displayText.replace(/\n/g, " ").substring(0, maxDescriptionLength) + "..." 
                                : displayText.replace(/\n/g, " "))
                              : null;
                            const isCritical = vuln.cvssScore && vuln.cvssScore >= 9.0;
                            return (
                              <LinkCard
                                key={`${vuln.identifier}-${vulnIndex}`}
                                style={{ marginBottom: "0.5rem", marginLeft: "1rem" }}
                              >
                                <LinkCard.Title>
                                  <HStack gap="space-8" align="center" justify="space-between" wrap>
                                    <LinkCard.Anchor asChild>
                                      <Link href={`/github/${encodeURIComponent(repoGroup.repository.nameWithOwner)}/${vuln.identifier}`}>
                                        {vuln.identifier}{vuln.name ? ` - ${vuln.name}` : ""} ({vuln.packageName})
                                      </Link>
                                    </LinkCard.Anchor>
                                    <HStack gap="space-8" align="center">
                                      {isCritical && (
                                        <Tag data-color="danger" variant="outline" size="small">
                                          CVSS {vuln.cvssScore?.toFixed(1)}
                                        </Tag>
                                      )}
                                      {vuln.dependabotUpdatePullRequestUrl && (
                                        <Tag data-color="success" variant="outline" size="small">
                                          Fix available
                                        </Tag>
                                      )}
                                      <WorkloadRiskScoreTags 
                                        vuln={vuln}
                                      />
                                    </HStack>
                                  </HStack>
                                </LinkCard.Title>
                                {truncatedText && (
                                  <LinkCard.Description>
                                    {truncatedText}
                                  </LinkCard.Description>
                                )}
                              </LinkCard>
                            );
                          })}
                        </div>
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

export default GitHubVulnerabilitiesList;
