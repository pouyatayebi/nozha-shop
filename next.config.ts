import type { NextConfig } from "next";

const nextConfig = {
      images: {
    domains: ['images.ctfassets.net','utfs.io'],
    
  },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;