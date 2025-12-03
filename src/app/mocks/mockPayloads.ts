export const mockVulnerabilitiesPayload = {
  teams: [
    {
      team: "Frontend Team",
      workloads: [
        {
          id: "workload-001",
          name: "TPT Frontend Application",
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
            },
            {
              identifier: "CVE-2025-0002",
              severity: "MEDIUM",
              suppressed: true,
              hasKevEntry: false,
              epssScore: "0.32",
              epssPercentile: "67.8",
            },
          ],
        },
        {
          id: "workload-002",
          name: "API Gateway",
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
            },
          ],
        },
      ],
    },
  ],
};
