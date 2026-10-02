import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produce the minimal server bundle used by the production Docker image.
  output: "standalone",
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
