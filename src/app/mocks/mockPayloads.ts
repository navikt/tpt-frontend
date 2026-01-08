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
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0001",
              riskScore: 200,
              riskScoreMultipliers: {
                base_high: 70,
                exposure: 2,
                kev: 1.5,
                epss: 1.2,
                production: 1.1,
                old_build_days: 45,
                old_build: 1.05,
              },
            },
            {
              identifier: "CVE-2025-0002",
              packageName: "lodash",
              description:
                "Prototype pollution vulnerability allowing arbitrary property injection",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0002",
              riskScore: 45,
              riskScoreMultipliers: {
                base_high: 50,
                exposure: 1,
                kev: 1,
                epss: 1.1,
                production: 1.1,
                old_build_days: 20,
                old_build: 1.02,
              },
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
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0003",
              riskScore: 98,
              riskScoreMultipliers: {
                base_high: 90,
                exposure: 1.5,
                kev: 1.8,
                epss: 1.5,
                production: 1,
                old_build_days: 10,
                old_build: 1.01,
              },
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
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0003",
              riskScore: 98,
              riskScoreMultipliers: {
                base_high: 90,
                exposure: 1.5,
                kev: 1.8,
                epss: 1.5,
                production: 1.1,
                old_build_days: 10,
                old_build: 1.01,
              },
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
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0004",
              riskScore: 20,
              riskScoreMultipliers: {
                base_high: 30,
                exposure: 1,
                kev: 1,
                epss: 1,
                production: 1.1,
                old_build_days: 5,
                old_build: 1,
              },
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
              vulnerabilityDetailsLink: "https://nvd.nist.gov/vuln/detail/CVE-2025-61727",
              riskScore: 18,
              riskScoreMultipliers: {
                base_medium: 40,
                exposure: 0.5,
                patch_available: 0.9
              },
              riskScoreBreakdown: {
                baseScore: 40,
                factors: [
                  {
                    name: "exposure",
                    contribution: -18,
                    percentage: -100,
                    explanation: "Application has no ingress (reduced exposure)",
                    impact: "MEDIUM"
                  },
                  {
                    name: "patch_available",
                    contribution: -2,
                    percentage: -11.11111111111111,
                    explanation: "Patch is available",
                    impact: "MEDIUM"
                  }
                ],
                totalScore: 18
              }
            },
            {
              identifier: "CVE-2025-61729",
              packageName: "pkg:golang/stdlib@v1.25.4",
              description: "Within HostnameError.Error(), when constructing an error string, there is no limit to the number of hosts that will be printed out. Furthermore, the error string is constructed by repeated string concatenation, leading to quadratic runtime. Therefore, a certificate provided by a malicious actor can result in excessive resource consumption.",
              vulnerabilityDetailsLink: "https://nvd.nist.gov/vuln/detail/CVE-2025-61729",
              riskScore: 31.5,
              riskScoreMultipliers: {
                base_high: 70,
                exposure: 0.5,
                patch_available: 0.9
              },
              riskScoreBreakdown: {
                baseScore: 70,
                factors: [
                  {
                    name: "exposure",
                    contribution: -31.5,
                    percentage: -100,
                    explanation: "Application has no ingress (reduced exposure)",
                    impact: "MEDIUM"
                  },
                  {
                    name: "patch_available",
                    contribution: -3.5,
                    percentage: -11.11111111111111,
                    explanation: "Patch is available",
                    impact: "MEDIUM"
                  }
                ],
                totalScore: 31.5
              }
            }
          ]
        },
      ],
    },
  ],
};
