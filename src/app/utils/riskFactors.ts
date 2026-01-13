import type { Vulnerability, RiskScoreFactor, RiskScoreMultipliers } from "../types/vulnerabilities";

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

interface FactorConfig {
    displayName: string;
    iconName: string;
    getMultiplier: (m: RiskScoreMultipliers) => number;
}

const FACTOR_REGISTRY: Record<string, FactorConfig> = {
    severity: {
        displayName: "Alvorlighetsgrad",
        iconName: "bug",
        getMultiplier: (m) => m.severity ?? 1.0, // Default to 1.0 since it's the base score
    },
    exposure: {
        displayName: "Eksponering",
        iconName: "globe",
        getMultiplier: (m) => m.exposure,
    },
    kev: {
        displayName: "KEV (Known Exploited)",
        iconName: "xmark-octagon",
        getMultiplier: (m) => m.kev,
    },
    epss: {
        displayName: "EPSS (Exploit Prediction)",
        iconName: "exclamation-triangle",
        getMultiplier: (m) => m.epss,
    },
    production: {
        displayName: "Produksjonsmiljø",
        iconName: "cloud",
        getMultiplier: (m) => m.production,
    },
    old_build: {
        displayName: "Gammelt bygg",
        iconName: "clock",
        getMultiplier: (m) => m.old_build,
    },
};

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
            return "info";
    }
}

export function getRiskFactors(vuln: Vulnerability): RiskFactor[] {
    const breakdown = vuln.riskScoreBreakdown;

    if (!breakdown?.factors) return [];

    return breakdown.factors.map((factor: RiskScoreFactor) => {
        const config = FACTOR_REGISTRY[factor.name];
        
        // Severity is the base score, not a multiplier
        const isSeverity = factor.name === "severity";
        const isNegative = factor.multiplier >= 1.0;
        const isHighOrCritical = factor.impact === "HIGH" || factor.impact === "CRITICAL";

        return {
            name: config?.displayName || factor.name.charAt(0).toUpperCase() + factor.name.slice(1).replace(/_/g, " "),
            description: factor.explanation,
            contribution: factor.contribution,
            percentage: factor.percentage,
            multiplier: factor.multiplier,
            impact: factor.impact,
            // Severity is always significant (it's the base score)
            // Other factors: significant if (increasing risk AND high/critical impact) OR (reducing risk with any impact)
            isSignificant: isSeverity || (isNegative && isHighOrCritical) || (!isNegative),
            isNegative: isNegative,
            iconName: config?.iconName || "checkmark-circle",
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
