"use client";
import { createContext, useContext, ReactNode } from "react";
import { useVulnerabilities } from "@/app/modules/vulnerabilities/hooks/useVulnerabilities";

type VulnerabilitiesContextType = ReturnType<typeof useVulnerabilities>;

const VulnerabilitiesContext = createContext<VulnerabilitiesContextType | undefined>(undefined);

export function VulnerabilitiesProvider({ children }: { children: ReactNode }) {
  const vulnerabilities = useVulnerabilities();
  
  return (
    <VulnerabilitiesContext.Provider value={vulnerabilities}>
      {children}
    </VulnerabilitiesContext.Provider>
  );
}

export function useVulnerabilitiesContext() {
  const context = useContext(VulnerabilitiesContext);
  if (context === undefined) {
    throw new Error("useVulnerabilitiesContext must be used within a VulnerabilitiesProvider");
  }
  return context;
}
