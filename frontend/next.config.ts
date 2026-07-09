import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
    const backendBase = apiBase.replace(/\/api$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${backendBase}/api/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/dashboard/campaigns',
        destination: '/campaigns',
        permanent: true,
      },
      {
        source: '/dashboard/campaigns/:path*',
        destination: '/campaigns/:path*',
        permanent: true,
      },
      {
        source: '/dashboard/analytics',
        destination: '/analytics',
        permanent: true,
      },
      {
        source: '/dashboard/directory',
        destination: '/directory',
        permanent: true,
      },
      {
        source: '/dashboard/sitemap-intelligence',
        destination: '/sitemap-intelligence',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
