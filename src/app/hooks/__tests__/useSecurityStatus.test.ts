import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSecurityStatus } from "@/app/shared/hooks/useSecurityStatus";
import { mockSecurityStatusPayload } from "@/app/mocks/mockPayloads";
import type { SecurityStatusResponse } from "@/app/types/securityStatus";

afterEach(() => vi.unstubAllGlobals());

describe("useSecurityStatus", () => {
  it("preserves the backend trend even when the monthly overdue series falls", async () => {
    const payload: SecurityStatusResponse = {
      ...mockSecurityStatusPayload,
      teams: mockSecurityStatusPayload.teams.slice(0, 1).map((team) => ({
        ...team,
        trend: {
          ...team.trend,
          status: "red",
          direction: "worse",
          appsWithOverduePerMonth: [4, 3, 2, 1],
        },
      })),
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(payload))));

    const { result } = renderHook(() => useSecurityStatus());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual(payload);
  });
});
