"use client";
import { VulnerabilitiesResponse } from "../../../types/vulnerabilities";
import { Table } from "@navikt/ds-react";
import { useMemo } from "react";

interface VulnerabilitiesTableProps {
  data?: VulnerabilitiesResponse;
}

const VulnerabilitiesTable = ({ data }: VulnerabilitiesTableProps) => {
  // Generate stable random risk scores using useMemo
  const tableRows = useMemo(() => {
    const rows: Array<{
      team: string;
      workload: string;
      ingressTypes: string[];
      vulnerabilityCount: number;
      riskScore: number;
    }> = [];

    data?.teams.forEach((team) => {
      team.workloads.forEach((workload) => {
        // Generate deterministic "random" score based on workload name
        const hash = workload.name.split("").reduce((a, b) => {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0);
        const riskScore = Math.abs(hash % 100) + 1;

        rows.push({
          team: team.team,
          workload: workload.name,
          ingressTypes: workload.ingressTypes,
          vulnerabilityCount: workload.vulnerabilities.length,
          riskScore,
        });
      });
    });

    return rows;
  }, [data]);

  return (
    <Table zebraStripes>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell scope="col">Team</Table.HeaderCell>
          <Table.HeaderCell scope="col">Applikasjon</Table.HeaderCell>
          <Table.HeaderCell scope="col">Ingress</Table.HeaderCell>
          <Table.HeaderCell scope="col">Sårbarheter</Table.HeaderCell>
          <Table.HeaderCell scope="col">Risikoscore</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {tableRows.map((row, index) => (
          <Table.Row key={`${row.team}-${row.workload}-${index}`}>
            <Table.DataCell>{row.team}</Table.DataCell>
            <Table.DataCell>{row.workload}</Table.DataCell>
            <Table.DataCell>{row.ingressTypes.join(", ")}</Table.DataCell>
            <Table.DataCell>{row.vulnerabilityCount}</Table.DataCell>
            <Table.DataCell>{row.riskScore}</Table.DataCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default VulnerabilitiesTable;
