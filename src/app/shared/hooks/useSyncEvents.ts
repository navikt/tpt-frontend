import { useEffect, useRef, useState } from "react";

// Wait this long after the last team_sync_complete before re-fetching,
// so a burst of events for multiple teams collapses into a single fetch.
const DEBOUNCE_MS = 1000;

interface UseSyncEventsOptions {
  onSyncComplete: () => void;
}

export function useSyncEvents({ onSyncComplete }: UseSyncEventsOptions): {
  isSyncing: boolean;
} {
  const [isSyncing, setIsSyncing] = useState(false);
  const onSyncCompleteRef = useRef(onSyncComplete);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onSyncCompleteRef.current = onSyncComplete;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const eventSource = new EventSource("/api/events");

    eventSource.addEventListener("team_sync_started", () => {
      setIsSyncing(true);
      // Cancel any pending fetch — more syncs are still in flight
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    });

    eventSource.addEventListener("team_sync_complete", () => {
      // Debounce: wait for the burst to settle before fetching
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        onSyncCompleteRef.current();
        setIsSyncing(false);
        debounceTimerRef.current = null;
      }, DEBOUNCE_MS);
    });

    eventSource.onerror = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      setIsSyncing(false);
    };

    return () => {
      eventSource.close();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return { isSyncing };
}
