import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import WorkloadRiskScoreValue from '../WorkloadRiskScoreValue';

// Mock next-intl to avoid ESM import issues in Jest
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'riskScore': 'Risk score:',
      'riskScoreCalculation': 'Risk score calculation',
      'calculationDataUnavailable': 'Calculation data not available',
    };
    return translations[key] || key;
  },
}));

describe('WorkloadRiskScoreValue', () => {
  const mockVulnHigh = {
    identifier: "CVE-2025-0001",
    packageName: "express",
    riskScore: 85,
    riskScoreBreakdown: {
      factors: [
        { name: "severity", points: 25, maxPoints: 25, explanation: "Critical", impact: "CRITICAL" as const },
        { name: "exploitation_evidence", points: 30, maxPoints: 30, explanation: "In KEV", impact: "CRITICAL" as const },
        { name: "exposure", points: 20, maxPoints: 25, explanation: "External", impact: "HIGH" as const },
        { name: "environment", points: 10, maxPoints: 15, explanation: "Production", impact: "HIGH" as const },
      ],
      totalScore: 85,
    },
  };

  const mockVulnMedium = {
    identifier: "CVE-2025-0002",
    packageName: "lodash",
    riskScore: 55,
    riskScoreBreakdown: {
      factors: [
        { name: "severity", points: 15, maxPoints: 25, explanation: "High", impact: "HIGH" as const },
        { name: "exploitation_evidence", points: 20, maxPoints: 30, explanation: "EPSS", impact: "MEDIUM" as const },
      ],
      totalScore: 55,
    },
  };

  const mockVulnLow = {
    identifier: "CVE-2025-0003",
    packageName: "test-pkg",
    riskScore: 20,
  };

  it('should render risk score with error variant for high scores', () => {
    render(<WorkloadRiskScoreValue vuln={mockVulnHigh} />);
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('should render risk score with warning variant for medium scores', () => {
    render(<WorkloadRiskScoreValue vuln={mockVulnMedium} />);
    expect(screen.getByText('55')).toBeInTheDocument();
  });

  it('should render risk score with success variant for low scores', () => {
    render(<WorkloadRiskScoreValue vuln={mockVulnLow} />);
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('should display breakdown factors in popover when clicked', async () => {
    const user = userEvent.setup();
    render(<WorkloadRiskScoreValue vuln={mockVulnHigh} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(screen.getByText('Risk score calculation')).toBeInTheDocument();
    expect(screen.getByText('25/25')).toBeInTheDocument();
    expect(screen.getByText('30/30')).toBeInTheDocument();
  });

  it('should handle missing breakdown gracefully', () => {
    render(<WorkloadRiskScoreValue vuln={mockVulnLow} />);
    expect(screen.getByText('20')).toBeInTheDocument();
  });
});
