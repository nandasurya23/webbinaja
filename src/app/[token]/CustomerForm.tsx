'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  WarningCircle,
  SignOut,
  Plus,
  Trash,
  IdentificationBadge,
  NotePencil,
  Phone,
  Images,
  Storefront,
  ShieldCheck,
  Copy,
  Check,
  Spinner,
  LinkSimple,
  ArrowClockwise,
  Sparkle,
} from '@phosphor-icons/react/dist/ssr';
import {
  createCustomerAction,
  checkAssetsAction,
  logoutAction,
  updateCustomDomainAction,
  getSubmissionForPrefillAction,
  type AssetCheckItem,
  type CreateCustomerResult,
} from './actions';
import { CUSTOMER_TEMPLATES } from '@/lib/customerTemplates';
import { MAX_GALLERY_PHOTOS, MAX_CATALOG_ITEMS } from '@/lib/customerLimits';
import type { PackageTier } from '@/lib/customerScaffold';
import AssetUploadButton from './AssetUploadButton';

type Service = { name: string; price: string; desc: string };
type CatalogItem = { name: string; price: string; desc: string; image: string };

const TEMPLATE_LABELS: Record<string, string> = {
  barber: 'Barbershop',
  restaurant: 'Restoran',
  professional: 'Jasa Profesional',
  bakery: 'Bakery',
  rental: 'Rental',
  gamecafe: 'Game Cafe',
  gym: 'Gym',
  petshop: 'Petshop',
  custom: 'Custom',
};

const inputClass =
  'w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3.5 py-2.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 placeholder:text-neutral-400';
const smallInputClass =
  'w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-2.5 py-1.5 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 placeholder:text-neutral-400';

function Field({
  label,
  required,
  type = 'text',
  placeholder,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-neutral-700 dark:text-neutral-300">
        {label}
        {required && <span className="text-amber-600 dark:text-amber-500"> *</span>}
      </span>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </label>
  );
}

function Section({
  icon,
  title,
  hint,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          {icon}
          {title}
        </div>
        {hint && <span className="text-xs text-neutral-400 dark:text-neutral-500">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function CopyButton({ text, label = 'Salin' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
    >
      {copied ? <Check size={13} weight="bold" /> : <Copy size={13} />}
      {copied ? 'Disalin' : label}
    </button>
  );
}

function DomainManagerCard({ token }: { token: string }) {
  const [domainSlug, setDomainSlug] = useState('');
  const [domainValue, setDomainValue] = useState('');
  const [domainResult, setDomainResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isSavingDomain, startDomainTransition] = useTransition();

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-sm shadow-sm p-6 sm:p-8">
      <Section
        icon={<LinkSimple size={16} />}
        title="Atur Domain Customer"
        hint="untuk customer yang sudah ada"
      >
        <p className="text-sm text-neutral-500 dark:text-neutral-400 -mt-1">
          Dipakai kalau customer Business Kit baru beli domain sendiri setelah situsnya sudah jadi. Isi slug
          customer dan domainnya (contoh: <code className="text-xs">namabisnis.com</code>, tanpa
          <code className="text-xs"> https://</code>), lalu jangan lupa tambahkan domain yang sama di Vercel →
          Domains dan arahkan DNS-nya di registrar.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Slug customer" placeholder="cafe-siti" value={domainSlug} onChange={setDomainSlug} />
          <Field label="Custom domain" placeholder="namabisnis.com (kosongkan untuk hapus)" value={domainValue} onChange={setDomainValue} />
        </div>
        <button
          type="button"
          disabled={isSavingDomain || !domainSlug}
          onClick={() => {
            setDomainResult(null);
            startDomainTransition(async () => {
              const res = await updateCustomDomainAction(token, domainSlug.trim(), domainValue.trim());
              setDomainResult(res.ok ? { ok: true, message: res.message ?? 'Berhasil.' } : { ok: false, message: res.error });
            });
          }}
          className="self-start inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3.5 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSavingDomain ? <Spinner size={15} className="animate-spin" /> : <LinkSimple size={15} />}
          {isSavingDomain ? 'Menyimpan...' : 'Simpan Domain'}
        </button>
        {domainResult && (
          <p className={`flex items-center gap-1.5 text-sm ${domainResult.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {domainResult.ok ? <CheckCircle size={15} weight="fill" /> : <WarningCircle size={15} weight="fill" />}
            {domainResult.message}
          </p>
        )}
      </Section>
    </div>
  );
}

const emptyService = (): Service => ({ name: '', price: '', desc: '' });
const emptyCatalogItem = (): CatalogItem => ({ name: '', price: '', desc: '', image: '' });

export default function CustomerForm({ token }: { token: string }) {
  // Identitas & profil
  const [slug, setSlug] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [template, setTemplate] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [packageTier, setPackageTier] = useState<PackageTier>('basic');
  const [customDomain, setCustomDomain] = useState('');

  // Kontak
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [mapsLink, setMapsLink] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');

  // Assets
  const [logo, setLogo] = useState('logo.webp');
  const [hero, setHero] = useState('hero.webp');
  const [ambiance, setAmbiance] = useState('');
  const [gallery, setGallery] = useState<string[]>(['gallery-01.webp']);

  // Layanan & katalog
  const [services, setServices] = useState<Service[]>([emptyService()]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);

  // Cek asset
  const [checkResults, setCheckResults] = useState<AssetCheckItem[] | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);
  const [checkedSignature, setCheckedSignature] = useState<string | null>(null);
  const [isChecking, startCheckTransition] = useTransition();

  // Submit
  const [result, setResult] = useState<CreateCustomerResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoggingOut, startLogoutTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Prefill from a /pesan submission picked in the inbox (?submission=<id>)
  // — a pure convenience so the operator doesn't retype what the customer
  // already sent. Runs once; doesn't affect the "Buat Customer" write path.
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  useEffect(() => {
    const id = searchParams.get('submission');
    if (!id) return;
    getSubmissionForPrefillAction(token, id).then((res) => {
      if (!res.ok) return;
      setSubmissionId(id);
      setBusinessName(res.businessName);
      setTemplate(res.template);
      setTagline(res.tagline);
      setDescription(res.description);
      setWhatsapp(res.whatsapp);
      setAddress(res.address);
      setMapsLink(res.mapsLink);
      setInstagram(res.instagram);
      setFacebook(res.facebook);
      if (res.logo) setLogo(res.logo);
      if (res.hero) setHero(res.hero);
      if (res.ambiance) setAmbiance(res.ambiance);
      if (res.gallery.length) setGallery(res.gallery);
      if (res.services.length) setServices(res.services.map((s) => ({ name: s.name, price: s.price, desc: s.desc ?? '' })));
      if (res.catalog.length) setCatalog(res.catalog.map((c) => ({ name: c.name, price: c.price, desc: c.desc ?? '', image: c.image })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const assetSignature = useMemo(
    () =>
      JSON.stringify({
        slug,
        logo,
        hero,
        ambiance,
        gallery,
        catalogImages: catalog.map((c) => c.image),
      }),
    [slug, logo, hero, ambiance, gallery, catalog]
  );
  const assetsAreChecked = checkedSignature === assetSignature && checkResults !== null;

  function runAssetCheck() {
    setCheckError(null);
    const items = [
      { label: 'Logo', filename: logo },
      { label: 'Hero', filename: hero },
      { label: 'Ambiance', filename: ambiance },
      ...gallery.map((g, i) => ({ label: `Galeri ${i + 1}`, filename: g })),
      ...catalog.map((c, i) => ({ label: `Katalog: ${c.name || `item ${i + 1}`}`, filename: c.image })),
    ].filter((i) => i.filename);

    const signature = assetSignature;
    startCheckTransition(async () => {
      const res = await checkAssetsAction(token, slug, items);
      if (res.ok) {
        setCheckResults(res.results);
        setCheckedSignature(signature);
      } else {
        setCheckError(res.error);
        setCheckResults(null);
        setCheckedSignature(null);
      }
    });
  }

  function resetForCreateAnother() {
    setResult(null);
    setSlug('');
    setBusinessName('');
    setTemplate('');
    setTagline('');
    setDescription('');
    setPackageTier('basic');
    setCustomDomain('');
    setWhatsapp('');
    setAddress('');
    setMapsLink('');
    setInstagram('');
    setFacebook('');
    setLogo('logo.webp');
    setHero('hero.webp');
    setAmbiance('');
    setGallery(['gallery-01.webp']);
    setServices([emptyService()]);
    setCatalog([]);
    setCheckResults(null);
    setCheckedSignature(null);
    setCheckError(null);
  }

  if (result?.ok) {
    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 p-6 sm:p-8">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mb-5">
            <CheckCircle size={24} weight="fill" />
          </div>
          <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-200 mb-1">Customer berhasil dibuat</h2>
          <p className="text-sm text-emerald-800/80 dark:text-emerald-300/80 mb-6">{result.message}</p>

          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700/80 dark:text-emerald-400/80 mb-1.5">
                Link untuk customer (setelah deploy)
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-emerald-300/70 dark:border-emerald-800 bg-white dark:bg-neutral-950 px-3 py-2">
                <LinkSimple size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-sm font-mono truncate flex-1">{result.productionUrl}</span>
                <CopyButton text={result.productionUrl} />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700/80 dark:text-emerald-400/80 mb-1.5">
                Preview lokal (npm run dev harus aktif)
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-emerald-300/70 dark:border-emerald-800 bg-white dark:bg-neutral-950 px-3 py-2">
                <LinkSimple size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <a href={result.localUrl} target="_blank" rel="noreferrer" className="text-sm font-mono truncate flex-1 hover:underline">
                  {result.localUrl}
                </a>
                <CopyButton text={result.localUrl} />
              </div>
            </div>

            {result.localPromoUrl && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700/80 dark:text-emerald-400/80 mb-1.5">
                  Kit Promosi Instan — preview lokal (npm run dev harus aktif)
                </p>
                <div className="flex items-center gap-2 rounded-lg border border-emerald-300/70 dark:border-emerald-800 bg-white dark:bg-neutral-950 px-3 py-2">
                  <Sparkle size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <a href={result.localPromoUrl} target="_blank" rel="noreferrer" className="text-sm font-mono truncate flex-1 hover:underline">
                    {result.localPromoUrl}
                  </a>
                  <CopyButton text={result.localPromoUrl} />
                </div>
              </div>
            )}

            {result.promoUrl && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700/80 dark:text-emerald-400/80 mb-1.5">
                  Kit Promosi Instan — link production (aktif setelah deploy)
                </p>
                <div className="flex items-center gap-2 rounded-lg border border-emerald-300/70 dark:border-emerald-800 bg-white dark:bg-neutral-950 px-3 py-2">
                  <Sparkle size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <a href={result.promoUrl} target="_blank" rel="noreferrer" className="text-sm font-mono truncate flex-1 hover:underline">
                    {result.promoUrl}
                  </a>
                  <CopyButton text={result.promoUrl} />
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={resetForCreateAnother}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 px-4 py-2.5 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
        >
          <Plus size={16} weight="bold" />
          Buat customer lain
        </button>

        <DomainManagerCard token={token} />

        <button
          type="button"
          disabled={isLoggingOut}
          className="self-start inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 disabled:opacity-50"
          onClick={() => {
            startLogoutTransition(async () => {
              await logoutAction(token);
              router.refresh();
            });
          }}
        >
          <SignOut size={14} />
          Keluar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/50 backdrop-blur-sm shadow-sm p-6 sm:p-8">
        <form
          className="flex flex-col gap-8"
          onSubmit={(e) => {
            e.preventDefault();
            setResult(null);
            startTransition(async () => {
              const res = await createCustomerAction(token, {
                slug,
                businessName,
                template,
                tagline,
                description,
                packageTier,
                customDomain,
                whatsapp,
                address,
                mapsLink,
                instagram,
                facebook,
                logo,
                hero,
                ambiance,
                gallery,
                services,
                catalog,
                submissionId: submissionId ?? undefined,
              });
              setResult(res);
            });
          }}
        >
          {submissionId && (
            <p className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-500 -mb-4">
              <Sparkle size={13} weight="fill" />
              Diisi otomatis dari submission inbox — cek ulang sebelum membuat customer.
            </p>
          )}
          <Section icon={<IdentificationBadge size={16} />} title="Identitas">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Slug" required placeholder="cafe-siti" value={slug} onChange={setSlug} />
              <Field label="Nama bisnis" required placeholder="Cafe Siti" value={businessName} onChange={setBusinessName} />
            </div>

            <div className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Template <span className="text-amber-600 dark:text-amber-500">*</span>
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {CUSTOMER_TEMPLATES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTemplate(t)}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition text-left ${
                      template === t
                        ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                        : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    {TEMPLATE_LABELS[t] ?? t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Paket <span className="text-amber-600 dark:text-amber-500">*</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPackageTier('basic')}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition text-left ${
                    packageTier === 'basic'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  Basic (499K)
                </button>
                <button
                  type="button"
                  onClick={() => setPackageTier('business')}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition text-left ${
                    packageTier === 'business'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  Business Kit (799K)
                </button>
              </div>
              {packageTier === 'business' && (
                <p className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-500">
                  <Sparkle size={13} weight="fill" />
                  Membuka link Kit Promosi Instan (gambar promo otomatis) setelah customer dibuat.
                </p>
              )}
            </div>

            {packageTier === 'business' && (
              <Field
                label="Custom domain (opsional)"
                placeholder="namabisnis.com"
                value={customDomain}
                onChange={setCustomDomain}
              />
            )}
            {packageTier === 'business' && customDomain && (
              <p className="text-xs text-neutral-400 -mt-2">
                Isi kalau domainnya sudah dibeli sekarang. Kalau belum, kosongkan saja — bisa ditambahkan nanti lewat
                bagian &quot;Atur Domain Customer&quot; di bawah setelah customer dibuat. Setelah diisi, tambahkan
                domain ini juga di Vercel → Domains dan arahkan DNS-nya.
              </p>
            )}
          </Section>

          <Section icon={<NotePencil size={16} />} title="Profil">
            <Field label="Tagline" placeholder="Kopi enak, harga bersahabat" value={tagline} onChange={setTagline} />
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">Deskripsi singkat</span>
              <textarea
                rows={3}
                placeholder="Ceritakan singkat tentang bisnis ini..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputClass}
              />
            </label>
          </Section>

          <Section icon={<Phone size={16} />} title="Kontak">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nomor WhatsApp" required placeholder="62812xxxxxxx" value={whatsapp} onChange={setWhatsapp} />
              <Field label="Alamat" placeholder="Jl. Contoh No. 1" value={address} onChange={setAddress} />
              <Field label="Google Maps link" type="url" placeholder="https://maps.google.com/..." value={mapsLink} onChange={setMapsLink} />
              <Field label="Instagram URL" type="url" placeholder="https://instagram.com/..." value={instagram} onChange={setInstagram} />
              <Field label="Facebook URL" type="url" placeholder="https://facebook.com/..." value={facebook} onChange={setFacebook} />
            </div>
          </Section>

          <Section
            icon={<Images size={16} />}
            title="Galeri & Asset"
            hint={`cdn.webbinaja.com/${slug || '<slug>'}/...`}
          >
            <p className="text-sm text-neutral-500 dark:text-neutral-400 -mt-1">
              Klik <strong>Upload</strong> untuk pilih foto PNG/JPG langsung dari komputer — otomatis dikonversi ke WebP
              (diresize & dikompres) dan diunggah ke folder <code className="text-xs">{slug || '<slug>'}</code> di R2, tanpa
              perlu convert manual. Atau isi nama file manual kalau sudah pernah diunggah sebelumnya. Maks 20MB per foto
              (otomatis dikompres di bawah 1.5MB) — galeri maks {MAX_GALLERY_PHOTOS} foto, katalog maks {MAX_CATALOG_ITEMS} item.
            </p>

            <div className="flex flex-col gap-3">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Field label="Logo (nama file)" placeholder="logo.webp" value={logo} onChange={setLogo} />
                </div>
                <AssetUploadButton token={token} slug={slug} kind="logo" baseNameHint="logo" onUploaded={setLogo} />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Field label="Hero (nama file)" placeholder="hero.webp" value={hero} onChange={setHero} />
                </div>
                <AssetUploadButton token={token} slug={slug} kind="hero" baseNameHint="hero" onUploaded={setHero} />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Field label="Ambiance (opsional)" placeholder="ambiance.webp" value={ambiance} onChange={setAmbiance} />
                </div>
                <AssetUploadButton token={token} slug={slug} kind="ambiance" baseNameHint="ambiance" onUploaded={setAmbiance} />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Foto galeri (nama file)
                <span className="ml-1.5 font-normal text-neutral-400">
                  ({gallery.length}/{MAX_GALLERY_PHOTOS})
                </span>
              </span>
              {gallery.map((g, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={g}
                    placeholder={`gallery-0${i + 1}.webp`}
                    onChange={(e) =>
                      setGallery((prev) => prev.map((v, idx) => (idx === i ? e.target.value : v)))
                    }
                    className={smallInputClass}
                  />
                  <AssetUploadButton
                    token={token}
                    slug={slug}
                    kind="gallery"
                    baseNameHint={g.replace(/\.[^.]+$/, '') || `gallery-${String(i + 1).padStart(2, '0')}`}
                    onUploaded={(filename) => setGallery((prev) => prev.map((v, idx) => (idx === i ? filename : v)))}
                  />
                  <button
                    type="button"
                    onClick={() => setGallery((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-neutral-400 hover:text-red-600 p-1.5 shrink-0"
                    aria-label="Hapus foto galeri"
                  >
                    <Trash size={15} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                disabled={gallery.length >= MAX_GALLERY_PHOTOS}
                onClick={() => setGallery((prev) => [...prev, `gallery-${String(prev.length + 1).padStart(2, '0')}.webp`])}
                className="self-start inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-500 hover:underline disabled:no-underline disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={13} weight="bold" />
                {gallery.length >= MAX_GALLERY_PHOTOS ? `Maksimal ${MAX_GALLERY_PHOTOS} foto` : 'Tambah foto galeri'}
              </button>
            </div>
          </Section>

          <Section icon={<Storefront size={16} />} title="Layanan">
            <div className="flex flex-col gap-3">
              {services.map((s, i) => (
                <div key={i} className="grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-start">
                  <input
                    placeholder="Nama layanan"
                    value={s.name}
                    onChange={(e) => setServices((prev) => prev.map((v, idx) => (idx === i ? { ...v, name: e.target.value } : v)))}
                    className={smallInputClass}
                  />
                  <input
                    placeholder="Harga (Rp 50.000)"
                    value={s.price}
                    onChange={(e) => setServices((prev) => prev.map((v, idx) => (idx === i ? { ...v, price: e.target.value } : v)))}
                    className={smallInputClass}
                  />
                  <input
                    placeholder="Deskripsi (opsional)"
                    value={s.desc}
                    onChange={(e) => setServices((prev) => prev.map((v, idx) => (idx === i ? { ...v, desc: e.target.value } : v)))}
                    className={smallInputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setServices((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-neutral-400 hover:text-red-600 p-1.5 shrink-0"
                    aria-label="Hapus layanan"
                  >
                    <Trash size={15} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setServices((prev) => [...prev, emptyService()])}
                className="self-start inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-500 hover:underline"
              >
                <Plus size={13} weight="bold" />
                Tambah layanan
              </button>
            </div>
          </Section>

          <Section icon={<Storefront size={16} />} title="Katalog" hint={`opsional · ${catalog.length}/${MAX_CATALOG_ITEMS}`}>
            <div className="flex flex-col gap-3">
              {catalog.map((c, i) => (
                <div key={i} className="grid sm:grid-cols-2 gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 p-3">
                  <input
                    placeholder="Nama produk"
                    value={c.name}
                    onChange={(e) => setCatalog((prev) => prev.map((v, idx) => (idx === i ? { ...v, name: e.target.value } : v)))}
                    className={smallInputClass}
                  />
                  <input
                    placeholder="Harga"
                    value={c.price}
                    onChange={(e) => setCatalog((prev) => prev.map((v, idx) => (idx === i ? { ...v, price: e.target.value } : v)))}
                    className={smallInputClass}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      placeholder="Nama file gambar (produk-01.webp)"
                      value={c.image}
                      onChange={(e) => setCatalog((prev) => prev.map((v, idx) => (idx === i ? { ...v, image: e.target.value } : v)))}
                      className={smallInputClass}
                    />
                    <AssetUploadButton
                      token={token}
                      slug={slug}
                      kind="catalog"
                      baseNameHint={c.image.replace(/\.[^.]+$/, '') || c.name || `produk-${i + 1}`}
                      onUploaded={(filename) => setCatalog((prev) => prev.map((v, idx) => (idx === i ? { ...v, image: filename } : v)))}
                    />
                  </div>
                  <input
                    placeholder="Deskripsi (opsional)"
                    value={c.desc}
                    onChange={(e) => setCatalog((prev) => prev.map((v, idx) => (idx === i ? { ...v, desc: e.target.value } : v)))}
                    className={smallInputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setCatalog((prev) => prev.filter((_, idx) => idx !== i))}
                    className="col-span-2 self-start inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                  >
                    <Trash size={13} />
                    Hapus item
                  </button>
                </div>
              ))}
              <button
                type="button"
                disabled={catalog.length >= MAX_CATALOG_ITEMS}
                onClick={() => setCatalog((prev) => [...prev, emptyCatalogItem()])}
                className="self-start inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-500 hover:underline disabled:no-underline disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={13} weight="bold" />
                {catalog.length >= MAX_CATALOG_ITEMS ? `Maksimal ${MAX_CATALOG_ITEMS} item` : 'Tambah item katalog'}
              </button>
            </div>
          </Section>

          <Section icon={<ShieldCheck size={16} />} title="Cek Asset" hint="wajib sebelum membuat customer">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Cek apakah file logo, hero, galeri, dan gambar katalog sudah ter-upload ke CDN (
              <code className="text-xs">npm run assets:upload {slug || '<slug>'}</code>) sebelum website dibuat. Boleh tetap
              lanjut walau ada yang belum ada — cukup jalankan pengecekannya dulu.
            </p>

            <button
              type="button"
              onClick={runAssetCheck}
              disabled={isChecking || !slug}
              className="self-start inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3.5 py-2 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChecking ? <Spinner size={15} className="animate-spin" /> : <ArrowClockwise size={15} />}
              {isChecking ? 'Mengecek...' : 'Cek Asset Sekarang'}
            </button>

            {checkError && (
              <p className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
                <WarningCircle size={15} weight="fill" />
                {checkError}
              </p>
            )}

            {checkResults && checkResults.length > 0 && (
              <ul className="flex flex-col gap-1.5 text-sm">
                {checkResults.map((r, i) => (
                  <li key={i} className="flex items-center gap-2">
                    {r.ok ? (
                      <CheckCircle size={15} weight="fill" className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <WarningCircle size={15} weight="fill" className="text-amber-600 dark:text-amber-500 shrink-0" />
                    )}
                    <span className="text-neutral-600 dark:text-neutral-300">{r.label}:</span>
                    <span className="font-mono text-xs truncate">{r.filename}</span>
                    <span className={`ml-auto text-xs ${r.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-500'}`}>
                      {r.ok ? `OK ${r.status ?? ''}` : r.error ?? `${r.status ?? 'gagal'}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {checkResults && checkResults.length === 0 && (
              <p className="text-sm text-neutral-400">Belum ada nama file asset untuk dicek.</p>
            )}

            {assetsAreChecked ? (
              <p className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                <CheckCircle size={14} weight="fill" />
                Sudah dicek untuk data saat ini.
              </p>
            ) : (
              <p className="text-xs text-neutral-400">
                Belum dicek untuk data saat ini — jalankan &quot;Cek Asset Sekarang&quot; dulu.
              </p>
            )}
          </Section>

          <button
            type="submit"
            disabled={isPending || !assetsAreChecked}
            title={!assetsAreChecked ? 'Jalankan "Cek Asset Sekarang" dulu' : undefined}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2.5 text-sm font-medium transition hover:bg-neutral-700 dark:hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              'Menyimpan...'
            ) : (
              <>
                <Plus size={16} weight="bold" />
                Buat customer
              </>
            )}
          </button>

          {result && !result.ok && (
            <p role="alert" className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 -mt-4">
              <WarningCircle size={16} weight="fill" />
              {result.error}
            </p>
          )}
        </form>
      </div>

      <DomainManagerCard token={token} />

      <button
        type="button"
        disabled={isLoggingOut}
        className="self-start inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 disabled:opacity-50"
        onClick={() => {
          startLogoutTransition(async () => {
            await logoutAction(token);
            router.refresh();
          });
        }}
      >
        <SignOut size={14} />
        Keluar
      </button>
    </div>
  );
}
