import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSyncEvents } from "./useSyncEvents";

class FakeEventSource {
  static instance: FakeEventSource | null = null;
  onerror: (() => void) | null = null;
  private listeners = new Map<string, ((event: Event) => void)[]>();

  constructor() {
    FakeEventSource.instance = this;
  }

  addEventListener(type: string, listener: (event: Event) => void) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }

  close() {}

  emit(type: string, data: object) {
    const event = new MessageEvent(type, { data: JSON.stringify(data) });
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }
}

function emit(type: string, data: object) {
  act(() => FakeEventSource.instance?.emit(type, data));
}

describe("useSyncEvents team sync failures", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("EventSource", FakeEventSource);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("stops syncing and reports the team when a sync fails", () => {
    const onSyncComplete = vi.fn();
    const { result } = renderHook(() => useSyncEvents({ onSyncComplete }));

    emit("team_sync_started", { teamSlug: "team-a" });
    expect(result.current.isSyncing).toBe(true);

    emit("team_sync_failed", { teamSlug: "team-a" });

    expect(result.current.isSyncing).toBe(false);
    expect(result.current.failedSyncTeams).toEqual(["team-a"]);
    expect(onSyncComplete).not.toHaveBeenCalled();
  });

  it("clears the failure when a later sync for the team completes", () => {
    const { result } = renderHook(() => useSyncEvents({ onSyncComplete: vi.fn() }));

    emit("team_sync_failed", { teamSlug: "team-a" });
    emit("team_sync_failed", { teamSlug: "team-b" });
    emit("team_sync_complete", { teamSlug: "team-a" });

    expect(result.current.failedSyncTeams).toEqual(["team-b"]);
  });
});
