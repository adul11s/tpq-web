import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || undefined,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-34c5ce5d1648439398fcedbfe1903645.r2.dev",
      },
      ...(process.env.NODE_ENV === "development"
        ? [{ protocol: "http" as const, hostname: "localhost", port: "9000" }]
        : []),
    ],
    // Local MinIO is available only while developing; keep the SSRF guard in production.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
