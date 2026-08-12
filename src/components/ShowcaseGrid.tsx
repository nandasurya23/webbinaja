"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowSquareOut } from '@phosphor-icons/react/dist/ssr';
import { AnimatedContainer } from './ui/AnimatedContainer';

export interface ShowcaseSite {
  businessName: string;
  template: string;
  logoUrl?: string;
  heroUrl?: string;
  url: string;
}

const SHOWCASE_INITIAL_COUNT = 4;

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

export function ShowcaseGrid({ showcaseSites }: { showcaseSites: ShowcaseSite[] }) {
  const [showAllSites, setShowAllSites] = useState(false);
  const visibleSites = showAllSites ? showcaseSites : showcaseSites.slice(0, SHOWCASE_INITIAL_COUNT);
  const hasMoreSites = showcaseSites.length > SHOWCASE_INITIAL_COUNT;

  if (showcaseSites.length === 0) return null;

  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10 border-t border-white/5">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-bold mb-4 text-blue-400">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Live Sekarang
        </div>
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white font-outfit mb-4">Sudah Dipercaya Bisnis Nyata</h2>
        <p className="text-zinc-400 max-w-xl font-medium">Bukan mockup — ini website customer kami yang beneran live dan diakses publik hari ini.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {visibleSites.map((site, i) => (
          <AnimatedContainer
            as="a"
            key={site.url}
            href={site.url}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: (i % SHOWCASE_INITIAL_COUNT) * 0.05 }}
            className="group flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 hover:bg-white/[0.07] transition-all duration-300"
          >
            <div className="relative w-full h-36 bg-white/5 overflow-hidden">
              {site.heroUrl ? (
                <Image
                  src={site.heroUrl}
                  alt={`Preview website ${site.businessName}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white/20">
                  {site.businessName.trim().charAt(0).toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 p-4">
              {site.logoUrl ? (
                <Image
                  src={site.logoUrl}
                  alt={site.businessName}
                  width={32}
                  height={32}
                  className="rounded-full object-cover shrink-0 h-8 w-8 border border-white/10"
                  loading="lazy"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {site.businessName.trim().charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{site.businessName}</p>
                <p className="text-[11px] text-zinc-500 truncate">{TEMPLATE_LABELS[site.template] ?? site.template}</p>
              </div>
              <ArrowSquareOut size={14} className="text-zinc-600 group-hover:text-zinc-300 transition-colors shrink-0" />
            </div>
          </AnimatedContainer>
        ))}
      </div>

      {hasMoreSites && (
        <div className="flex justify-center mt-10">
          <button
            type="button"
            onClick={() => setShowAllSites((v) => !v)}
            className="px-6 py-3 bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded hover:bg-white/10 hover:border-white/30 transition-colors"
          >
            {showAllSites ? 'Tampilkan Lebih Sedikit' : `Lihat Lebih Banyak (${showcaseSites.length - SHOWCASE_INITIAL_COUNT})`}
          </button>
        </div>
      )}
    </section>
  );
}
