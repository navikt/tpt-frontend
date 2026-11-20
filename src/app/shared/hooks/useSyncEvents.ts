import { useEffect, useRef, useState } from "react";

// Wait this long after the last sync_complete before re-fetching,
// so a burst of events collapses into a single fetch.
const DEBOUNCE_MS = 1000;

interface UseSyncEventsOptions {
  onSyncComplete: () => void;
  onGitHubSyncComplete?: () => void;
  onGitHubSyncStarted?: () => void;
  onGitHubSyncError?: () => void;
}

function parseTeamSlug(event: Event): string | null {
  if (!(event instanceof MessageEvent) || typeof event.data !== "string") return null;
  try {
    const parsed: unknown = JSON.parse(event.data);
    if (typeof parsed === "object" && parsed !== null && "teamSlug" in parsed) {
      return typeof parsed.teamSlug === "string" ? parsed.teamSlug : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function useSyncEvents({
  onSyncComplete,
  onGitHubSyncComplete,
  onGitHubSyncStarted,
  onGitHubSyncError,
}: UseSyncEventsOptions): {
  isSyncing: boolean;
  isGitHubSyncing: boolean;
  failedSyncTeams: string[];
} {
  const [isSyncing, setIsSyncing] = useState(false);
  const [failedSyncTeams, setFailedSyncTeams] = useState<string[]>([]);
  const [isGitHubSyncing, setIsGitHubSyncing] = useState(false);

  const onSyncCompleteRef = useRef(onSyncComplete);
  const onGitHubSyncCompleteRef = useRef(onGitHubSyncComplete);
  const onGitHubSyncStartedRef = useRef(onGitHubSyncStarted);
  const onGitHubSyncErrorRef = useRef(onGitHubSyncError);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeSyncTeamsRef = useRef(new Set<string>());
  const refreshPendingRef = useRef(false);
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
    onGitHubSyncErrorRef.current = onGitHubSyncError;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const eventSource = new EventSource("/api/events");

    const scheduleSyncSettled = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        if (refreshPendingRef.current) {
          refreshPendingRef.current = false;
          onSyncCompleteRef.current();
        }
        if (activeSyncTeamsRef.current.size === 0) {
          setIsSyncing(false);
        }
      }, DEBOUNCE_MS);
    };

    eventSource.addEventListener("team_sync_started", (event) => {
      activeSyncTeamsRef.current.add(parseTeamSlug(event) ?? "");
      setIsSyncing(true);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    });

    eventSource.addEventListener("team_sync_complete", (event) => {
      const teamSlug = parseTeamSlug(event);
      activeSyncTeamsRef.current.delete(teamSlug ?? "");
      if (teamSlug) {
        setFailedSyncTeams((prev) => prev.filter((team) => team !== teamSlug));
      }
      refreshPendingRef.current = true;
      scheduleSyncSettled();
    });

    eventSource.addEventListener("team_sync_failed", (event) => {
      const teamSlug = parseTeamSlug(event);
      activeSyncTeamsRef.current.delete(teamSlug ?? "");
      if (teamSlug) {
        setFailedSyncTeams((prev) => (prev.includes(teamSlug) ? prev : [...prev, teamSlug]));
      }
      if (refreshPendingRef.current) {
        scheduleSyncSettled();
      } else if (activeSyncTeamsRef.current.size === 0) {
        setIsSyncing(false);
      }
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
      activeSyncTeamsRef.current.clear();
      setIsSyncing(false);
      setIsGitHubSyncing(false);
      onGitHubSyncErrorRef.current?.();
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

  return { isSyncing, isGitHubSyncing, failedSyncTeams };
}
