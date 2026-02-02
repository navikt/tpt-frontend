"use client";

import { Table, BodyShort, Box } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import { TeamSla } from "@/app/types/admin";
import { formatNumber } from "@/lib/format";
import { useState, useMemo } from "react";

interface TeamsSlaTableProps {
  teams: TeamSla[];
}

type SortField = "teamSlug" | "totalVulnerabilities" | "criticalOverdue" | "nonCriticalOverdue";
type SortDirection = "ascending" | "descending";

export function TeamsSlaTable({ teams }: TeamsSlaTableProps) {
  const t = useTranslations("admin");
  const [sort, setSort] = useState<{ orderBy: SortField; direction: SortDirection }>({
    orderBy: "criticalOverdue",
    direction: "descending",
  });

  const sortedTeams = useMemo(() => {
    const sorted = [...teams];
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
  }, [teams, sort]);

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
    <Table size="small" sort={sort} onSortChange={handleSort}>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader sortKey="teamSlug" sortable>
            {t("teamSlug")}
          </Table.ColumnHeader>
          <Table.ColumnHeader sortKey="totalVulnerabilities" sortable align="right">
            {t("total")}
          </Table.ColumnHeader>
          <Table.ColumnHeader sortKey="criticalOverdue" sortable align="right">
            {t("criticalOverdue")}
          </Table.ColumnHeader>
          <Table.ColumnHeader sortKey="nonCriticalOverdue" sortable align="right">
            {t("nonCriticalOverdue")}
          </Table.ColumnHeader>
          <Table.ColumnHeader align="right">
            {t("criticalWithinSla")}
          </Table.ColumnHeader>
          <Table.ColumnHeader align="right">
            {t("nonCriticalWithinSla")}
          </Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sortedTeams.map((team) => (
          <Table.Row key={team.teamSlug}>
            <Table.DataCell>{team.teamSlug}</Table.DataCell>
            <Table.DataCell align="right">
              {formatNumber(team.totalVulnerabilities)}
            </Table.DataCell>
            <Table.DataCell
              align="right"
              style={{
                backgroundColor: team.criticalOverdue > 0
                  ? "var(--a-surface-danger-subtle)"
                  : undefined,
              }}
            >
              {formatNumber(team.criticalOverdue)}
            </Table.DataCell>
            <Table.DataCell
              align="right"
              style={{
                backgroundColor: team.nonCriticalOverdue > 0
                  ? "var(--a-surface-warning-subtle)"
                  : undefined,
              }}
            >
              {formatNumber(team.nonCriticalOverdue)}
            </Table.DataCell>
            <Table.DataCell align="right">
              {formatNumber(team.criticalWithinSla)}
            </Table.DataCell>
            <Table.DataCell align="right">
              {formatNumber(team.nonCriticalWithinSla)}
            </Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
