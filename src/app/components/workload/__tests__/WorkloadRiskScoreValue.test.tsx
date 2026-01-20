import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import WorkloadRiskScoreValue from '../WorkloadRiskScoreValue';

// Mock next-intl to avoid ESM import issues in Jest
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'riskScore': 'Risk score:',
      'riskScoreCalculation': 'Risk score calculation',
      'fromCVE': 'From CVE:',
      'exposedIngress': 'Exposed ingress:',
      'kev': 'KEV:',
      'epss': 'EPSS:',
      'production': 'In production:',
      'oldBuild': 'Old build:',
      'daysSinceLastBuild': 'Days since last build:',
      'calculationDataUnavailable': 'Calculation data not available',
    };
    return translations[key] || key;
  },
}));

describe('WorkloadRiskScoreValue', () => {
  const mockVulnHigh = {
    riskScore: 150,
    riskScoreMultipliers: {
      severity: 100,
      exposure: 1.5,
      kev: 1.0,
      epss: 1.0,
      production: 1.0,
      old_build_days: 0,
      old_build: 1.0,
    },
  };

  const mockVulnMedium = {
    riskScore: 60,
    riskScoreMultipliers: {
      severity: 50,
      exposure: 1.2,
      kev: 1.0,
      epss: 1.0,
      production: 1.0,
      old_build_days: 0,
      old_build: 1.0,
    },
  };

  const mockVulnLow = {
    riskScore: 30,
  };

  it('should render risk score with error variant for high scores', () => {
    render(<WorkloadRiskScoreValue vuln={mockVulnHigh} />);
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('should render risk score with warning variant for medium scores', () => {
    render(<WorkloadRiskScoreValue vuln={mockVulnMedium} />);
    expect(screen.getByText('60')).toBeInTheDocument();
  });

  it('should render risk score with success variant for low scores', () => {
    render(<WorkloadRiskScoreValue vuln={mockVulnLow} />);
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('should display multipliers in popover when clicked', async () => {
    const user = userEvent.setup();
    render(<WorkloadRiskScoreValue vuln={mockVulnHigh} />);

    // Click the button to open popover
    const button = screen.getByRole('button');
    await user.click(button);

    // Check that multiplier details are visible
    expect(screen.getByText('Risk score calculation')).toBeInTheDocument();
    expect(screen.getByText('From CVE:')).toBeInTheDocument();
    expect(screen.getByText('Exposed ingress:')).toBeInTheDocument();
  });

  it('should handle missing multipliers gracefully', () => {
    render(<WorkloadRiskScoreValue vuln={mockVulnLow} />);
    expect(screen.getByText('30')).toBeInTheDocument();
  });
});
