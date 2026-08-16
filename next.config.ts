import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || undefined,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.tpq-qurani.example.id",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
      },
    ],
    // Dev/self-hosted only: MinIO media lives on localhost:9000; Next 16's
    // SSRF guard blocks private-IP optimization by default. Prod uses the
    // public CDN hostname above, so this is inert in production.
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
