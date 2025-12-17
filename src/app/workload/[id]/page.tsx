"use client";
import { useVulnerabilities } from "../../hooks/useVulnerabilities";
import { useParams } from "next/navigation";
import {
  Table,
  Tag,
  Heading,
  BodyShort,
  Link as DSLink,
  Popover,
  Button,
} from "@navikt/ds-react";
import WorkloadAccordion from "../../components/workload/WorkloadAccordion";
import Link from "next/link";
import { useState } from "react";

interface VulnerabilityWithMultipliers {
  riskScore: number;
  riskScoreMultipliers?: {
    base_high: number;
    exposure: number;
    kev: number;
    epss: number;
    production: number;
    old_build_days: number;
    old_build: number;
  };
}

function RiskScoreCell({ vuln }: { vuln: VulnerabilityWithMultipliers }) {
  const [openState, setOpenState] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  return (
    <>
      <Button
        ref={(el) => setAnchorEl(el)}
        onClick={() => setOpenState(!openState)}
        variant="tertiary"
        size="small"
        style={{ padding: 0 }}
      >
        <Tag
          variant={
            vuln.riskScore > 85
              ? "error"
              : vuln.riskScore > 50
              ? "warning"
              : "success"
          }
          size="small"
        >
          {Math.round(vuln.riskScore)}
        </Tag>
      </Button>
      <Popover
        open={openState}
        onClose={() => setOpenState(false)}
        anchorEl={anchorEl}
        placement="right"
      >
        <Popover.Content>
          <Heading size="xsmall" spacing>
            Risk Score Multipliers
          </Heading>
          {vuln.riskScoreMultipliers ? (
            <div style={{ fontSize: "0.875rem" }}>
              <BodyShort size="small">
                <b>Base (High):</b> {vuln.riskScoreMultipliers.base_high}
              </BodyShort>
              <BodyShort size="small">
                <b>Exposure:</b> {vuln.riskScoreMultipliers.exposure}x
              </BodyShort>
              <BodyShort size="small">
                <b>KEV:</b> {vuln.riskScoreMultipliers.kev}x
              </BodyShort>
              <BodyShort size="small">
                <b>EPSS:</b> {vuln.riskScoreMultipliers.epss}x
              </BodyShort>
              <BodyShort size="small">
                <b>Production:</b> {vuln.riskScoreMultipliers.production}x
              </BodyShort>
              <BodyShort size="small">
                <b>Old Build Days:</b>{" "}
                {vuln.riskScoreMultipliers.old_build_days}
              </BodyShort>
              <BodyShort size="small">
                <b>Old Build:</b> {vuln.riskScoreMultipliers.old_build}x
              </BodyShort>
            </div>
          ) : (
            <BodyShort size="small">No multiplier data available</BodyShort>
          )}
        </Popover.Content>
      </Popover>
    </>
  );
}

export default function WorkloadDetailPage() {
  const params = useParams();
  const workloadId = params.id as string;
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
                    <RiskScoreCell vuln={vuln} />
                  </Table.DataCell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table>
      )}
    </div>
  );
}
