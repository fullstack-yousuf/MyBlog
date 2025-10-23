// // next.config.ts
// import type { NextConfig } from "next";
// // @ts-ignore: next-pwa does not provide type declarations
// import withPWAInit from "next-pwa";

// // initialize next-pwa
// const withPWA = withPWAInit({
//   dest: "public",
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === "development", // no SW in dev mode
//   fallbacks: {
//     document: "/offline.html",
//   },
//   runtimeCaching: [
//     {
//       // 🛰️ API cache from NestJS backend
//       urlPattern: /^https?:\/\/localhost:5000\/api\/.*$/i,
//       handler: "NetworkFirst",
//       options: {
//         cacheName: "api-cache",
//         networkTimeoutSeconds: 3,
//         expiration: {
//           maxEntries: 50,
//           maxAgeSeconds: 60 * 60 * 24, // 1 day
//         },
//       },
//     },
//     {
//       // 🖼️ Images and icons
//       urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
//       handler: "CacheFirst",
//       options: {
//         cacheName: "image-cache",
//         expiration: {
//           maxEntries: 100,
//           maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
//         },
//       },
//     },
//     {
//       // ⚙️ Next.js static assets
//       urlPattern: /\/_next\/static\/.*/i,
//       handler: "StaleWhileRevalidate",
//       options: {
//         cacheName: "next-static",
//       },
//     },
//     {
//       // 🌐 Fallback pages (HTML)
//       urlPattern: /.*/i,
//       handler: "StaleWhileRevalidate",
//       options: {
//         cacheName: "pages-cache",
//       },
//     },
//   ],
// });

// // ✅ Final merged Next.js config
// const nextConfig: NextConfig = {
//   reactStrictMode: true,
//   images: {
//     domains: ["localhost"],
//   },
//   experimental: {
//     turbo: true,
//   }as any,
// };

// // ✅ Export wrapped config
// export default withPWA(nextConfig);
const withPWA = require("next-pwa") as any;
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // appDir is not present in the installed Next.js types; cast to any to avoid the type error
    appDir: true,
  } as any,
};

export default withPWA({
  ...nextConfig,
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: isDev, // disable service worker in dev mode
  fallbacks: {
    document: "/offline.html",
  },
  runtimeCaching: [
    {
      // Cache API calls with a NetworkFirst strategy
      urlPattern: /^\/api\/.*$/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24, // 1 day
        },
        networkTimeoutSeconds: 3,
      },
    },
    {
      // Cache images & icons
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "image-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    {
      // Cache Next.js static files (_next/static/*)
      urlPattern: /\/_next\/static\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "next-static",
      },
    },
    {
      // Cache all other routes (pages)
      urlPattern: /.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "pages-cache",
      },
    },
  ],
});
