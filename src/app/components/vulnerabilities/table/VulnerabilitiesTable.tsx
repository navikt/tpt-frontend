"use client";
import { VulnerabilitiesResponse } from "@/app/types/vulnerabilities";
import { Table, Link } from "@navikt/ds-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import NextLink from "next/link";

interface VulnerabilitiesTableProps {
  data?: VulnerabilitiesResponse;
  teamFilters: Record<string, boolean>;
  applicationFilters: Record<string, boolean>;
  cveFilters: Record<string, boolean>;
}

type SortColumn = "team" | "workload" | "vulnerability" | "riskScore";
type SortDirection = "ascending" | "descending" | "none";

const VulnerabilitiesTable = ({
  data,
  teamFilters,
  applicationFilters,
  cveFilters,
}: VulnerabilitiesTableProps) => {
  const t = useTranslations();
  const [sort, setSort] = useState<{
    orderBy: SortColumn;
    direction: SortDirection;
  }>({
    orderBy: "riskScore",
    direction: "descending",
  });

  const handleSort = (sortKey: SortColumn) => {
    setSort((prevSort) => ({
      orderBy: sortKey,
      direction:
        prevSort.orderBy === sortKey && prevSort.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  const tableRows = useMemo(() => {
    const rows: Array<{
      team: string;
      workload: string;
      workloadId: string;
      vulnerabilityId: string;
      ingressTypes: string[] | undefined;
      vulnerability: string;
      riskScore: number;
    }> = [];

    // Check if any filters are active
    const hasTeamFilters = Object.values(teamFilters).some((v) => v);
    const hasApplicationFilters = Object.values(applicationFilters).some(
      (v) => v
    );
    const hasCveFilters = Object.values(cveFilters).some((v) => v);

    data?.teams.forEach((team) => {
      // Show team if no team filters OR team is selected
      if (!hasTeamFilters || teamFilters[team.team]) {
        team.workloads.forEach((workload) => {
          // Show workload if no application filters OR workload is selected
          if (
            !hasApplicationFilters ||
            applicationFilters[workload.name]
          ) {
            workload.vulnerabilities.forEach((vulnerability) => {
              // Show CVE if no CVE filters OR CVE is selected
              if (
                !hasCveFilters ||
                cveFilters[vulnerability.identifier]
              ) {
                rows.push({
                  team: team.team,
                  workload: workload.name,
                  workloadId: workload.id,
                  vulnerabilityId: vulnerability.identifier,
                  ingressTypes: workload.ingressTypes,
                  vulnerability: vulnerability.identifier,
                  riskScore: vulnerability.riskScore,
                });
              }
            });
          }
        });
      }
    });

    return rows;
  }, [data, teamFilters, applicationFilters, cveFilters]);

  const sortedRows = useMemo(() => {
    if (sort.direction === "none") return tableRows;

    return [...tableRows].sort((a, b) => {
      const aValue = a[sort.orderBy];
      const bValue = b[sort.orderBy];

      let comparison;
      if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sort.direction === "ascending" ? comparison : -comparison;
    });
  }, [tableRows, sort]);

  return (
    <Table
      zebraStripes
      sort={sort}
      onSortChange={(sortKey) => handleSort(sortKey as SortColumn)}
    >
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader sortKey="team" sortable>
            {t("vulnerabilitiesTable.team")}
          </Table.ColumnHeader>
          <Table.ColumnHeader sortKey="workload" sortable>
            {t("vulnerabilitiesTable.application")}
          </Table.ColumnHeader>
          <Table.ColumnHeader sortKey="vulnerability" sortable>
            {t("vulnerabilitiesTable.vulnerability")}
          </Table.ColumnHeader>
          <Table.ColumnHeader sortKey="riskScore" sortable>
            {t("vulnerabilitiesTable.riskScore")}
          </Table.ColumnHeader>
          <Table.ColumnHeader>
            {t("vulnerabilitiesTable.links")}
          </Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sortedRows.map((row, index) => (
          <Table.Row key={`${row.team}-${row.workload}-${index}`}>
            <Table.DataCell>
              <Link
                as={NextLink}
                href={`https://console.nav.cloud.nais.io/team/${row.team}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {row.team}
              </Link>
            </Table.DataCell>
            <Table.DataCell>{row.workload}</Table.DataCell>
            <Table.DataCell>{row.vulnerability}</Table.DataCell>
            <Table.DataCell>
              {Math.round(row.riskScore)}
            </Table.DataCell>
            <Table.DataCell>
              <Link
                  href={`/${row.workloadId}/${row.vulnerabilityId}`}
              >
                {t("vulnerabilitiesTable.details")}
              </Link>
            </Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default VulnerabilitiesTable;
