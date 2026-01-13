import type { Workload } from '../../types/vulnerabilities';

describe('Vulnerability Types', () => {
  it('should create valid Workload objects', () => {
    const workload: Workload = {
      id: 'test-app',
      name: 'Test Application',
      environment: 'production',
      repository: 'https://github.com/test/test-app',
      ingressTypes: ['external'],
      buildTime: '2024-01-13T10:00:00Z',
      vulnerabilities: [
        {
          identifier: 'CVE-2024-1234',
          packageName: 'test-package',
          riskScore: 100,
          name: 'Test Vulnerability',
          description: 'A test vulnerability',
        },
      ],
    };

    expect(workload.id).toBe('test-app');
    expect(workload.vulnerabilities).toHaveLength(1);
    expect(workload.vulnerabilities[0].riskScore).toBe(100);
  });

  it('should handle optional fields', () => {
    const workload: Workload = {
      id: 'minimal-app',
      name: 'Minimal App',
      environment: 'dev',
      vulnerabilities: [],
    };

    expect(workload.repository).toBeUndefined();
    expect(workload.ingressTypes).toBeUndefined();
    expect(workload.buildTime).toBeUndefined();
  });
});
