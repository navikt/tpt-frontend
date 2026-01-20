import type {Vulnerability, RiskScoreFactor} from "../types/vulnerabilities";

export interface RiskFactor {
    name: string;
    description: string;
    contribution: number;
    percentage: number;
    multiplier: number;
    impact: string;
    isSignificant: boolean;
    isNegative: boolean;
    iconName: string; // Store icon name instead of JSX
    severity: "high" | "medium" | "low" | "info";
}

export function getRiskFactors(vuln: Vulnerability, translate?: (key: string) => string): RiskFactor[] {
    const breakdown = vuln.riskScoreBreakdown;

    if (!breakdown?.factors) return [];

    return breakdown.factors
        .filter((factor: RiskScoreFactor) => { return factor.name != "severity" })
        .map((factor: RiskScoreFactor) => {

            // Severity is the base score, not a multiplier
            const isNegative = factor.multiplier >= 1.0;
            const isHighOrCritical = factor.impact === "HIGH" || factor.impact === "CRITICAL";

            return {
                name: getFactorName(factor.name, translate),
                description: factor.explanation,
                contribution: factor.contribution,
                percentage: factor.percentage,
                multiplier: factor.multiplier,
                impact: factor.impact,
                // Other factors: significant if (increasing risk AND high/critical impact) OR (reducing risk with any impact)
                isSignificant: (isNegative && isHighOrCritical) || (!isNegative),
                isNegative: isNegative,
                iconName: getIcon(factor.name),
                severity: getSeverityFromImpactAndMultiplier(factor.impact, factor.multiplier),
            };
        });
}

export function getSeverityColor(severity: "high" | "medium" | "low" | "info"): string {
    switch (severity) {
        case "high":
            return "var(--a-surface-danger-subtle)";
        case "medium":
            return "var(--a-surface-warning-subtle)";
        case "low":
            return "var(--a-surface-success-subtle)";
        case "info":
            return "var(--a-surface-info-subtle)";
    }
}

export function getSeverityIconColor(severity: "high" | "medium" | "low" | "info"): string {
    switch (severity) {
        case "high":
            return "var(--a-icon-danger)";
        case "medium":
            return "var(--a-icon-warning)";
        case "low":
            return "var(--a-icon-success)";
        case "info":
            return "var(--a-icon-info)";
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

export function getSeverityFromImpactAndMultiplier(
    impact: string,
    multiplier: number
): "high" | "medium" | "low" | "info" {
    // If reducing risk (multiplier < 1.0), always show as info/positive
    if (multiplier < 1.0) return "info";

    // If increasing risk, use impact level
    switch (impact) {
        case "CRITICAL":
            return "high";
        case "HIGH":
            return "high";
        case "MEDIUM":
            return "medium";
        case "LOW":
            return "low";
        default:
            console.warn("getSeverityFromImpactAndMultiplier() unknown impact: " + impact)
            return "info";
    }
}

function getIcon(name: string) {
    switch (name) {
        case "severity":
            return "bug";
        case "exposure":
            return "globe";
        case "kev":
            return "xmark-octagon";
        case "epss":
            return "exclamation-triangle";
        case "exploit_reference":
            return "exclamation-triangle";
        case "environment":
            return "cloud";
        case "patch_available":
            return "clock";
        case "build_age":
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
        case "exposure":
            return "Eksponering";
        case "kev":
            return "KEV (Known Exploited)";
        case "epss":
            return "EPSS (Exploit Prediction)";
        case "exploit_reference":
            return "Kode for utnyttelse er offentlig kjent";
        case "environment":
            return "Produksjonsmiljø";
        case "patch_available":
            return "Patch er tilgjengelig";
        case "build_age":
            return "Gammelt bygg";
        default:
            console.error("getFactorName() unknown name: " + name);
            return name;
    }
}

