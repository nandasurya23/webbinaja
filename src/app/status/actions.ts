'use server';

import { getSubmissionByLookup, isRateLimited, recordRateLimitHit } from '@/lib/db';
import { sanitizeWhatsapp } from '@/lib/url';
import { clientIp } from '@/lib/clientIp';

export type CheckStatusResult =
  | {
      ok: true;
      businessName: string;
      workStatusLabel: string;
      paymentStatusLabel: string;
      queueNumber: number | null;
    }
  | { ok: false; error: string };

const WORK_LABELS: Record<string, string> = {
  not_started: 'Belum Dikerjakan',
  in_progress: 'Sedang Dikerjakan',
  done: 'Selesai',
};

const PAYMENT_LABELS: Record<string, string> = {
  unchecked: 'Belum Dicek',
  confirmed: 'Dikonfirmasi',
  rejected: 'Ditolak',
};

const GENERIC_NOT_FOUND = 'Data tidak ditemukan — cek kembali nomor WhatsApp dan kode Anda.';

/**
 * Deliberately isolated: returns ONLY the 4 fields above, never photos,
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
    workStatusLabel: WORK_LABELS[submission.workStatus] ?? submission.workStatus,
    paymentStatusLabel: PAYMENT_LABELS[submission.paymentStatus] ?? submission.paymentStatus,
    queueNumber: submission.queueNumber,
  };
}
