import { useState, useEffect } from "react";
import { getStoredJSON, setStoredJSON } from "@/app/shared/utils/storageHelpers";

const USER_PREFERENCES_KEY = "tpt-user-preferences";

export interface UserPreferences {
  showAllBuckets: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  showAllBuckets: false,
};

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
    const stored = getStoredJSON<UserPreferences>(USER_PREFERENCES_KEY);
    return stored ? { ...DEFAULT_PREFERENCES, ...stored } : DEFAULT_PREFERENCES;
  });

  useEffect(() => {
    setStoredJSON(USER_PREFERENCES_KEY, preferences);
  }, [preferences]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({ ...prev, ...updates }));
  };

  return {
    preferences,
    updatePreferences,
  };
};
