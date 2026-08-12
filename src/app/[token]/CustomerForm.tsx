'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WarningCircle, SignOut, Plus, IdentificationBadge, NotePencil, Phone, Sparkle, Spinner } from '@phosphor-icons/react/dist/ssr';
import {
  createCustomerAction,
  updateCustomerAction,
  checkAssetsAction,
  logoutAction,
  getSubmissionForPrefillAction,
  type AssetCheckItem,
  type CreateCustomerResult,
} from './actions';
import type { CustomerConfig } from '@/types/config';
import { CUSTOMER_TEMPLATES } from '@/lib/customerTemplates';
import type { PackageTier } from '@/lib/customerScaffold';
import { Field, Section, DomainManagerCard } from './CustomerFormPieces';
import CustomerCreatedPanel from './CustomerCreatedPanel';
import AssetsSection from './AssetsSection';
import ServicesEditor, { type Service, emptyService } from './ServicesEditor';
import CatalogEditor, { type CatalogItem } from './CatalogEditor';
import AssetCheckSection from './AssetCheckSection';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { motion } from 'motion/react';

const TEMPLATE_LABELS: Record<string, string> = {
  barber: 'Barbershop',
  restaurant: 'Restoran',
  professional: 'Jasa Profesional',
  bakery: 'Bakery',
  rental: 'Rental',
  gamecafe: 'Game Cafe',
  gym: 'Gym',
  petshop: 'Petshop',
};

export default function CustomerForm({ 
  token,
  initialData,
}: { 
  token: string;
  initialData?: CustomerConfig & { slug: string; customDomain?: string };
}) {
  const isEditing = !!initialData;

  // Identitas & profil
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [businessName, setBusinessName] = useState(initialData?.businessName || '');
  const [template, setTemplate] = useState(initialData?.template || '');
  const [tagline, setTagline] = useState(initialData?.tagline || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [packageTier, setPackageTier] = useState<PackageTier>(initialData?.package || 'basic');
  const [customDomain, setCustomDomain] = useState(initialData?.customDomain || '');

  // Tema / Warna
  const [primaryColor, setPrimaryColor] = useState(initialData?.theme?.primaryColor || '#000000');
  const [secondaryColor, setSecondaryColor] = useState(initialData?.theme?.secondaryColor || '#ffffff');
  const [accentColor, setAccentColor] = useState(initialData?.theme?.accentColor || '#f59e0b');

  // Kontak
  const [whatsapp, setWhatsapp] = useState(initialData?.contact?.whatsapp || '');
  const [address, setAddress] = useState(initialData?.contact?.address || '');
  const [mapsLink, setMapsLink] = useState(initialData?.contact?.mapsLink || '');
  const [instagram, setInstagram] = useState(initialData?.contact?.instagram || '');
  const [facebook, setFacebook] = useState(initialData?.contact?.facebook || '');

  // Assets
  const [logo, setLogo] = useState(initialData?.assets?.logo || 'logo.webp');
  const [hero, setHero] = useState(initialData?.assets?.hero || 'hero.webp');
  const [ambiance, setAmbiance] = useState(initialData?.assets?.ambiance || '');
  const [gallery, setGallery] = useState<string[]>(initialData?.assets?.gallery || ['gallery-01.webp']);

  // Layanan & katalog
  const [services, setServices] = useState<Service[]>(
    initialData?.services?.length ? initialData.services.map(s => ({ name: s.name, price: s.price, desc: s.desc ?? '' })) : [emptyService()]
  );
  const [catalog, setCatalog] = useState<CatalogItem[]>(
    initialData?.catalog?.length ? initialData.catalog.map(c => ({ name: c.name, price: c.price, desc: c.desc ?? '', image: c.image })) : []
  );

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

  const [submissionId, setSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const id = searchParams.get('submission');
    if (!id) return;
    getSubmissionForPrefillAction(token, id).then((res) => {
      if (ignore) return;
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
    return () => {
      ignore = true;
    };
  }, [searchParams, token]);

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

  function logout() {
    startLogoutTransition(async () => {
      await logoutAction(token);
      router.refresh();
    });
  }

  if (result?.ok) {
    return (
      <CustomerCreatedPanel
        token={token}
        result={result}
        isLoggingOut={isLoggingOut}
        onCreateAnother={resetForCreateAnother}
        onLogout={logout}
      />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-24">
      <Card className="border-white/10 bg-zinc-950/60 p-6 sm:p-8">
        <form
          className="flex flex-col gap-10"
          onSubmit={(e) => {
            e.preventDefault();
            setResult(null);
            startTransition(async () => {
              const input = {
                slug,
                businessName,
                template,
                tagline,
                description,
                packageTier,
                customDomain,
                primaryColor,
                secondaryColor,
                accentColor,
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
              };
              
              const res = isEditing
                ? await updateCustomerAction(token, initialData.slug, input)
                : await createCustomerAction(token, input);
              setResult(res);
            });
          }}
        >
          {submissionId && (
            <div className="flex items-center gap-2 p-3 text-sm rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400 -mt-2">
              <Sparkle size={16} weight="fill" />
              Diisi otomatis dari submission inbox — cek ulang sebelum membuat customer.
            </div>
          )}
          
          <Section icon={<IdentificationBadge size={18} weight="bold" className="text-blue-500" />} title="Identitas">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Slug" required placeholder="cafe-siti" value={slug} onChange={setSlug} disabled={isEditing} />
              <Field label="Nama bisnis" required placeholder="Cafe Siti" value={businessName} onChange={setBusinessName} />
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <span className="text-sm font-medium text-zinc-300">
                Template <span className="text-blue-500 ml-1">*</span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CUSTOMER_TEMPLATES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTemplate(t)}
                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition text-center ${
                      template === t
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-sm shadow-blue-500/20'
                        : 'border-white/10 hover:border-white/30 text-zinc-300 bg-zinc-900/50 hover:bg-zinc-800'
                    }`}
                  >
                    {TEMPLATE_LABELS[t] ?? t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <span className="text-sm font-medium text-zinc-300">
                Paket <span className="text-blue-500 ml-1">*</span>
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPackageTier('basic')}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition text-left flex flex-col ${
                    packageTier === 'basic'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : 'border-white/10 hover:border-white/30 text-zinc-300 bg-zinc-900/50 hover:bg-zinc-800'
                  }`}
                >
                  <span className={packageTier === 'basic' ? 'text-blue-400' : 'text-zinc-200'}>Basic (499K)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPackageTier('business')}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium transition text-left flex flex-col ${
                    packageTier === 'business'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : 'border-white/10 hover:border-white/30 text-zinc-300 bg-zinc-900/50 hover:bg-zinc-800'
                  }`}
                >
                  <span className={packageTier === 'business' ? 'text-blue-400' : 'text-zinc-200'}>Business Kit (799K)</span>
                </button>
              </div>
              {packageTier === 'business' && !isEditing && (
                <p className="flex items-center gap-1.5 text-xs text-amber-500 mt-1">
                  <Sparkle size={14} weight="fill" />
                  Membuka link Kit Promosi Instan (gambar promo otomatis) setelah customer dibuat.
                </p>
              )}
            </div>

            {packageTier === 'business' && !isEditing && (
              <div className="mt-4">
                <Field
                  label="Custom domain (opsional)"
                  placeholder="namabisnis.com"
                  value={customDomain}
                  onChange={setCustomDomain}
                />
                <p className="text-xs text-zinc-500 mt-2 leading-relaxed max-w-[600px]">
                  Isi kalau domainnya sudah dibeli sekarang. Kalau belum, kosongkan saja — bisa ditambahkan nanti lewat
                  bagian &quot;Atur Domain Customer&quot; di bawah setelah customer dibuat. Setelah diisi, tambahkan
                  domain ini juga di Vercel → Domains dan arahkan DNS-nya.
                </p>
              </div>
            )}
          </Section>

          <Section icon={<NotePencil size={18} weight="bold" className="text-blue-500" />} title="Profil">
            <Field label="Tagline" placeholder="Kopi enak, harga bersahabat" value={tagline} onChange={setTagline} />
            <label className="flex flex-col gap-2 mt-2">
              <span className="text-sm font-medium text-zinc-300">Deskripsi singkat</span>
              <textarea
                rows={4}
                placeholder="Ceritakan singkat tentang bisnis ini..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500/50 resize-none"
              />
            </label>
          </Section>

          <Section icon={<Sparkle size={18} weight="bold" className="text-blue-500" />} title="Warna / Tema">
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-zinc-300">Warna Utama</span>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full h-12 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-zinc-300">Warna Sekunder</span>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full h-12 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-zinc-300">Warna Aksen</span>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-full h-12 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                />
              </div>
            </div>
          </Section>

          <Section icon={<Phone size={18} weight="bold" className="text-blue-500" />} title="Kontak">
            <div className="grid sm:grid-cols-2 gap-6">
              <Field label="Nomor WhatsApp" required placeholder="62812xxxxxxx" value={whatsapp} onChange={setWhatsapp} />
              <Field label="Alamat" placeholder="Jl. Contoh No. 1" value={address} onChange={setAddress} />
              <Field label="Google Maps link" type="url" placeholder="https://maps.google.com/..." value={mapsLink} onChange={setMapsLink} />
              <Field label="Instagram URL" type="url" placeholder="https://instagram.com/..." value={instagram} onChange={setInstagram} />
              <Field label="Facebook URL" type="url" placeholder="https://facebook.com/..." value={facebook} onChange={setFacebook} />
            </div>
          </Section>

          <AssetsSection
            token={token}
            slug={slug}
            logo={logo}
            setLogo={setLogo}
            hero={hero}
            setHero={setHero}
            ambiance={ambiance}
            setAmbiance={setAmbiance}
            gallery={gallery}
            setGallery={setGallery}
            submissionId={submissionId}
          />

          <ServicesEditor services={services} setServices={setServices} />

          <CatalogEditor token={token} slug={slug} catalog={catalog} setCatalog={setCatalog} submissionId={submissionId} />

          <AssetCheckSection
            slug={slug}
            isChecking={isChecking}
            onCheck={runAssetCheck}
            checkError={checkError}
            checkResults={checkResults}
            assetsAreChecked={assetsAreChecked}
          />

          <div className="sticky bottom-0 border-t border-white/10 bg-zinc-950/80 backdrop-blur-xl pt-6 pb-2 -mx-2 px-2 flex flex-col md:flex-row justify-between items-center z-10 gap-4 mt-4 rounded-xl">
            {result && !result.ok ? (
              <p role="alert" className="flex items-center gap-1.5 text-sm font-medium text-red-400">
                <WarningCircle size={16} weight="fill" />
                {result.error}
              </p>
            ) : (
              <div />
            )}
              <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isPending || !assetsAreChecked}
              title={!assetsAreChecked ? 'Jalankan "Cek Asset Sekarang" dulu' : undefined}
              className="w-full md:w-[250px]"
            >
              {isPending ? (
                <><Spinner size={18} className="animate-spin mr-2" /> Menyimpan...</>
              ) : (
                <><Plus size={18} weight="bold" className="mr-2" /> {isEditing ? 'Simpan Perubahan' : 'Buat Customer'}</>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {!isEditing && <DomainManagerCard token={token} />}

      <div className="flex justify-end mt-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isLoggingOut}
          onClick={logout}
          className="text-zinc-500 hover:text-zinc-300"
        >
          <SignOut size={16} className="mr-2" />
          Keluar
        </Button>
      </div>
    </motion.div>
  );
}
