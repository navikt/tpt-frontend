"use client";
import { useVulnerabilities } from "../../hooks/useVulnerabilities";
import { useParams } from "next/navigation";
import { Table, Heading, BodyShort, Link as DSLink } from "@navikt/ds-react";
import WorkloadAccordion from "../../components/workload/WorkloadAccordion";
import WorkloadRiskScoreCell from "../../components/workload/WorkloadRiskScoreCell";
import Link from "next/link";

export default function WorkloadDetailPage() {
  const params = useParams();
  const workloadId = params.workloadId as string;
  const { data, isLoading } = useVulnerabilities();

  const workloadData = data?.teams
    .flatMap((team) =>
      team.workloads.map((workload) => ({
        ...workload,
        team: team.team,
      }))
    )
    .find((w) => w.id === workloadId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!workloadData) {
    return (
      <div style={{ marginTop: "2rem" }}>
        <Heading size="large" spacing>
          Workload ikke funnet
        </Heading>
        <BodyShort>
          <Link href="/">Tilbake til forsiden</Link>
        </BodyShort>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "2rem" }}>
      <Link href="/" style={{ marginBottom: "1rem", display: "inline-block" }}>
        ← Tilbake
      </Link>

      <Heading size="large" spacing>
        {workloadData.name}
      </Heading>

      <div style={{ marginBottom: "2rem" }}>
        <BodyShort spacing>
          <b>Team:</b> {workloadData.team}
        </BodyShort>
        <BodyShort spacing>
          <b>Environment:</b> {workloadData.environment}
        </BodyShort>
        {workloadData.buildTime && (
          <BodyShort spacing>
            <b>Build Time:</b> {workloadData.buildTime}
          </BodyShort>
        )}
        {workloadData.repository && (
          <BodyShort spacing>
            <b>Repository:</b>{" "}
            <DSLink
              href={`https://www.github.com/${workloadData.repository}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {workloadData.repository}
            </DSLink>
          </BodyShort>
        )}
        <BodyShort spacing>
          <b>Ingress Types:</b>{" "}
          {workloadData.ingressTypes?.join(", ") || "None"}
        </BodyShort>
      </div>

      <WorkloadAccordion />

      <Heading size="medium" spacing>
        Sårbarheter ({workloadData.vulnerabilities.length})
      </Heading>

      {workloadData.vulnerabilities.length === 0 ? (
        <BodyShort>Ingen sårbarheter funnet.</BodyShort>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>CVE ID</Table.HeaderCell>
              <Table.HeaderCell>Package</Table.HeaderCell>
              <Table.HeaderCell>Risk Score</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {[...workloadData.vulnerabilities]
              .sort((a, b) => b.riskScore - a.riskScore)
              .map((vuln, index) => (
                <Table.Row key={`${vuln.identifier}-${index}`}>
                  <Table.DataCell>{vuln.identifier}</Table.DataCell>
                  <Table.DataCell>{vuln.packageName}</Table.DataCell>
                  <Table.DataCell>
                    <WorkloadRiskScoreCell vuln={vuln} />
                  </Table.DataCell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table>
      )}
    </div>
  );
}
