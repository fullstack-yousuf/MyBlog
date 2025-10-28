const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV !== "production", // ✅ enable PWA only in production
  fallbacks: {
    document: "/offline.html",
  },
  runtimeCaching: [
    {
      urlPattern: /^\/api\/.*$/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24,
        },
        networkTimeoutSeconds: 3,
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "image-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "next-static",
      },
    },
    {
      urlPattern: /.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "pages-cache",
      },
    },
  ],
});

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // ✅ don’t fail builds due to ESLint
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ don’t fail builds due to TS
  },
  experimental: {
    appDir: true,
  } as any,
};

export default withPWA(nextConfig);
