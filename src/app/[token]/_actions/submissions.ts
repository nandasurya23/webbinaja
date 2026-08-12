'use server';

import { getSubmission, deleteSubmission } from '@/lib/db';
import { isValidSubmissionId } from '@/lib/assets';
import { findThemePalette } from '@/lib/themePalettes';
import type { ServiceInput, CatalogItemInput } from '@/lib/customerScaffold';
import { assertAdminIdentity, requireSession } from './shared';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createR2Client } from '../../../../scripts/assets/r2Client';
import { R2_BUCKET_NAME, loadR2Credentials } from '../../../../scripts/assets/config';

async function deleteSubmissionAndAssets(submissionId: string): Promise<void> {
  const submission = await getSubmission(submissionId);
  if (!submission) return;

  try {
    loadR2Credentials();
    const client = createR2Client();
    const filesToDelete = [
      submission.logoFilename,
      submission.heroFilename,
      submission.ambianceFilename,
      ...submission.gallery,
      ...submission.catalog.map((c) => c.image),
    ].filter(Boolean) as string[];

    if (filesToDelete.length > 0) {
      await Promise.allSettled(
        filesToDelete.map((filename) =>
          client.send(
            new DeleteObjectCommand({
              Bucket: R2_BUCKET_NAME,
              Key: `_submissions/${submissionId}/${filename}`,
            })
          )
        )
      );
    }
  } catch (err) {
    // If R2 deletion fails, we still proceed to delete the DB record.
    console.error('Failed to delete assets from R2:', err);
  }

  await deleteSubmission(submissionId);
}

export type DeleteSubmissionResult = { ok: true; message: string } | { ok: false; error: string };

/** Manual delete for cancelled/unwanted submissions — mirrors the reject-payment cleanup path above. */
export async function deleteSubmissionAction(token: string, submissionId: string): Promise<DeleteSubmissionResult> {
  assertAdminIdentity(token);
  await requireSession();

  if (!isValidSubmissionId(submissionId)) {
    return { ok: false, error: 'ID submission tidak valid.' };
  }

  await deleteSubmissionAndAssets(submissionId);
  return { ok: true, message: 'Pesanan telah dihapus.' };
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
      tiktok: string;
      marketplace: string;
      openingHours: string;
      logo: string;
      hero: string;
      ambiance: string;
      gallery: string[];
      services: ServiceInput[];
      catalog: CatalogItemInput[];
      primaryColor: string | null;
      secondaryColor: string | null;
      accentColor: string | null;
      themePaletteLabel: string | null;
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
    tiktok: submission.tiktok ?? '',
    marketplace: submission.marketplace ?? '',
    openingHours: submission.openingHours ?? '',
    logo: submission.logoFilename ?? '',
    hero: submission.heroFilename ?? '',
    ambiance: submission.ambianceFilename ?? '',
    gallery: submission.gallery,
    services: submission.services,
    catalog: submission.catalog,
    primaryColor: submission.primaryColor,
    secondaryColor: submission.secondaryColor,
    accentColor: submission.accentColor,
    themePaletteLabel: findThemePalette(submission.themePaletteId ?? '')?.label ?? null,
  };
}
