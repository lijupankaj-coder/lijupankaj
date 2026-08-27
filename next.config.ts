import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://supabase.lijupankaj.com wss://supabase.lijupankaj.com https://supabase-portfolio-preview.49-13-238-2.sslip.io wss://supabase-portfolio-preview.49-13-238-2.sslip.io",
  "font-src 'self' data: https://fonts.gstatic.com",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob:",
  "media-src 'self' blob:",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "upgrade-insecure-requests"
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" }
];

const privateRouteHeaders = [{ key: "Cache-Control", value: "private, no-store, max-age=0" }];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ["sharp"],
  turbopack: { root: process.cwd() },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.lijupankaj.com" }],
        destination: "https://lijupankaj.com/:path*",
        permanent: true
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "portfolio-preview.49-13-238-2.sslip.io" }],
        destination: "https://lijupankaj.com/:path*",
        permanent: true
      }
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: privateRouteHeaders },
      { source: "/api/admin/:path*", headers: privateRouteHeaders },
      { source: "/api/auth/:path*", headers: privateRouteHeaders },
      { source: "/auth/:path*", headers: privateRouteHeaders }
    ];
  }
};

export default nextConfig;
