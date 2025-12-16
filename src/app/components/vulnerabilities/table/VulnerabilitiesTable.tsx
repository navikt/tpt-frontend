"use client";
import { VulnerabilitiesResponse } from "../../../types/vulnerabilities";
import { Table } from "@navikt/ds-react";
import { useMemo, useState } from "react";

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
      ingressTypes: string[] | undefined;
      vulnerability: string;
      riskScore: number;
    }> = [];

    data?.teams.forEach((team) => {
      if (teamFilters[team.team] === true) {
        team.workloads.forEach((workload) => {
          if (applicationFilters[workload.name] === true) {
            workload.vulnerabilities.forEach((vulnerability) => {
              if (cveFilters[vulnerability.identifier] === true) {
                rows.push({
                  team: team.team,
                  workload: workload.name,
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

      let comparison = 0;
      if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sort.direction === "ascending" ? comparison : -comparison;
    });
  }, [tableRows, sort]);

  return (
    <Table zebraStripes sort={sort} onSortChange={(sortKey) => handleSort(sortKey as SortColumn)}>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader sortKey="team" sortable>Team</Table.ColumnHeader>
          <Table.ColumnHeader sortKey="workload" sortable>Applikasjon</Table.ColumnHeader>
          <Table.ColumnHeader sortKey="vulnerability" sortable>Sårbarhet</Table.ColumnHeader>
          <Table.ColumnHeader sortKey="riskScore" sortable>Risikoscore</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {sortedRows.map((row, index) => (
          <Table.Row key={`${row.team}-${row.workload}-${index}`}>
            <Table.DataCell>{row.team}</Table.DataCell>
            <Table.DataCell>{row.workload}</Table.DataCell>
            <Table.DataCell>{row.vulnerability}</Table.DataCell>
            <Table.DataCell>{Math.round(row.riskScore)}</Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default VulnerabilitiesTable;
