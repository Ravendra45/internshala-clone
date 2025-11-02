import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // === enable static export ===
  // This replaces the old `next export` CLI.
  output: "export",

  // Optional: produce folder/index.html style (safer for many static hosts)
  trailingSlash: true,

  // If you use next/image, disable optimization for static export:
  images: {
    unoptimized: true
  }
};

export default nextConfig;
