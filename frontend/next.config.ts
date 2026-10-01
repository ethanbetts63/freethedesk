import { securityHeaders } from '@freetheplatform/web-security';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  // Addresses Google has already seen. They went out on 9 September 2026 with
  // the config rewrite and the Perth page, still listed in Google, answered 404
  // until they came back. Remove one only once Search Console no longer has it.
  async redirects() {
    return [
      { source: '/websites', destination: '/', permanent: true },
      { source: '/dealer-websites', destination: '/', permanent: true },
      { source: '/website-builder', destination: '/dealership-website-builder', permanent: true },
      {
        source: '/website-development-perth',
        destination: '/website-development',
        permanent: true,
      },
      { source: '/dealers/signup', destination: '/licensing#signup', permanent: true },
      { source: '/work/:path*', destination: '/portfolio/:path*', permanent: true },
    ];
  },
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
              // Wildcard, not www: the tag only bootstraps, and pulls the
              // recorder from scripts.clarity.ms.
              'https://*.clarity.ms',
              'https://va.vercel-scripts.com',
              'https://js.stripe.com',
              // GA4. gtag.js is served from googletagmanager.com even when Tag
              // Manager itself is not in use.
              'https://www.googletagmanager.com',
            ],
            img: [
              'https://www.clarity.ms',
              'https://c.clarity.ms',
              // GA4's fallback transport: where `sendBeacon` is unavailable the
              // hit goes out as a pixel, so img-src is what carries it.
              'https://www.googletagmanager.com',
              'https://*.google-analytics.com',
            ],
            connect: [
              'https://*.clarity.ms',
              'https://va.vercel-scripts.com',
              'https://api.stripe.com',
              // GA4 collection. Three hosts, not one: hits go to
              // *.google-analytics.com, consent and server-side tagging to
              // *.analytics.google.com, and the tag fetches its own remote
              // config from googletagmanager.com after loading.
              'https://*.google-analytics.com',
              'https://*.analytics.google.com',
              'https://www.googletagmanager.com',
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
