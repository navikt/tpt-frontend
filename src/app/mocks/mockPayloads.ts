export const mockVulnerabilitiesPayload = {
  teams: [
    {
      team: "Frontend Team",
      workloads: [
        {
          id: "workload-001",
          name: "TPT Frontend Application",
          environment: "prod-gcp",
          repository: "navikt/tpt-frontend",
          ingressTypes: ["external"],
          buildTime: "2025-11-27",
          vulnerabilities: [
            {
              identifier: "CVE-2025-0001",
              packageName: "express",
              description:
                "A buffer overflow vulnerability in the X.509 certificate parser could allow remote code execution",
              riskScore: 200,
            },
            {
              identifier: "CVE-2025-0002",
              packageName: "lodash",
              description:
                "Prototype pollution vulnerability allowing arbitrary property injection",
              riskScore: 45,
            },
          ],
        },
        {
          id: "workload-002",
          name: "TPT Frontend Application",
          environment: "dev-gcp",
          repository: "navikt/tpt-frontend",
          ingressTypes: ["external"],
          buildTime: "2025-11-27",
          vulnerabilities: [
            {
              identifier: "CVE-2025-0001",
              packageName: "express",
              description:
                "A buffer overflow vulnerability in the X.509 certificate parser could allow remote code execution",
              riskScore: 200,
            },
            {
              identifier: "CVE-2025-0002",
              packageName: "lodash",
              description:
                "Prototype pollution vulnerability allowing arbitrary property injection",
              riskScore: 45,
            },
          ],
        },
        {
          id: "workload-002",
          name: "API Gateway",
          environment: "dev-gcp",
          repository: "navikt/api-gateway",
          ingressTypes: ["internal"],
          buildTime: "2025-11-26",
          vulnerabilities: [
            {
              identifier: "CVE-2025-0003",
              packageName: "log4j-core",
              description:
                "Remote code execution via JNDI lookup in log messages",
              riskScore: 98,
            },
          ],
        },
        {
          id: "workload-002-prod",
          name: "API Gateway",
          environment: "prod-gcp",
          repository: "navikt/api-gateway",
          ingressTypes: ["internal"],
          buildTime: "2025-11-26",
          vulnerabilities: [
            {
              identifier: "CVE-2025-0003",
              packageName: "log4j-core",
              description:
                "Remote code execution via JNDI lookup in log messages",
              riskScore: 98,
            },
          ],
        },
      ],
    },
    {
      team: "Backend Team",
      workloads: [
        {
          id: "workload-003",
          name: "User Service",
          environment: "prod-gcp",
          repository: "navikt/user-service",
          ingressTypes: [""],
          buildTime: "2025-11-25",
          vulnerabilities: [
            {
              identifier: "CVE-2025-0004",
              packageName: "spring-core",
              description: "SQL injection vulnerability in parameter binding",
              riskScore: 20,
            },
          ],
        },
        {
          id: "workload-004",
          name: "util-thing",
          environment: null,
          repository: "navikt/util-thing",
          vulnerabilities: [
            {
              identifier: "CVE-2025-61727",
              packageName: "pkg:golang/stdlib@v1.25.4",
              description: "An excluded subdomain constraint in a certificate chain does not restrict the usage of wildcard SANs in the leaf certificate. For example a constraint that excludes the subdomain test.example.com does not prevent a leaf certificate from claiming the SAN *.example.com.",
              riskScore: 18,
            },
            {
              identifier: "CVE-2025-61729",
              packageName: "pkg:golang/stdlib@v1.25.4",
              description: "Within HostnameError.Error(), when constructing an error string, there is no limit to the number of hosts that will be printed out. Furthermore, the error string is constructed by repeated string concatenation, leading to quadratic runtime. Therefore, a certificate provided by a malicious actor can result in excessive resource consumption.",
              riskScore: 31.5,
            }
          ]
        },
      ],
    },
  ],
};

export const mockVulnerabilityDetails: Record<string, object> = {
  "workload-001/CVE-2025-0001": {
    identifier: "CVE-2025-0001",
    name: "express",
    packageName: "express",
    description:
      "A buffer overflow vulnerability in the X.509 certificate parser could allow remote code execution",
    vulnerabilityDetailsLink: "https://nvd.nist.gov/vuln/detail/CVE-2025-0001",
    riskScore: 200,
    riskScoreBreakdown: {
      baseScore: 70,
      factors: [
        {
          name: "kev",
          contribution: 122.5,
          percentage: 175,
          explanation: "Listed in CISA KEV catalog",
          impact: "CRITICAL",
          multiplier: 1.75,
        },
        {
          name: "exposure",
          contribution: 140,
          percentage: 200,
          explanation: "Application is publicly accessible",
          impact: "HIGH",
          multiplier: 2.0,
        },
      ],
      totalScore: 200,
    },
    cvssScore: 9.8,
    publishedAt: "2025-01-15T00:00:00",
    packageEcosystem: "npm",
    dependencyScope: null,
    dependabotUpdatePullRequestUrl: null,
    summary: null,
  },
  "workload-001/CVE-2025-0002": {
    identifier: "CVE-2025-0002",
    name: "lodash",
    packageName: "lodash",
    description:
      "Prototype pollution vulnerability allowing arbitrary property injection",
    vulnerabilityDetailsLink: "https://nvd.nist.gov/vuln/detail/CVE-2025-0002",
    riskScore: 45,
    riskScoreBreakdown: {
      baseScore: 50,
      factors: [
        {
          name: "patch_available",
          contribution: -5,
          percentage: -10,
          explanation: "Patch is available",
          impact: "MEDIUM",
          multiplier: 0.9,
        },
      ],
      totalScore: 45,
    },
    cvssScore: 6.5,
    publishedAt: "2025-02-01T00:00:00",
    packageEcosystem: "npm",
    dependencyScope: null,
    dependabotUpdatePullRequestUrl: null,
    summary: null,
  },
  "workload-004/CVE-2025-61727": {
    identifier: "CVE-2025-61727",
    packageName: "pkg:golang/stdlib@v1.25.4",
    description: "An excluded subdomain constraint in a certificate chain does not restrict the usage of wildcard SANs in the leaf certificate.",
    vulnerabilityDetailsLink: "https://nvd.nist.gov/vuln/detail/CVE-2025-61727",
    riskScore: 18,
    riskScoreBreakdown: {
      baseScore: 40,
      factors: [
        {
          name: "exposure",
          contribution: -18,
          percentage: -100,
          explanation: "Application has no ingress (reduced exposure)",
          impact: "MEDIUM",
          multiplier: 0.5,
        },
        {
          name: "patch_available",
          contribution: -2,
          percentage: -11.11111111111111,
          explanation: "Patch is available",
          impact: "MEDIUM",
          multiplier: 0.9,
        }
      ],
      totalScore: 18
    },
    packageEcosystem: "golang",
    dependencyScope: null,
    dependabotUpdatePullRequestUrl: null,
    summary: null,
  },
  "workload-004/CVE-2025-61729": {
    identifier: "CVE-2025-61729",
    packageName: "pkg:golang/stdlib@v1.25.4",
    description: "Within HostnameError.Error(), when constructing an error string, there is no limit to the number of hosts that will be printed out.",
    vulnerabilityDetailsLink: "https://nvd.nist.gov/vuln/detail/CVE-2025-61729",
    riskScore: 31.5,
    riskScoreBreakdown: {
      baseScore: 70,
      factors: [
        {
          name: "exposure",
          contribution: -31.5,
          percentage: -100,
          explanation: "Application has no ingress (reduced exposure)",
          impact: "MEDIUM",
          multiplier: 0.5,
        },
        {
          name: "patch_available",
          contribution: -3.5,
          percentage: -11.11111111111111,
          explanation: "Patch is available",
          impact: "MEDIUM",
          multiplier: 0.9,
        }
      ],
      totalScore: 31.5
    },
    packageEcosystem: "golang",
    dependencyScope: null,
    dependabotUpdatePullRequestUrl: null,
    summary: null,
  },
  "workload-002/CVE-2025-0001": {
    identifier: "CVE-2025-0001",
    name: "express",
    packageName: "express",
    description:
      "A buffer overflow vulnerability in the X.509 certificate parser could allow remote code execution",
    vulnerabilityDetailsLink: "https://nvd.nist.gov/vuln/detail/CVE-2025-0001",
    riskScore: 200,
    riskScoreBreakdown: {
      baseScore: 70,
      factors: [
        {
          name: "kev",
          contribution: 122.5,
          percentage: 175,
          explanation: "Listed in CISA KEV catalog",
          impact: "CRITICAL",
          multiplier: 1.75,
        },
        {
          name: "exposure",
          contribution: 140,
          percentage: 200,
          explanation: "Application is publicly accessible",
          impact: "HIGH",
          multiplier: 2.0,
        },
      ],
      totalScore: 200,
    },
    cvssScore: 9.8,
    publishedAt: "2025-01-15T00:00:00",
    packageEcosystem: "npm",
    dependencyScope: null,
    dependabotUpdatePullRequestUrl: null,
    summary: null,
  },
  "workload-002/CVE-2025-0002": {
    identifier: "CVE-2025-0002",
    name: "lodash",
    packageName: "lodash",
    description:
      "Prototype pollution vulnerability allowing arbitrary property injection",
    vulnerabilityDetailsLink: "https://nvd.nist.gov/vuln/detail/CVE-2025-0002",
    riskScore: 45,
    riskScoreBreakdown: {
      baseScore: 50,
      factors: [
        {
          name: "patch_available",
          contribution: -5,
          percentage: -10,
          explanation: "Patch is available",
          impact: "MEDIUM",
          multiplier: 0.9,
        },
      ],
      totalScore: 45,
    },
    cvssScore: 6.5,
    publishedAt: "2025-02-01T00:00:00",
    packageEcosystem: "npm",
    dependencyScope: null,
    dependabotUpdatePullRequestUrl: null,
    summary: null,
  },
  "workload-002/CVE-2025-0003": {
    identifier: "CVE-2025-0003",
    name: "log4j-core",
    packageName: "log4j-core",
    description:
      "Remote code execution via JNDI lookup in log messages",
    vulnerabilityDetailsLink: "https://nvd.nist.gov/vuln/detail/CVE-2025-0003",
    riskScore: 98,
    riskScoreBreakdown: {
      baseScore: 90,
      factors: [
        {
          name: "kev",
          contribution: 157.5,
          percentage: 175,
          explanation: "Listed in CISA KEV catalog",
          impact: "CRITICAL",
          multiplier: 1.75,
        },
        {
          name: "exposure",
          contribution: 45,
          percentage: 50,
          explanation: "Application is internally accessible",
          impact: "MEDIUM",
          multiplier: 1.5,
        },
        {
          name: "epss",
          contribution: 45,
          percentage: 50,
          explanation: "High probability of exploitation (EPSS: 0.94)",
          impact: "HIGH",
          multiplier: 1.5,
        },
      ],
      totalScore: 98,
    },
    cvssScore: 10.0,
    publishedAt: "2021-12-10T00:00:00",
    packageEcosystem: "maven",
    dependencyScope: null,
    dependabotUpdatePullRequestUrl: null,
    summary: null,
  },
  "workload-002-prod/CVE-2025-0003": {
    identifier: "CVE-2025-0003",
    name: "log4j-core",
    packageName: "log4j-core",
    description:
      "Remote code execution via JNDI lookup in log messages",
    vulnerabilityDetailsLink: "https://nvd.nist.gov/vuln/detail/CVE-2025-0003",
    riskScore: 98,
    riskScoreBreakdown: {
      baseScore: 90,
      factors: [
        {
          name: "kev",
          contribution: 157.5,
          percentage: 175,
          explanation: "Listed in CISA KEV catalog",
          impact: "CRITICAL",
          multiplier: 1.75,
        },
        {
          name: "exposure",
          contribution: 45,
          percentage: 50,
          explanation: "Application is internally accessible",
          impact: "MEDIUM",
          multiplier: 1.5,
        },
        {
          name: "epss",
          contribution: 45,
          percentage: 50,
          explanation: "High probability of exploitation (EPSS: 0.94)",
          impact: "HIGH",
          multiplier: 1.5,
        },
        {
          name: "environment",
          contribution: 9,
          percentage: 10,
          explanation: "Running in production environment",
          impact: "MEDIUM",
          multiplier: 1.1,
        },
      ],
      totalScore: 98,
    },
    cvssScore: 10.0,
    publishedAt: "2021-12-10T00:00:00",
    packageEcosystem: "maven",
    dependencyScope: null,
    dependabotUpdatePullRequestUrl: null,
    summary: null,
  },
  "workload-003/CVE-2025-0004": {
    identifier: "CVE-2025-0004",
    name: "spring-core",
    packageName: "spring-core",
    description: "SQL injection vulnerability in parameter binding",
    vulnerabilityDetailsLink: "https://nvd.nist.gov/vuln/detail/CVE-2025-0004",
    riskScore: 20,
    riskScoreBreakdown: {
      baseScore: 30,
      factors: [
        {
          name: "exposure",
          contribution: -15,
          percentage: -50,
          explanation: "Application has no public ingress",
          impact: "LOW",
          multiplier: 0.5,
        },
        {
          name: "patch_available",
          contribution: -3,
          percentage: -10,
          explanation: "Patch is available",
          impact: "LOW",
          multiplier: 0.9,
        },
      ],
      totalScore: 20,
    },
    cvssScore: 5.4,
    publishedAt: "2025-03-01T00:00:00",
    packageEcosystem: "maven",
    dependencyScope: "runtime",
    dependabotUpdatePullRequestUrl: null,
    summary: null,
  },
};
