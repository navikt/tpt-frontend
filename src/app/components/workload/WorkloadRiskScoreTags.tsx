"use client";
import {Tag, BodyShort,} from "@navikt/ds-react";
import { getRiskFactors, getTagVariantFromSeverity } from "@/app/utils/riskFactors";
import type { Vulnerability } from "@/app/types/vulnerabilities";

const WorkloadRiskScoreTags = ({vuln}: {
    vuln: Vulnerability
}) => {
    const MAX_TAGS = 4;
    
    const riskFactors = getRiskFactors(vuln);
    
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
                                        text={`+${remainingCount} flere`}
                                    />
                                )}
                            </>
                        );
                    })()}
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
