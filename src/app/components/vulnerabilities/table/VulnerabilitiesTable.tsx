"use client";
import { VulnerabilitiesResponse } from "../../../types/vulnerabilities";
import { Table } from "@navikt/ds-react";
import { useMemo } from "react";

interface VulnerabilitiesTableProps {
  data?: VulnerabilitiesResponse;
  teamFilters: Record<string, boolean>;
  applicationFilters: Record<string, boolean>;
}

const VulnerabilitiesTable = ({
  data,
  teamFilters,
  applicationFilters,
}: VulnerabilitiesTableProps) => {
  const tableRows = useMemo(() => {
    const rows: Array<{
      team: string;
      workload: string;
      ingressTypes: string[];
      vulnerability: string;
      riskScore: number;
    }> = [];

    data?.teams.forEach((team) => {
      if (teamFilters[team.team] === true) {
        team.workloads.forEach((workload) => {
          if (applicationFilters[workload.name] === true) {
            workload.vulnerabilities.forEach((vulnerability) => {
              rows.push({
                team: team.team,
                workload: workload.name,
                ingressTypes: workload.ingressTypes,
                vulnerability: vulnerability.identifier,
                riskScore: vulnerability.riskScore,
              });
            });
          }
        });
      }
    });

    return rows;
  }, [data, teamFilters, applicationFilters]);

  return (
    <Table zebraStripes>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell scope="col">Team</Table.HeaderCell>
          <Table.HeaderCell scope="col">Applikasjon</Table.HeaderCell>
          <Table.HeaderCell scope="col">Sårbarhet</Table.HeaderCell>
          <Table.HeaderCell scope="col">Risikoscore</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {tableRows.map((row, index) => (
          <Table.Row key={`${row.team}-${row.workload}-${index}`}>
            <Table.DataCell>{row.team}</Table.DataCell>
            <Table.DataCell>{row.workload}</Table.DataCell>
            <Table.DataCell>{row.vulnerability}</Table.DataCell>
            <Table.DataCell>{row.riskScore}</Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default VulnerabilitiesTable;
