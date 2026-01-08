"use client";
import {Tag, BodyShort,} from "@navikt/ds-react";

interface VulnerabilityWithMultipliers {
    riskScore: number;
    riskScoreMultipliers?: {
        base_high: number;
        exposure: number;
        kev: number;
        epss: number;
        production: number;
        old_build_days: number;
        old_build: number;
    };
}

const WorkloadRiskScoreTags = ({vuln, ingressTypes}: {
    vuln: VulnerabilityWithMultipliers,
    ingressTypes?: string[]
}) => {
    const exposureTagVariant =
        ingressTypes?.indexOf("external") != -1 ? "error" :
            ingressTypes?.indexOf("login") != -1 ? "warning" :
                ingressTypes?.indexOf("internal") != -1 ? "info" : "success"
    const exposureIngress =
        ingressTypes?.indexOf("external") != -1 ? "ekstern" :
            ingressTypes?.indexOf("authenticated") != -1 ? "autentisert" :
                ingressTypes?.indexOf("internal") != -1 ? "intern" : "none"
    return (
        <>
            {vuln.riskScoreMultipliers ? (
                <div>
                    {vuln.riskScoreMultipliers.exposure > 1.0 ? (
                        <RiskScoreTag variant={exposureTagVariant} text={"Ingress " + exposureIngress} />): ("")}
                    {vuln.riskScoreMultipliers.kev > 1.0 ? (
                        <RiskScoreTag variant={"error"} text={"KEV"} />): ("")}
                    {vuln.riskScoreMultipliers.epss > 1.0 ? (
                        <RiskScoreTag variant={"warning"} text={"EPSS"} />): ("")}
                    {vuln.riskScoreMultipliers.production > 1.0 ? (
                        <RiskScoreTag variant={"warning"} text={"Prod"} />): ("")}
                    {vuln.riskScoreMultipliers.old_build > 1.0 ? (
                        <RiskScoreTag variant={"warning"} text={"Gammelt bygg"} />): ("")}
                </div>
            ) : (
                <BodyShort size="small">Beregningsdata ikke tilgjengelig</BodyShort>
            )}
        </>
    );
};

const RiskScoreTag = ({variant, text}: {
    variant: "error" | "warning" | "info" | "success",
    text: string,
}) => {
    return (
        <Tag variant={variant} size={"small"} style={{marginRight:"1em"}}>{text}</Tag>
    )
}
export default WorkloadRiskScoreTags;
