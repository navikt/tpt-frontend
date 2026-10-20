import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type CheckResult, useCheckResults } from "../useCheckResults";

describe("useCheckResults", () => {
    const fetchMock = vi.fn<typeof fetch>();

    beforeEach(() => {
        fetchMock.mockReset();
        vi.stubGlobal("fetch", fetchMock);
        vi.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("loads and groups checks and triggers collection only on mount", async () => {
        const good: CheckResult = {
            type: "AllGood",
            name: "good-check",
            desc: "Passing check",
            severity: "LOW",
            whenChecked: "2026-10-12T06:00:00Z",
        };
        const bad: CheckResult = {
            ...good,
            type: "NeedsWork",
            name: "bad-check",
            severity: "HIGH",
            reasons: ["Missing configuration"],
        };
        const badWithoutReason: CheckResult = {
            ...bad,
            name: "bad-check-without-reason",
            reasons: [],
        };
        fetchMock
            .mockResolvedValueOnce(new Response(JSON.stringify([
                {
                    repoName: "test-repo",
                    repoOwners: ["team-a", "team-b"],
                    results: [good, bad, badWithoutReason],
                },
            ])))
            .mockResolvedValueOnce(new Response(null, { status: 202 }));

        const { result, rerender } = renderHook(() => useCheckResults());

        expect(result.current.isLoading).toBe(true);
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.checkResults).toEqual([
            { name: "test-repo", owners: ["team-a", "team-b"], good: [good], bad: [bad, badWithoutReason] },
        ]);
        expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/datacollector/checks");
        expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/datacollector/collect", { method: "POST" });

        rerender();
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("stops loading and logs failed requests without retrying on rerender", async () => {
        const loadError = new Error("Check request failed");
        const collectError = new Error("Collection request failed");
        const errorLog = vi.spyOn(console, "error").mockImplementation(() => {});
        fetchMock
            .mockRejectedValueOnce(loadError)
            .mockRejectedValueOnce(collectError);

        const { result, rerender } = renderHook(() => useCheckResults());

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.checkResults).toEqual([]);
        expect(result.current.hasError).toBe(true);
        expect(errorLog).toHaveBeenCalledWith(loadError);
        expect(errorLog).toHaveBeenCalledWith(collectError);

        rerender();
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });
});
