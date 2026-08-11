'use server';

import { getSubmission, updateSubmissionStatus, type StatusPatch } from '@/lib/db';
import { isValidSubmissionId } from '@/lib/assets';
import type { ServiceInput, CatalogItemInput } from '@/lib/customerScaffold';
import { assertAdminIdentity, requireSession } from './shared';

export type SetStatusResult =
  | { ok: true; message: string; queueNumber: number | null }
  | { ok: false; error: string };

/** Either role can set status — the only role-gated action is admin management (see auth.ts). */
export async function setSubmissionStatusAction(token: string, submissionId: string, patch: StatusPatch): Promise<SetStatusResult> {
  assertAdminIdentity(token);
  await requireSession();

  if (!isValidSubmissionId(submissionId)) {
    return { ok: false, error: 'ID submission tidak valid.' };
  }

  const updated = await updateSubmissionStatus(submissionId, patch);
  if (!updated) return { ok: false, error: 'Submission tidak ditemukan.' };

  return {
    queueNumber: updated.queueNumber,
    ok: true,
    message: updated.queueNumber ? `Status diperbarui. Nomor antri: #${updated.queueNumber}` : 'Status diperbarui.',
  };
}

export type SubmissionPrefillResult =
  | {
      ok: true;
      businessName: string;
      template: string;
      tagline: string;
      description: string;
      whatsapp: string;
      address: string;
      mapsLink: string;
      instagram: string;
      facebook: string;
      logo: string;
      hero: string;
      ambiance: string;
      gallery: string[];
      services: ServiceInput[];
      catalog: CatalogItemInput[];
    }
  | { ok: false; error: string };

/** Used by CustomerForm to prefill itself from a /pesan submission picked in the inbox — see ?submission= query param handling. */
export async function getSubmissionForPrefillAction(token: string, submissionId: string): Promise<SubmissionPrefillResult> {
  assertAdminIdentity(token);
  await requireSession();

  if (!isValidSubmissionId(submissionId)) {
    return { ok: false, error: 'ID submission tidak valid.' };
  }

  let submission;
  try {
    submission = await getSubmission(submissionId);
  } catch {
    return { ok: false, error: 'Gagal mengambil data submission.' };
  }
  if (!submission) {
    return { ok: false, error: 'Submission tidak ditemukan.' };
  }

  return {
    ok: true,
    businessName: submission.businessName,
    template: submission.template ?? '',
    tagline: submission.tagline ?? '',
    description: submission.description ?? '',
    whatsapp: submission.whatsapp,
    address: submission.address ?? '',
    mapsLink: submission.mapsLink ?? '',
    instagram: submission.instagram ?? '',
    facebook: submission.facebook ?? '',
    logo: submission.logoFilename ?? '',
    hero: submission.heroFilename ?? '',
    ambiance: submission.ambianceFilename ?? '',
    gallery: submission.gallery,
    services: submission.services,
    catalog: submission.catalog,
  };
}
