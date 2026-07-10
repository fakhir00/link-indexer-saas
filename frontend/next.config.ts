import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
    const backendBase = apiBase.replace(/\/api$/, '');
    const sitemapApiBase = process.env.NEXT_PUBLIC_SITEMAP_API_URL ?? 'http://localhost:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendBase}/api/:path*`,
      },
      {
        source: '/sitemap-projects',
        destination: `${sitemapApiBase}/sitemap-projects/index.html`,
      },
      {
        source: '/sitemap-projects/:path*',
        destination: `${sitemapApiBase}/sitemap-projects/:path*`,
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
