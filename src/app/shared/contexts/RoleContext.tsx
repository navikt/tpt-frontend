"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useVulnerabilitiesContext } from "@/app/contexts/VulnerabilitiesContext";
import {
  getKvItem,
  setKvItem,
  removeKvItem,
  KV_KEYS,
} from "@/app/shared/utils/indexedDbCache";

export const ALL_ROLES = ["DEVELOPER", "TEAM_MEMBER", "PRODUCT_LEADER", "TECH_LEADER"] as const;
export type AppRole = (typeof ALL_ROLES)[number];

// Roles available to all users
const BASE_ROLES: AppRole[] = ["DEVELOPER", "TEAM_MEMBER"];
// Additional roles only available to ADMINs
const ADMIN_ONLY_ROLES: AppRole[] = ["PRODUCT_LEADER", "TECH_LEADER"];

interface RoleContextType {
  selectedRole: string | null;
  setSelectedRole: (role: string | null) => void;
  actualRole: string | undefined;
  effectiveRole: string | undefined;
  availableRoles: AppRole[];
  hasSelectedRole: boolean;
  isInitialized: boolean;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleContextProvider({ children }: { children: ReactNode }) {
  const { data: vulnData, isLoading, error: vulnError } = useVulnerabilitiesContext();
  const actualRole = vulnData?.userRole;

  const [selectedRole, setSelectedRoleState] = useState<string | null>(null);
  const [hasSelectedRole, setHasSelectedRole] = useState(false);

  // Load stored role from IndexedDB on mount
  useEffect(() => {
    (async () => {
      const role = await getKvItem<string>(KV_KEYS.ROLE_CONTEXT);
      if (role) {
        setSelectedRoleState(role);
        setHasSelectedRole(true);
      }
    })();
  }, []);

  // Save to IndexedDB when changed
  const setSelectedRole = (role: string | null) => {
    setSelectedRoleState(role);
    if (role) {
      setKvItem(KV_KEYS.ROLE_CONTEXT, role);
      setHasSelectedRole(true);
    } else {
      removeKvItem(KV_KEYS.ROLE_CONTEXT);
      setHasSelectedRole(false);
    }
  };

  // Determine effective role (override or actual)
  const effectiveRole = selectedRole || actualRole;

  // Roles the current user can choose from
  const availableRoles: AppRole[] =
    actualRole === "ADMIN"
      ? [...BASE_ROLES, ...ADMIN_ONLY_ROLES]
      : BASE_ROLES;

  // Consider initialized once the fetch has settled — either with data or
  // with an error. Never leave pages spinning forever on a network failure.
  const isInitialized = !isLoading && (!!vulnData || !!vulnError);

  const value: RoleContextType = {
    selectedRole,
    setSelectedRole,
    actualRole,
    effectiveRole,
    availableRoles,
    hasSelectedRole,
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
