import type { NextConfig } from "next";

/**
 * In development, browser calls same-origin `/api/*` which Next proxies to Django.
 * In production, set NEXT_PUBLIC_API_URL=http://api.nasersolb.com for direct API calls.
 */
const API_PROXY_TARGET =
  process.env.API_PROXY_TARGET?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  // Easier Node server deploy (copy .next/standalone + public + static)
  output: "standalone",

  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  allowedDevOrigins: ["127.0.0.1", "localhost"],

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "api.nasersolb.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.nasersolb.com",
        pathname: "/**",
      },
    ],
  },

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
