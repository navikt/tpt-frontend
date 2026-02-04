"use client";
import { useVulnerabilities } from "@/app/modules/vulnerabilities/hooks/useVulnerabilities";
import { useRoleContext } from "@/app/shared/hooks/useRoleContext";
import DeveloperView from "./views/DeveloperView";
import TeamMemberView from "./views/TeamMemberView";
import LeaderView from "./views/LeaderView";
import NoTeamView from "./views/NoTeamView";
import { Loader, Box } from "@navikt/ds-react";
import { ErrorMessage } from "@/app/components/ErrorMessage";
import { useTranslations } from "next-intl";

export default function Home() {
  const { data: vulnData, isLoading: isVulnLoading, error } = useVulnerabilities();
  const { effectiveRole, isInitialized, isLoading: isRoleLoading } = useRoleContext();
  const t = useTranslations("errors");

  // Show error state if fetch failed
  if (error) {
    return (
      <ErrorMessage
        error={error}
        title={t("fetchVulnerabilitiesError")}
      />
    );
  }

  // Wait for both vulnerabilities data AND role initialization
  if (isVulnLoading || isRoleLoading || !vulnData || !isInitialized) {
    return (
      <Box
        paddingBlock="space-24"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <Loader size="large" title="Laster data..." />
      </Box>
    );
  }

  // Route based on effective role (selected context or actual user role)
  if (effectiveRole === "DEVELOPER") {
    return <DeveloperView />;
  }

  if (effectiveRole === "TEAM_MEMBER") {
    return <TeamMemberView />;
  }

  if (effectiveRole === "LEADER") {
    return <LeaderView />;
  }

  // Show NoTeamView for NONE or undefined roles
  return <NoTeamView />;
}
