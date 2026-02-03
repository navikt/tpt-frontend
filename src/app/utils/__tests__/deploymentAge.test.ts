import { calculateDeploymentAge } from "../deploymentAge";

describe("calculateDeploymentAge", () => {
  const maxAgeDays = 90;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-02-03T00:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return non-compliant for deployment older than max age", () => {
    const lastDeploy = "2025-10-01T00:00:00Z"; // ~125 days ago
    const result = calculateDeploymentAge(lastDeploy, maxAgeDays);

    expect(result.hasDeploymentInfo).toBe(true);
    expect(result.isCompliant).toBe(false);
    expect(result.daysSinceDeployment).toBeGreaterThan(maxAgeDays);
  });

  it("should return compliant for recent deployment", () => {
    const lastDeploy = "2026-01-01T00:00:00Z"; // ~33 days ago
    const result = calculateDeploymentAge(lastDeploy, maxAgeDays);

    expect(result.hasDeploymentInfo).toBe(true);
    expect(result.isCompliant).toBe(true);
    expect(result.daysSinceDeployment).toBeLessThanOrEqual(maxAgeDays);
  });

  it("should return compliant at exact threshold", () => {
    const lastDeploy = "2025-11-05T00:00:00Z"; // exactly 90 days ago
    const result = calculateDeploymentAge(lastDeploy, maxAgeDays);

    expect(result.hasDeploymentInfo).toBe(true);
    expect(result.isCompliant).toBe(true);
    expect(result.daysSinceDeployment).toBe(maxAgeDays);
  });

  it("should return no deployment info when lastDeploy is undefined", () => {
    const result = calculateDeploymentAge(undefined, maxAgeDays);

    expect(result.hasDeploymentInfo).toBe(false);
    expect(result.isCompliant).toBe(true);
    expect(result.daysSinceDeployment).toBe(0);
  });

  it("should handle invalid date format gracefully", () => {
    const result = calculateDeploymentAge("invalid-date", maxAgeDays);

    expect(result.hasDeploymentInfo).toBe(false);
    expect(result.isCompliant).toBe(true);
    expect(result.daysSinceDeployment).toBe(0);
  });

  it("should calculate days correctly for deployment today", () => {
    const lastDeploy = "2026-02-03T00:00:00Z"; // today
    const result = calculateDeploymentAge(lastDeploy, maxAgeDays);

    expect(result.hasDeploymentInfo).toBe(true);
    expect(result.isCompliant).toBe(true);
    expect(result.daysSinceDeployment).toBe(0);
  });
});
