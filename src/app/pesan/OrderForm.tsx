'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import {
  Plus,
  Trash,
  WarningCircle,
  CheckCircle,
  WhatsappLogo,
  UploadSimple,
  Spinner,
  Key,
  Copy,
  Check,
} from '@phosphor-icons/react/dist/ssr';
import { submitOrderAction, uploadSubmissionAssetAction } from './actions';
import { CUSTOMER_TEMPLATES } from '@/lib/customerTemplates';
import { MAX_GALLERY_PHOTOS, MAX_CATALOG_ITEMS } from '@/lib/customerLimits';

type Service = { name: string; price: string; desc: string };
type CatalogItem = { name: string; price: string; desc: string; image: string };

const PACKAGES: { id: string; name: string; price: string }[] = [
  { id: 'basic', name: 'Paket Basic', price: 'Rp 499.000' },
  { id: 'business_kit', name: 'Paket Business Kit', price: 'Rp 799.000' },
];

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
  'w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10 placeholder:text-zinc-500 text-white';
const smallInputClass =
  'w-full rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10 placeholder:text-zinc-500 text-white';

function Field({
  label,
  required,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-zinc-300">
        {label}
        {required && <span className="text-amber-500"> *</span>}
      </span>
      <input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </label>
  );
}

function UploadButton({
  submissionId,
  kind,
  baseNameHint,
  onUploaded,
}: {
  submissionId: string;
  kind: 'logo' | 'hero' | 'ambiance' | 'gallery' | 'catalog';
  baseNameHint: string;
  onUploaded: (filename: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setState('uploading');
    setError(null);
    const formData = new FormData();
    formData.set('submissionId', submissionId);
    formData.set('kind', kind);
    formData.set('baseName', baseNameHint);
    formData.set('file', file);

    const res = await uploadSubmissionAssetAction(formData);
    if (res.ok && res.filename) {
      setState('done');
      onUploaded(res.filename);
    } else {
      setState('error');
      setError(res.error ?? 'Upload gagal.');
    }
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        disabled={state === 'uploading'}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2 py-1.5 text-xs font-medium hover:bg-white/5 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 text-zinc-200"
      >
        {state === 'uploading' ? (
          <Spinner size={13} className="animate-spin" />
        ) : state === 'done' ? (
          <CheckCircle size={13} weight="fill" className="text-emerald-400" />
        ) : (
          <UploadSimple size={13} />
        )}
        {state === 'uploading' ? 'Mengunggah...' : state === 'done' ? 'Terunggah' : 'Upload'}
      </button>
      {error && (
        <span className="flex items-center gap-1 text-xs text-red-400">
          <WarningCircle size={13} weight="fill" />
          {error}
        </span>
      )}
    </div>
  );
}

/**
 * Logo/hero/ambiance row for the public order form — upload-only, no
 * editable filename text field. The customer never needs to see or type a
 * filename (that used to sit in a text input next to the upload button,
 * confusing since there was nothing meaningful to type there); this just
 * shows the label, an uploaded/not-uploaded status, and the upload button.
 */
function PhotoSlot({
  label,
  filename,
  submissionId,
  kind,
  onUploaded,
}: {
  label: string;
  filename: string;
  submissionId: string;
  kind: 'logo' | 'hero' | 'ambiance';
  onUploaded: (filename: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5">
      <div className="flex items-center gap-2 text-sm min-w-0">
        <span className="font-medium text-zinc-300 shrink-0">{label}</span>
        {filename ? (
          <span className="flex items-center gap-1 text-xs text-emerald-400 truncate">
            <CheckCircle size={13} weight="fill" />
            Sudah diunggah
          </span>
        ) : (
          <span className="text-xs text-zinc-500">Belum diunggah</span>
        )}
      </div>
      <UploadButton submissionId={submissionId} kind={kind} baseNameHint={kind} onUploaded={onUploaded} />
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
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
      className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:underline shrink-0"
    >
      {copied ? <Check size={13} weight="bold" /> : <Copy size={13} />}
      {copied ? 'Disalin' : 'Salin'}
    </button>
  );
}

const emptyService = (): Service => ({ name: '', price: '', desc: '' });
const emptyCatalogItem = (): CatalogItem => ({ name: '', price: '', desc: '', image: '' });

export default function OrderForm({ initialPackage }: { initialPackage?: string }) {
  const submissionId = useMemo(() => crypto.randomUUID(), []);

  const [businessName, setBusinessName] = useState('');
  const [packageTier, setPackageTier] = useState(
    PACKAGES.some((p) => p.id === initialPackage) ? (initialPackage as string) : ''
  );
  const [template, setTemplate] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [address, setAddress] = useState('');
  const [mapsLink, setMapsLink] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [website, setWebsite] = useState(''); // honeypot

  const [logo, setLogo] = useState('');
  const [hero, setHero] = useState('');
  const [ambiance, setAmbiance] = useState('');
  const [gallery, setGallery] = useState<string[]>([]);

  const [services, setServices] = useState<Service[]>([emptyService()]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);

  const [result, setResult] = useState<{ ok: true; whatsappUrl: string; lookupCode: string } | { ok: false; error: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (result?.ok) {
    return (
      <div className="rounded-2xl border border-emerald-900/50 bg-emerald-950/30 p-6 sm:p-8">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500/15 text-emerald-400 mb-5">
          <CheckCircle size={24} weight="fill" />
        </div>
        <h2 className="text-lg font-semibold text-emerald-200 mb-1">Data berhasil dikirim</h2>
        <p className="text-sm text-emerald-300/80 mb-6">
          Lanjutkan ke WhatsApp untuk konfirmasi pembayaran — kami akan mulai proses setelah pembayaran diterima.
        </p>

        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/80 mb-1.5 flex items-center gap-1.5">
            <Key size={13} />
            Kode Cek Status Pesanan
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-emerald-800 bg-black/20 px-3 py-2">
            <span className="text-sm font-mono font-bold tracking-widest flex-1">{result.lookupCode}</span>
            <CopyButton text={result.lookupCode} />
          </div>
          <p className="text-xs text-emerald-300/60 mt-1.5">
            Simpan kode ini — dipakai bersama nomor WhatsApp Anda untuk cek status pesanan di halaman{' '}
            <a href="/status" className="underline">/status</a>.
          </p>
        </div>

        <a
          href={result.whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 text-black px-5 py-3 text-sm font-bold hover:bg-emerald-400 transition"
        >
          <WhatsappLogo size={18} weight="fill" />
          Lanjut ke WhatsApp untuk Pembayaran
        </a>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={(e) => {
        e.preventDefault();
        setResult(null);
        startTransition(async () => {
          const res = await submitOrderAction({
            id: submissionId,
            businessName,
            packageTier,
            template,
            tagline,
            description,
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
            website,
          });
          setResult(res);
        });
      }}
    >
      {/* Honeypot — hidden from real users via CSS, bots that fill every field will trip it. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>

      <div className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-300">
          Paket <span className="text-amber-500">*</span>
        </span>
        <div className="grid sm:grid-cols-2 gap-2">
          {PACKAGES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPackageTier(p.id)}
              className={`rounded-lg border px-3.5 py-2.5 text-sm font-medium transition text-left ${
                packageTier === p.id ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-white/10 hover:border-white/30 text-zinc-300'
              }`}
            >
              {p.name}
              <span className="block text-xs font-normal text-zinc-500 mt-0.5">{p.price}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Nama bisnis" required placeholder="Cafe Siti" value={businessName} onChange={setBusinessName} />
        <Field label="Nomor WhatsApp" required placeholder="62812xxxxxxx" value={whatsapp} onChange={setWhatsapp} />
      </div>

      <div className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-300">
          Template <span className="text-amber-500">*</span>
        </span>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {CUSTOMER_TEMPLATES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTemplate(t)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition text-left ${
                template === t ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-white/10 hover:border-white/30 text-zinc-300'
              }`}
            >
              {TEMPLATE_LABELS[t] ?? t}
            </button>
          ))}
        </div>
      </div>

      <Field label="Tagline" placeholder="Kopi enak, harga bersahabat" value={tagline} onChange={setTagline} />
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-zinc-300">Deskripsi singkat</span>
        <textarea
          rows={3}
          placeholder="Ceritakan singkat tentang bisnis ini..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
        />
      </label>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Alamat" placeholder="Jl. Contoh No. 1" value={address} onChange={setAddress} />
        <Field label="Google Maps link" placeholder="https://maps.google.com/..." value={mapsLink} onChange={setMapsLink} />
        <Field label="Instagram URL" placeholder="https://instagram.com/..." value={instagram} onChange={setInstagram} />
        <Field label="Facebook URL" placeholder="https://facebook.com/..." value={facebook} onChange={setFacebook} />
      </div>

      {/* Foto */}
      <div className="flex flex-col gap-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Foto</span>
        <div className="flex flex-col gap-3">
          <PhotoSlot label="Logo" filename={logo} submissionId={submissionId} kind="logo" onUploaded={setLogo} />
          <PhotoSlot label="Foto utama (hero)" filename={hero} submissionId={submissionId} kind="hero" onUploaded={setHero} />
          <PhotoSlot
            label="Foto suasana (opsional)"
            filename={ambiance}
            submissionId={submissionId}
            kind="ambiance"
            onUploaded={setAmbiance}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-zinc-300">
            Foto galeri
            <span className="ml-1.5 font-normal text-zinc-500">
              ({gallery.length}/{MAX_GALLERY_PHOTOS})
            </span>
          </span>
          {gallery.map((g, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={smallInputClass}>{g || `Foto ${i + 1} belum diunggah`}</div>
              <UploadButton
                submissionId={submissionId}
                kind="gallery"
                baseNameHint={`gallery-${String(i + 1).padStart(2, '0')}`}
                onUploaded={(filename) => setGallery((prev) => prev.map((v, idx) => (idx === i ? filename : v)))}
              />
              <button
                type="button"
                onClick={() => setGallery((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-zinc-500 hover:text-red-400 p-1.5 shrink-0"
                aria-label="Hapus foto galeri"
              >
                <Trash size={15} />
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={gallery.length >= MAX_GALLERY_PHOTOS}
            onClick={() => setGallery((prev) => [...prev, ''])}
            className="self-start inline-flex items-center gap-1 text-xs font-medium text-amber-500 hover:underline disabled:no-underline disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={13} weight="bold" />
            {gallery.length >= MAX_GALLERY_PHOTOS ? `Maksimal ${MAX_GALLERY_PHOTOS} foto` : 'Tambah foto galeri'}
          </button>
        </div>
      </div>

      {/* Layanan */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Layanan / Produk</span>
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
              className="text-zinc-500 hover:text-red-400 p-1.5 shrink-0"
              aria-label="Hapus layanan"
            >
              <Trash size={15} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setServices((prev) => [...prev, emptyService()])}
          className="self-start inline-flex items-center gap-1 text-xs font-medium text-amber-500 hover:underline"
        >
          <Plus size={13} weight="bold" />
          Tambah layanan
        </button>
      </div>

      {/* Katalog */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Katalog (opsional) · {catalog.length}/{MAX_CATALOG_ITEMS}
        </span>
        {catalog.map((c, i) => (
          <div key={i} className="grid sm:grid-cols-2 gap-2 rounded-lg border border-white/10 p-3">
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
              <div className={smallInputClass}>{c.image || 'Foto belum diunggah'}</div>
              <UploadButton
                submissionId={submissionId}
                kind="catalog"
                baseNameHint={c.name || `produk-${i + 1}`}
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
              className="col-span-2 self-start inline-flex items-center gap-1 text-xs font-medium text-red-400 hover:underline"
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
          className="self-start inline-flex items-center gap-1 text-xs font-medium text-amber-500 hover:underline disabled:no-underline disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={13} weight="bold" />
          {catalog.length >= MAX_CATALOG_ITEMS ? `Maksimal ${MAX_CATALOG_ITEMS} item` : 'Tambah item katalog'}
        </button>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-white text-black px-4 py-3 text-sm font-bold transition hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Mengirim...' : 'Kirim Data'}
      </button>

      {result && !result.ok && (
        <p role="alert" className="flex items-center gap-1.5 text-sm text-red-400 -mt-4">
          <WarningCircle size={16} weight="fill" />
          {result.error}
        </p>
      )}
    </form>
  );
}
