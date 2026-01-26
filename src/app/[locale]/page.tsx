"use client";
import { useVulnerabilities } from "@/app/modules/vulnerabilities/hooks/useVulnerabilities";
import DeveloperView from "./views/DeveloperView";
import TeamMemberView from "./views/TeamMemberView";
import LeaderView from "./views/LeaderView";
import { Loader, Box } from "@navikt/ds-react";

export default function Home() {
  const { data: vulnData, isLoading } = useVulnerabilities();

  // Show loading state while data is being fetched
  if (isLoading || !vulnData) {
    return (
      <Box
        paddingBlock="space-24"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <Loader size="large" title="Laster data..." />
      </Box>
    );
  }

  // Route based on user role
  if (vulnData.userRole === "DEVELOPER") {
    return <DeveloperView />;
  }

  if (vulnData.userRole === "LEADER") {
    return <LeaderView />;
  }

  // Default to TeamMemberView for TEAM_MEMBER or undefined roles
  return <TeamMemberView />;
}
