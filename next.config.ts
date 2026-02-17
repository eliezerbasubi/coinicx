import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "app.hyperliquid.xyz",
        pathname: "/coins/**",
      },
    ],
  },
};

export default nextConfig;
