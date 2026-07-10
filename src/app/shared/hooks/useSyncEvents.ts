import { useEffect, useRef, useState } from "react";

interface UseSyncEventsOptions {
  onSyncComplete: () => void;
}

export function useSyncEvents({ onSyncComplete }: UseSyncEventsOptions): {
  isSyncing: boolean;
} {
  const [isSyncing, setIsSyncing] = useState(false);
  const onSyncCompleteRef = useRef(onSyncComplete);

  useEffect(() => {
    onSyncCompleteRef.current = onSyncComplete;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const eventSource = new EventSource("/api/events");

    eventSource.addEventListener("team_sync_started", () => {
      setIsSyncing(true);
    });

    eventSource.addEventListener("team_sync_complete", () => {
      onSyncCompleteRef.current();
      setIsSyncing(false);
    });

    eventSource.onerror = () => {
      // EventSource reconnects automatically on error.
      // Reset syncing state so we don't show a permanent spinner if the
      // connection drops mid-sync.
      setIsSyncing(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return { isSyncing };
}
