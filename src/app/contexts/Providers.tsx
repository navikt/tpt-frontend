"use client";
import { ReactNode } from "react";
import { VulnerabilitiesProvider } from "./VulnerabilitiesContext";
import { ConfigProvider } from "./ConfigContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider>
      <VulnerabilitiesProvider>
        {children}
      </VulnerabilitiesProvider>
    </ConfigProvider>
  );
}
