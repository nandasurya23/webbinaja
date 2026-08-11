'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WarningCircle, SignOut, Plus, IdentificationBadge, NotePencil, Phone, Sparkle } from '@phosphor-icons/react/dist/ssr';
import {
  createCustomerAction,
  checkAssetsAction,
  logoutAction,
  getSubmissionForPrefillAction,
  type AssetCheckItem,
  type CreateCustomerResult,
} from './actions';
import { CUSTOMER_TEMPLATES } from '@/lib/customerTemplates';
import type { PackageTier } from '@/lib/customerScaffold';
import { Field, Section, DomainManagerCard, inputClass } from './CustomerFormPieces';
import CustomerCreatedPanel from './CustomerCreatedPanel';
import AssetsSection from './AssetsSection';
import ServicesEditor, { type Service, emptyService } from './ServicesEditor';
import CatalogEditor, { type CatalogItem, emptyCatalogItem } from './CatalogEditor';
import AssetCheckSection from './AssetCheckSection';

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
                  Business Kit (999K)
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
          />

          <ServicesEditor services={services} setServices={setServices} />

          <CatalogEditor token={token} slug={slug} catalog={catalog} setCatalog={setCatalog} />

          <AssetCheckSection
            slug={slug}
            isChecking={isChecking}
            onCheck={runAssetCheck}
            checkError={checkError}
            checkResults={checkResults}
            assetsAreChecked={assetsAreChecked}
          />

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
        onClick={logout}
      >
        <SignOut size={14} />
        Keluar
      </button>
    </div>
  );
}
