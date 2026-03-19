import {
  parsePurlType,
  classifyPackage,
  getPackageDisplayName,
  groupByRemediationAction,
  countOsVulnerabilities,
} from "../packageClassification";
import { Vulnerability } from "@/app/shared/types/vulnerabilities";

const makeVuln = (
  packageName: string,
  packageEcosystem?: string,
  dependencyCategory?: "OS_PACKAGE" | "APPLICATION" | "CONTAINER" | "UNKNOWN"
): Vulnerability => ({
  identifier: "CVE-2025-0001",
  packageName,
  packageEcosystem,
  dependencyCategory,
  riskScore: 80,
});

describe("parsePurlType", () => {
  it("parses deb type", () => {
    expect(parsePurlType("pkg:deb/debian/libssl3@3.0.11")).toBe("deb");
  });

  it("parses apk type", () => {
    expect(parsePurlType("pkg:apk/chainguard/giflib@5.2.2-r13?arch=x86_64")).toBe("apk");
  });

  it("parses rpm type", () => {
    expect(parsePurlType("pkg:rpm/redhat/openssl@1.1.1")).toBe("rpm");
  });

  it("parses npm type", () => {
    expect(parsePurlType("pkg:npm/express@4.18.2")).toBe("npm");
  });

  it("parses maven type", () => {
    expect(parsePurlType("pkg:maven/org.apache.logging.log4j/log4j-core@2.14.1")).toBe("maven");
  });

  it("parses golang type", () => {
    expect(parsePurlType("pkg:golang/stdlib@v1.25.4")).toBe("golang");
  });

  it("parses pypi type", () => {
    expect(parsePurlType("pkg:pypi/requests@2.31.0")).toBe("pypi");
  });

  it("parses nuget type", () => {
    expect(parsePurlType("pkg:nuget/Newtonsoft.Json@13.0.1")).toBe("nuget");
  });

  it("returns null for plain package names", () => {
    expect(parsePurlType("express")).toBeNull();
    expect(parsePurlType("log4j-core")).toBeNull();
    expect(parsePurlType("lodash")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parsePurlType("")).toBeNull();
  });

  it("returns null for malformed purl missing slash", () => {
    expect(parsePurlType("pkg:deb")).toBeNull();
  });
});

describe("classifyPackage", () => {
  describe("OS packages (os-rebuild)", () => {
    it("classifies deb packages as os-rebuild", () => {
      const result = classifyPackage("pkg:deb/debian/libssl3@3.0.11");
      expect(result.category).toBe("os-rebuild");
      expect(result.ecosystemType).toBe("deb");
      expect(result.ecosystemDisplayName).toBe("Debian");
    });

    it("classifies apk packages as os-rebuild", () => {
      const result = classifyPackage("pkg:apk/chainguard/giflib@5.2.2-r13?arch=x86_64&distro=20230214");
      expect(result.category).toBe("os-rebuild");
      expect(result.ecosystemType).toBe("apk");
      expect(result.ecosystemDisplayName).toBe("Alpine/Chainguard");
    });

    it("classifies rpm packages as os-rebuild", () => {
      const result = classifyPackage("pkg:rpm/redhat/openssl@1.1.1");
      expect(result.category).toBe("os-rebuild");
      expect(result.ecosystemDisplayName).toBe("RPM");
    });
  });

  describe("Application dependencies (app-dependency)", () => {
    it("classifies npm packages as app-dependency", () => {
      const result = classifyPackage("pkg:npm/express@4.18.2");
      expect(result.category).toBe("app-dependency");
      expect(result.ecosystemDisplayName).toBe("npm");
    });

    it("classifies maven packages as app-dependency", () => {
      const result = classifyPackage("pkg:maven/org.apache.logging.log4j/log4j-core@2.14.1");
      expect(result.category).toBe("app-dependency");
      expect(result.ecosystemDisplayName).toBe("Maven");
    });

    it("classifies golang packages as app-dependency", () => {
      const result = classifyPackage("pkg:golang/stdlib@v1.25.4");
      expect(result.category).toBe("app-dependency");
      expect(result.ecosystemDisplayName).toBe("Go");
    });

    it("classifies plain package names as app-dependency", () => {
      const result = classifyPackage("express");
      expect(result.category).toBe("app-dependency");
    });

    it("classifies plain names using packageEcosystem fallback", () => {
      const result = classifyPackage("log4j-core", "maven");
      expect(result.category).toBe("app-dependency");
      expect(result.ecosystemDisplayName).toBe("Maven");
    });

    it("classifies unknown purl type as app-dependency", () => {
      const result = classifyPackage("pkg:newformat/something@1.0.0");
      expect(result.category).toBe("app-dependency");
    });
  });

  describe("dependencyCategory backend field takes precedence", () => {
    it("classifies as os-rebuild when dependencyCategory is OS_PACKAGE, regardless of purl", () => {
      // pkg:maven is normally app-dependency, but backend says OS_PACKAGE
      const result = classifyPackage("pkg:maven/org.foo/bar@1.0", "maven", "OS_PACKAGE");
      expect(result.category).toBe("os-rebuild");
    });

    it("classifies as app-dependency when dependencyCategory is APPLICATION", () => {
      const result = classifyPackage("pkg:deb/debian/libssl3@3.0.11", "deb", "APPLICATION");
      expect(result.category).toBe("app-dependency");
    });

    it("classifies CONTAINER as app-dependency", () => {
      const result = classifyPackage("pkg:docker/myimage@sha256:abc", undefined, "CONTAINER");
      expect(result.category).toBe("app-dependency");
    });

    it("classifies UNKNOWN as app-dependency", () => {
      const result = classifyPackage("something", undefined, "UNKNOWN");
      expect(result.category).toBe("app-dependency");
    });

    it("uses packageEcosystem for display name even when dependencyCategory drives category", () => {
      const result = classifyPackage("pkg:deb/debian/libssl3@3.0.11", "deb", "OS_PACKAGE");
      expect(result.category).toBe("os-rebuild");
      expect(result.ecosystemDisplayName).toBe("Debian");
    });
  });
});

describe("getPackageDisplayName", () => {
  it("extracts name from deb purl", () => {
    expect(getPackageDisplayName("pkg:deb/debian/libssl3@3.0.11-1~deb12u2")).toBe("libssl3");
  });

  it("extracts name from apk purl with qualifiers", () => {
    expect(getPackageDisplayName("pkg:apk/chainguard/giflib@5.2.2-r13?arch=x86_64")).toBe("giflib");
  });

  it("extracts name from npm purl", () => {
    expect(getPackageDisplayName("pkg:npm/express@4.18.2")).toBe("express");
  });

  it("extracts name from maven purl with namespace", () => {
    expect(getPackageDisplayName("pkg:maven/org.apache.logging.log4j/log4j-core@2.14.1")).toBe("log4j-core");
  });

  it("returns plain name unchanged", () => {
    expect(getPackageDisplayName("express")).toBe("express");
    expect(getPackageDisplayName("log4j-core")).toBe("log4j-core");
  });
});

describe("groupByRemediationAction", () => {
  it("splits OS and app packages into separate groups", () => {
    const vulns: Vulnerability[] = [
      makeVuln("pkg:deb/debian/libssl3@3.0.11", "deb", "OS_PACKAGE"),
      makeVuln("pkg:deb/debian/curl@7.88.1", "deb", "OS_PACKAGE"),
      makeVuln("pkg:npm/express@4.18.2", "npm", "APPLICATION"),
      makeVuln("express"),
    ];

    const groups = groupByRemediationAction(vulns);
    expect(groups).toHaveLength(2);

    const osGroup = groups.find((g) => g.category === "os-rebuild")!;
    const appGroup = groups.find((g) => g.category === "app-dependency")!;

    expect(osGroup.vulnerabilities).toHaveLength(2);
    expect(appGroup.vulnerabilities).toHaveLength(2);
  });

  it("returns only app group when no OS packages", () => {
    const vulns = [makeVuln("pkg:npm/express@4.18.2", "npm", "APPLICATION"), makeVuln("lodash")];
    const groups = groupByRemediationAction(vulns);
    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe("app-dependency");
  });

  it("returns only OS group when all packages are OS", () => {
    const vulns = [
      makeVuln("pkg:deb/debian/libssl3@3.0.11", "deb", "OS_PACKAGE"),
      makeVuln("pkg:apk/chainguard/zlib@1.2.13", "apk", "OS_PACKAGE"),
    ];
    const groups = groupByRemediationAction(vulns);
    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe("os-rebuild");
  });

  it("collects unique ecosystems per group", () => {
    const vulns = [
      makeVuln("pkg:deb/debian/libssl3@3.0.11", "deb", "OS_PACKAGE"),
      makeVuln("pkg:apk/chainguard/giflib@5.2.2", "apk", "OS_PACKAGE"),
      makeVuln("pkg:deb/debian/curl@7.88.1", "deb", "OS_PACKAGE"),
    ];
    const groups = groupByRemediationAction(vulns);
    const osGroup = groups[0];
    expect(osGroup.ecosystems).toContain("Debian");
    expect(osGroup.ecosystems).toContain("Alpine/Chainguard");
    expect(osGroup.ecosystems).toHaveLength(2);
  });

  it("returns empty array for empty input", () => {
    expect(groupByRemediationAction([])).toHaveLength(0);
  });
});

describe("countOsVulnerabilities", () => {
  it("counts only OS-level vulnerabilities", () => {
    const vulns: Vulnerability[] = [
      makeVuln("pkg:deb/debian/libssl3@3.0.11", "deb", "OS_PACKAGE"),
      makeVuln("pkg:apk/chainguard/giflib@5.2.2", "apk", "OS_PACKAGE"),
      makeVuln("pkg:npm/express@4.18.2", "npm", "APPLICATION"),
      makeVuln("lodash"),
    ];
    expect(countOsVulnerabilities(vulns)).toBe(2);
  });

  it("returns 0 when no OS packages", () => {
    const vulns = [makeVuln("express"), makeVuln("pkg:npm/lodash@4.17.21", "npm", "APPLICATION")];
    expect(countOsVulnerabilities(vulns)).toBe(0);
  });

  it("returns full count when all are OS packages", () => {
    const vulns = [makeVuln("pkg:deb/debian/libssl3", "deb", "OS_PACKAGE"), makeVuln("pkg:rpm/redhat/curl", "rpm", "OS_PACKAGE")];
    expect(countOsVulnerabilities(vulns)).toBe(2);
  });
});
