import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Django's API routes are slash-terminated. Keep those slashes intact when
  // Next proxies browser requests so POST bodies are never lost to a redirect.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    const apiUrl = process.env.DJANGO_API_URL ?? "http://127.0.0.1:8000";

    return [
      { source: "/api/:path*/", destination: `${apiUrl}/api/:path*/` },
      { source: "/api/:path*", destination: `${apiUrl}/api/:path*` },
    ];
  },
};

export default nextConfig;

