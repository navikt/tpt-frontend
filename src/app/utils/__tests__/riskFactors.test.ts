import {
  getSeverityFromImpactAndMultiplier,
  getSeverityColor,
  getSeverityIconColor,
  getTagVariantFromSeverity,
  getRiskFactors,
} from '../riskFactors';
import type { Vulnerability } from '../../types/vulnerabilities';

describe('riskFactors utils', () => {
  describe('getSeverityFromImpactAndMultiplier', () => {
    it('should return "info" when multiplier is less than 1.0', () => {
      expect(getSeverityFromImpactAndMultiplier('HIGH', 0.5)).toBe('info');
      expect(getSeverityFromImpactAndMultiplier('CRITICAL', 0.9)).toBe('info');
    });

    it('should return "high" for CRITICAL impact', () => {
      expect(getSeverityFromImpactAndMultiplier('CRITICAL', 2.0)).toBe('high');
    });

    it('should return "high" for HIGH impact', () => {
      expect(getSeverityFromImpactAndMultiplier('HIGH', 1.5)).toBe('high');
    });

    it('should return "medium" for MEDIUM impact', () => {
      expect(getSeverityFromImpactAndMultiplier('MEDIUM', 1.2)).toBe('medium');
    });

    it('should return "low" for LOW impact', () => {
      expect(getSeverityFromImpactAndMultiplier('LOW', 1.1)).toBe('low');
    });

    it('should return "info" for unknown impact', () => {
      expect(getSeverityFromImpactAndMultiplier('UNKNOWN', 1.5)).toBe('info');
    });
  });

  describe('getSeverityColor', () => {
    it('should return correct colors for each severity level', () => {
      expect(getSeverityColor('high')).toBe('var(--a-surface-danger-subtle)');
      expect(getSeverityColor('medium')).toBe('var(--a-surface-warning-subtle)');
      expect(getSeverityColor('low')).toBe('var(--a-surface-success-subtle)');
      expect(getSeverityColor('info')).toBe('var(--a-surface-info-subtle)');
    });
  });

  describe('getSeverityIconColor', () => {
    it('should return correct icon colors for each severity level', () => {
      expect(getSeverityIconColor('high')).toBe('var(--a-icon-danger)');
      expect(getSeverityIconColor('medium')).toBe('var(--a-icon-warning)');
      expect(getSeverityIconColor('low')).toBe('var(--a-icon-success)');
      expect(getSeverityIconColor('info')).toBe('var(--a-icon-info)');
    });
  });

  describe('getTagVariantFromSeverity', () => {
    it('should return correct tag variant for each severity level', () => {
      expect(getTagVariantFromSeverity('high')).toBe('error');
      expect(getTagVariantFromSeverity('medium')).toBe('warning');
      expect(getTagVariantFromSeverity('low')).toBe('success');
      expect(getTagVariantFromSeverity('info')).toBe('info');
    });
  });

  describe('getRiskFactors', () => {
    it('should return empty array when no breakdown exists', () => {
      const vuln: Vulnerability = {
        identifier: 'CVE-2024-1234',
        packageName: 'test-package',
        riskScore: 100,
      };
      expect(getRiskFactors(vuln)).toEqual([]);
    });

    it('should return risk factors when breakdown exists', () => {
      const vuln: Vulnerability = {
        identifier: 'CVE-2024-1234',
        packageName: 'test-package',
        riskScore: 180,
        riskScoreBreakdown: {
          baseScore: 100,
          totalScore: 180,
          factors: [
            {
              name: 'severity',
              contribution: 100,
              percentage: 55.6,
              multiplier: 1.0,
              explanation: 'Base severity score',
              impact: 'HIGH',
            },
            {
              name: 'exposure',
              contribution: 50,
              percentage: 27.8,
              multiplier: 1.5,
              explanation: 'Application is exposed to the internet',
              impact: 'HIGH',
            },
          ],
        },
      };

      const factors = getRiskFactors(vuln);
      expect(factors).toHaveLength(2);
      expect(factors[0].name).toBe('Alvorlighetsgrad');
      expect(factors[0].multiplier).toBe(1.0); // Severity always 1.0
      expect(factors[1].name).toBe('Eksponering');
      expect(factors[1].multiplier).toBe(1.5);
    });

    it('should handle factors without config gracefully', () => {
      const vuln: Vulnerability = {
        identifier: 'CVE-2024-1234',
        packageName: 'test-package',
        riskScore: 100,
        riskScoreBreakdown: {
          baseScore: 100,
          totalScore: 100,
          factors: [
            {
              name: 'unknown_factor',
              contribution: 10,
              percentage: 10,
              multiplier: 1.0,
              explanation: 'Unknown factor',
              impact: 'LOW',
            },
          ],
        },
      };

      const factors = getRiskFactors(vuln);
      expect(factors).toHaveLength(1);
      expect(factors[0].name).toBe('Unknown factor');
      expect(factors[0].multiplier).toBe(1.0);
    });
  });
});
