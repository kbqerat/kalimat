import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Admin uploads (product photos, card images) are served from the Supabase
// Storage bucket, on the project's own domain.
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : "";

// No nonce/strict-dynamic here on purpose: that path forces every page into
// dynamic rendering (see the Next.js CSP guide) and still wouldn't cover the
// `motion` library, which sets animated transforms via the `style` attribute
// rather than a nonce-able <style> tag. `unsafe-inline` on style-src is
// required for that; connect-src/frame-ancestors/object-src do the real work
// of stopping data exfiltration and clickjacking regardless.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: ${supabaseOrigin};
  font-src 'self' data:;
  connect-src 'self'${isDev ? " ws:" : ""};
  frame-src https://www.openstreetmap.org;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  ${isDev ? "" : "upgrade-insecure-requests;"}
`
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspHeader },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    // Deck photo uploads go through a Server Action as multipart/form-data.
    // The default cap is 1MB — too small for a few photos at once.
    serverActions: {
      bodySizeLimit: "12mb",
    },
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
