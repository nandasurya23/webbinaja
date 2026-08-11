# WebbinAja Asset Pipeline (Cloudflare R2)

Customer photos (logo, hero, gallery) live outside the Git repository, in
Cloudflare R2, served publicly through `cdn.webbinaja.com`. The website
stays 100% static/FE-only — R2 is object storage + CDN, nothing else.

```
customer-input/{slug}/*.jpg      (local, gitignored, never committed)
        │
        │  npm run assets:upload {slug}
        ▼
scripts/assets/cli.ts   (resize, compress, convert to WebP)
        │
        │  R2 credentials (local .env.local only)
        ▼
Cloudflare R2 bucket: webbinaja-assets/{slug}/*.webp
        │
        │  public read, via custom domain
        ▼
https://cdn.webbinaja.com/{slug}/*.webp
        │
        ▼
src/customers/{slug}/config.ts → assets: { hero: "hero.webp", ... }
        │
        ▼
next build → Vercel → live site
```

There is no upload API, no admin dashboard, no backend. Uploading is a
one-off local CLI command a developer runs before deploying.

## 1. One-time Cloudflare setup (manual)

1. **Create the bucket** — Cloudflare dashboard → R2 → Create bucket →
   name it exactly `webbinaja-assets`. One bucket for all customers;
   customers are separated by object key prefix (`{slug}/...`), not by
   bucket.
2. **Public read access** — enable the bucket's public development URL, or
   (recommended) connect a custom domain.
3. **Custom domain** — R2 bucket → Settings → Custom Domains → add
   `cdn.webbinaja.com` (requires that DNS zone to already be on Cloudflare).
   This is what makes bucket contents reachable as
   `https://cdn.webbinaja.com/{slug}/{filename}`.
4. **Keep write access private** — do **not** enable public write / bucket
   listing. Only the credential created in step 5 can write, and that
   credential never leaves your machine.
5. **Create an API token** — R2 → Manage R2 API Tokens → Create API Token
   → permission: **Object Read & Write**, scoped to the `webbinaja-assets`
   bucket only. Note the Access Key ID, Secret Access Key, and your
   Cloudflare Account ID (shown on the R2 overview page).

## 2. Local credential setup (per developer machine)

```bash
cp .env.local.example .env.local
```

Fill in `.env.local` (already gitignored, never commit it):

```
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
```

These three variables are read **only** by `scripts/assets/cli.ts`. Nothing
in `src/` (the Next.js app) reads them, imports them, or ships them to the
browser — the app only ever consumes the public `cdn.webbinaja.com` URLs
built by `src/lib/assets.ts`.

## 3. Uploading a customer's photos

Stage raw photos locally (any of jpg/jpeg/png/webp/avif, flat folder, no
subfolders):

```
customer-input/
└── barber-agus/
    ├── logo.jpg
    ├── hero.jpg
    ├── gallery-01.jpg
    └── gallery-02.jpg
```

`customer-input/` is gitignored — these raw files never enter Git.

Run:

```bash
npm run assets:upload barber-agus
```

The CLI:

1. Validates the slug (lowercase letters/digits/hyphens only — rejects
   `../`, `<script>`, etc.).
2. Validates each file's extension and actual image content (not just the
   extension — a renamed non-image is rejected).
3. Rejects files over 20MB raw.
4. Resizes (max 512px for `logo.*`, 1920px for `hero.*`, 1600px for
   `gallery-*`/`ambiance.*`, preserving aspect ratio, never upscaling).
5. Converts to WebP, preserving transparency for logos, stepping down
   quality automatically if needed to stay under ~1.5MB per file.
6. Uploads to `webbinaja-assets/barber-agus/{filename}.webp`.
7. Prints the resulting CDN URLs.

Example output:

```
WebbinAja Asset Pipeline

Customer: barber-agus

✓ Validating files
✓ Optimizing images

  ✓ Uploading logo.webp (512x512, 41KB, q82)
  ✓ Uploading hero.webp (1920x1080, 312KB, q82)
  ✓ Uploading gallery-01.webp (1600x1067, 210KB, q82)

Assets uploaded successfully.

CDN:
https://cdn.webbinaja.com/barber-agus/

  https://cdn.webbinaja.com/barber-agus/logo.webp
  https://cdn.webbinaja.com/barber-agus/hero.webp
  https://cdn.webbinaja.com/barber-agus/gallery-01.webp
```

On error, each file gets its own actionable line, e.g.:

```
  ✗ hero.png — unsupported image format "gif" (allowed: jpeg, png, webp, avif)
  ✗ gallery-02.jpg exceeds maximum input size (24500KB > 20480KB)
```

## 4. Wiring uploaded assets into a customer config

`src/customers/{slug}/config.ts` stores **bare filenames**, not full URLs:

```ts
export const config = {
  // ...
  assets: {
    logo: "logo.webp",
    hero: "hero.webp",
    gallery: ["gallery-01.webp", "gallery-02.webp"],
  },
  // ...
};
```

`getCustomerConfig()` (`src/lib/customers.ts`) resolves these into absolute
`https://cdn.webbinaja.com/{slug}/{filename}` URLs via
`resolveCustomerImages()` in `src/lib/assets.ts` before the config ever
reaches a template — templates and `JsonLd` don't know or care that the
image came from R2. Existing customers that still set `images.hero` /
`images.gallery` directly (e.g. Unsplash placeholder URLs) keep working
unchanged — `assets` takes priority when both are present, `images` is the
fallback.

Instead of writing `config.ts` by hand, scaffold it:

```bash
npm run customer:new              # asks for slug + everything else
npm run customer:new barber-agus  # slug already known, still asks the rest
```

This writes `src/customers/{slug}/config.ts` with the `assets` block already
in place (`logo.webp`, `hero.webp`, `gallery-01.webp`), so steps 3–4 above
just work once you upload matching filenames.

Before committing/deploying, sanity-check the config:

```bash
npm run customer:validate barber-agus
npm run customer:validate barber-agus -- --check-assets   # also HEAD-checks
                                                             # the CDN URLs
```

This catches an invalid slug, unsafe URL scheme (`javascript:`, `data:`),
malformed asset filename (including path traversal), or missing required
field before it ever reaches a deploy.

## 5. Replacing a customer's photo

Overwrite the file in `customer-input/{slug}/` and re-run:

```bash
npm run assets:upload barber-agus
```

Filenames stay the same (`hero.webp` stays `hero.webp`), so no config
change is needed. Because the filename doesn't change, uploaded objects use
`Cache-Control: public, max-age=3600, must-revalidate` (not a long
immutable cache) — browsers/CDN can re-check after an hour instead of
serving a stale image indefinitely. If you need instant invalidation, wait
up to an hour or purge the file from the Cloudflare cache manually.

To find and remove assets that are no longer referenced by any config:

```bash
npm run assets:sync barber-agus                    # lists stale remote objects only
npm run assets:sync barber-agus -- --delete        # also deletes them, after a
                                                     # typed "yes" confirmation
```

`assets:sync` never deletes automatically — it always requires the explicit
`--delete` flag and an interactive confirmation.

## 6. Deploying after an asset change

Uploading to R2 does **not** trigger a deploy — it's a separate step from
Vercel. After uploading and updating `assets` in the customer config,
commit the config change and push/deploy as normal:

```bash
git add src/customers/barber-agus/config.ts
git commit -m "barber-agus: update hero photo"
git push
```

Vercel builds and deploys the static site as usual; at request time the
page fetches the (already-optimized) image straight from
`cdn.webbinaja.com`.

## 7. Error handling reference

| Situation | Behavior |
|---|---|
| Invalid slug (`../x`, `Foo_Bar`, uppercase, etc.) | Rejected before touching the filesystem or R2 |
| Missing `customer-input/{slug}/` | Clear error, exits non-zero, no R2 call made |
| Unsupported extension (`.gif`, `.bmp`, ...) | That file is skipped with a clear message; others still process |
| File content doesn't match a supported image format | Skipped with a clear message (checked via real image parsing, not just the extension) |
| File over 20MB raw | Skipped with a clear message |
| Optimized output still over ~1.5MB at lowest quality | Skipped with a clear message — use a smaller source image |
| Missing `R2_*` credentials | Fails immediately with the names of the missing variables, before any upload attempt |
| R2 unreachable / bad endpoint / auth failure | Per-file upload error printed, command exits non-zero, already-uploaded files are unaffected |

## 8. Security rules

- R2 write credentials exist **only** in a developer's local `.env.local`
  (or CI secret store, if uploads are ever automated in CI — not currently
  the case). They are never read by `src/` and never reach the client
  bundle.
- R2 bucket permission model: **public read, private write**. There is no
  upload/delete endpoint on the website — the only way to write to
  `webbinaja-assets` is this CLI with a valid credential.
- Asset filenames are restricted to `^[a-z0-9][a-z0-9._-]*\.(webp|avif|jpg|jpeg|png)$`
  with no `/`, `\`, or `..` — enforced both in the CLI (before upload) and
  in `src/lib/assets.ts` (before building any URL a page renders), so a bad
  filename in a config can't produce path traversal or a non-image URL.
- Customer slugs are restricted to `^[a-z0-9]+(-[a-z0-9]+)*$` — enforced in
  `getCustomerConfig()`, so one customer's config can never resolve to
  another customer's asset path or escape the `{slug}/` prefix.
- `next.config.ts` only allows `next/image` to fetch remote images from
  `images.unsplash.com` and `cdn.webbinaja.com` — never a wildcard.
- The CSP `img-src` directive is scoped the same way.

## 9. What NOT to do

- Do **not** add an upload API route, Server Action, or admin dashboard —
  uploads are CLI-only, on purpose.
- Do **not** put R2 credentials in `NEXT_PUBLIC_*` variables, in any file
  under `src/`, or in `vercel.json` build env exposed to the client.
- Do **not** create a bucket per customer — one bucket
  (`webbinaja-assets`), customers separated by key prefix.
- Do **not** enable public write or bucket listing on the R2 bucket.
- Do **not** commit `customer-input/`, `.env.local`, or raw customer
  photos to Git.
- Do **not** widen the `next.config.ts` remote image allowlist or CSP
  `img-src` to a wildcard domain.
