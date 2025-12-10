export const mockVulnerabilitiesPayload = {
  teams: [
    {
      team: "Frontend Team",
      workloads: [
        {
          id: "workload-001",
          name: "TPT Frontend Application",
          environmentName: "prod-gcp",
          ingressTypes: ["external"],
          buildTime: "2025-11-27",
          vulnerabilities: [
            {
              identifier: "CVE-2025-0001",
              severity: "HIGH",
              suppressed: false,
              hasKevEntry: true,
              epssScore: "0.85",
              epssPercentile: "95.2",
              riskScore: 90,
            },
            {
              identifier: "CVE-2025-0002",
              severity: "MEDIUM",
              suppressed: true,
              hasKevEntry: false,
              epssScore: "0.32",
              epssPercentile: "67.8",
              riskScore: 45,
            },
          ],
        },
        {
          id: "workload-002",
          name: "API Gateway",
          environmentName: "dev-gcp",
          ingressTypes: ["internal"],
          buildTime: "2025-11-26",
          vulnerabilities: [
            {
              identifier: "CVE-2025-0003",
              severity: "CRITICAL",
              suppressed: false,
              hasKevEntry: true,
              epssScore: "0.97",
              epssPercentile: "99.1",
              riskScore: 98,
            },
          ],
        },
        {
          id: "workload-002-prod",
          name: "API Gateway",
          environmentName: "prod-gcp",
          ingressTypes: ["internal"],
          buildTime: "2025-11-26",
          vulnerabilities: [
            {
              identifier: "CVE-2025-0003",
              severity: "CRITICAL",
              suppressed: false,
              hasKevEntry: true,
              epssScore: "0.97",
              epssPercentile: "99.1",
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
          environmentName: "prod-gcp",
          ingressTypes: [""],
          buildTime: "2025-11-25",
          vulnerabilities: [
            {
              identifier: "CVE-2025-0004",
              severity: "LOW",
              suppressed: false,
              hasKevEntry: false,
              epssScore: "0.15",
              epssPercentile: "23.4",
              riskScore: 20,
            },
          ],
        },
      ],
    },
  ],
};
