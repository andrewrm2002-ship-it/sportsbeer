import { BASE_PATH } from "./src/lib/base-path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: BASE_PATH,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

export default nextConfig;
