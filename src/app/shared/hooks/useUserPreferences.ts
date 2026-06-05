import { useState, useEffect, useRef } from "react";
import {
  getKvItem,
  setKvItem,
  KV_KEYS,
} from "@/app/shared/utils/indexedDbCache";

export interface UserPreferences {
  showAllBuckets: boolean;
  vulnerabilityGrouping: "action" | "package";
}

const DEFAULT_PREFERENCES: UserPreferences = {
  showAllBuckets: false,
  vulnerabilityGrouping: "action",
};

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const loadedRef = useRef(false);

  useEffect(() => {
    (async () => {
      const stored = await getKvItem<UserPreferences>(KV_KEYS.USER_PREFERENCES);
      if (stored) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...stored });
      }
      loadedRef.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!loadedRef.current) return;
    setKvItem(KV_KEYS.USER_PREFERENCES, preferences);
  }, [preferences]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  return {
    preferences,
    updatePreferences,
  };
};
