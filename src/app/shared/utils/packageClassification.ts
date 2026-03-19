/**
 * Utilities for classifying packages by their remediation strategy.
 *
 * Primary signal: `dependencyCategory` from the backend (OS_PACKAGE / APPLICATION / CONTAINER / UNKNOWN).
 * Secondary signal: `packageEcosystem` (raw PURL type, e.g. deb, npm, cargo) for display within a group.
 * Fallback: client-side purl parsing of `packageName` when backend fields are absent.
 *
 * Purl format: pkg:<type>/<namespace>/<name>@<version>[?qualifiers]
 * Examples:
 *   pkg:deb/debian/libssl3@3.0.11-1~deb12u2
 *   pkg:apk/chainguard/giflib@5.2.2-r13?arch=x86_64
 *   pkg:npm/express@4.18.2
 *   pkg:golang/stdlib@v1.25.4
 */

import { Vulnerability } from "@/app/shared/types/vulnerabilities";

export type RemediationCategory = "os-rebuild" | "app-dependency";

export interface PackageInfo {
  category: RemediationCategory;
  ecosystemType: string;
  ecosystemDisplayName: string;
}

export interface RemediationGroup {
  category: RemediationCategory;
  label: string;
  ecosystems: string[];
  vulnerabilities: Vulnerability[];
}

const OS_ECOSYSTEMS: Record<string, string> = {
  deb: "Debian",
  apk: "Alpine/Chainguard",
  rpm: "RPM",
  ebuild: "Gentoo",
  opkg: "OpenWRT",
};

const APP_ECOSYSTEMS: Record<string, string> = {
  npm: "npm",
  maven: "Maven",
  golang: "Go",
  pypi: "Python",
  nuget: "NuGet",
  cargo: "Rust",
  gem: "Ruby",
  composer: "PHP",
  cocoapods: "CocoaPods",
  swift: "Swift",
  hex: "Elixir",
  pub: "Dart",
  conda: "Conda",
  cran: "R",
};

/** All known ecosystem display name maps combined. */
const ALL_ECOSYSTEMS: Record<string, string> = { ...OS_ECOSYSTEMS, ...APP_ECOSYSTEMS };

/**
 * Parse the ecosystem type from a purl-formatted package name.
 * Returns null if the string is not in purl format.
 */
export function parsePurlType(packageName: string): string | null {
  if (!packageName.startsWith("pkg:")) return null;
  const withoutPrefix = packageName.slice(4);
  const slashIndex = withoutPrefix.indexOf("/");
  if (slashIndex === -1) return null;
  return withoutPrefix.slice(0, slashIndex).toLowerCase();
}

/**
 * Resolve a human-readable display name from ecosystem type strings.
 * Checks packageEcosystem first (most accurate), then purl type, then falls back to raw value.
 */
function resolveDisplayName(packageEcosystem?: string, purlType?: string | null): string {
  if (packageEcosystem) {
    const eco = packageEcosystem.toLowerCase();
    if (eco in ALL_ECOSYSTEMS) return ALL_ECOSYSTEMS[eco]!;
    return packageEcosystem;
  }
  if (purlType) {
    return ALL_ECOSYSTEMS[purlType] ?? purlType;
  }
  return "Unknown";
}

/**
 * Classify a vulnerability's package into a remediation category.
 *
 * Resolution order:
 * 1. `dependencyCategory` from backend (OS_PACKAGE → os-rebuild, APPLICATION → app-dependency, etc.)
 * 2. Client-side purl parsing of `packageName`
 * 3. `packageEcosystem` field as last resort
 *
 * `packageEcosystem` is always used for the display name regardless of which path resolved the category.
 */
export function classifyPackage(
  packageName: string,
  packageEcosystem?: string,
  dependencyCategory?: "OS_PACKAGE" | "APPLICATION" | "CONTAINER" | "UNKNOWN"
): PackageInfo {
  const purlType = parsePurlType(packageName);
  const ecosystemType = packageEcosystem?.toLowerCase() ?? purlType ?? "unknown";
  const ecosystemDisplayName = resolveDisplayName(packageEcosystem, purlType);

  // 1. Prefer backend-provided category
  if (dependencyCategory) {
    if (dependencyCategory === "OS_PACKAGE") {
      return { category: "os-rebuild", ecosystemType, ecosystemDisplayName };
    }
    // APPLICATION, CONTAINER, UNKNOWN all map to app-dependency in the UI
    return { category: "app-dependency", ecosystemType, ecosystemDisplayName };
  }

  // 2. Fall back to purl type from packageName
  if (purlType) {
    if (purlType in OS_ECOSYSTEMS) {
      return { category: "os-rebuild", ecosystemType: purlType, ecosystemDisplayName };
    }
    return { category: "app-dependency", ecosystemType: purlType, ecosystemDisplayName };
  }

  // 3. Fall back to packageEcosystem
  if (packageEcosystem) {
    const eco = packageEcosystem.toLowerCase();
    if (eco in OS_ECOSYSTEMS) {
      return { category: "os-rebuild", ecosystemType: eco, ecosystemDisplayName };
    }
    return { category: "app-dependency", ecosystemType: eco, ecosystemDisplayName };
  }

  return { category: "app-dependency", ecosystemType: "unknown", ecosystemDisplayName: packageName };
}

/**
 * Extract the short package name from a purl string (without version/qualifiers).
 * Falls back to the full packageName if not in purl format.
 *
 * Examples:
 *   "pkg:deb/debian/libssl3@3.0.11" → "libssl3"
 *   "pkg:npm/express@4.18.2" → "express"
 *   "express" → "express"
 */
export function getPackageDisplayName(packageName: string): string {
  if (!packageName.startsWith("pkg:")) return packageName;
  const withoutPrefix = packageName.slice(4);
  const parts = withoutPrefix.split("/");
  if (parts.length < 2) return packageName;
  const lastPart = parts[parts.length - 1] ?? packageName;
  return (lastPart.split("@")[0] ?? lastPart).split("?")[0] ?? lastPart;
}

/**
 * Group a list of vulnerabilities by remediation action (os-rebuild vs app-dependency).
 * Groups with no vulnerabilities are omitted.
 */
export function groupByRemediationAction(
  vulnerabilities: Vulnerability[]
): RemediationGroup[] {
  const osGroup: RemediationGroup = {
    category: "os-rebuild",
    label: "os-rebuild",
    ecosystems: [],
    vulnerabilities: [],
  };
  const appGroup: RemediationGroup = {
    category: "app-dependency",
    label: "app-dependency",
    ecosystems: [],
    vulnerabilities: [],
  };

  for (const vuln of vulnerabilities) {
    const info = classifyPackage(vuln.packageName, vuln.packageEcosystem, vuln.dependencyCategory);
    if (info.category === "os-rebuild") {
      osGroup.vulnerabilities.push(vuln);
      if (!osGroup.ecosystems.includes(info.ecosystemDisplayName)) {
        osGroup.ecosystems.push(info.ecosystemDisplayName);
      }
    } else {
      appGroup.vulnerabilities.push(vuln);
      if (!appGroup.ecosystems.includes(info.ecosystemDisplayName)) {
        appGroup.ecosystems.push(info.ecosystemDisplayName);
      }
    }
  }

  const groups: RemediationGroup[] = [];
  if (osGroup.vulnerabilities.length > 0) groups.push(osGroup);
  if (appGroup.vulnerabilities.length > 0) groups.push(appGroup);
  return groups;
}

/**
 * Count how many vulnerabilities are OS-level (fixable by base image rebuild).
 */
export function countOsVulnerabilities(vulnerabilities: Vulnerability[]): number {
  return vulnerabilities.filter(
    (v) => classifyPackage(v.packageName, v.packageEcosystem, v.dependencyCategory).category === "os-rebuild"
  ).length;
}
