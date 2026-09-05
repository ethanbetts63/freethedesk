import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Django's API routes are slash-terminated. Keep those slashes intact when
  // Next proxies browser requests so POST bodies are never lost to a redirect.
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      { source: "/websites", destination: "/dealer-websites", permanent: true },
      { source: "/website-builder", destination: "/dealership-website-builder", permanent: true },
      { source: "/dealers", destination: "/licensing", permanent: true },
      { source: "/dealers/signup", destination: "/licensing#signup", permanent: true },
    ];
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
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

