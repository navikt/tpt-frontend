"use client";

import { useState, useMemo } from "react";
import { VStack, Box, BodyShort, HStack, TextField, Button, Tag } from "@navikt/ds-react";
import { MagnifyingGlassIcon, FilterIcon, ArrowsCirclepathIcon } from "@navikt/aksel-icons";
import { RepositoryMetrics } from "../hooks/useRepositoryMetrics";
import { GitHubRepositoryListItem } from "./GitHubRepositoryListItem";
import { QuickWinsPanel } from "./QuickWinsPanel";
import { useTranslations } from "next-intl";

interface GitHubRepositoryListProps {
  repositories: RepositoryMetrics[];
  onFilterClick: () => void;
  activeFilterCount: number;
  onRefresh: () => void;
  isRefreshing: boolean;
  isSyncing: boolean;
}

const INITIAL_DISPLAY_COUNT = 10;

export function GitHubRepositoryList({
  repositories,
  onFilterClick,
  activeFilterCount,
  onRefresh,
  isRefreshing,
  isSyncing,
}: GitHubRepositoryListProps) {
  const t = useTranslations("github");
  const tRepo = useTranslations("github.repository");

  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [quickWinsOnly, setQuickWinsOnly] = useState(false);

  const sortedRepositories = useMemo(
    () => [...repositories].sort((a, b) => b.aggregateRiskScore - a.aggregateRiskScore),
    [repositories]
  );

  const filteredRepositories = useMemo(() => {
    let result = sortedRepositories;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((repo) =>
        repo.nameWithOwner.toLowerCase().includes(query)
      );
    }

    if (quickWinsOnly) {
      result = result.filter((repo) => repo.fixesReadyCount > 0);
    }

    return result;
  }, [sortedRepositories, searchQuery, quickWinsOnly]);

  const displayedRepositories = showAll
    ? filteredRepositories
    : filteredRepositories.slice(0, INITIAL_DISPLAY_COUNT);

  const remainingCount = filteredRepositories.length - INITIAL_DISPLAY_COUNT;

  return (
    <VStack gap="space-24">
      {/* Quick wins panel — always shown when there are fixes ready */}
      <QuickWinsPanel repositories={sortedRepositories} />

      {/* Search + filter bar */}
      <HStack gap="space-8" align="center">
        <div style={{ position: "relative", flex: 1 }}>
          <MagnifyingGlassIcon
            fontSize="1.25rem"
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--ax-text-neutral-subtle)",
              pointerEvents: "none",
            }}
          />
          <TextField
            label={tRepo("searchPlaceholder")}
            hideLabel
            placeholder={tRepo("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowAll(false);
            }}
            autoComplete="off"
            style={{ paddingInlineStart: "2.25rem" }}
          />
        </div>
        <Button
          variant="secondary"
          icon={<FilterIcon />}
          onClick={onFilterClick}
        >
          Filter
          {activeFilterCount > 0 && (
            <Tag variant="info" size="xsmall" style={{ marginInlineStart: "0.4rem" }}>
              {activeFilterCount}
            </Tag>
          )}
        </Button>
        <Button
          variant="secondary"
          icon={<ArrowsCirclepathIcon />}
          onClick={onRefresh}
          disabled={isRefreshing || isSyncing}
          loading={isRefreshing || isSyncing}
        />
        <Button
          variant={quickWinsOnly ? "primary" : "secondary"}
          onClick={() => {
            setQuickWinsOnly((v) => !v);
            setShowAll(false);
          }}
        >
          {tRepo("quickWinsOnly")}
        </Button>
      </HStack>

      {/* Repository list header */}
      {filteredRepositories.length > 0 && (
        <HStack justify="space-between" align="center">
          <BodyShort weight="semibold">
            {t("repositories")} · {filteredRepositories.length}
          </BodyShort>
          <BodyShort size="small" style={{ color: "var(--ax-text-neutral-subtle)" }}>
            {t("sortedByRiskHighToLow")}
          </BodyShort>
        </HStack>
      )}

      {/* Repository rows */}
      <VStack gap="space-8">
        {displayedRepositories.map((repository, index) => (
          <GitHubRepositoryListItem
            key={repository.nameWithOwner}
            repository={repository}
            rank={index + 1}
          />
        ))}
      </VStack>

      {/* Show more / show less */}
      {remainingCount > 0 && !showAll && (
        <Box style={{ textAlign: "center" }}>
          <Button variant="secondary" onClick={() => setShowAll(true)}>
            {tRepo("showMore", { count: remainingCount })}
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
            {tRepo("showLess")}
          </Button>
        </Box>
      )}

      {/* Empty states */}
      {repositories.length === 0 && (
        <Box
          padding="space-24"
          borderRadius="8"
          style={{ textAlign: "center", backgroundColor: "var(--ax-bg-neutral-soft)" }}
        >
          <BodyShort>{tRepo("noRepositories")}</BodyShort>
        </Box>
      )}

      {repositories.length > 0 && filteredRepositories.length === 0 && (
        <Box
          padding="space-24"
          borderRadius="8"
          style={{ textAlign: "center", backgroundColor: "var(--ax-bg-neutral-soft)" }}
        >
          <BodyShort>{tRepo("noSearchResults")}</BodyShort>
        </Box>
      )}
    </VStack>
  );
}
