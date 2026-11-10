import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds a fully static copy (out/) with relative asset paths,
// used for hosting the proposal as a standalone static page.
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(staticExport ? { output: "export" as const, assetPrefix: "./app", trailingSlash: false } : {}),
  images: {
    unoptimized: staticExport,
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920, 2400],
  },
};

export default nextConfig;
