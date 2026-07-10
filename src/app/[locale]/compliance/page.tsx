"use client";
import { useVulnerabilitiesContext } from "@/app/contexts/VulnerabilitiesContext";
import { useRoleContext } from "@/app/shared/hooks/useRoleContext";
import TeamMemberView from "../views/TeamMemberView";
import LeaderView from "../views/LeaderView";
import NoTeamView from "../views/NoTeamView";
import { Loader, Box } from "@navikt/ds-react";
import { ErrorMessage } from "@/app/components/ErrorMessage";
import { useTranslations } from "next-intl";

export default function CompliancePage() {
  const { error } = useVulnerabilitiesContext();
  const { effectiveRole, isInitialized, isLoading: isRoleLoading } = useRoleContext();
  const t = useTranslations("errors");
  const tTeamMember = useTranslations("teamMemberView");

  // Wait for role to be known before deciding which view to show
  if (isRoleLoading || !isInitialized) {
    return (
      <Box
        paddingBlock="space-24"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <Loader size="large" title={tTeamMember("loadingData")} />
      </Box>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        error={error}
        title={t("fetchVulnerabilitiesError")}
      />
    );
  }

  if (effectiveRole === "DEVELOPER" || effectiveRole === "TEAM_MEMBER") {
    return <TeamMemberView />;
  }

  if (effectiveRole === "LEADER" || effectiveRole === "PRODUCT_LEADER" || effectiveRole === "TECH_LEADER") {
    return <LeaderView />;
  }

  return <NoTeamView />;
}
