import { vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useConfig, __resetConfigState } from '../../shared/hooks/useConfig';

// Mock Faro instrumentation
vi.mock('@/instrumentation/faro', () => ({
  getFaroInstance: vi.fn(() => null),
}));

// Mock the global fetch
global.fetch = vi.fn();

describe('useConfig hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    __resetConfigState(); // Reset global state between tests
  });

  it('should return config data on successful fetch', async () => {
    const mockConfig = {
      thresholds: {
        critical: 75,
        high: 50,
        medium: 25,
      },
      scoring: {
        severityMax: 25,
        exploitationMax: 30,
        exposureMax: 25,
        environmentMax: 15,
        actionabilityMax: 10,
      },
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockConfig,
    } as Response);

    const { result } = renderHook(() => useConfig());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.config).toEqual(mockConfig);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.config).toBeNull();
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('errors.networkError');
  });

  it('should handle non-ok responses', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ error: 'errors.fetchConfigError' }),
    } as Response);

    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.config).toBeNull();
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('errors.fetchConfigError');
  });
});
