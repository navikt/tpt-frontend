"use client";
import { useVulnerabilities } from "../../hooks/useVulnerabilities";
import { useParams } from "next/navigation";
import {
  Table,
  Tag,
  Heading,
  BodyShort,
  Link as DSLink,
  Accordion,
  Popover,
  Button,
} from "@navikt/ds-react";
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
                <strong>Base (High):</strong>{" "}
                {vuln.riskScoreMultipliers.base_high}
              </BodyShort>
              <BodyShort size="small">
                <strong>Exposure:</strong> {vuln.riskScoreMultipliers.exposure}x
              </BodyShort>
              <BodyShort size="small">
                <strong>KEV:</strong> {vuln.riskScoreMultipliers.kev}x
              </BodyShort>
              <BodyShort size="small">
                <strong>EPSS:</strong> {vuln.riskScoreMultipliers.epss}x
              </BodyShort>
              <BodyShort size="small">
                <strong>Production:</strong>{" "}
                {vuln.riskScoreMultipliers.production}x
              </BodyShort>
              <BodyShort size="small">
                <strong>Old Build Days:</strong>{" "}
                {vuln.riskScoreMultipliers.old_build_days}
              </BodyShort>
              <BodyShort size="small">
                <strong>Old Build:</strong>{" "}
                {vuln.riskScoreMultipliers.old_build}x
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

  const accordionItemSpacing = "1.5rem";

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
          <strong>Team:</strong> {workloadData.team}
        </BodyShort>
        <BodyShort spacing>
          <strong>Environment:</strong> {workloadData.environment}
        </BodyShort>
        {workloadData.buildTime && (
          <BodyShort spacing>
            <strong>Build Time:</strong> {workloadData.buildTime}
          </BodyShort>
        )}
        {workloadData.repository && (
          <BodyShort spacing>
            <strong>Repository:</strong>{" "}
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
          <strong>Ingress Types:</strong>{" "}
          {workloadData.ingressTypes?.join(", ") || "None"}
        </BodyShort>
      </div>

      <Accordion style={{ marginBottom: "2rem" }}>
        <Accordion.Item>
          <Accordion.Header>
            Forklaring av termer og risikoskåring
          </Accordion.Header>
          <Accordion.Content>
            <Heading size="xsmall">
              KEV (Known Exploited Vulnerabilities)
            </Heading>
            <BodyShort style={{ marginBottom: accordionItemSpacing }}>
              KEV er en liste fra CISA (Cybersecurity and Infrastructure
              Security Agency) over sårbarheter som er aktivt utnyttet i
              naturen. Sårbarheter med KEV-oppføring får høyere risikoskåre
              fordi de representerer en reell, dokumentert trussel.
            </BodyShort>

            <Heading size="xsmall">
              EPSS (Exploit Prediction Scoring System)
            </Heading>
            <BodyShort style={{ marginBottom: accordionItemSpacing }}>
              EPSS er et datastyrt system som predikerer sannsynligheten for at
              en sårbarhet vil bli utnyttet de neste 30 dagene. Høyere
              EPSS-skåre indikerer større sannsynlighet for aktiv utnyttelse, og
              øker derfor risikoskåren.
            </BodyShort>

            <Heading size="xsmall">Ingress Types</Heading>
            <BodyShort spacing>
              <strong>External:</strong> Applikasjonen er eksponert mot
              internett uten autentisering. Dette gir høyest angrepsflate og
              påvirker risikoskåren mest.
            </BodyShort>
            <BodyShort spacing>
              <strong>Authenticated:</strong> Applikasjonen er eksponert mot
              internett, men krever autentisering. Dette gir moderat økt risiko.
            </BodyShort>
            <BodyShort spacing>
              <strong>Internal:</strong> Applikasjonen er kun tilgjengelig
              internt i nettverket. Dette gir normal/baseline risiko.
            </BodyShort>
            <BodyShort style={{ marginBottom: accordionItemSpacing }}>
              <strong>Unknown/None:</strong> Ingen ingress er konfigurert. Dette
              betyr at applikasjonen ikke er tilgjengelig eksternt eller internt
              og får redusert risikoskåre.
            </BodyShort>

            <Heading size="xsmall">Risk Score</Heading>
            <BodyShort>
              Risikoskåren beregnes ved å ta hensyn til flere faktorer inkludert
              CVE severity, KEV-status, EPSS-skåre, ingress type,
              produksjonsmiljø og byggets alder. Høyere skåre betyr høyere
              prioritet for utbedring.
            </BodyShort>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>

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
