import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce the minimal standalone bundle for Docker builds, omit when deploying to Vercel
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
