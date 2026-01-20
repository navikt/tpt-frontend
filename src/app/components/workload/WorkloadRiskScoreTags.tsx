"use client";
import {Tag} from "@navikt/ds-react";
import { useTranslations } from "next-intl";
import {
    getRiskFactors,
    getTagVariantFromSeverity,
    RiskFactor
} from "@/app/utils/riskFactors";
import type {Vulnerability} from "@/app/types/vulnerabilities";

const WorkloadRiskScoreTags = ({vuln}: {
    vuln: Vulnerability
}) => {
    const t = useTranslations("workload");
    const rootT = useTranslations(); // Root-level translations for riskFactors
    const MAX_TAGS = 4;
    
    const riskFactors = getRiskFactors(vuln, (key: string) => {
        return rootT(key);
    }).filter((factor: RiskFactor) => { return factor.name != "severity" });
    
    return (
        <>
            {riskFactors.length > 0 ? (
                <div>
                    {(() => {
                        const criticalAndHighFactors = riskFactors
                            .filter(factor => factor.impact === "HIGH" || factor.impact === "CRITICAL")
                            .sort((a, b) => {
                                // Sort CRITICAL before HIGH
                                if (a.impact === "CRITICAL" && b.impact !== "CRITICAL") return -1;
                                if (b.impact === "CRITICAL" && a.impact !== "CRITICAL") return 1;
                                // Then sort by contribution descending
                                return b.contribution - a.contribution;
                            });
                        
                        const tagsToShow = criticalAndHighFactors.slice(0, MAX_TAGS);
                        const remainingCount = criticalAndHighFactors.length - MAX_TAGS;
                        
                        return (
                            <>
                                {tagsToShow.map((factor, index) => (
                                    <RiskScoreTag 
                                        key={`${factor.name}-${index}`}
                                        variant={getTagVariantFromSeverity(factor.severity)} 
                                        text={factor.name}
                                    />
                                ))}
                                {remainingCount > 0 && (
                                    <RiskScoreTag 
                                        variant="info"
                                        text={t("moreFactors", { count: remainingCount })}
                                    />
                                )}
                            </>
                        );
                    })()}
                </div>
            ) : null}
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
