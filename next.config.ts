import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

// Same env var src/lib/assets.ts reads (ASSET_CDN_DOMAIN, falling back to
// R2_CDN_BASE_URL) — the R2 bucket's public hostname, e.g. a "pub-xxxx.r2.dev"
// R2.dev subdomain or a real custom domain if one is set up. Must match
// exactly what assets.ts resolves to, or next/image and the CSP will block
// the very images the app serves.
const assetCdnDomain = process.env.ASSET_CDN_DOMAIN || process.env.R2_CDN_BASE_URL?.replace(/^https?:\/\//, '') || '';

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
  img-src 'self' data: https://images.unsplash.com${assetCdnDomain ? ` https://${assetCdnDomain}` : ''};
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
  experimental: {
    serverActions: {
      // Default is 1MB, but raw photo uploads (admin AssetUploadButton and
      // the public /pesan form) go through Server Actions as multipart
      // FormData up to MAX_INPUT_FILE_BYTES (20MB, scripts/assets/config.ts)
      // — without this override, any upload over 1MB fails before ever
      // reaching that check. Small margin above 20MB for multipart overhead.
      bodySizeLimit: '21mb',
    },
    optimizePackageImports: ['@phosphor-icons/react'],
  },
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
      ...(assetCdnDomain
        ? [
            {
              protocol: 'https' as const,
              hostname: assetCdnDomain,
            },
          ]
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // No path-based noindex rule for the admin panel anymore — its URL is
      // now just a random token (src/app/[token]), not a fixed "/admin"
      // prefix a header `source` pattern could target. Each panel page sets
      // `metadata.robots = { index: false, follow: false }` itself instead
      // (see src/app/[token]/page.tsx and its subpages) — that was already
      // the primary protection; this header was always secondary.
    ];
  },
};

export default nextConfig;
