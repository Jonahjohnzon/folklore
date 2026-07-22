import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["expo-server-sdk"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;