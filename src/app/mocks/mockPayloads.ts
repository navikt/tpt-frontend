export const mockVulnerabilitiesPayload = {
  teams: [
    {
      team: "Frontend Team",
      workloads: [
        {
          id: "workload-001",
          name: "TPT Frontend Application",
          workloadType: "app",
          environment: "prod-gcp",
          repository: "navikt/tpt-frontend",
          lastDeploy: "2025-11-27T10:00:00Z",
          vulnerabilities: [
            {
              identifier: "CVE-2025-0001",
              packageName: "express",
              description:
                "A buffer overflow vulnerability in the X.509 certificate parser could allow remote code execution",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0001",
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
              packageName: "lodash",
              description:
                "Prototype pollution vulnerability allowing arbitrary property injection",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0002",
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
          ],
        },
        {
          id: "workload-002",
          name: "TPT Frontend Application",
          workloadType: "app",
          environment: "dev-gcp",
          repository: "navikt/tpt-frontend",
          lastDeploy: "2025-11-27T10:00:00Z",
          vulnerabilities: [
            {
              identifier: "CVE-2025-0001",
              packageName: "express",
              description:
                "A buffer overflow vulnerability in the X.509 certificate parser could allow remote code execution",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0001",
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
              packageName: "lodash",
              description:
                "Prototype pollution vulnerability allowing arbitrary property injection",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0002",
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
          id: "workload-002",
          name: "API Gateway",
          workloadType: "app",
          environment: "dev-gcp",
          repository: "navikt/api-gateway",
          lastDeploy: "2025-11-26T10:00:00Z",
          vulnerabilities: [
            {
              identifier: "CVE-2025-0003",
              packageName: "log4j-core",
              description:
                "Remote code execution via JNDI lookup in log messages",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0003",
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
          id: "workload-002-prod",
          name: "API Gateway",
          workloadType: "app",
          environment: "prod-gcp",
          repository: "navikt/api-gateway",
          lastDeploy: "2025-11-26T10:00:00Z",
          vulnerabilities: [
            {
              identifier: "CVE-2025-0003",
              packageName: "log4j-core",
              description:
                "Remote code execution via JNDI lookup in log messages",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0003",
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
      team: "Backend Team",
      workloads: [
        {
          id: "workload-003",
          name: "User Service",
          workloadType: "app",
          environment: "prod-gcp",
          repository: "navikt/user-service",
          lastDeploy: "2025-11-25T10:00:00Z",
          vulnerabilities: [
            {
              identifier: "CVE-2025-0004",
              packageName: "spring-core",
              description: "SQL injection vulnerability in parameter binding",
              vulnerabilityDetailsLink:
                "https://nvd.nist.gov/vuln/detail/CVE-2025-0004",
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
          id: "workload-004",
          name: "util-thing",
          workloadType: "job",
          environment: "dev",
          repository: "navikt/util-thing",
          vulnerabilities: [
            {
              identifier: "CVE-2025-61727",
              packageName: "pkg:golang/stdlib@v1.25.4",
              description: "An excluded subdomain constraint in a certificate chain does not restrict the usage of wildcard SANs in the leaf certificate.",
              vulnerabilityDetailsLink: "https://nvd.nist.gov/vuln/detail/CVE-2025-61727",
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
              description: "Within HostnameError.Error(), when constructing an error string, there is no limit to the number of hosts that will be printed out.",
              vulnerabilityDetailsLink: "https://nvd.nist.gov/vuln/detail/CVE-2025-61729",
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
            }
          ]
        },
      ],
    },
  ],
};
