import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests from 127.0.0.1 in dev (silences the browser warning)
  allowedDevOrigins: ["http://127.0.0.1:3000", "http://localhost:3000"],

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },

  turbopack: {
    // Point Turbopack at this package's own root so it ignores the parent lockfile
    root: path.resolve(__dirname),
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
