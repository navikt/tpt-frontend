import { renderHook, waitFor } from '@testing-library/react';
import { useConfig } from '../../shared/hooks/useConfig';

// Mock Faro instrumentation
jest.mock('@/instrumentation/faro', () => ({
  getFaro: jest.fn(() => null),
}));

// Mock the global fetch
global.fetch = jest.fn();

describe('useConfig hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return config data on successful fetch', async () => {
    const mockConfig = {
      thresholds: {
        high: 150,
        medium: 75,
        low: 30,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockConfig,
    });

    const { result } = renderHook(() => useConfig());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.config).toEqual(mockConfig);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.config).toBeNull();
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('errors.networkError');
  });

  it('should handle non-ok responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ error: 'errors.fetchConfigError' }),
    });

    const { result } = renderHook(() => useConfig());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.config).toBeNull();
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('errors.fetchConfigError');
  });
});
