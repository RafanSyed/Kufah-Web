import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ✅ Allow builds to pass even if there are ESLint errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
