"use client";
import { useVulnerabilities } from "../../hooks/useVulnerabilities";
import { useConfig } from "../../hooks/useConfig";
import { LinkCard, Tag } from "@navikt/ds-react";
import Link from "next/link";

const Criticals = () => {
  const { data, isLoading } = useVulnerabilities();
  const { config, isLoading: configLoading } = useConfig();

  const asapThreshold = config?.thresholds.asap ?? 85;

  const criticalVulnerabilities =
    data?.teams.flatMap((team) =>
      team.workloads.flatMap((workload) =>
        workload.vulnerabilities
          .filter((vuln) => vuln.riskScore >= asapThreshold)
          .map((vuln) => ({
            ...vuln,
            workload: {
              id: workload.id,
              name: workload.name,
              environment: workload.environment,
              repository: workload.repository,
              ingressTypes: workload.ingressTypes,
              buildTime: workload.buildTime,
            },
            team: team.team,
          }))
      )
    ) || [];

  return (
    <>
      <h2 style={{ marginTop: "2rem" }}>Prioriterte sårbarheter </h2>
      {isLoading || configLoading ? (
        <div>Loading critical vulnerabilities...</div>
      ) : null}
      {!isLoading && !configLoading && criticalVulnerabilities.length === 0 ? (
        <p>
          Godt jobbet! 🙌 Vi ser ingen sårbarheter du må fikse <i>nå</i>.
        </p>
      ) : (
        <>
          {criticalVulnerabilities.map((vuln, index) => (
            <LinkCard
              key={`${vuln.identifier}-${index}`}
              style={{
                marginBottom: "1rem",
              }}
            >
              <LinkCard.Title>
                <LinkCard.Anchor asChild>
                  <Link href={`/${vuln.workload.id}/${vuln.identifier}`}>
                    {vuln.workload.name}
                  </Link>
                </LinkCard.Anchor>
              </LinkCard.Title>

              <LinkCard.Description>
                {vuln.packageName} har kritisk sårbarhet {vuln.identifier}.
                {vuln.workload.repository && (
                  <>
                    <br />
                    <a
                      href={`https://www.github.com/${vuln.workload.repository}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {vuln.workload.repository}
                    </a>
                  </>
                )}
              </LinkCard.Description>

              <LinkCard.Footer>
                <Tag
                  size="small"
                  variant={
                    vuln.workload.environment?.includes("prod")
                      ? "success"
                      : "info"
                  }
                >
                  {vuln.workload.environment}
                </Tag>
              </LinkCard.Footer>
            </LinkCard>
          ))}
        </>
      )}
    </>
  );
};

export default Criticals;
