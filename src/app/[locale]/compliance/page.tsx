"use client";

import { useMemo } from "react";
import { useSecurityStatus } from "@/app/shared/hooks/useSecurityStatus";
import { useRoleContext } from "@/app/shared/hooks/useRoleContext";
import { ManyTeamsLeaderView } from "@/app/modules/compliance/components/ManyTeamsLeaderView";
import { FewTeamsLeaderView } from "@/app/modules/compliance/components/FewTeamsLeaderView";
import { DeveloperComplianceView } from "@/app/modules/compliance/components/DeveloperComplianceView";
import NoTeamView from "../views/NoTeamView";
import { Loader, Box } from "@navikt/ds-react";
import { ErrorMessage } from "@/app/components/ErrorMessage";
import { useTranslations } from "next-intl";

export default function CompliancePage() {
  const { data: statusData, isLoading: isStatusLoading, error: statusError } = useSecurityStatus();
  const { effectiveRole, isInitialized, isLoading: isRoleLoading } = useRoleContext();
  const t = useTranslations("errors");
  const tCompliance = useTranslations("compliance");

  const teams = useMemo(() => statusData?.teams ?? [], [statusData]);

  // Wait for role and status data to be ready
  if (isRoleLoading || !isInitialized || isStatusLoading) {
    return (
      <Box
        paddingBlock="space-24"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <Loader size="large" title={tCompliance("loadingData")} />
      </Box>
    );
  }

  if (statusError) {
    return (
      <ErrorMessage
        error={statusError}
        title={t("fetchSecurityStatusError")}
      />
    );
  }

  if (teams.length === 0) {
    return <NoTeamView />;
  }

  if (effectiveRole === "DEVELOPER" || effectiveRole === "TEAM_MEMBER") {
    return <DeveloperComplianceView teams={teams} />;
  }

  if (effectiveRole === "TEAM_LEADER") {
    return <FewTeamsLeaderView teams={teams} />;
  }

  // Leaders with < 4 teams get few-teams view (5b), 4 or more get many-teams view (5a)
  if (teams.length < 4) {
    return <FewTeamsLeaderView teams={teams} />;
  }

  return <ManyTeamsLeaderView teams={teams} />;
}
