import { useEffect, useRef, useState } from "react";

// Wait this long after the last sync_complete before re-fetching,
// so a burst of events collapses into a single fetch.
const DEBOUNCE_MS = 1000;

interface UseSyncEventsOptions {
  onSyncComplete: () => void;
  onGitHubSyncComplete?: () => void;
  onGitHubSyncStarted?: () => void;
}

export function useSyncEvents({
  onSyncComplete,
  onGitHubSyncComplete,
  onGitHubSyncStarted,
}: UseSyncEventsOptions): {
  isSyncing: boolean;
  isGitHubSyncing: boolean;
} {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGitHubSyncing, setIsGitHubSyncing] = useState(false);

  const onSyncCompleteRef = useRef(onSyncComplete);
  const onGitHubSyncCompleteRef = useRef(onGitHubSyncComplete);
  const onGitHubSyncStartedRef = useRef(onGitHubSyncStarted);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const githubDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onSyncCompleteRef.current = onSyncComplete;
  });

  useEffect(() => {
    onGitHubSyncCompleteRef.current = onGitHubSyncComplete;
  });

  useEffect(() => {
    onGitHubSyncStartedRef.current = onGitHubSyncStarted;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const eventSource = new EventSource("/api/events");

    eventSource.addEventListener("team_sync_started", () => {
      setIsSyncing(true);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    });

    eventSource.addEventListener("team_sync_complete", () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        onSyncCompleteRef.current();
        setIsSyncing(false);
        debounceTimerRef.current = null;
      }, DEBOUNCE_MS);
    });

    eventSource.addEventListener("github_vuln_sync_started", () => {
      setIsGitHubSyncing(true);
      onGitHubSyncStartedRef.current?.();
      if (githubDebounceTimerRef.current) {
        clearTimeout(githubDebounceTimerRef.current);
        githubDebounceTimerRef.current = null;
      }
    });

    eventSource.addEventListener("github_vuln_sync_complete", () => {
      if (githubDebounceTimerRef.current) {
        clearTimeout(githubDebounceTimerRef.current);
      }
      githubDebounceTimerRef.current = setTimeout(() => {
        onGitHubSyncCompleteRef.current?.();
        setIsGitHubSyncing(false);
        githubDebounceTimerRef.current = null;
      }, DEBOUNCE_MS);
    });

    eventSource.onerror = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (githubDebounceTimerRef.current) {
        clearTimeout(githubDebounceTimerRef.current);
        githubDebounceTimerRef.current = null;
      }
      setIsSyncing(false);
      setIsGitHubSyncing(false);
    };

    return () => {
      eventSource.close();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (githubDebounceTimerRef.current) {
        clearTimeout(githubDebounceTimerRef.current);
      }
    };
  }, []);

  return { isSyncing, isGitHubSyncing };
}
