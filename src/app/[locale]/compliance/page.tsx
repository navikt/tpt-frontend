"use client";

import { useMemo } from "react";
import { useSecurityStatus } from "@/app/shared/hooks/useSecurityStatus";
import { useRoleContext } from "@/app/shared/hooks/useRoleContext";
import { ManyTeamsLeaderView } from "@/app/modules/compliance/components/ManyTeamsLeaderView";
import { FewTeamsLeaderView } from "@/app/modules/compliance/components/FewTeamsLeaderView";
import { DeveloperComplianceView } from "@/app/modules/compliance/components/DeveloperComplianceView";
import { ComplianceMeasurement } from "@/app/modules/compliance/components/ComplianceMeasurement";
import NoTeamView from "../views/NoTeamView";
import { Loader, Box, VStack } from "@navikt/ds-react";
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

  if (!statusData || teams.length === 0) {
    return <NoTeamView />;
  }

  const isDeveloper = effectiveRole === "DEVELOPER" || effectiveRole === "TEAM_MEMBER";
  const isFewTeamsLeader = effectiveRole === "TEAM_LEADER" || teams.length < 4;

  return (
    <VStack gap="space-16">
      {isDeveloper
        ? <DeveloperComplianceView teams={teams} />
        : isFewTeamsLeader
          ? <FewTeamsLeaderView teams={teams} />
          : <ManyTeamsLeaderView teams={teams} />}
      <ComplianceMeasurement
        measurement={statusData.measurement}
        generatedAt={statusData.generatedAt}
      />
    </VStack>
  );
}
