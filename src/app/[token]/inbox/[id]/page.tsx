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
    <div className="flex flex-col gap-2">
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-white/5 group">
        <Image src={url} alt={label} fill sizes="(max-width: 640px) 33vw, 160px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <span className="text-xs text-zinc-400 font-medium truncate">{label}</span>
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
    return <LoginForm token={token} />;
  }

  const submission = await getSubmission(id);
  if (!submission) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <Link href={`/${token}/inbox`} className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors w-max">
        <ArrowLeft size={16} />
        Kembali ke Inbox
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">{submission.businessName}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                submission.status === 'processed'
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  : 'bg-zinc-800/50 text-zinc-300 border-white/5'
              }`}
            >
              {submission.status === 'processed' ? `Diproses → ${submission.processedSlug}` : 'Pending'}
            </span>
            {submission.packageTier && (
              <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {PACKAGE_LABELS[submission.packageTier] ?? submission.packageTier}
              </span>
            )}
          </div>
        </div>

        <Link
          href={`/${token}?submission=${submission.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 text-white px-5 py-2.5 text-sm font-semibold hover:bg-blue-400 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
        >
          <NotePencil size={18} weight="bold" />
          Buat Website Customer
        </Link>
      </div>

      {submission.tagline && <p className="text-lg text-zinc-300 leading-relaxed max-w-2xl">{submission.tagline}</p>}

      <div className="flex flex-col gap-6 mt-4">
        <StatusControls
          token={token}
          submissionId={submission.id}
          initialWorkStatus={submission.workStatus}
          initialPaymentStatus={submission.paymentStatus}
          initialQueueNumber={submission.queueNumber}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="rounded-2xl border border-white/5 bg-zinc-950/60 p-6 sm:p-8 flex flex-col gap-4 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Kontak</h2>
            <div className="flex flex-col gap-3">
              <p className="flex items-center gap-3 text-sm text-zinc-200">
                <WhatsappLogo size={18} className="text-blue-500 shrink-0" weight="fill" /> {submission.whatsapp}
              </p>
              <p className="flex items-center gap-3 text-sm text-zinc-200">
                <Key size={18} className="text-zinc-500 shrink-0" weight="fill" /> Kode lookup: <span className="font-mono text-blue-400">{submission.lookupCode}</span>
              </p>
              {submission.address && (
                <p className="flex items-start gap-3 text-sm text-zinc-200">
                  <MapPin size={18} className="text-zinc-500 shrink-0 mt-0.5" weight="fill" /> <span className="leading-relaxed">{submission.address}</span>
                </p>
              )}
            </div>
            
            {(submission.instagram || submission.facebook) && (
              <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-3">
                {submission.instagram && (
                  <a href={submission.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white transition-colors w-max">
                    <InstagramLogo size={18} shrink-0 weight="fill" /> {submission.instagram}
                  </a>
                )}
                {submission.facebook && (
                  <a href={submission.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white transition-colors w-max">
                    <FacebookLogo size={18} shrink-0 weight="fill" /> {submission.facebook}
                  </a>
                )}
              </div>
            )}
          </section>

          {submission.description && (
            <section className="rounded-2xl border border-white/5 bg-zinc-950/60 p-6 sm:p-8 flex flex-col shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">Deskripsi Bisnis</h2>
              <p className="text-sm text-zinc-300 leading-relaxed flex-1">{submission.description}</p>
              {submission.template && (
                <div className="mt-6 pt-4 border-t border-white/5">
                  <p className="text-xs text-zinc-400">Template pilihan: <span className="text-blue-400 font-medium">{submission.template}</span></p>
                </div>
              )}
            </section>
          )}
        </div>

        {(submission.logoFilename || submission.heroFilename || submission.ambianceFilename || submission.gallery.length > 0) && (
          <section className="rounded-2xl border border-white/5 bg-zinc-950/60 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">Aset Foto</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {submission.logoFilename && <Photo submissionId={submission.id} filename={submission.logoFilename} label="Logo" />}
              {submission.heroFilename && <Photo submissionId={submission.id} filename={submission.heroFilename} label="Hero Image" />}
              {submission.ambianceFilename && <Photo submissionId={submission.id} filename={submission.ambianceFilename} label="Suasana Toko" />}
              {submission.gallery.map((g, i) => (
                <Photo key={i} submissionId={submission.id} filename={g} label={`Galeri ${i + 1}`} />
              ))}
            </div>
          </section>
        )}

        {submission.services.length > 0 && (
          <section className="rounded-2xl border border-white/5 bg-zinc-950/60 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">Layanan / Produk Utama</h2>
            <ul className="flex flex-col gap-4">
              {submission.services.map((s, i) => (
                <li key={i} className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 p-4 rounded-xl bg-zinc-900/50 border border-white/5">
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm mb-1">{s.name}</p>
                    {s.desc && <p className="text-xs text-zinc-400 leading-relaxed">{s.desc}</p>}
                  </div>
                  <span className="font-mono text-blue-400 text-sm font-medium shrink-0">{s.price}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {submission.catalog.length > 0 && (
          <section className="rounded-2xl border border-white/5 bg-zinc-950/60 p-6 sm:p-8 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6">Katalog Produk</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {submission.catalog.map((c, i) => (
                <div key={i} className="flex gap-4 p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                  {c.image && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-zinc-950 shrink-0 border border-white/5">
                      <Image
                        src={getSubmissionAssetUrl(submission.id, c.image) ?? ''}
                        alt={c.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex flex-col justify-center flex-1">
                    <p className="font-semibold text-white text-sm truncate mb-1">{c.name}</p>
                    <p className="text-xs font-mono text-blue-400 mb-1">{c.price}</p>
                    {c.desc && <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{c.desc}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
