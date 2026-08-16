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
  },
};

export default nextConfig;
