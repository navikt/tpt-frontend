"use client";

import { useMemo, useState } from "react";
import {
  Accordion,
  BodyShort,
  Box,
  Button,
  ExpansionCard,
  Heading,
  HGrid,
  HStack,
  Link,
  Select,
  Tag,
  TextField,
  VStack,
} from "@navikt/ds-react";
import { useLocale, useTranslations } from "next-intl";
import { useCheckResults } from "@/app/modules/goldenpath/useCheckResults";
import type { CheckResult } from "@/app/modules/goldenpath/useCheckResults";
import { filterGoldenPathChecks, getGoldenPathDisplayName } from "@/app/modules/goldenpath/filterCheckResults";
import { useVulnerabilitiesContext } from "@/app/contexts/VulnerabilitiesContext";
import styles from "./page.module.css";

type Severity = CheckResult["severity"];
type SortOption = "severity" | "checks" | "repository";

const severities: Severity[] = ["HIGH", "MEDIUM", "LOW", "UNKNOWN"];
const severityRank: Record<Severity, number> = {
  HIGH: 4,
  MEDIUM: 3,
  LOW: 2,
  UNKNOWN: 1,
};
const severityColors: Record<Severity, "danger" | "warning" | "neutral" | "info"> = {
  HIGH: "danger",
  MEDIUM: "warning",
  LOW: "neutral",
  UNKNOWN: "info",
};

export default function GoldenPathPage() {
  const { checkResults: allCheckResults, isLoading, hasError } = useCheckResults();
  const { data, teamFilters, applicationFilters } = useVulnerabilitiesContext();
  // Scope everything on the page to the global work context filter (navbar),
  // and show repositories as "team/repo" like the rest of the app.
  const checkResults = useMemo(
    () =>
      filterGoldenPathChecks(allCheckResults, data?.teams ?? [], {
        teamFilters,
        applicationFilters,
      }).map((repo) => ({ ...repo, displayName: getGoldenPathDisplayName(repo) })),
    [allCheckResults, data, teamFilters, applicationFilters],
  );
  const t = useTranslations("goldenpath");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [selectedSeverities, setSelectedSeverities] = useState<Set<Severity>>(
    () => new Set(severities),
  );
  const [sortOption, setSortOption] = useState<SortOption>("severity");
  const [openRepositories, setOpenRepositories] = useState<Set<string>>(() => new Set());

  const allBadChecks = checkResults.flatMap((repo) => repo.bad);
  const totalGoodChecks = checkResults.reduce((total, repo) => total + repo.good.length, 0);
  const repositoriesWithGoodChecks = checkResults.filter((repo) => repo.good.length > 0).length;
  const repositoriesWithoutFailures = checkResults
    .filter((repo) => repo.good.length > 0 && repo.bad.length === 0)
    .sort((first, second) => first.displayName.localeCompare(second.displayName));
  const severityCounts = severities.map((severity) => ({
    severity,
    count: allBadChecks.filter((check) => check.severity === severity).length,
  }));

  const lastChecked = checkResults
    .flatMap((repo) => [...repo.good, ...repo.bad])
    .map((check) => check.whenChecked)
    .filter((date) => !Number.isNaN(Date.parse(date)))
    .sort((first, second) => Date.parse(second) - Date.parse(first))[0];

  const filteredRepositories = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return checkResults
      .map((repo) => {
        const matchingChecks = repo.bad.filter((check) => {
          if (!selectedSeverities.has(check.severity)) return false;
          if (!normalizedQuery) return true;
          const searchText = [check.name, check.desc, ...(check.reasons ?? [])]
            .join(" ")
            .toLocaleLowerCase();
          return repo.displayName.toLocaleLowerCase().includes(normalizedQuery) ||
            repo.name.toLocaleLowerCase().includes(normalizedQuery) ||
            searchText.includes(normalizedQuery);
        });
        return { ...repo, visibleChecks: matchingChecks };
      })
      .filter((repo) => repo.visibleChecks.length > 0)
      .sort((first, second) => {
        if (sortOption === "repository") return first.displayName.localeCompare(second.displayName);
        if (sortOption === "checks") return second.visibleChecks.length - first.visibleChecks.length;
        const firstSeverity = Math.max(...first.visibleChecks.map((check) => severityRank[check.severity]));
        const secondSeverity = Math.max(...second.visibleChecks.map((check) => severityRank[check.severity]));
        return secondSeverity - firstSeverity ||
          second.visibleChecks.length - first.visibleChecks.length ||
          first.displayName.localeCompare(second.displayName);
      });
  }, [checkResults, query, selectedSeverities, sortOption]);

  const visibleCheckCount = filteredRepositories.reduce(
    (total, repo) => total + repo.visibleChecks.length,
    0,
  );

  const toggleSeverity = (severity: Severity) => {
    setSelectedSeverities((current) => {
      const next = new Set(current);
      if (next.has(severity)) next.delete(severity);
      else next.add(severity);
      return next;
    });
  };

  const setAllRepositoriesOpen = (open: boolean) => {
    setOpenRepositories(open ? new Set(filteredRepositories.map((repo) => repo.name)) : new Set());
  };

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat(locale === "nb" ? "nb-NO" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));

  return (
    <main className={styles.page}>
      <HStack className={styles.pageHeader} align="end" justify="space-between" wrap>
        <div>
          <Heading size="large" level="1">{t("title")}</Heading>
          <BodyShort className={styles.intro}>{t("intro")}</BodyShort>
        </div>
        <BodyShort size="small" className={styles.lastChecked}>
          {lastChecked ? t("lastChecked", { date: formatDate(lastChecked) }) : t("noCheckTime")}
        </BodyShort>
      </HStack>

      {!isLoading && !hasError && (
        <>
          <HGrid columns={{ xs: 1, md: 2 }} gap="space-16">
            <Box className={styles.summaryCard} background="default" borderRadius="8">
              <HStack gap="space-8" align="baseline" wrap>
                <Heading size="xlarge" level="2" className={styles.dangerValue}>
                  {allBadChecks.length}
                </Heading>
                <BodyShort>
                  {t("checksNeedWork", {
                    count: allBadChecks.length,
                    repositories: checkResults.filter((repo) => repo.bad.length > 0).length,
                  })}
                </BodyShort>
              </HStack>
              <HStack gap="space-8" wrap className={styles.summaryTags}>
                {severityCounts.filter(({ count }) => count > 0).map(({ severity, count }) => (
                  <SeverityTag key={severity} severity={severity} count={count} />
                ))}
              </HStack>
            </Box>

            <Box className={styles.summaryCard} background="default" borderRadius="8">
              <HStack gap="space-8" align="baseline" wrap>
                <Heading size="xlarge" level="2" className={styles.successValue}>
                  {totalGoodChecks}
                </Heading>
                <BodyShort>{t("checksPassing")}</BodyShort>
              </HStack>
              <BodyShort size="small" className={styles.summaryNote}>
                {t("repositoriesWithPassingChecks", { count: repositoriesWithGoodChecks })}
              </BodyShort>
            </Box>
          </HGrid>

          <BodyShort size="small" className={styles.countNote}>{t("countNote")}</BodyShort>
        </>
      )}

      <section aria-labelledby="needs-work-heading">
        <Heading size="medium" level="2" id="needs-work-heading" className={styles.sectionHeading}>
          {t("needsWork")}
        </Heading>

        <div className={styles.toolbar}>
          <TextField
            label={t("search")}
            hideLabel
            placeholder={t("search")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
          <HStack gap="space-8" wrap role="group" aria-label={t("filterBySeverity")}>
            {severities.filter((severity) => {
              return severityCounts.some((item) => item.severity === severity && item.count > 0);
            }).map((severity) => (
              <Button
                key={severity}
                type="button"
                size="small"
                variant={selectedSeverities.has(severity) ? "secondary" : "tertiary"}
                data-color="neutral"
                aria-pressed={selectedSeverities.has(severity)}
                onClick={() => toggleSeverity(severity)}
              >
                {t(`severity.${severity.toLowerCase()}`)}
              </Button>
            ))}
          </HStack>
          <Select
            label={t("sort")}
            hideLabel
            value={sortOption}
            onChange={(event) => {
              const value = event.target.value;
              setSortOption(value === "checks" || value === "repository" ? value : "severity");
            }}
          >
            <option value="severity">{t("sortBy.severity")}</option>
            <option value="checks">{t("sortBy.checks")}</option>
            <option value="repository">{t("sortBy.repository")}</option>
          </Select>
        </div>

        {!isLoading && !hasError && (
          <>
            <HStack className={styles.resultsHeader} justify="space-between" align="center" wrap>
              <BodyShort size="small">
                {t("resultsCount", {
                  checks: visibleCheckCount,
                  repositories: filteredRepositories.length,
                })}
              </BodyShort>
              {filteredRepositories.length > 0 && (
                <HStack gap="space-16">
                  <Button type="button" variant="tertiary" size="small" onClick={() => setAllRepositoriesOpen(true)}>
                    {t("expandAll")}
                  </Button>
                  <Button type="button" variant="tertiary" size="small" onClick={() => setAllRepositoriesOpen(false)}>
                    {t("collapseAll")}
                  </Button>
                </HStack>
              )}
            </HStack>

            {filteredRepositories.length > 0 ? (
              <Accordion className={styles.repositoryList}>
                {filteredRepositories.map((repo) => (
                  <Accordion.Item
                    key={repo.name}
                    open={openRepositories.has(repo.name)}
                    onOpenChange={(open) => {
                      setOpenRepositories((current) => {
                        const next = new Set(current);
                        if (open) next.add(repo.name);
                        else next.delete(repo.name);
                        return next;
                      });
                    }}
                  >
                    <Accordion.Header>
                      <HStack className={styles.repositoryHeader} gap="space-16" justify="space-between" align="center" wrap>
                        <BodyShort weight="semibold">{repo.displayName}</BodyShort>
                        <HStack gap="space-8" wrap>
                          {severityCountsFor(repo.visibleChecks).map(({ severity, count }) => (
                            <SeverityTag key={severity} severity={severity} count={count} />
                          ))}
                        </HStack>
                      </HStack>
                    </Accordion.Header>
                    <Accordion.Content>
                      <RepositoryChecks repository={repo.name} checks={repo.visibleChecks} formatDate={formatDate} />
                    </Accordion.Content>
                  </Accordion.Item>
                ))}
              </Accordion>
            ) : (
              <Box className={styles.emptyState} background="neutral-soft" borderRadius="8">
                <BodyShort>
                  {allBadChecks.length === 0 ? t("noChecksNeedWork") : t("noMatchingChecks")}
                </BodyShort>
              </Box>
            )}
          </>
        )}

        {isLoading && <BodyShort>{t("loading")}</BodyShort>}
        {hasError && <BodyShort role="alert">{t("loadError")}</BodyShort>}
      </section>

      {!isLoading && !hasError && repositoriesWithoutFailures.length > 0 && (
          <ExpansionCard data-color="neutral" size="small" aria-labelledby="no-checks-need-work-heading">
            <ExpansionCard.Header>
              <ExpansionCard.Title as="h2" size="small" id="no-checks-need-work-heading">
                {t("noChecksNeedWorkSection", { count: repositoriesWithoutFailures.length })}
              </ExpansionCard.Title>
            </ExpansionCard.Header>
            <ExpansionCard.Content>
              <VStack gap="space-16">
                <BodyShort size="small">{t("availableResultsNote")}</BodyShort>
                <Accordion data-color="neutral">
                  {repositoriesWithoutFailures.map((repo) => (
                    <Accordion.Item key={repo.name}>
                      <Accordion.Header>
                        <HStack className={styles.repositoryHeader} gap="space-16" justify="space-between" align="center" wrap>
                          <BodyShort weight="semibold">{repo.displayName}</BodyShort>
                          <Tag size="small" variant="moderate" data-color="success">
                            {t("passingCheckCount", { count: repo.good.length })}
                          </Tag>
                        </HStack>
                      </Accordion.Header>
                      <Accordion.Content>
                        <RepositoryChecks repository={repo.name} checks={repo.good} formatDate={formatDate} />
                      </Accordion.Content>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </VStack>
            </ExpansionCard.Content>
          </ExpansionCard>
      )}
    </main>
  );
}

function severityCountsFor(checks: CheckResult[]) {
  return severities
    .map((severity) => ({
      severity,
      count: checks.filter((check) => check.severity === severity).length,
    }))
    .filter(({ count }) => count > 0);
}

function SeverityTag({ severity, count }: { severity: Severity; count?: number }) {
  const t = useTranslations("goldenpath");
  return (
    <Tag size="small" variant="moderate" data-color={severityColors[severity]}>
      {count === undefined ? t(`severity.${severity.toLowerCase()}`) : `${count} ${t(`severity.${severity.toLowerCase()}`)}`}
    </Tag>
  );
}

function RepositoryChecks({
  repository,
  checks,
  formatDate,
}: {
  repository: string;
  checks: CheckResult[];
  formatDate: (date: string) => string;
}) {
  const t = useTranslations("goldenpath");

  return (
    <VStack gap="space-12" className={styles.checkList}>
      {checks.map((check) => (
        <CheckCard key={check.name} check={check} formatDate={formatDate} />
      ))}
      <Link
        href={`https://github.com/${repository.split("/").map(encodeURIComponent).join("/")}`}
        target="_blank"
        rel="noreferrer"
      >
        {t("openRepository", { repository })}
      </Link>
    </VStack>
  );
}

function CheckCard({
  check,
  formatDate,
}: {
  check: CheckResult;
  formatDate: (date: string) => string;
}) {
  const t = useTranslations("goldenpath");
  const validDate = !Number.isNaN(Date.parse(check.whenChecked));

  return (
    <Box className={styles.checkCard} background="neutral-soft" borderRadius="8">
      <HStack justify="space-between" align="start" gap="space-16" wrap>
        {check.type === "AllGood" ? (
          <Tag size="small" variant="moderate" data-color="success">{t("passing")}</Tag>
        ) : (
          <SeverityTag severity={check.severity} />
        )}
        <BodyShort weight="semibold" className={styles.checkDescription}>{check.desc}</BodyShort>
        <BodyShort size="small" className={styles.checkDate}>
          {validDate ? t("checked", { date: formatDate(check.whenChecked) }) : t("noCheckTime")}
        </BodyShort>
      </HStack>
      {check.reasons && check.reasons.length > 0 && (
        <VStack gap="space-4" className={styles.reasons}>
          {check.reasons.map((reason, index) => (
            <BodyShort key={`${check.name}-${index}`}>{reason}</BodyShort>
          ))}
        </VStack>
      )}
    </Box>
  );
}
