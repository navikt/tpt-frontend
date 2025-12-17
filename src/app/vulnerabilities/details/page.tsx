"use client";
import { useSearchParams } from "next/navigation";
import { useVulnerabilities } from "../../hooks/useVulnerabilities";

export default function Page() {
  const searchParams = useSearchParams();
  const { data, isLoading } = useVulnerabilities();

  const team = searchParams.get("team");
  const workload = searchParams.get("workload");
  const vuln = searchParams.get("vuln");

  const teamData = data?.teams.find((t) => t.team === team);
  const workloadData = teamData?.workloads.find((w) => w.name === workload);
  const vulnData = workloadData?.vulnerabilities.find(
    (v) => v.identifier === vuln
  );

  console.log({ teamData, workloadData, vulnData });

  return (
    <main>
      <h1>
        {teamData?.team} / {workloadData?.name}
      </h1>
    </main>
  );
}
