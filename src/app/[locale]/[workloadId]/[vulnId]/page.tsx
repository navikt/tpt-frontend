"use client";
import { useParams } from "next/navigation";
import { WorkloadDetail } from "@/app/modules/vulnerabilities/components/WorkloadDetail";

export default function WorkloadDetailPage() {
    const params = useParams();
    const workloadId = params.workloadId as string;
    const vulnId = params.vulnId as string;

    return <WorkloadDetail workloadId={workloadId} vulnId={vulnId} />;
}
