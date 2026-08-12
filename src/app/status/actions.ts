'use server';

import { getSubmissionByLookup, isRateLimited, recordRateLimitHit } from '@/lib/db';
import { sanitizeWhatsapp } from '@/lib/url';
import { clientIp } from '@/lib/clientIp';
import { MAIN_DOMAIN } from '@/lib/customers';

export type CheckStatusResult =
  | {
      ok: true;
      businessName: string;
      statusLabel: string;
      queueNumber: number | null;
      /** Only set once the site has actually been built (processedSlug exists). */
      websiteUrl?: string;
    }
  | { ok: false; error: string };

const GENERIC_NOT_FOUND = 'Data tidak ditemukan — cek kembali nomor WhatsApp dan kode Anda.';

/**
 * Deliberately isolated: returns ONLY the fields above, never photos,
 * description, address, or any other submission field, and never
 * distinguishes "wrong phone" from "wrong code" in the error — both make it
 * harder to use this as a way to enumerate/guess other people's data.
 */
export async function checkStatusAction(whatsappRaw: string, lookupCodeRaw: string): Promise<CheckStatusResult> {
  const whatsapp = sanitizeWhatsapp(whatsappRaw);
  const lookupCode = lookupCodeRaw.trim().toUpperCase();

  if (!whatsapp || !lookupCode) {
    return { ok: false, error: 'Nomor WhatsApp dan kode wajib diisi.' };
  }

  const ip = await clientIp();
  try {
    if (await isRateLimited('status_check', ip, 10, 60)) {
      return { ok: false, error: 'Terlalu banyak percobaan. Coba lagi nanti.' };
    }
    await recordRateLimitHit('status_check', ip);
  } catch {
    // Fail open on rate limiting, same reasoning as the other public actions.
  }

  const submission = await getSubmissionByLookup(whatsapp, lookupCode).catch(() => null);
  if (!submission) {
    return { ok: false, error: GENERIC_NOT_FOUND };
  }

  return {
    ok: true,
    businessName: submission.businessName,
    statusLabel: submission.status === 'processed' ? 'Selesai' : 'Sedang Dikerjakan',
    queueNumber: submission.queueNumber,
    ...(submission.status === 'processed' && submission.processedSlug && {
      websiteUrl: `https://${submission.processedSlug}.${MAIN_DOMAIN}`,
    }),
  };
}
