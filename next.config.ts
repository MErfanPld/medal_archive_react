import type { NextConfig } from "next";

const API_PROXY_TARGET =
  process.env.API_PROXY_TARGET?.replace(/\/$/, "") || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  allowedDevOrigins: ["127.0.0.1", "localhost"],

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_PROXY_TARGET}/api/:path*`,
      },
      {
        source: "/media/:path*",
        destination: `${API_PROXY_TARGET}/media/:path*`,
      },
    ];
  },
};

export default nextConfig;
