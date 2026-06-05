"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useVulnerabilities } from "@/app/modules/vulnerabilities/hooks/useVulnerabilities";
import {
  getKvItem,
  setKvItem,
  removeKvItem,
  KV_KEYS,
} from "@/app/shared/utils/indexedDbCache";

interface RoleContextType {
  selectedRole: string | null;
  setSelectedRole: (role: string | null) => void;
  actualRole: string | undefined;
  effectiveRole: string | undefined;
  isInitialized: boolean;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleContextProvider({ children }: { children: ReactNode }) {
  const { data: vulnData, isLoading } = useVulnerabilities();
  const actualRole = vulnData?.userRole;

  const [selectedRole, setSelectedRoleState] = useState<string | null>(null);

  // Load stored role from IndexedDB on mount
  useEffect(() => {
    (async () => {
      const role = await getKvItem<string>(KV_KEYS.ROLE_CONTEXT);
      if (role) {
        setSelectedRoleState(role);
      }
    })();
  }, []);

  // Save to IndexedDB when changed
  const setSelectedRole = (role: string | null) => {
    setSelectedRoleState(role);
    if (role) {
      setKvItem(KV_KEYS.ROLE_CONTEXT, role);
    } else {
      removeKvItem(KV_KEYS.ROLE_CONTEXT);
    }
  };

  // Determine effective role (override or actual)
  const effectiveRole = selectedRole || actualRole;

  // Only consider initialized when we have data
  const isInitialized = !!vulnData && !isLoading;

  const value: RoleContextType = {
    selectedRole,
    setSelectedRole,
    actualRole,
    effectiveRole,
    isInitialized,
    isLoading,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRoleContext() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRoleContext must be used within a RoleContextProvider");
  }
  return context;
}
