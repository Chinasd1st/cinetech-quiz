import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/cinetech-quiz",
  images: { unoptimized: true },
};

export default nextConfig;
