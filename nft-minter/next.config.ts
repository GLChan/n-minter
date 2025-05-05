import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        port: '',
      },

      {
        protocol: 'https',
        hostname: 'azure-many-sole-7.mypinata.cloud/', // 允许 Pinata 公共网关
        pathname: '/ipfs/**',
      },
    ],
  }
};

export default nextConfig;
