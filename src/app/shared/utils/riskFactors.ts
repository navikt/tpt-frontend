import type {Vulnerability, RiskScoreFactor} from "../types/vulnerabilities";

export interface RiskFactor {
    name: string;
    description: string;
    points: number;
    maxPoints: number;
    impact: string;
    isSignificant: boolean;
    iconName: string;
    severity: "high" | "medium" | "low" | "info";
}

export function getRiskFactors(vuln: Vulnerability, translate?: (key: string) => string): RiskFactor[] {
    const breakdown = vuln.riskScoreBreakdown;

    if (!breakdown?.factors) return [];

    return breakdown.factors
        .filter((factor: RiskScoreFactor) => { return factor.name != "severity" })
        .map((factor: RiskScoreFactor) => {
            const isHighOrCritical = factor.impact === "HIGH" || factor.impact === "CRITICAL";

            return {
                name: getFactorName(factor.name, translate),
                description: factor.explanation,
                points: factor.points,
                maxPoints: factor.maxPoints,
                impact: factor.impact,
                isSignificant: isHighOrCritical,
                iconName: getIcon(factor.name),
                severity: getSeverityFromImpact(factor.impact),
            };
        });
}

export function getSeverityColor(severity: "high" | "medium" | "low" | "info"): string {
    switch (severity) {
        case "high":
            return "var(--ax-bg-danger-soft)";
        case "medium":
            return "var(--ax-bg-warning-soft)";
        case "low":
            return "var(--ax-bg-success-soft)";
        case "info":
            return "var(--ax-bg-info-soft)";
    }
}

export function getSeverityIconColor(severity: "high" | "medium" | "low" | "info"): string {
    switch (severity) {
        case "high":
            return "var(--ax-text-danger-decoration)";
        case "medium":
            return "var(--ax-text-warning-decoration)";
        case "low":
            return "var(--ax-text-success-decoration)";
        case "info":
            return "var(--ax-text-info-decoration)";
    }
}

export function getTagVariantFromSeverity(severity: "high" | "medium" | "low" | "info"): "error" | "warning" | "info" | "success" {
    switch (severity) {
        case "high":
            return "error";
        case "medium":
            return "warning";
        case "low":
            return "success";
        case "info":
            return "info";
    }
}

export function getSeverityFromImpact(
    impact: string
): "high" | "medium" | "low" | "info" {
    switch (impact) {
        case "CRITICAL":
            return "high";
        case "HIGH":
            return "high";
        case "MEDIUM":
            return "medium";
        case "LOW":
            return "low";
        case "NONE":
            return "info";
        default:
            console.warn("getSeverityFromImpact() unknown impact: " + impact)
            return "info";
    }
}

function getIcon(name: string) {
    switch (name) {
        case "severity":
            return "bug";
        case "exploitation_evidence":
            return "xmark-octagon";
        case "exposure":
            return "globe";
        case "environment":
            return "cloud";
        case "actionability":
            return "clock";
        default:
            console.warn("getIcon() unknown name: " + name)
            return "checkmark-circle";
    }
}

function getFactorName(name: string, translate?: (key: string) => string): string {
    if (translate) {
        return translate(`riskFactors.${name}`);
    }
    
    // Fallback to Norwegian for backwards compatibility
    switch (name) {
        case "severity":
            return "Alvorlighetsgrad";
        case "exploitation_evidence":
            return "Utnyttelsesbevis";
        case "exposure":
            return "Eksponering";
        case "environment":
            return "Miljøkontekst";
        case "actionability":
            return "Handlingsevne";
        default:
            console.error("getFactorName() unknown name: " + name);
            return name;
    }
}

