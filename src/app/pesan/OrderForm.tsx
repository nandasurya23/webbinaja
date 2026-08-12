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
  Image as ImageIcon,
  CheckSquareOffset
} from '@phosphor-icons/react/dist/ssr';
import { motion, AnimatePresence } from 'motion/react';
import { submitOrderAction, uploadSubmissionAssetAction } from './actions';
import { CUSTOMER_TEMPLATES } from '@/lib/customerTemplates';
import { MAX_GALLERY_PHOTOS, MAX_CATALOG_ITEMS } from '@/lib/customerLimits';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

type Service = { name: string; price: string; desc: string };
type CatalogItem = { name: string; price: string; desc: string; image: string };

const PACKAGES: { id: string; name: string; price: string; desc: string }[] = [
  { id: 'basic', name: 'Paket Basic', price: 'Rp 499.000', desc: 'Website + domain' },
  { id: 'business_kit', name: 'Paket Business Kit', price: 'Rp 799.000', desc: '+ Materi promosi awal' },
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

function Field({
  label,
  required,
  placeholder,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-zinc-300">
        {label}
        {required && <span className="text-blue-500 ml-1">*</span>}
      </span>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
    <div className="flex flex-col items-end gap-1.5 shrink-0">
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
      <Button
        type="button"
        variant={state === 'done' ? 'secondary' : 'outline'}
        size="sm"
        disabled={state === 'uploading'}
        onClick={() => inputRef.current?.click()}
        className="w-[110px]"
      >
        {state === 'uploading' ? (
          <><Spinner size={14} className="animate-spin mr-1.5" /> Mengunggah...</>
        ) : state === 'done' ? (
          <><CheckCircle size={14} weight="fill" className="text-blue-500 mr-1.5" /> Terunggah</>
        ) : (
          <><UploadSimple size={14} className="mr-1.5" /> Unggah</>
        )}
      </Button>
      {error && (
        <span className="flex items-center gap-1 text-[10px] text-red-400">
          <WarningCircle size={12} weight="fill" /> {error}
        </span>
      )}
    </div>
  );
}

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
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-zinc-900/30 p-4 transition-colors hover:bg-zinc-900/50">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
          <ImageIcon size={20} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-zinc-200">{label}</span>
          {filename ? (
            <span className="flex items-center gap-1 text-xs font-medium text-blue-400 truncate mt-0.5">
              <CheckCircle size={12} weight="fill" />
              Terunggah
            </span>
          ) : (
            <span className="text-xs text-zinc-500 mt-0.5">PNG, JPG maks 5MB</span>
          )}
        </div>
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
      className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition"
    >
      {copied ? <Check size={14} weight="bold" className="text-blue-400" /> : <Copy size={14} />}
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-blue-500/20 bg-blue-950/20 p-8 shadow-xl backdrop-blur-xl"
      >
        <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-500/20 text-blue-400 mb-6 border border-blue-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <CheckSquareOffset size={32} weight="fill" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Pesanan Terkirim!</h2>
        <p className="text-zinc-400 mb-8 leading-relaxed max-w-[400px]">
          Kami telah menerima detail Anda. Lanjutkan ke WhatsApp untuk konfirmasi pembayaran dan kami akan memproses pesanan Anda.
        </p>

        <div className="mb-8 p-4 rounded-xl border border-white/5 bg-black/40 backdrop-blur-md">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-3 flex items-center gap-1.5">
            <Key size={14} />
            Kode Pelacakan Pesanan
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-lg border border-blue-500/30 bg-blue-950/30 px-4 py-2.5 font-mono text-lg font-bold tracking-[0.2em] text-blue-400">
              {result.lookupCode}
            </div>
            <CopyButton text={result.lookupCode} />
          </div>
          <p className="text-xs text-zinc-500 mt-3">
            Simpan kode ini untuk mengecek status pesanan Anda nanti di halaman <Link href="/status" className="text-blue-400 hover:underline">/status</Link>.
          </p>
        </div>

        <a 
          href={result.whatsappUrl} 
          target="_blank" 
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-lg bg-blue-500 text-white hover:bg-blue-400 shadow-sm shadow-blue-900/20 h-12 px-6 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 w-full sm:w-auto mt-4"
        >
          <WhatsappLogo size={20} weight="fill" className="mr-2" />
          Lanjut ke WhatsApp
        </a>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-10 max-w-[800px] mx-auto w-full pb-24"
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
      {/* Honeypot */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Pilih Paket</h2>
          <p className="text-sm text-zinc-400 mt-1">Pilih paket yang sesuai dengan kebutuhan Anda.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {PACKAGES.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPackageTier(p.id)}
              className={`flex flex-col items-start rounded-xl border p-5 text-left transition-all duration-200 ${
                packageTier === p.id 
                ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                : 'border-white/10 bg-zinc-900/30 hover:border-white/30 hover:bg-zinc-900/50'
              }`}
            >
              <span className={`text-base font-bold ${packageTier === p.id ? 'text-blue-400' : 'text-zinc-200'}`}>
                {p.name}
              </span>
              <span className={`text-xl font-medium mt-2 ${packageTier === p.id ? 'text-white' : 'text-zinc-400'}`}>
                {p.price}
              </span>
              <span className={`text-xs mt-1 ${packageTier === p.id ? 'text-blue-500/80' : 'text-zinc-500'}`}>
                {p.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Profil Bisnis</h2>
          <p className="text-sm text-zinc-400 mt-1">Informasi dasar untuk pembuatan website Anda.</p>
        </div>
        
        <Card className="border-none bg-transparent shadow-none">
          <div className="grid sm:grid-cols-2 gap-6">
            <Field label="Nama Bisnis" required placeholder="mis. Cafe Siti" value={businessName} onChange={setBusinessName} />
            <Field label="Nomor WhatsApp" required placeholder="62812xxxxxxx" value={whatsapp} onChange={setWhatsapp} />
          </div>

          <div className="flex flex-col gap-3 mt-6">
            <span className="text-sm font-medium text-zinc-300">
              Template <span className="text-blue-500 ml-1">*</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {CUSTOMER_TEMPLATES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTemplate(t)}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all text-center ${
                    template === t 
                    ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-sm shadow-blue-500/20' 
                    : 'border-white/10 bg-zinc-900/50 hover:border-white/20 text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  {TEMPLATE_LABELS[t] ?? t}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <Field label="Tagline" placeholder="mis. Kopi enak, harga bersahabat" value={tagline} onChange={setTagline} />
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-zinc-300">Deskripsi Singkat</span>
              <textarea
                rows={4}
                placeholder="Ceritakan singkat tentang bisnis ini..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/50 resize-none"
              />
            </label>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Sosial Media & Lokasi</h2>
          <p className="text-sm text-zinc-400 mt-1">Bantu pelanggan menemukan Anda secara online maupun offline.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          <Field label="Alamat" placeholder="Jl. Contoh No. 1" value={address} onChange={setAddress} />
          <Field label="Tautan Google Maps" type="url" placeholder="https://maps.google.com/..." value={mapsLink} onChange={setMapsLink} />
          <Field label="URL Instagram" type="url" placeholder="https://instagram.com/..." value={instagram} onChange={setInstagram} />
          <Field label="URL Facebook" type="url" placeholder="https://facebook.com/..." value={facebook} onChange={setFacebook} />
        </div>
      </div>

      {/* Photography */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Fotografi</h2>
          <p className="text-sm text-zinc-400 mt-1">Foto berkualitas tinggi membuat bisnis Anda lebih menonjol.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <PhotoSlot label="Logo Brand" filename={logo} submissionId={submissionId} kind="logo" onUploaded={setLogo} />
          <PhotoSlot label="Banner Utama (Hero)" filename={hero} submissionId={submissionId} kind="hero" onUploaded={setHero} />
          <PhotoSlot label="Suasana Toko (Opsional)" filename={ambiance} submissionId={submissionId} kind="ambiance" onUploaded={setAmbiance} />
        </div>

        <div className="rounded-xl border border-white/10 bg-zinc-900/20 p-5 mt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-white">Foto Galeri</h3>
              <p className="text-xs text-zinc-500 mt-0.5">Tampilkan karya terbaik Anda ({gallery.length}/{MAX_GALLERY_PHOTOS})</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={gallery.length >= MAX_GALLERY_PHOTOS}
              onClick={() => setGallery((prev) => [...prev, ''])}
            >
              <Plus size={14} className="mr-1.5" />
              Tambah Foto
            </Button>
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {gallery.map((g, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="flex items-center gap-3 overflow-hidden"
                >
                  <div className="flex-1 flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-zinc-900/50 p-2.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-zinc-800 text-zinc-500">
                        <ImageIcon size={14} />
                      </div>
                      <span className="text-sm text-zinc-300 truncate">
                        {g || `Slot ${i + 1} - Menunggu unggahan`}
                      </span>
                    </div>
                    <UploadButton
                      submissionId={submissionId}
                      kind="gallery"
                      baseNameHint={`gallery-${String(i + 1).padStart(2, '0')}`}
                      onUploaded={(filename) => setGallery((prev) => prev.map((v, idx) => (idx === i ? filename : v)))}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setGallery((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                  >
                    <Trash size={16} />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            {gallery.length === 0 && (
              <div className="text-center p-6 border border-dashed border-white/10 rounded-lg text-sm text-zinc-500">
                Belum ada foto galeri. Klik &quot;Tambah Foto&quot; untuk memulai.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Layanan & Harga</h2>
            <p className="text-sm text-zinc-400 mt-1">Cantumkan layanan Anda beserta harganya.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setServices((prev) => [...prev, emptyService()])}>
            <Plus size={14} className="mr-1.5" />
            Tambah Layanan
          </Button>
        </div>
        
        <div className="space-y-4">
          <AnimatePresence>
            {services.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid sm:grid-cols-[1.5fr_1fr_2fr_auto] gap-3 items-start p-4 rounded-xl border border-white/5 bg-zinc-900/30"
              >
                <Input
                  placeholder="Nama layanan (mis. Potong Rambut)"
                  value={s.name}
                  onChange={(e) => setServices((prev) => prev.map((v, idx) => (idx === i ? { ...v, name: e.target.value } : v)))}
                />
                <Input
                  placeholder="Harga (Rp 50.000)"
                  value={s.price}
                  onChange={(e) => setServices((prev) => prev.map((v, idx) => (idx === i ? { ...v, price: e.target.value } : v)))}
                />
                <Input
                  placeholder="Deskripsi singkat (opsional)"
                  value={s.desc}
                  onChange={(e) => setServices((prev) => prev.map((v, idx) => (idx === i ? { ...v, desc: e.target.value } : v)))}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setServices((prev) => prev.filter((_, idx) => idx !== i))}
                  className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                >
                  <Trash size={16} />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
          {services.length === 0 && (
            <div className="text-center p-8 border border-dashed border-white/10 rounded-xl text-sm text-zinc-500">
              Belum ada layanan. Klik &quot;Tambah Layanan&quot; untuk menambahkan penawaran Anda.
            </div>
          )}
        </div>
      </div>

      {/* Catalog */}
      <div className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Katalog Produk</h2>
            <p className="text-sm text-zinc-400 mt-1">Produk fisik yang Anda jual ({catalog.length}/{MAX_CATALOG_ITEMS})</p>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            disabled={catalog.length >= MAX_CATALOG_ITEMS}
            onClick={() => setCatalog((prev) => [...prev, emptyCatalogItem()])}
          >
            <Plus size={14} className="mr-1.5" />
            Tambah Produk
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence>
            {catalog.map((c, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col gap-3 p-5 rounded-xl border border-white/10 bg-zinc-900/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-white">Item {i + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCatalog((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 px-2 text-xs"
                  >
                    <Trash size={14} className="mr-1" /> Hapus
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Nama produk"
                    value={c.name}
                    onChange={(e) => setCatalog((prev) => prev.map((v, idx) => (idx === i ? { ...v, name: e.target.value } : v)))}
                  />
                  <Input
                    placeholder="Harga"
                    value={c.price}
                    onChange={(e) => setCatalog((prev) => prev.map((v, idx) => (idx === i ? { ...v, price: e.target.value } : v)))}
                  />
                </div>
                <Input
                  placeholder="Deskripsi (opsional)"
                  value={c.desc}
                  onChange={(e) => setCatalog((prev) => prev.map((v, idx) => (idx === i ? { ...v, desc: e.target.value } : v)))}
                />
                <div className="flex items-center justify-between rounded-lg border border-white/5 bg-zinc-950/50 p-2 mt-1">
                  <span className="text-xs text-zinc-400 pl-2 truncate max-w-[120px]">
                    {c.image || 'Belum ada gambar'}
                  </span>
                  <UploadButton
                    submissionId={submissionId}
                    kind="catalog"
                    baseNameHint={c.name || `produk-${i + 1}`}
                    onUploaded={(filename) => setCatalog((prev) => prev.map((v, idx) => (idx === i ? { ...v, image: filename } : v)))}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="border-t border-white/10 pt-8 pb-4 sticky bottom-0 bg-zinc-950/80 backdrop-blur-xl z-20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {result && !result.ok ? (
          <p role="alert" className="flex items-center gap-1.5 text-sm font-medium text-red-400">
            <WarningCircle size={16} weight="fill" />
            {result.error}
          </p>
        ) : (
          <p className="text-sm text-zinc-400">Periksa kembali detail Anda sebelum mengirim.</p>
        )}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending}
          className="w-full md:w-[200px]"
        >
          {isPending ? (
            <><Spinner size={18} className="animate-spin mr-2" /> Memproses...</>
          ) : (
            'Kirim Pesanan'
          )}
        </Button>
      </div>
    </motion.form>
  );
}
