"use client";
import {Tag, BodyShort,} from "@navikt/ds-react";

interface VulnerabilityWithMultipliers {
    riskScore: number;
    riskScoreMultipliers?: {
        severity: number;
        exposure: number;
        kev: number;
        epss: number;
        production: number;
        old_build_days: number;
        old_build: number;
    };
}

const WorkloadRiskScoreTags = ({vuln, ingressTypes, environment}: {
    vuln: VulnerabilityWithMultipliers,
    ingressTypes?: string[],
    environment?: string
}) => {
    const exposureTagVariant =
        ingressTypes?.indexOf("external") != -1 ? "error" :
            ingressTypes?.indexOf("login") != -1 ? "warning" :
                ingressTypes?.indexOf("internal") != -1 ? "info" : "success"
    const exposureIngress =
        ingressTypes?.indexOf("external") != -1 ? "ekstern" :
            ingressTypes?.indexOf("authenticated") != -1 ? "autentisert" :
                ingressTypes?.indexOf("internal") != -1 ? "intern" : "none"
    
    // Determine environment tag based on environment prefix
    const getEnvironmentTag = () => {
        if (!environment) return null;
        if (environment.startsWith("prod-")) {
            return <RiskScoreTag variant={"warning"} text={"Prod"} />;
        } else if (environment.startsWith("dev-")) {
            return <RiskScoreTag variant={"info"} text={"Dev"} />;
        }
        return null;
    };
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
                    {/* Show environment tag instead of production multiplier tag to avoid duplication */}
                    {getEnvironmentTag()}
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
