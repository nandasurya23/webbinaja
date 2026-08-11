// Customer config values (WhatsApp, Instagram, Facebook, Maps links, etc.) are
// rendered directly into `href` attributes. Treat them as untrusted data and
// reject dangerous schemes like `javascript:` / `data:` / `vbscript:`.
const SAFE_PROTOCOLS = new Set(['http:', 'https:']);

export function isSafeUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  try {
    // A base is only used to resolve protocol-relative/relative strings;
    // any string with an explicit scheme (e.g. "javascript:...") ignores it.
    const parsed = new URL(url, 'https://placeholder.invalid');
    return SAFE_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

export function sanitizeUrl(url: string | undefined | null, fallback = '#'): string {
  return isSafeUrl(url) ? (url as string) : fallback;
}

// WhatsApp numbers are interpolated into `https://wa.me/${number}` — strip
// everything but digits so the value can't break out of the URL path.
export function sanitizeWhatsapp(number: string | undefined | null): string {
  if (!number) return '';
  return number.replace(/[^0-9]/g, '');
}
