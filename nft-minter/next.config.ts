import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

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
        hostname: 'mzmlztcizgitmitugcdk.supabase.co',
        port: '',
      },

      {
        protocol: 'https',
        hostname: 'azure-many-sole-7.mypinata.cloud', // 允许 Pinata 公共网关
        pathname: '/ipfs/**',
      },
    ],
  }
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);