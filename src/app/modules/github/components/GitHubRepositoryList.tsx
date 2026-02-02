"use client";

import { useState, useMemo } from "react";
import { VStack, Box, Heading, BodyShort, HStack, TextField, Button } from "@navikt/ds-react";
import { MagnifyingGlassIcon } from "@navikt/aksel-icons";
import { RepositoryMetrics } from "../hooks/useRepositoryMetrics";
import { GitHubRepositoryListItem } from "./GitHubRepositoryListItem";
import { useTranslations } from "next-intl";

interface GitHubRepositoryListProps {
  repositories: RepositoryMetrics[];
}

const INITIAL_DISPLAY_COUNT = 10;

export function GitHubRepositoryList({ repositories }: GitHubRepositoryListProps) {
  const t = useTranslations("github.repository");
  const tOverview = useTranslations("github.overview");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const sortedRepositories = useMemo(() => {
    return [...repositories].sort(
      (a, b) => b.aggregateRiskScore - a.aggregateRiskScore
    );
  }, [repositories]);

  const filteredRepositories = useMemo(() => {
    if (!searchQuery.trim()) return sortedRepositories;
    
    const query = searchQuery.toLowerCase();
    return sortedRepositories.filter((repo) =>
      repo.nameWithOwner.toLowerCase().includes(query)
    );
  }, [sortedRepositories, searchQuery]);

  const displayedRepositories = showAll 
    ? filteredRepositories 
    : filteredRepositories.slice(0, INITIAL_DISPLAY_COUNT);

  const remainingCount = filteredRepositories.length - INITIAL_DISPLAY_COUNT;

  const totalVulnerabilities = repositories.reduce(
    (sum, r) => sum + r.vulnerabilityCount,
    0
  );

  const criticalRepositories = repositories.filter(
    (r) => r.aggregateRiskScore >= 300
  ).length;

  const highRiskRepositories = repositories.filter(
    (r) => r.aggregateRiskScore >= 150 && r.aggregateRiskScore < 300
  ).length;

  return (
    <VStack gap="space-24">
      <Box
        padding="space-16"
        background="neutral-soft"
        borderRadius="8"
      >
        <VStack gap="space-8">
          <Heading size="medium" level="2">
            {tOverview("title")}
          </Heading>
          <BodyShort>
            {repositories.length} {tOverview("totalRepositories")} · {totalVulnerabilities}{" "}
            {tOverview("totalVulnerabilities")}
          </BodyShort>
          {criticalRepositories > 0 && (
            <BodyShort
              weight="semibold"
              style={{ color: "var(--a-surface-danger)" }}
            >
              ⚠️ {criticalRepositories} {tOverview("criticalRepositories")}
            </BodyShort>
          )}
          {criticalRepositories === 0 && highRiskRepositories > 0 && (
            <BodyShort
              weight="semibold"
              style={{ color: "var(--a-surface-warning)" }}
            >
              {highRiskRepositories} {tOverview("highRiskRepositories")}
            </BodyShort>
          )}
          {criticalRepositories === 0 && highRiskRepositories === 0 && (
            <BodyShort
              weight="semibold"
              style={{ color: "var(--a-surface-success)" }}
            >
              🙌 {tOverview("noCriticalVulnerabilities")}
            </BodyShort>
          )}
        </VStack>
      </Box>

      {repositories.length > 0 && (
        <Box>
          <HStack gap="space-8" align="center">
            <MagnifyingGlassIcon fontSize="1.5rem" style={{ color: "var(--a-icon-subtle)" }} />
            <TextField
              label={t("searchPlaceholder")}
              hideLabel
              placeholder={t("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
              style={{ flex: 1 }}
            />
          </HStack>
        </Box>
      )}

      {filteredRepositories.length > INITIAL_DISPLAY_COUNT && !showAll && (
        <BodyShort size="small" style={{ color: "var(--a-text-subtle)" }}>
          {t("showingTop", { count: INITIAL_DISPLAY_COUNT })}
        </BodyShort>
      )}

      <VStack gap="space-20">
        {displayedRepositories.map((repository) => (
          <GitHubRepositoryListItem key={repository.nameWithOwner} repository={repository} />
        ))}
      </VStack>

      {remainingCount > 0 && !showAll && (
        <Box style={{ textAlign: "center" }}>
          <Button
            variant="secondary"
            onClick={() => setShowAll(true)}
          >
            {t("showMore", { count: remainingCount })}
          </Button>
        </Box>
      )}

      {showAll && filteredRepositories.length > INITIAL_DISPLAY_COUNT && (
        <Box style={{ textAlign: "center" }}>
          <Button
            variant="secondary"
            onClick={() => {
              setShowAll(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            {t("showLess")}
          </Button>
        </Box>
      )}

      {repositories.length === 0 && (
        <Box
          padding="space-24"
          background="neutral-soft"
          borderRadius="8"
          style={{ textAlign: "center" }}
        >
          <BodyShort>{t("noRepositories")}</BodyShort>
        </Box>
      )}

      {repositories.length > 0 && filteredRepositories.length === 0 && (
        <Box
          padding="space-24"
          background="neutral-soft"
          borderRadius="8"
          style={{ textAlign: "center" }}
        >
          <BodyShort>No repositories match your search</BodyShort>
        </Box>
      )}
    </VStack>
  );
}
