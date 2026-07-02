import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Prevent Turbopack from trying to bundle Mongoose (it uses native Node.js modules)
  serverExternalPackages: ["mongoose"],

  images: {
    // Allow serving local uploads
    localPatterns: [
      {
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
