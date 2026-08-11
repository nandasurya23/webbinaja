// Per-customer content limits — kept separate from customerScaffold.ts (which
// imports node:fs/node:path) so client components can import just these
// numbers without pulling Node-only modules into the browser bundle, same
// reasoning as the customerTemplates.ts split.
//
// These bound how much a single customer can grow the R2 bucket and how
// heavy their page gets, independent of per-file size (already capped at
// 20MB input / ~1.5MB optimized output in scripts/assets/config.ts —
// see MAX_INPUT_FILE_BYTES / MAX_OUTPUT_FILE_BYTES).
export const MAX_GALLERY_PHOTOS = 8;
export const MAX_CATALOG_ITEMS = 12;
