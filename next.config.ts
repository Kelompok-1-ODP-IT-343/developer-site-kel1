import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // menghasilkan .next/standalone untuk runtime container
  output: "standalone",
  // agar build tidak gagal karena lint errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  // agar build tidak gagal karena type errors
  typescript: {
    ignoreBuildErrors: true,
  },
  // Dev/preview proxy to avoid CORS issues when calling backend from the browser.
  // Usage: set NEXT_PUBLIC_API_URL=/api/v1 and NEXT_PUBLIC_CREDIT_SCORE_API_URL=/credit-api
  // Configure destinations via API_PROXY_TARGET_CORE and API_PROXY_TARGET_CREDIT.
  async rewrites() {
    const core = process.env.API_PROXY_TARGET_CORE || "https://local-dev.satuatap.my.id/api/v1";
    const credit = process.env.API_PROXY_TARGET_CREDIT || "https://local-dev.satuatap.my.id/api/v1";
    return [
      {
        source: "/api/v1/:path*",
        destination: `${core}/:path*`,
      },
      {
        source: "/credit-api/:path*",
        destination: `${credit}/:path*`,
      },
    ];
  },
};

export default nextConfig;
