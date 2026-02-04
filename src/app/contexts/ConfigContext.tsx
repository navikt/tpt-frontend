"use client";
import { createContext, useContext, ReactNode } from "react";
import { useConfig } from "@/app/shared/hooks/useConfig";

type ConfigContextType = ReturnType<typeof useConfig>;

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const config = useConfig();
  
  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfigContext() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfigContext must be used within a ConfigProvider");
  }
  return context;
}
