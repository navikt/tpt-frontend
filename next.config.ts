import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Enable standalone output for Docker deployment
  output: "standalone",
  // Use in-memory cache for fetch() calls (no filesystem writes)
  cacheMaxMemorySize: 50 * 1024 * 1024, // 50MB
  // In-memory cache handler to prevent filesystem writes in read-only container
  cacheHandler: require.resolve("./cache-handler.js"),
};

export default withNextIntl(nextConfig);
