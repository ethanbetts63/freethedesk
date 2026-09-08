import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Django's API routes are slash-terminated. Keep those slashes intact when
  // Next proxies browser requests so POST bodies are never lost to a redirect.
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      { source: "/websites", destination: "/", permanent: true },
      { source: "/dealer-websites", destination: "/", permanent: true },
      { source: "/website-builder", destination: "/dealership-website-builder", permanent: true },
      { source: "/website-development-perth", destination: "/website-development", permanent: true },
      { source: "/dealers/signup", destination: "/licensing#signup", permanent: true },
      { source: "/work/:path*", destination: "/portfolio/:path*", permanent: true },
    ];
  },
  async headers() {
    // 'unsafe-inline' on script-src is still required: the JSON-LD blocks and
    // the Clarity loader are inline, and Next's own bootstrap is too. Moving to
    // a nonce needs middleware, so this is the tightening that is safe today —
    // it closes off every origin we do not actually load code from.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.clarity.ms https://va.vercel-scripts.com https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://www.clarity.ms https://c.clarity.ms",
      "font-src 'self' data:",
      "connect-src 'self' https://*.clarity.ms https://va.vercel-scripts.com https://api.stripe.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [{
      source: "/(.*)",
      headers: [
        { key: "Content-Security-Policy", value: csp },
        { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    }];
  },
  async rewrites() {
    const apiUrl = process.env.DJANGO_API_URL ?? "http://127.0.0.1:8000";

    return [
      { source: "/api/:path*/", destination: `${apiUrl}/api/:path*/` },
      { source: "/api/:path*", destination: `${apiUrl}/api/:path*` },
    ];
  },
};

export default nextConfig;

