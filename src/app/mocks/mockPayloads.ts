import type { VulnerabilitiesResponse } from "@/app/shared/types/vulnerabilities";
import type { SlaOverdueData } from "@/app/shared/hooks/useSlaOverdue";

// ---------------------------------------------------------------------------
// mockVulnerabilitiesPayload
// Shape: VulnerabilitiesResponse (teams → workloads → vulnerabilities)
// Used by: GET /api/applications when MOCKS_ENABLED=true
// ---------------------------------------------------------------------------
export const mockVulnerabilitiesPayload: VulnerabilitiesResponse = {
  userRole: "ADMIN",
  teams: [
    {
      team: "frontend-team",
      workloads: [
        {
          id: "workload-frontend-prod",
          name: "tpt-frontend",
          workloadType: "app",
          environment: "prod-gcp",
          repository: "navikt/tpt-frontend",
          lastDeploy: "2025-11-27T10:00:00Z",
          vulnerabilities: [
            {
              identifier: "CVE-2025-0001",
              packageName: "pkg:npm/express@4.18.2",
              packageEcosystem: "npm",
              dependencyCategory: "APPLICATION",
              dependencyScope: "RUNTIME",
              description:
                "A buffer overflow vulnerability in the X.509 certificate parser could allow remote code execution.",
              summary: "Buffer overflow in X.509 certificate parser.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0001",
              publishedAt: "2025-01-15T00:00:00Z",
              cvssScore: 9.8,
              riskScore: 88,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 25, maxPoints: 25, explanation: "Base severity: CRITICAL (25/25 points)", impact: "CRITICAL" },
                  { name: "exploitation_evidence", points: 30, maxPoints: 30, explanation: "Listed in CISA KEV catalog", impact: "CRITICAL" },
                  { name: "exposure", points: 20, maxPoints: 25, explanation: "External ingress without authentication", impact: "HIGH" },
                  { name: "environment", points: 10, maxPoints: 15, explanation: "Production environment", impact: "HIGH" },
                  { name: "actionability", points: 3, maxPoints: 10, explanation: "No patch available", impact: "LOW" },
                ],
                totalScore: 88,
              },
            },
            {
              identifier: "CVE-2025-0002",
              packageName: "pkg:npm/lodash@4.17.21",
              packageEcosystem: "npm",
              dependencyCategory: "APPLICATION",
              dependencyScope: "RUNTIME",
              description:
                "Prototype pollution vulnerability allowing arbitrary property injection.",
              summary: "Prototype pollution in lodash.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0002",
              publishedAt: "2025-02-03T00:00:00Z",
              cvssScore: 7.5,
              riskScore: 42,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 15, maxPoints: 25, explanation: "Base severity: HIGH (15/25 points)", impact: "HIGH" },
                  { name: "exploitation_evidence", points: 10, maxPoints: 30, explanation: "High EPSS score", impact: "MEDIUM" },
                  { name: "exposure", points: 10, maxPoints: 25, explanation: "External ingress with authentication", impact: "MEDIUM" },
                  { name: "environment", points: 5, maxPoints: 15, explanation: "Production environment", impact: "MEDIUM" },
                  { name: "actionability", points: 2, maxPoints: 10, explanation: "No patch available", impact: "LOW" },
                ],
                totalScore: 42,
              },
            },
            {
              identifier: "CVE-2025-0010",
              packageName: "pkg:npm/semver@7.5.3",
              packageEcosystem: "npm",
              dependencyCategory: "APPLICATION",
              dependencyScope: "DEVELOPMENT",
              description:
                "Regular expression denial of service (ReDoS) in semver when parsing untrusted version strings.",
              summary: "ReDoS in semver version string parsing.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0010",
              publishedAt: "2025-03-10T00:00:00Z",
              cvssScore: 5.3,
              riskScore: 8,
              riskScoreBreakdown: {
                suppressed: true,
                factors: [
                  { name: "severity", points: 8, maxPoints: 25, explanation: "Base severity: MEDIUM (8/25 points)", impact: "MEDIUM" },
                  { name: "exploitation_evidence", points: 5, maxPoints: 30, explanation: "Low EPSS score", impact: "LOW" },
                  { name: "exposure", points: 10, maxPoints: 25, explanation: "External ingress with authentication", impact: "MEDIUM" },
                  { name: "environment", points: 5, maxPoints: 15, explanation: "Production environment", impact: "MEDIUM" },
                  { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" },
                ],
                totalScore: 8,
              },
            },
          ],
        },
        {
          id: "workload-frontend-dev",
          name: "tpt-frontend",
          workloadType: "app",
          environment: "dev-gcp",
          repository: "navikt/tpt-frontend",
          lastDeploy: "2025-11-27T10:00:00Z",
          vulnerabilities: [
            {
              identifier: "CVE-2025-0001",
              packageName: "pkg:npm/express@4.18.2",
              packageEcosystem: "npm",
              dependencyCategory: "APPLICATION",
              dependencyScope: "RUNTIME",
              description:
                "A buffer overflow vulnerability in the X.509 certificate parser could allow remote code execution.",
              summary: "Buffer overflow in X.509 certificate parser.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0001",
              publishedAt: "2025-01-15T00:00:00Z",
              cvssScore: 9.8,
              riskScore: 68,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 25, maxPoints: 25, explanation: "Base severity: CRITICAL (25/25 points)", impact: "CRITICAL" },
                  { name: "exploitation_evidence", points: 30, maxPoints: 30, explanation: "Listed in CISA KEV catalog", impact: "CRITICAL" },
                  { name: "exposure", points: 10, maxPoints: 25, explanation: "External ingress with authentication", impact: "MEDIUM" },
                  { name: "environment", points: 0, maxPoints: 15, explanation: "Development environment", impact: "NONE" },
                  { name: "actionability", points: 3, maxPoints: 10, explanation: "No patch available", impact: "LOW" },
                ],
                totalScore: 68,
              },
            },
            {
              identifier: "CVE-2025-0002",
              packageName: "pkg:npm/lodash@4.17.21",
              packageEcosystem: "npm",
              dependencyCategory: "APPLICATION",
              dependencyScope: "RUNTIME",
              description:
                "Prototype pollution vulnerability allowing arbitrary property injection.",
              summary: "Prototype pollution in lodash.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0002",
              publishedAt: "2025-02-03T00:00:00Z",
              cvssScore: 7.5,
              riskScore: 32,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 15, maxPoints: 25, explanation: "Base severity: HIGH (15/25 points)", impact: "HIGH" },
                  { name: "exploitation_evidence", points: 10, maxPoints: 30, explanation: "High EPSS score", impact: "MEDIUM" },
                  { name: "exposure", points: 5, maxPoints: 25, explanation: "Internal ingress", impact: "LOW" },
                  { name: "environment", points: 0, maxPoints: 15, explanation: "Development environment", impact: "NONE" },
                  { name: "actionability", points: 2, maxPoints: 10, explanation: "No patch available", impact: "LOW" },
                ],
                totalScore: 32,
              },
            },
          ],
        },
        {
          id: "workload-api-gateway-dev",
          name: "api-gateway",
          workloadType: "app",
          environment: "dev-gcp",
          repository: "navikt/api-gateway",
          lastDeploy: "2025-11-26T10:00:00Z",
          vulnerabilities: [
            {
              identifier: "CVE-2021-44228",
              name: "Log4Shell",
              packageName: "pkg:maven/org.apache.logging.log4j/log4j-core@2.14.1",
              packageEcosystem: "maven",
              dependencyCategory: "APPLICATION",
              dependencyScope: "RUNTIME",
              description:
                "Remote code execution via JNDI lookup in log messages (Log4Shell).",
              summary: "JNDI injection leading to remote code execution in Log4j.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2021-44228",
              publishedAt: "2021-12-10T00:00:00Z",
              cvssScore: 10.0,
              riskScore: 78,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 25, maxPoints: 25, explanation: "Base severity: CRITICAL (25/25 points)", impact: "CRITICAL" },
                  { name: "exploitation_evidence", points: 30, maxPoints: 30, explanation: "Listed in CISA KEV catalog", impact: "CRITICAL" },
                  { name: "exposure", points: 15, maxPoints: 25, explanation: "Internal ingress", impact: "MEDIUM" },
                  { name: "environment", points: 0, maxPoints: 15, explanation: "Development environment", impact: "NONE" },
                  { name: "actionability", points: 8, maxPoints: 10, explanation: "Patch available, ransomware use known", impact: "HIGH" },
                ],
                totalScore: 78,
              },
            },
          ],
        },
        {
          id: "workload-api-gateway-prod",
          name: "api-gateway",
          workloadType: "app",
          environment: "prod-gcp",
          repository: "navikt/api-gateway",
          lastDeploy: "2025-11-26T10:00:00Z",
          vulnerabilities: [
            {
              identifier: "CVE-2021-44228",
              name: "Log4Shell",
              packageName: "pkg:maven/org.apache.logging.log4j/log4j-core@2.14.1",
              packageEcosystem: "maven",
              dependencyCategory: "APPLICATION",
              dependencyScope: "RUNTIME",
              description:
                "Remote code execution via JNDI lookup in log messages (Log4Shell).",
              summary: "JNDI injection leading to remote code execution in Log4j.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2021-44228",
              publishedAt: "2021-12-10T00:00:00Z",
              cvssScore: 10.0,
              riskScore: 93,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 25, maxPoints: 25, explanation: "Base severity: CRITICAL (25/25 points)", impact: "CRITICAL" },
                  { name: "exploitation_evidence", points: 30, maxPoints: 30, explanation: "Listed in CISA KEV catalog", impact: "CRITICAL" },
                  { name: "exposure", points: 15, maxPoints: 25, explanation: "Internal ingress", impact: "MEDIUM" },
                  { name: "environment", points: 15, maxPoints: 15, explanation: "Production environment, old deploy", impact: "HIGH" },
                  { name: "actionability", points: 8, maxPoints: 10, explanation: "Patch available, ransomware use known", impact: "HIGH" },
                ],
                totalScore: 93,
              },
            },
          ],
        },
      ],
    },
    {
      team: "backend-team",
      workloads: [
        {
          id: "workload-user-service-prod",
          name: "user-service",
          workloadType: "app",
          environment: "prod-gcp",
          repository: "navikt/user-service",
          lastDeploy: "2025-11-25T10:00:00Z",
          vulnerabilities: [
            {
              identifier: "CVE-2025-0004",
              packageName: "pkg:maven/org.springframework/spring-core@5.3.27",
              packageEcosystem: "maven",
              dependencyCategory: "APPLICATION",
              dependencyScope: "RUNTIME",
              description: "SQL injection vulnerability in parameter binding.",
              summary: "SQL injection in Spring Framework parameter binding.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0004",
              publishedAt: "2025-03-01T00:00:00Z",
              cvssScore: 6.5,
              dependabotUpdatePullRequestUrl:
                "https://github.com/navikt/user-service/pull/42",
              riskScore: 18,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 8, maxPoints: 25, explanation: "Base severity: MEDIUM (8/25 points)", impact: "MEDIUM" },
                  { name: "exploitation_evidence", points: 0, maxPoints: 30, explanation: "No exploitation evidence", impact: "NONE" },
                  { name: "exposure", points: 0, maxPoints: 25, explanation: "No ingress", impact: "NONE" },
                  { name: "environment", points: 5, maxPoints: 15, explanation: "Production environment", impact: "MEDIUM" },
                  { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" },
                ],
                totalScore: 18,
              },
            },
          ],
        },
        {
          // workloadType "job" — no lastDeploy
          id: "workload-util-thing-dev",
          name: "util-thing",
          workloadType: "job",
          environment: "dev-gcp",
          repository: "navikt/util-thing",
          vulnerabilities: [
            {
              identifier: "CVE-2025-61727",
              packageName: "pkg:golang/stdlib@v1.25.4",
              packageEcosystem: "golang",
              dependencyCategory: "APPLICATION",
              description:
                "An excluded subdomain constraint in a certificate chain does not restrict the usage of wildcard SANs in the leaf certificate.",
              summary: "Wildcard SAN not restricted by subdomain exclusion constraint in Go stdlib.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-61727",
              publishedAt: "2025-06-15T00:00:00Z",
              cvssScore: 5.3,
              riskScore: 15,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 8, maxPoints: 25, explanation: "Base severity: MEDIUM (8/25 points)", impact: "MEDIUM" },
                  { name: "exploitation_evidence", points: 0, maxPoints: 30, explanation: "No exploitation evidence", impact: "NONE" },
                  { name: "exposure", points: 0, maxPoints: 25, explanation: "No ingress", impact: "NONE" },
                  { name: "environment", points: 0, maxPoints: 15, explanation: "No environment context", impact: "NONE" },
                  { name: "actionability", points: 7, maxPoints: 10, explanation: "Patch available", impact: "HIGH" },
                ],
                totalScore: 15,
              },
            },
            {
              identifier: "CVE-2025-61729",
              packageName: "pkg:golang/stdlib@v1.25.4",
              packageEcosystem: "golang",
              dependencyCategory: "APPLICATION",
              description:
                "Within HostnameError.Error(), when constructing an error string, there is no limit to the number of hosts that will be printed out.",
              summary: "Unbounded host list in HostnameError.Error() may cause excessive memory use.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-61729",
              publishedAt: "2025-06-15T00:00:00Z",
              cvssScore: 7.5,
              riskScore: 28,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 18, maxPoints: 25, explanation: "Base severity: HIGH (18/25 points)", impact: "HIGH" },
                  { name: "exploitation_evidence", points: 0, maxPoints: 30, explanation: "No exploitation evidence", impact: "NONE" },
                  { name: "exposure", points: 0, maxPoints: 25, explanation: "No ingress", impact: "NONE" },
                  { name: "environment", points: 0, maxPoints: 15, explanation: "No environment context", impact: "NONE" },
                  { name: "actionability", points: 10, maxPoints: 10, explanation: "Patch available", impact: "HIGH" },
                ],
                totalScore: 28,
              },
            },
          ],
        },
        {
          id: "workload-payment-service-prod",
          name: "payment-service",
          workloadType: "app",
          environment: "prod-gcp",
          repository: "navikt/payment-service",
          lastDeploy: "2025-10-01T08:00:00Z",
          vulnerabilities: [
            {
              identifier: "CVE-2024-32002",
              packageName: "pkg:deb/debian/libssl3@3.0.11-1~deb12u2",
              packageEcosystem: "deb",
              dependencyCategory: "OS_PACKAGE",
              description:
                "OpenSSL vulnerability in X.509 certificate verification, specifically in name constraint checking.",
              summary: "Incorrect name constraint checking in OpenSSL X.509 verification.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2024-32002",
              publishedAt: "2024-05-01T00:00:00Z",
              cvssScore: 9.0,
              riskScore: 82,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 25, maxPoints: 25, explanation: "Base severity: CRITICAL (25/25 points)", impact: "CRITICAL" },
                  { name: "exploitation_evidence", points: 20, maxPoints: 30, explanation: "High EPSS score", impact: "HIGH" },
                  { name: "exposure", points: 20, maxPoints: 25, explanation: "External ingress without authentication", impact: "HIGH" },
                  { name: "environment", points: 10, maxPoints: 15, explanation: "Production environment", impact: "HIGH" },
                  { name: "actionability", points: 7, maxPoints: 10, explanation: "Patch available via base image update", impact: "HIGH" },
                ],
                totalScore: 82,
              },
            },
            {
              identifier: "CVE-2024-0727",
              packageName: "pkg:deb/debian/libcrypto3@3.0.11-1~deb12u2",
              packageEcosystem: "deb",
              dependencyCategory: "OS_PACKAGE",
              description:
                "Processing a maliciously formatted PKCS12 file may lead OpenSSL to crash, causing a potential denial of service.",
              summary: "Denial of service via malformed PKCS12 file in OpenSSL.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2024-0727",
              publishedAt: "2024-01-25T00:00:00Z",
              cvssScore: 7.5,
              riskScore: 76,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 20, maxPoints: 25, explanation: "Base severity: HIGH (20/25 points)", impact: "HIGH" },
                  { name: "exploitation_evidence", points: 15, maxPoints: 30, explanation: "Proof-of-concept available", impact: "MEDIUM" },
                  { name: "exposure", points: 20, maxPoints: 25, explanation: "External ingress without authentication", impact: "HIGH" },
                  { name: "environment", points: 10, maxPoints: 15, explanation: "Production environment", impact: "HIGH" },
                  { name: "actionability", points: 11, maxPoints: 10, explanation: "Patch available via base image update", impact: "HIGH" },
                ],
                totalScore: 76,
              },
            },
            {
              identifier: "CVE-2023-44487",
              name: "HTTP/2 Rapid Reset",
              packageName: "pkg:deb/debian/nghttp2@1.52.0-1",
              packageEcosystem: "deb",
              dependencyCategory: "OS_PACKAGE",
              description:
                "HTTP/2 Rapid Reset Attack allows denial of service via rapid stream creation and cancellation.",
              summary: "Denial of service via HTTP/2 rapid stream reset (Rapid Reset Attack).",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2023-44487",
              publishedAt: "2023-10-10T00:00:00Z",
              cvssScore: 7.5,
              riskScore: 88,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 25, maxPoints: 25, explanation: "Base severity: CRITICAL (25/25 points)", impact: "CRITICAL" },
                  { name: "exploitation_evidence", points: 30, maxPoints: 30, explanation: "Listed in CISA KEV catalog", impact: "CRITICAL" },
                  { name: "exposure", points: 20, maxPoints: 25, explanation: "External ingress without authentication", impact: "HIGH" },
                  { name: "environment", points: 10, maxPoints: 15, explanation: "Production environment", impact: "HIGH" },
                  { name: "actionability", points: 3, maxPoints: 10, explanation: "Patch available via base image update", impact: "LOW" },
                ],
                totalScore: 88,
              },
            },
            {
              identifier: "CVE-2024-45338",
              packageName: "pkg:deb/debian/curl@7.88.1-10+deb12u5",
              packageEcosystem: "deb",
              dependencyCategory: "OS_PACKAGE",
              description:
                "An attacker can cause unexpected data to be retrieved from a server by injecting a newline character into the URL.",
              summary: "Newline injection in curl URL handling allows unexpected data retrieval.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2024-45338",
              publishedAt: "2024-12-11T00:00:00Z",
              cvssScore: 6.5,
              riskScore: 79,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 22, maxPoints: 25, explanation: "Base severity: HIGH (22/25 points)", impact: "HIGH" },
                  { name: "exploitation_evidence", points: 15, maxPoints: 30, explanation: "High EPSS score", impact: "MEDIUM" },
                  { name: "exposure", points: 20, maxPoints: 25, explanation: "External ingress without authentication", impact: "HIGH" },
                  { name: "environment", points: 10, maxPoints: 15, explanation: "Production environment", impact: "HIGH" },
                  { name: "actionability", points: 12, maxPoints: 10, explanation: "Patch available via base image update", impact: "HIGH" },
                ],
                totalScore: 79,
              },
            },
            {
              identifier: "CVE-2024-12797",
              packageName: "pkg:apk/chainguard/giflib@5.2.2-r13?arch=x86_64&distro=20230214",
              packageEcosystem: "apk",
              dependencyCategory: "OS_PACKAGE",
              description:
                "A buffer overflow in giflib when processing specially crafted GIF images.",
              summary: "Buffer overflow in giflib GIF image processing.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2024-12797",
              publishedAt: "2024-12-20T00:00:00Z",
              cvssScore: 9.1,
              riskScore: 80,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 25, maxPoints: 25, explanation: "Base severity: CRITICAL (25/25 points)", impact: "CRITICAL" },
                  { name: "exploitation_evidence", points: 15, maxPoints: 30, explanation: "Proof-of-concept available", impact: "MEDIUM" },
                  { name: "exposure", points: 20, maxPoints: 25, explanation: "External ingress without authentication", impact: "HIGH" },
                  { name: "environment", points: 10, maxPoints: 15, explanation: "Production environment", impact: "HIGH" },
                  { name: "actionability", points: 10, maxPoints: 10, explanation: "Patch available via base image update", impact: "HIGH" },
                ],
                totalScore: 80,
              },
            },
            {
              identifier: "CVE-2024-56406",
              packageName: "pkg:npm/express@4.18.2",
              packageEcosystem: "npm",
              dependencyCategory: "APPLICATION",
              dependencyScope: "RUNTIME",
              description:
                "Path traversal vulnerability in Express.js static file serving middleware.",
              summary: "Path traversal in Express.js static file serving.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2024-56406",
              publishedAt: "2024-11-20T00:00:00Z",
              cvssScore: 9.1,
              riskScore: 83,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 25, maxPoints: 25, explanation: "Base severity: CRITICAL (25/25 points)", impact: "CRITICAL" },
                  { name: "exploitation_evidence", points: 20, maxPoints: 30, explanation: "High EPSS score", impact: "HIGH" },
                  { name: "exposure", points: 20, maxPoints: 25, explanation: "External ingress without authentication", impact: "HIGH" },
                  { name: "environment", points: 10, maxPoints: 15, explanation: "Production environment", impact: "HIGH" },
                  { name: "actionability", points: 8, maxPoints: 10, explanation: "Patch available: upgrade to 4.21.1", impact: "HIGH" },
                ],
                totalScore: 83,
              },
            },
            {
              identifier: "CVE-2025-0020",
              packageName: "pkg:docker/navikt/payment-service@sha256:abc123",
              packageEcosystem: "docker",
              dependencyCategory: "CONTAINER",
              description:
                "The base container image uses a version of the runtime with known vulnerabilities.",
              summary: "Vulnerable runtime version in container base image.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0020",
              publishedAt: "2025-04-01T00:00:00Z",
              cvssScore: 8.1,
              riskScore: 71,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 20, maxPoints: 25, explanation: "Base severity: HIGH (20/25 points)", impact: "HIGH" },
                  { name: "exploitation_evidence", points: 15, maxPoints: 30, explanation: "Proof-of-concept available", impact: "MEDIUM" },
                  { name: "exposure", points: 20, maxPoints: 25, explanation: "External ingress without authentication", impact: "HIGH" },
                  { name: "environment", points: 10, maxPoints: 15, explanation: "Production environment", impact: "HIGH" },
                  { name: "actionability", points: 6, maxPoints: 10, explanation: "Patch available via base image rebuild", impact: "MEDIUM" },
                ],
                totalScore: 71,
              },
            },
            {
              identifier: "CVE-2025-0021",
              packageName: "unknown-internal-lib@1.0.0",
              dependencyCategory: "UNKNOWN",
              description:
                "Vulnerability in an internal library with an unrecognized package type.",
              summary: "Vulnerability in library with unknown package ecosystem.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0021",
              publishedAt: "2025-05-01T00:00:00Z",
              riskScore: 35,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 15, maxPoints: 25, explanation: "Base severity: HIGH (15/25 points)", impact: "HIGH" },
                  { name: "exploitation_evidence", points: 0, maxPoints: 30, explanation: "No exploitation evidence", impact: "NONE" },
                  { name: "exposure", points: 10, maxPoints: 25, explanation: "External ingress without authentication", impact: "HIGH" },
                  { name: "environment", points: 5, maxPoints: 15, explanation: "Production environment", impact: "MEDIUM" },
                  { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" },
                ],
                totalScore: 35,
              },
            },
          ],
        },
      ],
    },
    // --- Extra teams for chart/scroll testing ---
    {
      team: "security-team",
      workloads: [
        {
          id: "workload-security-scanner-prod",
          name: "security-scanner",
          workloadType: "app",
          environment: "prod-gcp",
          repository: "navikt/security-scanner",
          lastDeploy: "2025-11-20T08:00:00Z",
          vulnerabilities: [
            { identifier: "CVE-2025-1001", packageName: "pkg:npm/lodash@4.17.21", packageEcosystem: "npm", dependencyCategory: "APPLICATION", riskScore: 91, riskScoreBreakdown: { factors: [{ name: "severity", points: 25, maxPoints: 25, explanation: "CRITICAL", impact: "CRITICAL" }, { name: "exploitation_evidence", points: 30, maxPoints: 30, explanation: "Listed in CISA KEV catalog", impact: "CRITICAL" }, { name: "exposure", points: 20, maxPoints: 25, explanation: "External ingress", impact: "HIGH" }, { name: "environment", points: 11, maxPoints: 15, explanation: "Production", impact: "HIGH" }, { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" }], totalScore: 91 } },
            { identifier: "CVE-2025-1002", packageName: "pkg:npm/axios@1.6.0", packageEcosystem: "npm", dependencyCategory: "APPLICATION", riskScore: 83, riskScoreBreakdown: { factors: [{ name: "severity", points: 25, maxPoints: 25, explanation: "CRITICAL", impact: "CRITICAL" }, { name: "exploitation_evidence", points: 20, maxPoints: 30, explanation: "High EPSS", impact: "HIGH" }, { name: "exposure", points: 20, maxPoints: 25, explanation: "External ingress", impact: "HIGH" }, { name: "environment", points: 10, maxPoints: 15, explanation: "Production", impact: "HIGH" }, { name: "actionability", points: 8, maxPoints: 10, explanation: "Patch available", impact: "HIGH" }], totalScore: 83 } },
            { identifier: "CVE-2025-1003", packageName: "pkg:npm/express@4.18.2", packageEcosystem: "npm", dependencyCategory: "APPLICATION", riskScore: 77, riskScoreBreakdown: { factors: [{ name: "severity", points: 22, maxPoints: 25, explanation: "HIGH", impact: "HIGH" }, { name: "exploitation_evidence", points: 20, maxPoints: 30, explanation: "High EPSS", impact: "HIGH" }, { name: "exposure", points: 20, maxPoints: 25, explanation: "External ingress", impact: "HIGH" }, { name: "environment", points: 10, maxPoints: 15, explanation: "Production", impact: "HIGH" }, { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" }], totalScore: 77 } },
            { identifier: "CVE-2025-1004", packageName: "pkg:npm/moment@2.29.4", packageEcosystem: "npm", dependencyCategory: "APPLICATION", riskScore: 62, riskScoreBreakdown: { factors: [{ name: "severity", points: 18, maxPoints: 25, explanation: "HIGH", impact: "HIGH" }, { name: "exploitation_evidence", points: 15, maxPoints: 30, explanation: "High EPSS", impact: "MEDIUM" }, { name: "exposure", points: 15, maxPoints: 25, explanation: "Internal ingress", impact: "MEDIUM" }, { name: "environment", points: 9, maxPoints: 15, explanation: "Production", impact: "MEDIUM" }, { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" }], totalScore: 62 } },
            { identifier: "CVE-2025-1005", packageName: "pkg:npm/qs@6.11.0", packageEcosystem: "npm", dependencyCategory: "APPLICATION", riskScore: 38, riskScoreBreakdown: { factors: [{ name: "severity", points: 12, maxPoints: 25, explanation: "MEDIUM", impact: "MEDIUM" }, { name: "exploitation_evidence", points: 5, maxPoints: 30, explanation: "Low EPSS", impact: "LOW" }, { name: "exposure", points: 12, maxPoints: 25, explanation: "Internal ingress", impact: "MEDIUM" }, { name: "environment", points: 5, maxPoints: 15, explanation: "Production", impact: "MEDIUM" }, { name: "actionability", points: 4, maxPoints: 10, explanation: "Patch available", impact: "LOW" }], totalScore: 38 } },
            { identifier: "CVE-2025-1006", packageName: "pkg:npm/semver@7.5.3", packageEcosystem: "npm", dependencyCategory: "APPLICATION", riskScore: 18, riskScoreBreakdown: { factors: [{ name: "severity", points: 8, maxPoints: 25, explanation: "MEDIUM", impact: "MEDIUM" }, { name: "exploitation_evidence", points: 0, maxPoints: 30, explanation: "No evidence", impact: "NONE" }, { name: "exposure", points: 5, maxPoints: 25, explanation: "Internal", impact: "LOW" }, { name: "environment", points: 3, maxPoints: 15, explanation: "Production", impact: "LOW" }, { name: "actionability", points: 2, maxPoints: 10, explanation: "No patch", impact: "LOW" }], totalScore: 18 } },
          ],
        },
      ],
    },
    {
      team: "data-platform",
      workloads: [
        {
          id: "workload-kafka-prod",
          name: "kafka-consumer",
          workloadType: "app",
          environment: "prod-gcp",
          repository: "navikt/kafka-consumer",
          lastDeploy: "2025-10-15T08:00:00Z",
          vulnerabilities: [
            { identifier: "CVE-2025-2001", packageName: "pkg:maven/org.apache.kafka/kafka-clients@3.4.0", packageEcosystem: "maven", dependencyCategory: "APPLICATION", riskScore: 88, riskScoreBreakdown: { factors: [{ name: "severity", points: 25, maxPoints: 25, explanation: "CRITICAL", impact: "CRITICAL" }, { name: "exploitation_evidence", points: 30, maxPoints: 30, explanation: "KEV", impact: "CRITICAL" }, { name: "exposure", points: 18, maxPoints: 25, explanation: "External", impact: "HIGH" }, { name: "environment", points: 10, maxPoints: 15, explanation: "Production", impact: "HIGH" }, { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" }], totalScore: 88 } },
            { identifier: "CVE-2025-2002", packageName: "pkg:maven/com.fasterxml.jackson.core/jackson-databind@2.15.2", packageEcosystem: "maven", dependencyCategory: "APPLICATION", riskScore: 79, riskScoreBreakdown: { factors: [{ name: "severity", points: 22, maxPoints: 25, explanation: "HIGH", impact: "HIGH" }, { name: "exploitation_evidence", points: 18, maxPoints: 30, explanation: "High EPSS", impact: "HIGH" }, { name: "exposure", points: 18, maxPoints: 25, explanation: "External", impact: "HIGH" }, { name: "environment", points: 10, maxPoints: 15, explanation: "Production", impact: "HIGH" }, { name: "actionability", points: 11, maxPoints: 10, explanation: "Patch available", impact: "HIGH" }], totalScore: 79 } },
            { identifier: "CVE-2025-2003", packageName: "pkg:maven/org.springframework/spring-web@5.3.27", packageEcosystem: "maven", dependencyCategory: "APPLICATION", riskScore: 55, riskScoreBreakdown: { factors: [{ name: "severity", points: 15, maxPoints: 25, explanation: "HIGH", impact: "HIGH" }, { name: "exploitation_evidence", points: 12, maxPoints: 30, explanation: "Medium EPSS", impact: "MEDIUM" }, { name: "exposure", points: 15, maxPoints: 25, explanation: "Internal", impact: "MEDIUM" }, { name: "environment", points: 8, maxPoints: 15, explanation: "Production", impact: "MEDIUM" }, { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" }], totalScore: 55 } },
            { identifier: "CVE-2025-2004", packageName: "pkg:maven/io.netty/netty-handler@4.1.94", packageEcosystem: "maven", dependencyCategory: "APPLICATION", riskScore: 42, riskScoreBreakdown: { factors: [{ name: "severity", points: 12, maxPoints: 25, explanation: "MEDIUM", impact: "MEDIUM" }, { name: "exploitation_evidence", points: 8, maxPoints: 30, explanation: "Low EPSS", impact: "LOW" }, { name: "exposure", points: 12, maxPoints: 25, explanation: "Internal", impact: "MEDIUM" }, { name: "environment", points: 5, maxPoints: 15, explanation: "Production", impact: "MEDIUM" }, { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" }], totalScore: 42 } },
            { identifier: "CVE-2025-2005", packageName: "pkg:maven/org.yaml/snakeyaml@1.33", packageEcosystem: "maven", dependencyCategory: "APPLICATION", riskScore: 20, riskScoreBreakdown: { factors: [{ name: "severity", points: 8, maxPoints: 25, explanation: "MEDIUM", impact: "MEDIUM" }, { name: "exploitation_evidence", points: 0, maxPoints: 30, explanation: "No evidence", impact: "NONE" }, { name: "exposure", points: 5, maxPoints: 25, explanation: "Internal", impact: "LOW" }, { name: "environment", points: 5, maxPoints: 15, explanation: "Production", impact: "MEDIUM" }, { name: "actionability", points: 2, maxPoints: 10, explanation: "Patch available", impact: "LOW" }], totalScore: 20 } },
          ],
        },
      ],
    },
    {
      team: "auth-team",
      workloads: [
        {
          id: "workload-auth-service-prod",
          name: "auth-service",
          workloadType: "app",
          environment: "prod-gcp",
          repository: "navikt/auth-service",
          lastDeploy: "2025-11-28T06:00:00Z",
          vulnerabilities: [
            { identifier: "CVE-2025-3001", packageName: "pkg:maven/org.keycloak/keycloak-core@21.1.2", packageEcosystem: "maven", dependencyCategory: "APPLICATION", riskScore: 95, riskScoreBreakdown: { factors: [{ name: "severity", points: 25, maxPoints: 25, explanation: "CRITICAL", impact: "CRITICAL" }, { name: "exploitation_evidence", points: 30, maxPoints: 30, explanation: "KEV", impact: "CRITICAL" }, { name: "exposure", points: 25, maxPoints: 25, explanation: "External no auth", impact: "CRITICAL" }, { name: "environment", points: 10, maxPoints: 15, explanation: "Production", impact: "HIGH" }, { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" }], totalScore: 95 } },
            { identifier: "CVE-2025-3002", packageName: "pkg:maven/io.jsonwebtoken/jjwt-api@0.11.5", packageEcosystem: "maven", dependencyCategory: "APPLICATION", riskScore: 86, riskScoreBreakdown: { factors: [{ name: "severity", points: 25, maxPoints: 25, explanation: "CRITICAL", impact: "CRITICAL" }, { name: "exploitation_evidence", points: 25, maxPoints: 30, explanation: "High EPSS + PoC", impact: "CRITICAL" }, { name: "exposure", points: 20, maxPoints: 25, explanation: "External", impact: "HIGH" }, { name: "environment", points: 11, maxPoints: 15, explanation: "Production", impact: "HIGH" }, { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" }], totalScore: 86 } },
            { identifier: "CVE-2025-3003", packageName: "pkg:deb/debian/libpam0g@1.5.2-6", packageEcosystem: "deb", dependencyCategory: "OS_PACKAGE", riskScore: 78, riskScoreBreakdown: { factors: [{ name: "severity", points: 22, maxPoints: 25, explanation: "HIGH", impact: "HIGH" }, { name: "exploitation_evidence", points: 18, maxPoints: 30, explanation: "High EPSS", impact: "HIGH" }, { name: "exposure", points: 18, maxPoints: 25, explanation: "External", impact: "HIGH" }, { name: "environment", points: 10, maxPoints: 15, explanation: "Production", impact: "HIGH" }, { name: "actionability", points: 10, maxPoints: 10, explanation: "Patch via base image", impact: "HIGH" }], totalScore: 78 } },
            { identifier: "CVE-2025-3004", packageName: "pkg:deb/debian/openssl@3.0.11", packageEcosystem: "deb", dependencyCategory: "OS_PACKAGE", riskScore: 30, riskScoreBreakdown: { factors: [{ name: "severity", points: 12, maxPoints: 25, explanation: "MEDIUM", impact: "MEDIUM" }, { name: "exploitation_evidence", points: 5, maxPoints: 30, explanation: "Low EPSS", impact: "LOW" }, { name: "exposure", points: 8, maxPoints: 25, explanation: "Internal", impact: "LOW" }, { name: "environment", points: 3, maxPoints: 15, explanation: "Production", impact: "LOW" }, { name: "actionability", points: 2, maxPoints: 10, explanation: "Patch available", impact: "LOW" }], totalScore: 30 } },
          ],
        },
      ],
    },
    {
      team: "notification-team",
      workloads: [
        {
          id: "workload-notif-prod",
          name: "notification-service",
          workloadType: "app",
          environment: "prod-gcp",
          repository: "navikt/notification-service",
          lastDeploy: "2025-11-22T10:00:00Z",
          vulnerabilities: [
            { identifier: "CVE-2025-4001", packageName: "pkg:npm/nodemailer@6.9.4", packageEcosystem: "npm", dependencyCategory: "APPLICATION", riskScore: 58, riskScoreBreakdown: { factors: [{ name: "severity", points: 15, maxPoints: 25, explanation: "HIGH", impact: "HIGH" }, { name: "exploitation_evidence", points: 12, maxPoints: 30, explanation: "Medium EPSS", impact: "MEDIUM" }, { name: "exposure", points: 15, maxPoints: 25, explanation: "External", impact: "MEDIUM" }, { name: "environment", points: 8, maxPoints: 15, explanation: "Production", impact: "MEDIUM" }, { name: "actionability", points: 8, maxPoints: 10, explanation: "Patch available", impact: "HIGH" }], totalScore: 58 } },
            { identifier: "CVE-2025-4002", packageName: "pkg:npm/handlebars@4.7.7", packageEcosystem: "npm", dependencyCategory: "APPLICATION", riskScore: 44, riskScoreBreakdown: { factors: [{ name: "severity", points: 12, maxPoints: 25, explanation: "MEDIUM", impact: "MEDIUM" }, { name: "exploitation_evidence", points: 10, maxPoints: 30, explanation: "Medium EPSS", impact: "MEDIUM" }, { name: "exposure", points: 12, maxPoints: 25, explanation: "Internal", impact: "MEDIUM" }, { name: "environment", points: 5, maxPoints: 15, explanation: "Production", impact: "MEDIUM" }, { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" }], totalScore: 44 } },
            { identifier: "CVE-2025-4003", packageName: "pkg:npm/ws@8.13.0", packageEcosystem: "npm", dependencyCategory: "APPLICATION", riskScore: 22, riskScoreBreakdown: { factors: [{ name: "severity", points: 8, maxPoints: 25, explanation: "MEDIUM", impact: "MEDIUM" }, { name: "exploitation_evidence", points: 2, maxPoints: 30, explanation: "Low EPSS", impact: "LOW" }, { name: "exposure", points: 5, maxPoints: 25, explanation: "Internal", impact: "LOW" }, { name: "environment", points: 5, maxPoints: 15, explanation: "Production", impact: "MEDIUM" }, { name: "actionability", points: 2, maxPoints: 10, explanation: "No patch", impact: "LOW" }], totalScore: 22 } },
            { identifier: "CVE-2025-4004", packageName: "pkg:npm/uuid@9.0.0", packageEcosystem: "npm", dependencyCategory: "APPLICATION", riskScore: 10, riskScoreBreakdown: { factors: [{ name: "severity", points: 5, maxPoints: 25, explanation: "LOW", impact: "LOW" }, { name: "exploitation_evidence", points: 0, maxPoints: 30, explanation: "No evidence", impact: "NONE" }, { name: "exposure", points: 2, maxPoints: 25, explanation: "Internal", impact: "LOW" }, { name: "environment", points: 2, maxPoints: 15, explanation: "Production", impact: "LOW" }, { name: "actionability", points: 1, maxPoints: 10, explanation: "No patch", impact: "LOW" }], totalScore: 10 } },
          ],
        },
      ],
    },
    {
      team: "search-team",
      workloads: [
        {
          id: "workload-search-prod",
          name: "search-api",
          workloadType: "app",
          environment: "prod-gcp",
          repository: "navikt/search-api",
          lastDeploy: "2025-09-01T08:00:00Z",
          vulnerabilities: [
            { identifier: "CVE-2025-5001", packageName: "pkg:maven/org.elasticsearch/elasticsearch@8.9.0", packageEcosystem: "maven", dependencyCategory: "APPLICATION", riskScore: 93, riskScoreBreakdown: { factors: [{ name: "severity", points: 25, maxPoints: 25, explanation: "CRITICAL", impact: "CRITICAL" }, { name: "exploitation_evidence", points: 30, maxPoints: 30, explanation: "KEV", impact: "CRITICAL" }, { name: "exposure", points: 20, maxPoints: 25, explanation: "External", impact: "HIGH" }, { name: "environment", points: 13, maxPoints: 15, explanation: "Production, old deploy", impact: "HIGH" }, { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" }], totalScore: 93 } },
            { identifier: "CVE-2025-5002", packageName: "pkg:maven/org.apache.lucene/lucene-core@9.7.0", packageEcosystem: "maven", dependencyCategory: "APPLICATION", riskScore: 80, riskScoreBreakdown: { factors: [{ name: "severity", points: 25, maxPoints: 25, explanation: "CRITICAL", impact: "CRITICAL" }, { name: "exploitation_evidence", points: 20, maxPoints: 30, explanation: "High EPSS", impact: "HIGH" }, { name: "exposure", points: 18, maxPoints: 25, explanation: "External", impact: "HIGH" }, { name: "environment", points: 12, maxPoints: 15, explanation: "Production, old deploy", impact: "HIGH" }, { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" }], totalScore: 80 } },
            { identifier: "CVE-2025-5003", packageName: "pkg:maven/com.google.guava/guava@32.1.2", packageEcosystem: "maven", dependencyCategory: "APPLICATION", riskScore: 63, riskScoreBreakdown: { factors: [{ name: "severity", points: 18, maxPoints: 25, explanation: "HIGH", impact: "HIGH" }, { name: "exploitation_evidence", points: 15, maxPoints: 30, explanation: "Medium EPSS", impact: "MEDIUM" }, { name: "exposure", points: 15, maxPoints: 25, explanation: "Internal", impact: "MEDIUM" }, { name: "environment", points: 10, maxPoints: 15, explanation: "Production, old deploy", impact: "HIGH" }, { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" }], totalScore: 63 } },
            { identifier: "CVE-2025-5004", packageName: "pkg:maven/org.apache.httpcomponents/httpclient@4.5.14", packageEcosystem: "maven", dependencyCategory: "APPLICATION", riskScore: 35, riskScoreBreakdown: { factors: [{ name: "severity", points: 12, maxPoints: 25, explanation: "MEDIUM", impact: "MEDIUM" }, { name: "exploitation_evidence", points: 5, maxPoints: 30, explanation: "Low EPSS", impact: "LOW" }, { name: "exposure", points: 10, maxPoints: 25, explanation: "Internal", impact: "MEDIUM" }, { name: "environment", points: 5, maxPoints: 15, explanation: "Production, old deploy", impact: "MEDIUM" }, { name: "actionability", points: 3, maxPoints: 10, explanation: "Patch available", impact: "LOW" }], totalScore: 35 } },
            { identifier: "CVE-2025-5005", packageName: "pkg:maven/com.zaxxer/HikariCP@5.0.1", packageEcosystem: "maven", dependencyCategory: "APPLICATION", riskScore: 15, riskScoreBreakdown: { factors: [{ name: "severity", points: 8, maxPoints: 25, explanation: "MEDIUM", impact: "MEDIUM" }, { name: "exploitation_evidence", points: 0, maxPoints: 30, explanation: "No evidence", impact: "NONE" }, { name: "exposure", points: 0, maxPoints: 25, explanation: "No ingress", impact: "NONE" }, { name: "environment", points: 5, maxPoints: 15, explanation: "Production", impact: "MEDIUM" }, { name: "actionability", points: 2, maxPoints: 10, explanation: "Patch available", impact: "LOW" }], totalScore: 15 } },
          ],
        },
      ],
    },
    {
      team: "ml-platform",
      workloads: [
        {
          id: "workload-ml-api-prod",
          name: "ml-inference-api",
          workloadType: "app",
          environment: "prod-gcp",
          repository: "navikt/ml-inference-api",
          lastDeploy: "2025-11-10T10:00:00Z",
          vulnerabilities: [
            { identifier: "CVE-2025-6001", packageName: "pkg:pypi/numpy@1.24.3", packageEcosystem: "pypi", dependencyCategory: "APPLICATION", riskScore: 76, riskScoreBreakdown: { factors: [{ name: "severity", points: 22, maxPoints: 25, explanation: "HIGH", impact: "HIGH" }, { name: "exploitation_evidence", points: 18, maxPoints: 30, explanation: "High EPSS", impact: "HIGH" }, { name: "exposure", points: 18, maxPoints: 25, explanation: "External", impact: "HIGH" }, { name: "environment", points: 10, maxPoints: 15, explanation: "Production", impact: "HIGH" }, { name: "actionability", points: 8, maxPoints: 10, explanation: "Patch available", impact: "HIGH" }], totalScore: 76 } },
            { identifier: "CVE-2025-6002", packageName: "pkg:pypi/pillow@10.0.0", packageEcosystem: "pypi", dependencyCategory: "APPLICATION", riskScore: 52, riskScoreBreakdown: { factors: [{ name: "severity", points: 15, maxPoints: 25, explanation: "HIGH", impact: "HIGH" }, { name: "exploitation_evidence", points: 10, maxPoints: 30, explanation: "Medium EPSS", impact: "MEDIUM" }, { name: "exposure", points: 15, maxPoints: 25, explanation: "Internal", impact: "MEDIUM" }, { name: "environment", points: 7, maxPoints: 15, explanation: "Production", impact: "MEDIUM" }, { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" }], totalScore: 52 } },
            { identifier: "CVE-2025-6003", packageName: "pkg:pypi/requests@2.28.2", packageEcosystem: "pypi", dependencyCategory: "APPLICATION", riskScore: 28, riskScoreBreakdown: { factors: [{ name: "severity", points: 10, maxPoints: 25, explanation: "MEDIUM", impact: "MEDIUM" }, { name: "exploitation_evidence", points: 5, maxPoints: 30, explanation: "Low EPSS", impact: "LOW" }, { name: "exposure", points: 8, maxPoints: 25, explanation: "Internal", impact: "LOW" }, { name: "environment", points: 3, maxPoints: 15, explanation: "Production", impact: "LOW" }, { name: "actionability", points: 2, maxPoints: 10, explanation: "Patch available", impact: "LOW" }], totalScore: 28 } },
          ],
        },
      ],
    },
    {
      team: "devtools-team",
      workloads: [
        {
          id: "workload-ci-runner-prod",
          name: "ci-runner",
          workloadType: "job",
          environment: "prod-gcp",
          repository: "navikt/ci-runner",
          vulnerabilities: [
            { identifier: "CVE-2025-7001", packageName: "pkg:golang/github.com/docker/docker@v24.0.5", packageEcosystem: "golang", dependencyCategory: "APPLICATION", riskScore: 85, riskScoreBreakdown: { factors: [{ name: "severity", points: 25, maxPoints: 25, explanation: "CRITICAL", impact: "CRITICAL" }, { name: "exploitation_evidence", points: 22, maxPoints: 30, explanation: "High EPSS + PoC", impact: "HIGH" }, { name: "exposure", points: 20, maxPoints: 25, explanation: "External", impact: "HIGH" }, { name: "environment", points: 10, maxPoints: 15, explanation: "Production", impact: "HIGH" }, { name: "actionability", points: 8, maxPoints: 10, explanation: "Patch available", impact: "HIGH" }], totalScore: 85 } },
            { identifier: "CVE-2025-7002", packageName: "pkg:golang/golang.org/x/net@v0.14.0", packageEcosystem: "golang", dependencyCategory: "APPLICATION", riskScore: 67, riskScoreBreakdown: { factors: [{ name: "severity", points: 18, maxPoints: 25, explanation: "HIGH", impact: "HIGH" }, { name: "exploitation_evidence", points: 15, maxPoints: 30, explanation: "Medium EPSS", impact: "MEDIUM" }, { name: "exposure", points: 18, maxPoints: 25, explanation: "External", impact: "HIGH" }, { name: "environment", points: 8, maxPoints: 15, explanation: "Production", impact: "MEDIUM" }, { name: "actionability", points: 8, maxPoints: 10, explanation: "Patch available", impact: "HIGH" }], totalScore: 67 } },
            { identifier: "CVE-2025-7003", packageName: "pkg:golang/github.com/cloudflare/circl@v1.3.3", packageEcosystem: "golang", dependencyCategory: "APPLICATION", riskScore: 32, riskScoreBreakdown: { factors: [{ name: "severity", points: 12, maxPoints: 25, explanation: "MEDIUM", impact: "MEDIUM" }, { name: "exploitation_evidence", points: 5, maxPoints: 30, explanation: "Low EPSS", impact: "LOW" }, { name: "exposure", points: 8, maxPoints: 25, explanation: "Internal", impact: "LOW" }, { name: "environment", points: 5, maxPoints: 15, explanation: "Production", impact: "MEDIUM" }, { name: "actionability", points: 2, maxPoints: 10, explanation: "Patch available", impact: "LOW" }], totalScore: 32 } },
            { identifier: "CVE-2025-7004", packageName: "pkg:golang/stdlib@v1.21.0", packageEcosystem: "golang", dependencyCategory: "APPLICATION", riskScore: 12, riskScoreBreakdown: { factors: [{ name: "severity", points: 5, maxPoints: 25, explanation: "LOW", impact: "LOW" }, { name: "exploitation_evidence", points: 0, maxPoints: 30, explanation: "No evidence", impact: "NONE" }, { name: "exposure", points: 2, maxPoints: 25, explanation: "Internal", impact: "LOW" }, { name: "environment", points: 3, maxPoints: 15, explanation: "Production", impact: "LOW" }, { name: "actionability", points: 2, maxPoints: 10, explanation: "Patch available", impact: "LOW" }], totalScore: 12 } },
          ],
        },
      ],
    },
    {
      team: "portal-team",
      workloads: [
        {
          id: "workload-portal-prod",
          name: "nav-portal",
          workloadType: "app",
          environment: "prod-gcp",
          repository: "navikt/nav-portal",
          lastDeploy: "2025-11-26T12:00:00Z",
          vulnerabilities: [
            { identifier: "CVE-2025-8001", packageName: "pkg:npm/next@14.0.3", packageEcosystem: "npm", dependencyCategory: "APPLICATION", riskScore: 90, riskScoreBreakdown: { factors: [{ name: "severity", points: 25, maxPoints: 25, explanation: "CRITICAL", impact: "CRITICAL" }, { name: "exploitation_evidence", points: 30, maxPoints: 30, explanation: "KEV", impact: "CRITICAL" }, { name: "exposure", points: 20, maxPoints: 25, explanation: "External no auth", impact: "HIGH" }, { name: "environment", points: 10, maxPoints: 15, explanation: "Production", impact: "HIGH" }, { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" }], totalScore: 90 } },
            { identifier: "CVE-2025-8002", packageName: "pkg:npm/react@18.2.0", packageEcosystem: "npm", dependencyCategory: "APPLICATION", riskScore: 53, riskScoreBreakdown: { factors: [{ name: "severity", points: 15, maxPoints: 25, explanation: "HIGH", impact: "HIGH" }, { name: "exploitation_evidence", points: 12, maxPoints: 30, explanation: "Medium EPSS", impact: "MEDIUM" }, { name: "exposure", points: 15, maxPoints: 25, explanation: "External", impact: "MEDIUM" }, { name: "environment", points: 6, maxPoints: 15, explanation: "Production", impact: "MEDIUM" }, { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" }], totalScore: 53 } },
            { identifier: "CVE-2025-8003", packageName: "pkg:npm/typescript@5.2.2", packageEcosystem: "npm", dependencyCategory: "APPLICATION", riskScore: 26, riskScoreBreakdown: { factors: [{ name: "severity", points: 10, maxPoints: 25, explanation: "MEDIUM", impact: "MEDIUM" }, { name: "exploitation_evidence", points: 3, maxPoints: 30, explanation: "Low EPSS", impact: "LOW" }, { name: "exposure", points: 8, maxPoints: 25, explanation: "Internal", impact: "LOW" }, { name: "environment", points: 3, maxPoints: 15, explanation: "Production", impact: "LOW" }, { name: "actionability", points: 2, maxPoints: 10, explanation: "No patch", impact: "LOW" }], totalScore: 26 } },
            { identifier: "CVE-2025-8004", packageName: "pkg:npm/zod@3.22.2", packageEcosystem: "npm", dependencyCategory: "APPLICATION", riskScore: 8, riskScoreBreakdown: { factors: [{ name: "severity", points: 5, maxPoints: 25, explanation: "LOW", impact: "LOW" }, { name: "exploitation_evidence", points: 0, maxPoints: 30, explanation: "No evidence", impact: "NONE" }, { name: "exposure", points: 0, maxPoints: 25, explanation: "Internal", impact: "NONE" }, { name: "environment", points: 2, maxPoints: 15, explanation: "Production", impact: "LOW" }, { name: "actionability", points: 1, maxPoints: 10, explanation: "No patch", impact: "LOW" }], totalScore: 8 } },
          ],
        },
      ],
    },
    {
      team: "infrastructure-team",
      workloads: [
        {
          id: "workload-infra-controller-prod",
          name: "infra-controller",
          workloadType: "app",
          environment: "prod-gcp",
          repository: "navikt/infra-controller",
          lastDeploy: "2025-08-01T08:00:00Z",
          vulnerabilities: [
            { identifier: "CVE-2025-9001", packageName: "pkg:golang/k8s.io/client-go@v0.27.4", packageEcosystem: "golang", dependencyCategory: "APPLICATION", riskScore: 97, riskScoreBreakdown: { factors: [{ name: "severity", points: 25, maxPoints: 25, explanation: "CRITICAL", impact: "CRITICAL" }, { name: "exploitation_evidence", points: 30, maxPoints: 30, explanation: "KEV", impact: "CRITICAL" }, { name: "exposure", points: 25, maxPoints: 25, explanation: "External no auth", impact: "CRITICAL" }, { name: "environment", points: 15, maxPoints: 15, explanation: "Production, very old deploy", impact: "HIGH" }, { name: "actionability", points: 2, maxPoints: 10, explanation: "No patch", impact: "LOW" }], totalScore: 97 } },
            { identifier: "CVE-2025-9002", packageName: "pkg:golang/k8s.io/apimachinery@v0.27.4", packageEcosystem: "golang", dependencyCategory: "APPLICATION", riskScore: 88, riskScoreBreakdown: { factors: [{ name: "severity", points: 25, maxPoints: 25, explanation: "CRITICAL", impact: "CRITICAL" }, { name: "exploitation_evidence", points: 25, maxPoints: 30, explanation: "High EPSS + PoC", impact: "CRITICAL" }, { name: "exposure", points: 20, maxPoints: 25, explanation: "External", impact: "HIGH" }, { name: "environment", points: 13, maxPoints: 15, explanation: "Production, old deploy", impact: "HIGH" }, { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" }], totalScore: 88 } },
            { identifier: "CVE-2025-9003", packageName: "pkg:golang/github.com/prometheus/client_golang@v1.16.0", packageEcosystem: "golang", dependencyCategory: "APPLICATION", riskScore: 75, riskScoreBreakdown: { factors: [{ name: "severity", points: 22, maxPoints: 25, explanation: "HIGH", impact: "HIGH" }, { name: "exploitation_evidence", points: 18, maxPoints: 30, explanation: "High EPSS", impact: "HIGH" }, { name: "exposure", points: 18, maxPoints: 25, explanation: "External", impact: "HIGH" }, { name: "environment", points: 12, maxPoints: 15, explanation: "Production, old deploy", impact: "HIGH" }, { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" }], totalScore: 75 } },
            { identifier: "CVE-2025-9004", packageName: "pkg:deb/debian/libc6@2.36-9", packageEcosystem: "deb", dependencyCategory: "OS_PACKAGE", riskScore: 60, riskScoreBreakdown: { factors: [{ name: "severity", points: 18, maxPoints: 25, explanation: "HIGH", impact: "HIGH" }, { name: "exploitation_evidence", points: 12, maxPoints: 30, explanation: "Medium EPSS", impact: "MEDIUM" }, { name: "exposure", points: 15, maxPoints: 25, explanation: "Internal", impact: "MEDIUM" }, { name: "environment", points: 10, maxPoints: 15, explanation: "Production, old deploy", impact: "HIGH" }, { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch via base image", impact: "MEDIUM" }], totalScore: 60 } },
            { identifier: "CVE-2025-9005", packageName: "pkg:deb/debian/zlib1g@1.2.13.dfsg-1", packageEcosystem: "deb", dependencyCategory: "OS_PACKAGE", riskScore: 40, riskScoreBreakdown: { factors: [{ name: "severity", points: 12, maxPoints: 25, explanation: "MEDIUM", impact: "MEDIUM" }, { name: "exploitation_evidence", points: 8, maxPoints: 30, explanation: "Low EPSS", impact: "LOW" }, { name: "exposure", points: 12, maxPoints: 25, explanation: "Internal", impact: "MEDIUM" }, { name: "environment", points: 5, maxPoints: 15, explanation: "Production", impact: "MEDIUM" }, { name: "actionability", points: 3, maxPoints: 10, explanation: "Patch via base image", impact: "LOW" }], totalScore: 40 } },
            { identifier: "CVE-2025-9006", packageName: "pkg:deb/debian/libsystemd0@252.12", packageEcosystem: "deb", dependencyCategory: "OS_PACKAGE", riskScore: 18, riskScoreBreakdown: { factors: [{ name: "severity", points: 8, maxPoints: 25, explanation: "MEDIUM", impact: "MEDIUM" }, { name: "exploitation_evidence", points: 0, maxPoints: 30, explanation: "No evidence", impact: "NONE" }, { name: "exposure", points: 5, maxPoints: 25, explanation: "Internal", impact: "LOW" }, { name: "environment", points: 3, maxPoints: 15, explanation: "Production", impact: "LOW" }, { name: "actionability", points: 2, maxPoints: 10, explanation: "Patch available", impact: "LOW" }], totalScore: 18 } },
          ],
        },
      ],
    },
    {
      team: "integration-team",
      workloads: [
        {
          id: "workload-integration-hub-prod",
          name: "integration-hub",
          workloadType: "app",
          environment: "prod-gcp",
          repository: "navikt/integration-hub",
          lastDeploy: "2025-11-18T08:00:00Z",
          vulnerabilities: [
            { identifier: "CVE-2025-A001", packageName: "pkg:maven/org.apache.camel/camel-core@4.0.0", packageEcosystem: "maven", dependencyCategory: "APPLICATION", riskScore: 82, riskScoreBreakdown: { factors: [{ name: "severity", points: 25, maxPoints: 25, explanation: "CRITICAL", impact: "CRITICAL" }, { name: "exploitation_evidence", points: 22, maxPoints: 30, explanation: "High EPSS + PoC", impact: "HIGH" }, { name: "exposure", points: 18, maxPoints: 25, explanation: "External", impact: "HIGH" }, { name: "environment", points: 10, maxPoints: 15, explanation: "Production", impact: "HIGH" }, { name: "actionability", points: 7, maxPoints: 10, explanation: "Patch available", impact: "HIGH" }], totalScore: 82 } },
            { identifier: "CVE-2025-A002", packageName: "pkg:maven/org.apache.activemq/activemq-broker@5.18.3", packageEcosystem: "maven", dependencyCategory: "APPLICATION", riskScore: 56, riskScoreBreakdown: { factors: [{ name: "severity", points: 15, maxPoints: 25, explanation: "HIGH", impact: "HIGH" }, { name: "exploitation_evidence", points: 12, maxPoints: 30, explanation: "Medium EPSS", impact: "MEDIUM" }, { name: "exposure", points: 15, maxPoints: 25, explanation: "Internal", impact: "MEDIUM" }, { name: "environment", points: 9, maxPoints: 15, explanation: "Production", impact: "MEDIUM" }, { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" }], totalScore: 56 } },
            { identifier: "CVE-2025-A003", packageName: "pkg:maven/com.rabbitmq/amqp-client@5.18.0", packageEcosystem: "maven", dependencyCategory: "APPLICATION", riskScore: 33, riskScoreBreakdown: { factors: [{ name: "severity", points: 12, maxPoints: 25, explanation: "MEDIUM", impact: "MEDIUM" }, { name: "exploitation_evidence", points: 5, maxPoints: 30, explanation: "Low EPSS", impact: "LOW" }, { name: "exposure", points: 8, maxPoints: 25, explanation: "Internal", impact: "LOW" }, { name: "environment", points: 5, maxPoints: 15, explanation: "Production", impact: "MEDIUM" }, { name: "actionability", points: 3, maxPoints: 10, explanation: "Patch available", impact: "LOW" }], totalScore: 33 } },
          ],
        },
      ],
    },
    {
      team: "clean-team",
      workloads: [
        {
          id: "workload-clean-service-prod",
          name: "clean-service",
          workloadType: "app",
          environment: "prod-gcp",
          repository: "navikt/clean-service",
          lastDeploy: "2025-11-27T12:00:00Z",
          vulnerabilities: [
            { identifier: "CVE-2025-B001", packageName: "pkg:npm/lodash@4.17.21", packageEcosystem: "npm", dependencyCategory: "APPLICATION", riskScore: 22, riskScoreBreakdown: { factors: [{ name: "severity", points: 8, maxPoints: 25, explanation: "MEDIUM", impact: "MEDIUM" }, { name: "exploitation_evidence", points: 2, maxPoints: 30, explanation: "Low EPSS", impact: "LOW" }, { name: "exposure", points: 5, maxPoints: 25, explanation: "Internal", impact: "LOW" }, { name: "environment", points: 5, maxPoints: 15, explanation: "Production", impact: "MEDIUM" }, { name: "actionability", points: 2, maxPoints: 10, explanation: "Patch available", impact: "LOW" }], totalScore: 22 } },
            { identifier: "CVE-2025-B002", packageName: "pkg:npm/chalk@5.3.0", packageEcosystem: "npm", dependencyCategory: "APPLICATION", riskScore: 8, riskScoreBreakdown: { factors: [{ name: "severity", points: 5, maxPoints: 25, explanation: "LOW", impact: "LOW" }, { name: "exploitation_evidence", points: 0, maxPoints: 30, explanation: "No evidence", impact: "NONE" }, { name: "exposure", points: 0, maxPoints: 25, explanation: "Internal", impact: "NONE" }, { name: "environment", points: 2, maxPoints: 15, explanation: "Production", impact: "LOW" }, { name: "actionability", points: 1, maxPoints: 10, explanation: "No patch", impact: "LOW" }], totalScore: 8 } },
          ],
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// mockGithubPayload
// Shape: VulnerabilitiesResponse with teams → repositories (GitHub shape)
// Used by: GET /api/github when MOCKS_ENABLED=true
// packageEcosystem values from GitHub/Dependabot source use UPPERCASE (e.g. "NPM", "GO")
// ---------------------------------------------------------------------------
export const mockGithubPayload: VulnerabilitiesResponse = {
  userRole: "DEVELOPER",
  teams: [
    {
      team: "frontend-team",
      workloads: [],
      repositories: [
        {
          nameWithOwner: "navikt/tpt-frontend",
          usesDistroless: false,
          vulnerabilities: [
            {
              identifier: "CVE-2025-0030",
              packageName: "pkg:npm/next@14.2.3",
              packageEcosystem: "NPM",
              dependencyCategory: "APPLICATION",
              dependencyScope: "RUNTIME",
              description:
                "Server-side request forgery in Next.js image optimization endpoint allows fetching internal network resources.",
              summary: "SSRF in Next.js image optimization endpoint.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0030",
              publishedAt: "2025-02-20T00:00:00Z",
              cvssScore: 8.6,
              dependabotUpdatePullRequestUrl:
                "https://github.com/navikt/tpt-frontend/pull/101",
              riskScore: 72,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 22, maxPoints: 25, explanation: "Base severity: HIGH (22/25 points)", impact: "HIGH" },
                  { name: "exploitation_evidence", points: 20, maxPoints: 30, explanation: "High EPSS score", impact: "HIGH" },
                  { name: "exposure", points: 20, maxPoints: 25, explanation: "External ingress without authentication", impact: "HIGH" },
                  { name: "environment", points: 5, maxPoints: 15, explanation: "Production environment", impact: "MEDIUM" },
                  { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" },
                ],
                totalScore: 72,
              },
            },
            {
              identifier: "CVE-2025-0031",
              packageName: "pkg:npm/axios@1.6.0",
              packageEcosystem: "NPM",
              dependencyCategory: "APPLICATION",
              dependencyScope: "RUNTIME",
              description:
                "Cross-site request forgery protection bypass in axios due to incorrect header handling.",
              summary: "CSRF bypass via incorrect header handling in axios.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0031",
              publishedAt: "2025-03-05T00:00:00Z",
              cvssScore: 6.5,
              riskScore: 38,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 12, maxPoints: 25, explanation: "Base severity: MEDIUM (12/25 points)", impact: "MEDIUM" },
                  { name: "exploitation_evidence", points: 10, maxPoints: 30, explanation: "High EPSS score", impact: "MEDIUM" },
                  { name: "exposure", points: 10, maxPoints: 25, explanation: "External ingress with authentication", impact: "MEDIUM" },
                  { name: "environment", points: 5, maxPoints: 15, explanation: "Production environment", impact: "MEDIUM" },
                  { name: "actionability", points: 1, maxPoints: 10, explanation: "No patch available", impact: "LOW" },
                ],
                totalScore: 38,
              },
            },
          ],
        },
        {
          nameWithOwner: "navikt/design-system",
          usesDistroless: true,
          vulnerabilities: [
            {
              identifier: "CVE-2025-0032",
              packageName: "pkg:npm/esbuild@0.19.11",
              packageEcosystem: "NPM",
              dependencyCategory: "APPLICATION",
              dependencyScope: "DEVELOPMENT",
              description:
                "Development server in esbuild serves files to any network host, potentially exposing source code.",
              summary: "esbuild dev server accessible to all network hosts by default.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0032",
              publishedAt: "2025-02-10T00:00:00Z",
              cvssScore: 4.8,
              riskScore: 22,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 8, maxPoints: 25, explanation: "Base severity: MEDIUM (8/25 points)", impact: "MEDIUM" },
                  { name: "exploitation_evidence", points: 5, maxPoints: 30, explanation: "Low EPSS score", impact: "LOW" },
                  { name: "exposure", points: 5, maxPoints: 25, explanation: "Internal ingress", impact: "LOW" },
                  { name: "environment", points: 0, maxPoints: 15, explanation: "Development environment", impact: "NONE" },
                  { name: "actionability", points: 4, maxPoints: 10, explanation: "Patch available", impact: "LOW" },
                ],
                totalScore: 22,
              },
            },
          ],
        },
      ],
    },
    {
      team: "backend-team",
      workloads: [],
      repositories: [
        {
          nameWithOwner: "navikt/tpt-backend",
          usesDistroless: true,
          vulnerabilities: [
            {
              identifier: "CVE-2025-0040",
              packageName: "pkg:maven/com.fasterxml.jackson.core/jackson-databind@2.15.2",
              packageEcosystem: "MAVEN",
              dependencyCategory: "APPLICATION",
              dependencyScope: "RUNTIME",
              description:
                "Deserialization of untrusted data in jackson-databind allows remote code execution via gadget chains.",
              summary: "Remote code execution via unsafe deserialization in jackson-databind.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0040",
              publishedAt: "2025-01-20T00:00:00Z",
              cvssScore: 9.8,
              dependabotUpdatePullRequestUrl:
                "https://github.com/navikt/tpt-backend/pull/55",
              riskScore: 85,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 25, maxPoints: 25, explanation: "Base severity: CRITICAL (25/25 points)", impact: "CRITICAL" },
                  { name: "exploitation_evidence", points: 25, maxPoints: 30, explanation: "Proof-of-concept and high EPSS score", impact: "CRITICAL" },
                  { name: "exposure", points: 20, maxPoints: 25, explanation: "External ingress without authentication", impact: "HIGH" },
                  { name: "environment", points: 10, maxPoints: 15, explanation: "Production environment", impact: "HIGH" },
                  { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" },
                ],
                totalScore: 85,
              },
            },
          ],
        },
        {
          nameWithOwner: "navikt/data-pipeline",
          usesDistroless: false,
          vulnerabilities: [
            {
              identifier: "CVE-2025-0041",
              packageName: "pkg:pypi/requests@2.28.2",
              packageEcosystem: "PIP",
              dependencyCategory: "APPLICATION",
              dependencyScope: "RUNTIME",
              description:
                "Improper certificate verification in the requests library allows man-in-the-middle attacks.",
              summary: "Improper certificate verification in Python requests library.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0041",
              publishedAt: "2025-04-10T00:00:00Z",
              cvssScore: 7.4,
              riskScore: 55,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 18, maxPoints: 25, explanation: "Base severity: HIGH (18/25 points)", impact: "HIGH" },
                  { name: "exploitation_evidence", points: 10, maxPoints: 30, explanation: "High EPSS score", impact: "MEDIUM" },
                  { name: "exposure", points: 12, maxPoints: 25, explanation: "External ingress with authentication", impact: "MEDIUM" },
                  { name: "environment", points: 10, maxPoints: 15, explanation: "Production environment", impact: "HIGH" },
                  { name: "actionability", points: 5, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" },
                ],
                totalScore: 55,
              },
            },
            {
              identifier: "CVE-2025-0042",
              packageName: "pkg:cargo/serde@1.0.195",
              packageEcosystem: "RUST",
              dependencyCategory: "APPLICATION",
              dependencyScope: "RUNTIME",
              description:
                "Stack overflow via deeply nested structures during deserialization in serde.",
              summary: "Stack overflow in serde when deserializing deeply nested structures.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0042",
              publishedAt: "2025-05-15T00:00:00Z",
              cvssScore: 5.9,
              riskScore: 30,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 12, maxPoints: 25, explanation: "Base severity: MEDIUM (12/25 points)", impact: "MEDIUM" },
                  { name: "exploitation_evidence", points: 0, maxPoints: 30, explanation: "No exploitation evidence", impact: "NONE" },
                  { name: "exposure", points: 10, maxPoints: 25, explanation: "External ingress with authentication", impact: "MEDIUM" },
                  { name: "environment", points: 5, maxPoints: 15, explanation: "Production environment", impact: "MEDIUM" },
                  { name: "actionability", points: 3, maxPoints: 10, explanation: "Patch available", impact: "LOW" },
                ],
                totalScore: 30,
              },
            },
            {
              identifier: "CVE-2025-0043",
              packageName: "pkg:golang/github.com/gin-gonic/gin@v1.9.1",
              packageEcosystem: "GO",
              dependencyCategory: "APPLICATION",
              dependencyScope: "RUNTIME",
              description:
                "Open redirect vulnerability in gin-gonic/gin when handling redirect responses.",
              summary: "Open redirect in gin-gonic/gin redirect handling.",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0043",
              publishedAt: "2025-03-22T00:00:00Z",
              cvssScore: 6.1,
              riskScore: 40,
              riskScoreBreakdown: {
                factors: [
                  { name: "severity", points: 12, maxPoints: 25, explanation: "Base severity: MEDIUM (12/25 points)", impact: "MEDIUM" },
                  { name: "exploitation_evidence", points: 5, maxPoints: 30, explanation: "Low EPSS score", impact: "LOW" },
                  { name: "exposure", points: 12, maxPoints: 25, explanation: "External ingress with authentication", impact: "MEDIUM" },
                  { name: "environment", points: 5, maxPoints: 15, explanation: "Production environment", impact: "MEDIUM" },
                  { name: "actionability", points: 6, maxPoints: 10, explanation: "Patch available", impact: "MEDIUM" },
                ],
                totalScore: 40,
              },
            },
          ],
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// mockSlaOverduePayload
// Shape: SlaOverdueData (from useSlaOverdue.ts)
// Used by: GET /api/sla/overdue when MOCKS_ENABLED=true
// ---------------------------------------------------------------------------
export const mockSlaOverduePayload: SlaOverdueData = {
  totalOverdue: 7,
  generatedAt: "2025-11-27T06:00:00Z",
  teams: [
    {
      teamSlug: "frontend-team",
      totalVulnerabilities: 8,
      criticalOverdue: 2,
      nonCriticalOverdue: 1,
      criticalWithinSla: 3,
      nonCriticalWithinSla: 2,
      repositoriesOutOfSla: 1,
      maxDaysOverdue: 47,
      criticalOverdueItems: [
        {
          cveId: "CVE-2025-0001",
          applicationName: "tpt-frontend",
          severity: "CRITICAL",
          daysOverdue: 47,
          workdaysOverdue: 33,
        },
        {
          cveId: "CVE-2021-44228",
          applicationName: "api-gateway",
          severity: "CRITICAL",
          daysOverdue: 12,
          workdaysOverdue: 9,
        },
      ],
      nonCriticalOverdueItems: [
        {
          cveId: "CVE-2025-0002",
          applicationName: "tpt-frontend",
          severity: "HIGH",
          daysOverdue: 35,
          workdaysOverdue: 25,
        },
      ],
    },
    {
      teamSlug: "backend-team",
      totalVulnerabilities: 14,
      criticalOverdue: 3,
      nonCriticalOverdue: 1,
      criticalWithinSla: 5,
      nonCriticalWithinSla: 5,
      repositoriesOutOfSla: 2,
      maxDaysOverdue: 62,
      criticalOverdueItems: [
        {
          cveId: "CVE-2023-44487",
          applicationName: "payment-service",
          severity: "CRITICAL",
          daysOverdue: 62,
          workdaysOverdue: 44,
        },
        {
          cveId: "CVE-2024-32002",
          applicationName: "payment-service",
          severity: "CRITICAL",
          daysOverdue: 30,
          workdaysOverdue: 21,
        },
        {
          cveId: "CVE-2024-56406",
          applicationName: "payment-service",
          severity: "CRITICAL",
          daysOverdue: 8,
          workdaysOverdue: 6,
        },
      ],
      nonCriticalOverdueItems: [
        {
          cveId: "CVE-2025-0004",
          applicationName: "user-service",
          severity: "HIGH",
          daysOverdue: 20,
          workdaysOverdue: 14,
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// mockConfigPayload
// Shape: ThresholdConfig (from useConfig.ts)
// Values match exact backend defaults from RiskScoringConfig / ConfigResponse
// Used by: GET /api/config when MOCKS_ENABLED=true
// ---------------------------------------------------------------------------
export const mockConfigPayload = {
  thresholds: {
    critical: 75,
    high: 50,
    medium: 25,
  },
  scoring: {
    severityMax: 25,
    exploitationMax: 30,
    exposureMax: 25,
    environmentMax: 15,
    actionabilityMax: 10,
  },
};
