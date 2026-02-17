"use client";

import { Table, BodyShort, Box, Search } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import { TeamOverview } from "@/app/types/admin";
import { formatNumber } from "@/lib/format";
import { useState, useMemo } from "react";

interface TeamsOverviewTableProps {
  teams: TeamOverview[];
}

type SortField = "teamSlug" | "totalVulnerabilities" | "criticalVulnerabilities" | "highVulnerabilities";
type SortDirection = "ascending" | "descending";

const DEFAULT_PAGE_SIZE = 20;

export function TeamsOverviewTable({ teams }: TeamsOverviewTableProps) {
  const t = useTranslations("admin");
  const [sort, setSort] = useState<{ orderBy: SortField; direction: SortDirection }>({
    orderBy: "criticalVulnerabilities",
    direction: "descending",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filteredAndSortedTeams = useMemo(() => {
    let filtered = teams;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = teams.filter((team) =>
        team.teamSlug.toLowerCase().includes(query)
      );
    }

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      let aVal = a[sort.orderBy];
      let bVal = b[sort.orderBy];

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sort.direction === "ascending" ? -1 : 1;
      if (aVal > bVal) return sort.direction === "ascending" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [teams, sort, searchQuery]);

  const displayedTeams = useMemo(() => {
    if (showAll) return filteredAndSortedTeams;
    return filteredAndSortedTeams.slice(0, DEFAULT_PAGE_SIZE);
  }, [filteredAndSortedTeams, showAll]);

  const handleSort = (sortKey: string | undefined) => {
    if (!sortKey) return;
    const field = sortKey as SortField;
    setSort((prevSort) => ({
      orderBy: field,
      direction:
        prevSort.orderBy === field && prevSort.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  if (teams.length === 0) {
    return (
      <Box padding="space-16">
        <BodyShort>{t("noTeams")}</BodyShort>
      </Box>
    );
  }

  return (
    <Box>
      <Box paddingBlock="space-12">
        <Search
          label={t("searchTeams")}
          hideLabel
          placeholder={t("searchTeamsPlaceholder")}
          value={searchQuery}
          onChange={setSearchQuery}
          size="small"
        />
      </Box>
      
      {filteredAndSortedTeams.length === 0 ? (
        <Box padding="space-16">
          <BodyShort>{t("noTeamsFound")}</BodyShort>
        </Box>
      ) : (
        <>
          <Table size="small" sort={sort} onSortChange={handleSort}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader sortKey="teamSlug" sortable>
                  {t("teamSlug")}
                </Table.ColumnHeader>
                <Table.ColumnHeader sortKey="totalVulnerabilities" sortable align="right">
                  {t("total")}
                </Table.ColumnHeader>
                <Table.ColumnHeader sortKey="criticalVulnerabilities" sortable align="right">
                  {t("critical")}
                </Table.ColumnHeader>
                <Table.ColumnHeader sortKey="highVulnerabilities" sortable align="right">
                  {t("high")}
                </Table.ColumnHeader>
                <Table.ColumnHeader align="right">
                  {t("medium")}
                </Table.ColumnHeader>
                <Table.ColumnHeader align="right">
                  {t("low")}
                </Table.ColumnHeader>
                <Table.ColumnHeader align="right">
                  {t("unknown")}
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {displayedTeams.map((team) => (
                <Table.Row key={team.teamSlug}>
                  <Table.DataCell>{team.teamSlug}</Table.DataCell>
                  <Table.DataCell align="right">
                    {formatNumber(team.totalVulnerabilities)}
                  </Table.DataCell>
                  <Table.DataCell
                    align="right"
                    style={{
                      backgroundColor: team.criticalVulnerabilities > 0
                        ? "var(--a-surface-danger-subtle)"
                        : undefined,
                    }}
                  >
                    {formatNumber(team.criticalVulnerabilities)}
                  </Table.DataCell>
                  <Table.DataCell
                    align="right"
                    style={{
                      backgroundColor: team.highVulnerabilities > 0
                        ? "var(--a-surface-warning-subtle)"
                        : undefined,
                    }}
                  >
                    {formatNumber(team.highVulnerabilities)}
                  </Table.DataCell>
                  <Table.DataCell align="right">
                    {formatNumber(team.mediumVulnerabilities)}
                  </Table.DataCell>
                  <Table.DataCell align="right">
                    {formatNumber(team.lowVulnerabilities)}
                  </Table.DataCell>
                  <Table.DataCell align="right">
                    {formatNumber(team.unknownVulnerabilities)}
                  </Table.DataCell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          
          {!showAll && filteredAndSortedTeams.length > DEFAULT_PAGE_SIZE && (
            <Box paddingBlock="space-12" style={{ textAlign: "center" }}>
              <BodyShort>
                {t("showingResults", { 
                  shown: displayedTeams.length, 
                  total: filteredAndSortedTeams.length 
                })}{" "}
                <button
                  onClick={() => setShowAll(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--a-text-action)",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                    font: "inherit",
                  }}
                >
                  {t("showAll")}
                </button>
              </BodyShort>
            </Box>
          )}
          
          {showAll && filteredAndSortedTeams.length > DEFAULT_PAGE_SIZE && (
            <Box paddingBlock="space-12" style={{ textAlign: "center" }}>
              <button
                onClick={() => setShowAll(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--a-text-action)",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0,
                  font: "inherit",
                }}
              >
                {t("showLess")}
              </button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
