import { useCallback, useEffect, useState } from "react";
import type { CopilotRemediationsResponse } from "@/app/shared/types/copilotRemediation";

const disabled: CopilotRemediationsResponse = { enabled: false, remediations: [] };

export function useCopilotRemediations(repository: string | undefined, active = true) {
  const [data, setData] = useState<CopilotRemediationsResponse>(disabled);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!repository || !active) return;
    const controller = new AbortController();

    const fetchRemediations = async () => {
      try {
        const response = await fetch(
          `/api/remediations/copilot?repository=${encodeURIComponent(repository)}`,
          { signal: controller.signal },
        );
        setData(response.ok ? await response.json() : disabled);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn("Could not fetch Copilot remediations", error);
          setData(disabled);
        }
      }
    };

    fetchRemediations();
    return () => controller.abort();
  }, [repository, active, reloadCount]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  return { ...data, reload };
}
