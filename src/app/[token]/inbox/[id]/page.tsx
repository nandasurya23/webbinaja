import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ADMIN_SESSION_COOKIE, isAdminConfigured, isValidAdminToken, parseSession } from '@/lib/adminAuth';
import { getSubmission } from '@/lib/db';
import { getSubmissionAssetUrl, isValidSubmissionId } from '@/lib/assets';
import LoginForm from '../../LoginForm';
import StatusControls from './StatusControls';
import { ArrowLeft, WhatsappLogo, MapPin, InstagramLogo, FacebookLogo, NotePencil, Key } from '@phosphor-icons/react/dist/ssr';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const PACKAGE_LABELS: Record<string, string> = {
  basic: 'Paket Basic (Rp 499k)',
  business_kit: 'Paket Business Kit (Rp 799k)',
};

function Photo({ submissionId, filename, label }: { submissionId: string; filename: string; label: string }) {
  const url = getSubmissionAssetUrl(submissionId, filename);
  if (!url) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800">
        <Image src={url} alt={label} fill sizes="(max-width: 640px) 33vw, 160px" className="object-cover" />
      </div>
      <span className="text-[11px] text-neutral-500 truncate">{label}</span>
    </div>
  );
}

// Same reasoning as ../page.tsx — no NODE_ENV production gate, this only
// reads from Neon.
export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ token: string; id: string }>;
}) {
  if (!isAdminConfigured()) notFound();

  const { token, id } = await params;
  if (!isValidAdminToken(token)) notFound();
  if (!isValidSubmissionId(id)) notFound();

  const cookieStore = await cookies();
  const session = parseSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  if (!session) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.08),transparent)]">
        <main className="max-w-2xl mx-auto px-4 py-16 sm:py-20">
          <h1 className="text-3xl font-semibold tracking-tight mb-1">Inbox Submission</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-10">Masuk untuk melanjutkan.</p>
          <LoginForm token={token} />
        </main>
      </div>
    );
  }

  const submission = await getSubmission(id);
  if (!submission) notFound();

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,158,11,0.08),transparent)]">
      <main className="max-w-2xl mx-auto px-4 py-16 sm:py-20">
        <Link href={`/${token}/inbox`} className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 mb-6">
          <ArrowLeft size={14} />
          Kembali ke Inbox
        </Link>

        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-3xl font-semibold tracking-tight">{submission.businessName}</h1>
          <span
            className={`shrink-0 inline-flex items-center text-[11px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full ${
              submission.status === 'processed'
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-300'
            }`}
          >
            {submission.status === 'processed' ? `Diproses → ${submission.processedSlug}` : 'Pending'}
          </span>
        </div>
        {submission.packageTier && (
          <span className="inline-flex items-center text-[11px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 mb-3">
            {PACKAGE_LABELS[submission.packageTier] ?? submission.packageTier}
          </span>
        )}
        {submission.tagline && <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-10">{submission.tagline}</p>}

        <Link
          href={`/${token}?submission=${submission.id}`}
          className="inline-flex items-center gap-1.5 mb-10 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2.5 text-sm font-medium hover:bg-neutral-700 dark:hover:bg-neutral-200 transition"
        >
          <NotePencil size={16} weight="bold" />
          Pakai data ini di form "Buat Customer"
        </Link>

        <div className="flex flex-col gap-8">
          <StatusControls
            token={token}
            submissionId={submission.id}
            initialWorkStatus={submission.workStatus}
            initialPaymentStatus={submission.paymentStatus}
            initialQueueNumber={submission.queueNumber}
          />

          <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-sm shadow-sm p-6 sm:p-8 flex flex-col gap-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Kontak</h2>
            <p className="flex items-center gap-2 text-sm">
              <WhatsappLogo size={15} className="text-emerald-600 shrink-0" /> {submission.whatsapp}
            </p>
            <p className="flex items-center gap-2 text-sm">
              <Key size={15} className="text-neutral-400 shrink-0" /> Kode lookup: <span className="font-mono">{submission.lookupCode}</span>
            </p>
            {submission.address && (
              <p className="flex items-center gap-2 text-sm">
                <MapPin size={15} className="text-neutral-400 shrink-0" /> {submission.address}
              </p>
            )}
            {submission.instagram && (
              <a href={submission.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:underline w-max">
                <InstagramLogo size={15} className="text-neutral-400 shrink-0" /> {submission.instagram}
              </a>
            )}
            {submission.facebook && (
              <a href={submission.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm hover:underline w-max">
                <FacebookLogo size={15} className="text-neutral-400 shrink-0" /> {submission.facebook}
              </a>
            )}
          </section>

          {submission.description && (
            <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-sm shadow-sm p-6 sm:p-8">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">Deskripsi</h2>
              <p className="text-sm leading-relaxed">{submission.description}</p>
              {submission.template && <p className="text-xs text-neutral-400 mt-3">Template pilihan: {submission.template}</p>}
            </section>
          )}

          {(submission.logoFilename || submission.heroFilename || submission.ambianceFilename || submission.gallery.length > 0) && (
            <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-sm shadow-sm p-6 sm:p-8">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-4">Foto</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {submission.logoFilename && <Photo submissionId={submission.id} filename={submission.logoFilename} label="Logo" />}
                {submission.heroFilename && <Photo submissionId={submission.id} filename={submission.heroFilename} label="Hero" />}
                {submission.ambianceFilename && <Photo submissionId={submission.id} filename={submission.ambianceFilename} label="Ambiance" />}
                {submission.gallery.map((g, i) => (
                  <Photo key={i} submissionId={submission.id} filename={g} label={`Galeri ${i + 1}`} />
                ))}
              </div>
            </section>
          )}

          {submission.services.length > 0 && (
            <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-sm shadow-sm p-6 sm:p-8">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-4">Layanan / Produk</h2>
              <ul className="flex flex-col gap-3">
                {submission.services.map((s, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-4 text-sm">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      {s.desc && <p className="text-xs text-neutral-500">{s.desc}</p>}
                    </div>
                    <span className="font-mono text-amber-700 dark:text-amber-500 shrink-0">{s.price}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {submission.catalog.length > 0 && (
            <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-sm shadow-sm p-6 sm:p-8">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-4">Katalog</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {submission.catalog.map((c, i) => (
                  <div key={i} className="flex gap-3">
                    {c.image && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0">
                        <Image
                          src={getSubmissionAssetUrl(submission.id, c.image) ?? ''}
                          alt={c.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{c.name}</p>
                      <p className="text-xs font-mono text-amber-700 dark:text-amber-500">{c.price}</p>
                      {c.desc && <p className="text-xs text-neutral-500 truncate">{c.desc}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
