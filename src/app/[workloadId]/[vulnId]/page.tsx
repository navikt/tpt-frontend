"use client";
import { useVulnerabilities } from "../../hooks/useVulnerabilities";
import { useParams } from "next/navigation";
import { Heading, BodyShort, Link as DSLink } from "@navikt/ds-react";
import WorkloadAccordion from "../../components/workload/WorkloadAccordion";
import WorkloadRiskScoreCell from "../../components/workload/WorkloadRiskScoreCell";
import Link from "next/link";

export default function WorkloadDetailPage() {
  const params = useParams();
  const workloadId = params.workloadId as string;
  const vulnId = params.vulnId as string;
  const { data, isLoading } = useVulnerabilities();

  const workloadData = data?.teams
    .flatMap((team) =>
      team.workloads.map((workload) => ({
        ...workload,
        team: team.team,
      }))
    )
    .find((w) => w.id === workloadId);

  const vulnerabilityData = workloadData?.vulnerabilities.find(
    (v) => v.identifier === vulnId
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  console.log("vulnId:", vulnerabilityData);

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
        <div style={{ marginBottom: "1rem" }}>
          <b>Risk score:</b> <WorkloadRiskScoreCell vuln={vulnerabilityData!} />
        </div>
      </div>

      <BodyShort spacing>
        <b>{vulnerabilityData?.identifier}</b>: {vulnerabilityData?.description}
      </BodyShort>
      <DSLink
        style={{ marginBottom: "2rem" }}
        href={vulnerabilityData?.vulnerabilityDetailsLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        Les mer om sårbarheten her
      </DSLink>

      <WorkloadAccordion />
    </div>
  );
}
