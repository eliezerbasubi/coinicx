import type { NextConfig } from "next";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" &&
      process.env.NEXT_PUBLIC_WEB3_NETWORK === "mainnet",
  },
  images: {
    minimumCacheTTL: 31536000, // 1 year
    remotePatterns: [
      {
        protocol: "https",
        hostname: "app.hyperliquid.xyz",
        pathname: "/coins/**",
      },
    ],
  },
  serverExternalPackages: ["pino", "lokijs", "encoding"],
  async headers() {
    return [
      {
        source: "/(.*)?", // Matches all pages
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=630720; includeSubDomains; preload",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin",
          },
          {
            key: "X-Xss-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Permissions-Policy",
            value:
              "accelerometer=(),autoplay=(),camera=(),clipboard-read=(),clipboard-write=(self),geolocation=(),gyroscope=(),hid=(),magnetometer=(),microphone=(),payment=(),publickey-credentials-get=(),screen-wake-lock=(),serial=(),usb=()",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
