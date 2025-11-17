import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // menghasilkan .next/standalone untuk runtime container
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "is3.cloudhost.id",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // agar build tidak gagal karena lint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  // agar build tidak gagal karena type errors
  typescript: {
    ignoreBuildErrors: true,
  },
  // Dev/preview proxy to avoid CORS issues when calling backend from the browser.
  // Preferred: set NEXT_PUBLIC_API_BASE_URL (e.g. http://localhost:18080) and the app will call `${BASE}/api/v1` and `${BASE}/credit-api` directly.
  // Alternatively (legacy): set NEXT_PUBLIC_API_URL=/api/v1 and NEXT_PUBLIC_CREDIT_SCORE_API_URL=/credit-api
  // Rewrites below are used when using relative paths; destinations can be configured via API_PROXY_TARGET_CORE and API_PROXY_TARGET_CREDIT.
  async rewrites() {
    // If a single base URL is provided, we don't need rewrites.
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      return [];
    }

    // Fallback proxy targets for legacy relative-path mode
    const core = process.env.API_PROXY_TARGET_CORE || "https://local-dev.satuatap.my.id/api/v1";
    const credit = process.env.API_PROXY_TARGET_CREDIT || "https://local-dev.satuatap.my.id/api/v1";
    const stripTrailingSlash = (u: string) => (u.endsWith("/") ? u.slice(0, -1) : u);
    return [
      {
        source: "/api/v1/:path*",
        destination: `${stripTrailingSlash(core)}/:path*`,
      },
      {
        source: "/credit-api/:path*",
        destination: `${stripTrailingSlash(credit)}/:path*`,
      },
    ];
  },
};

export default nextConfig;
