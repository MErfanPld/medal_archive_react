import type { NextConfig } from "next";

/**
 * In development, browser calls same-origin `/api/*` which Next proxies to Django.
 * This avoids CORS between localhost:3000 and 127.0.0.1:8000.
 * Set NEXT_PUBLIC_API_URL to a full URL (e.g. production API) to call backend directly
 * (backend must then allow CORS).
 */
const API_PROXY_TARGET =
  process.env.API_PROXY_TARGET?.replace(/\/$/, "") || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
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
