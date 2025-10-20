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
};

export default nextConfig;
