"use client";
import { use } from "react";
import { useParams } from "next/navigation";
import { Box, Loader } from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import { useAdminTeamVulnerabilities } from "@/app/modules/admin/hooks/useAdminTeamVulnerabilities";
import { AdminTeamVulnerabilitiesProvider } from "@/app/contexts/AdminTeamVulnerabilitiesContext";
import { ErrorMessage } from "@/app/components/ErrorMessage";
import { WorkloadDetail } from "@/app/modules/vulnerabilities/components/WorkloadDetail";

interface AdminTeamVulnDetailPageProps {
    params: Promise<{ teamSlug: string }>;
}

export default function AdminTeamVulnDetailPage({ params }: AdminTeamVulnDetailPageProps) {
    const { teamSlug } = use(params);
    const routeParams = useParams();
    const workloadId = routeParams.workloadId as string;
    const vulnId = routeParams.vulnId as string;

    const t = useTranslations("admin");
    const tErrors = useTranslations("errors");

    const { data, isLoading, error } = useAdminTeamVulnerabilities(teamSlug);

    if (error) {
        return (
            <ErrorMessage error={error} title={tErrors("fetchVulnerabilitiesError")} />
        );
    }

    if (isLoading || !data) {
        return (
            <Box paddingBlock="space-24" style={{ display: "flex", justifyContent: "center" }}>
                <Loader size="large" title={t("loadingData")} />
            </Box>
        );
    }

    return (
        <AdminTeamVulnerabilitiesProvider data={data} isLoading={isLoading} error={error}>
            <WorkloadDetail workloadId={workloadId} vulnId={vulnId} />
        </AdminTeamVulnerabilitiesProvider>
    );
}
