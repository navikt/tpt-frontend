import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Enable standalone output for Docker deployment
  output: "standalone",
  // Use in-memory cache only (no filesystem writes in read-only container)
  cacheMaxMemorySize: 50 * 1024 * 1024, // 50MB
};

export default withNextIntl(nextConfig);
