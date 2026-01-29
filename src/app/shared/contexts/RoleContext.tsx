"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { useVulnerabilities } from "@/app/modules/vulnerabilities/hooks/useVulnerabilities";

const ROLE_CONTEXT_KEY = "tpt-role-context";

interface RoleContextType {
  selectedRole: string | null;
  setSelectedRole: (role: string | null) => void;
  actualRole: string | undefined;
  effectiveRole: string | undefined;
  isInitialized: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

function getStoredRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ROLE_CONTEXT_KEY);
}

export function RoleContextProvider({ children }: { children: ReactNode }) {
  const { data: vulnData } = useVulnerabilities();
  const actualRole = vulnData?.userRole;
  
  const [selectedRole, setSelectedRoleState] = useState<string | null>(() => getStoredRole());
  const [isInitialized] = useState(true);

  // Save to localStorage when changed
  const setSelectedRole = (role: string | null) => {
    setSelectedRoleState(role);
    if (role) {
      localStorage.setItem(ROLE_CONTEXT_KEY, role);
    } else {
      localStorage.removeItem(ROLE_CONTEXT_KEY);
    }
  };

  // Determine effective role (override or actual)
  const effectiveRole = selectedRole || actualRole;

  const value: RoleContextType = {
    selectedRole,
    setSelectedRole,
    actualRole,
    effectiveRole,
    isInitialized,
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
