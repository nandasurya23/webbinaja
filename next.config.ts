import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

// No nonce-based CSP: this app is fully statically generated (SSG) so pages
// have no per-request server pass to inject a nonce into. Nonces would force
// every page into dynamic rendering, defeating the static/CDN-cached
// architecture. 'unsafe-inline' on script/style is required because Next.js
// embeds its hydration payload as an inline <script> with no nonce in this
// mode — see node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md
// ("Without Nonces" section). 'unsafe-eval' is only enabled in dev, where
// React needs it for debugging; it is never sent in production.
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https://images.unsplash.com https://cdn.webbinaja.com;
  font-src 'self' data:;
  connect-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  frame-src 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const securityHeaders = [
  { key: 'Content-Security-Policy', value: cspHeader },
  // Defense-in-depth alongside frame-ancestors — ignored by modern browsers
  // that honor CSP, still relevant for older UAs.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), interest-cohort=()',
  },
  // Vercel terminates TLS; HSTS just tells browsers to always use it.
  // No `preload` — that requires submitting the domain and is not reversible.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const nextConfig: NextConfig = {
  images: {
    // AVIF first — typically 20-30% smaller than WebP for photos; Next
    // falls back to WebP automatically for browsers that don't support it.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Customer asset CDN (Cloudflare R2, public-read only). Kept to this
      // exact hostname — never a wildcard — so customer config can't point
      // next/image at an arbitrary attacker-controlled origin.
      {
        protocol: 'https',
        hostname: 'cdn.webbinaja.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // Local-only admin UI (src/app/admin/[token]) — 404s outside dev,
        // this just keeps it out of any crawler/cache that got this far.
        source: '/admin/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
