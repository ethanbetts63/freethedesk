import { securityHeaders } from '@freetheplatform/web-security';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders({
          // Next's App Router inlines its own bootstrap, and Tailwind and
          // React's `style` prop both produce inline styles. The alternative
          // is a per-request nonce, which forces every page dynamic.
          allowInlineScripts: true,
          allowInlineStyles: true,

          hosts: {
            script: [
              'https://www.clarity.ms',
              'https://va.vercel-scripts.com',
              'https://js.stripe.com',
            ],
            img: ['https://www.clarity.ms', 'https://c.clarity.ms'],
            connect: [
              'https://*.clarity.ms',
              'https://va.vercel-scripts.com',
              'https://api.stripe.com',
            ],
            frame: ['https://js.stripe.com', 'https://hooks.stripe.com'],
          },
        }),
      },
    ];
  },
  async rewrites() {
    const apiUrl = process.env.DJANGO_API_URL ?? 'http://127.0.0.1:8000';

    return [
      { source: '/api/:path*/', destination: `${apiUrl}/api/:path*/` },
      { source: '/api/:path*', destination: `${apiUrl}/api/:path*` },
    ];
  },
};

export default nextConfig;
