"use client";
import { useVulnerabilities } from "../../hooks/useVulnerabilities";
import { LinkCard, Tag } from "@navikt/ds-react";
import Link from "next/link";

const Criticals = () => {
  const { data, isLoading } = useVulnerabilities();

  const criticalVulnerabilities =
    data?.teams.flatMap((team) =>
      team.workloads.flatMap((workload) =>
        workload.vulnerabilities
          .filter((vuln) => vuln.riskScore > 85)
          .map((vuln) => ({
            ...vuln,
            workload: {
              id: workload.id,
              name: workload.name,
              environmentName: workload.environmentName,
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
      {isLoading ? <div>Loading critical vulnerabilities...</div> : null}
      {!isLoading && criticalVulnerabilities.length === 0 ? (
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
                  <Link
                    href="/"
                    onNavigate={() =>
                      alert("I'm navigating with nextjs router!")
                    }
                  >
                    {vuln.workload.name}
                  </Link>
                </LinkCard.Anchor>
              </LinkCard.Title>

              <LinkCard.Description>
                {/* TODO: Fikse pakke og versjon fra api når tilgjengelig */}
                PAKKE VERSJON har kritisk sårbarhet {vuln.identifier} med
                riskscore {vuln.riskScore} i team {vuln.team}.
              </LinkCard.Description>

              <LinkCard.Footer>
                <Tag
                  size="small"
                  variant={
                    vuln.workload.environmentName === "prod"
                      ? "success"
                      : "info"
                  }
                >
                  {vuln.workload.environmentName === "prod"
                    ? "prod-gcp"
                    : "dev-gcp"}
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
