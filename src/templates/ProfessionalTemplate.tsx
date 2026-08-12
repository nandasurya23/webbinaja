"use client";
import React from 'react';
import { CustomerConfig, Testimonial } from '@/types/config';
import { sanitizeUrl, sanitizeWhatsapp } from '@/lib/url';
import { m } from 'motion/react';
import Image from 'next/image';
import { Pill, FirstAid, Heartbeat, Stethoscope, ShieldCheck, MapPin, InstagramLogo, FacebookLogo, TiktokLogo, Storefront, Clock, ArrowRight } from '@phosphor-icons/react/dist/ssr';

export const ProfessionalTemplate = ({ config }: { config: CustomerConfig }) => {
  return (
    <div className="w-full min-h-screen bg-primary text-secondary font-sans selection:bg-accent selection:text-white overflow-x-hidden">
      
      {/* Clean & Professional Navbar */}
      <nav className="w-full px-6 py-6 md:px-12 md:py-8 flex justify-between items-center bg-primary border-b border-secondary/10 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center overflow-hidden">
            {config.images?.logo ? (
              <Image src={config.images.logo} alt={config.businessName} width={40} height={40} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-lg">{config.businessName.charAt(0)}</span>
            )}
          </div>
          <span className="text-xl md:text-2xl font-semibold tracking-tight text-secondary font-sans">
            {config.businessName}
          </span>
        </div>
        <a 
          href={`https://wa.me/${sanitizeWhatsapp(config.contact.whatsapp)}?text=Halo%20${encodeURIComponent(config.businessName)},%20saya%20ingin%20buat%20janji%20temu/konsultasi`}
          target="_blank"
          rel="noreferrer"
          className="hidden md:flex items-center gap-2 px-6 py-3 bg-accent text-white font-medium rounded-lg hover:bg-accent/90 transition-colors shadow-sm"
        >
          <span>Konsultasi</span>
          <ArrowRight weight="bold" />
        </a>
      </nav>

      {/* Hero Section: Structured Bento Grid */}
      <section className="px-6 py-12 md:py-16 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[70vh]">
          
          {/* Main Hero Card */}
          <m.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-8 bg-accent rounded-[2rem] p-8 md:p-16 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
            
            <div className="relative z-10 max-w-2xl">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1] font-sans">
                {config.tagline}
              </h1>
              <p className="text-lg md:text-xl text-white/80 font-medium leading-relaxed mb-12 max-w-lg">
                {config.description}
              </p>
            </div>
            
            <div className="relative z-10">
              <a 
                href={`https://wa.me/${sanitizeWhatsapp(config.contact.whatsapp)}?text=Halo%20${encodeURIComponent(config.businessName)},%20saya%20ingin%20buat%20janji%20temu/konsultasi`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-secondary font-semibold rounded-xl hover:bg-secondary/10 transition-colors"
              >
                Buat Janji Temu <ArrowRight weight="bold" />
              </a>
            </div>
          </m.div>

          {/* Side Bento Cards */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Image Asset */}
            <m.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 rounded-[2rem] overflow-hidden relative bg-secondary/10 min-h-[300px]"
            >
              {config.images?.hero ? (
                <Image src={config.images.hero} alt="Klinik" fill sizes="(min-width: 1024px) 33vw, 100vw" priority className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-secondary/40 font-medium">Visual Placeholder</div>
              )}
            </m.div>
            
            {/* Trust Card */}
            <m.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="h-48 rounded-[2rem] bg-primary border border-secondary/10 p-8 flex flex-col justify-center"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
                  <ShieldCheck size={28} weight="fill" />
                </div>
                <h3 className="text-xl font-bold text-secondary">Trusted Care</h3>
              </div>
              <p className="text-secondary/60 font-medium">Layanan profesional terstandarisasi untuk kenyamanan Anda.</p>
            </m.div>
          </div>
        </div>
      </section>

      {/* Services (Bento Grid) */}
      <section className="px-6 py-24 max-w-[1600px] mx-auto">
        <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-secondary font-sans mb-4">Layanan Kami</h2>
            <p className="text-lg text-secondary/60 font-medium">Solusi komprehensif untuk kebutuhan Anda.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {config.services.map((svc, i) => {
            const iconsList = [
              <Stethoscope key={0} weight="duotone" size={40} />,
              <Heartbeat key={1} weight="duotone" size={40} />,
              <FirstAid key={2} weight="duotone" size={40} />,
              <Pill key={3} weight="duotone" size={40} />
            ];
            const Icon = iconsList[i % iconsList.length];
            return (
              <m.div 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, amount: 0.2 }} 
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                key={i} 
                className="bg-primary rounded-[2rem] p-8 md:p-10 border border-secondary/10 flex flex-col group hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-secondary/5 rounded-xl flex items-center justify-center text-accent mb-8 border border-secondary/5 group-hover:bg-accent/10 transition-colors">
                  {Icon}
                </div>
                <h3 className="text-2xl font-bold text-secondary mb-4 font-sans">{svc.name}</h3>
                {svc.desc && <p className="text-secondary/60 text-lg leading-relaxed mb-8 flex-grow">{svc.desc}</p>}
                <div className="text-xl font-semibold text-accent mt-auto">
                  {svc.price}
                </div>
              </m.div>
            );
          })}
        </div>
      </section>

      {/* Catalog / Produk */}
      {config.catalog && config.catalog.length > 0 && (
        <section className="px-6 py-24 max-w-[1600px] mx-auto">
          <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-secondary font-sans mb-4">Produk Kami</h2>
              <p className="text-lg text-secondary/60 font-medium">Pilihan produk yang kami sediakan.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.catalog.map((item, i) => (
              <m.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                key={i}
                className="bg-primary rounded-[2rem] border border-secondary/10 overflow-hidden flex flex-col group hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300"
              >
                {item.image && (
                  <div className="w-full aspect-square relative overflow-hidden">
                    <Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                  </div>
                )}
                <div className="p-8 md:p-10 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-secondary mb-4 font-sans">{item.name}</h3>
                  {item.desc && <p className="text-secondary/60 text-lg leading-relaxed mb-8 flex-grow">{item.desc}</p>}
                  <div className="text-xl font-semibold text-accent mt-auto">{item.price}</div>
                </div>
              </m.div>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {config.testimonials && config.testimonials.length > 0 && (
        <section className="px-6 py-24 bg-primary border-y border-secondary/10">
          <div className="max-w-[1600px] mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-secondary font-sans mb-16 text-center">Apa Kata Pasien</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.testimonials.map((t: Testimonial, i: number) => (
                <m.div 
                  initial={{ opacity: 0, y: 20 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  key={i} 
                  className="bg-secondary/5 rounded-[2rem] p-8 md:p-10 border border-secondary/10 flex flex-col justify-between"
                >
                  <p className="text-secondary/80 text-lg leading-relaxed mb-8 font-medium italic">&quot;{t.text}&quot;</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold">
                      {t.name.charAt(0)}
                    </div>
                    <p className="text-secondary font-bold">{t.name}</p>
                  </div>
                </m.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="px-6 py-24 bg-primary">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24">
          
          <div className="md:col-span-6 lg:col-span-4 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">{config.businessName.charAt(0)}</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-secondary font-sans">
                {config.businessName}
              </span>
            </div>
            <p className="text-secondary/60 text-lg leading-relaxed font-medium">
              {config.description}
            </p>
          </div>
          
          <div className="md:col-span-6 lg:col-span-4 flex flex-col gap-6">
            <span className="text-sm font-bold uppercase tracking-widest text-secondary/40">Lokasi</span>
            <p className="text-secondary/80 text-lg font-medium">{config.contact.address}</p>
            <a href={sanitizeUrl(config.contact.mapsLink)} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-accent font-semibold hover:text-accent/80 transition-colors w-max mt-2">
              <MapPin size={20} /> Lihat di Google Maps
            </a>
          </div>

          <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-6">
            <span className="text-sm font-bold uppercase tracking-widest text-secondary/40">Hubungi Kami</span>
            <div className="flex flex-col gap-4 text-lg font-semibold text-secondary/80">
              <a href={`https://wa.me/${sanitizeWhatsapp(config.contact.whatsapp)}?text=Halo%20${encodeURIComponent(config.businessName)},%20saya%20ingin%20buat%20janji%20temu/konsultasi`} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-accent transition-colors">
                 WhatsApp
              </a>
              {config.contact.instagram && (
                <a href={sanitizeUrl(config.contact.instagram)} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-accent transition-colors">
                  <InstagramLogo size={24} /> Instagram
                </a>
              )}
              {config.contact.facebook && (
                <a href={sanitizeUrl(config.contact.facebook)} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-accent transition-colors">
                  <FacebookLogo size={24} /> Facebook
                </a>
              )}
              {config.contact.tiktok && (
                <a href={sanitizeUrl(config.contact.tiktok)} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-accent transition-colors">
                  <TiktokLogo size={24} /> TikTok
                </a>
              )}
              {config.contact.marketplace && (
                <a href={sanitizeUrl(config.contact.marketplace)} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-accent transition-colors">
                  <Storefront size={24} /> Marketplace
                </a>
              )}
              {config.business?.openingHours?.[0] && (
                <span className="flex items-center gap-3">
                  <Clock size={24} /> {config.business.openingHours[0]}
                </span>
              )}
            </div>
          </div>

        </div>
        <div className="max-w-[1600px] mx-auto mt-24 pt-8 border-t border-secondary/10 text-secondary/60 font-medium">
          &copy; {new Date().getFullYear()} {config.businessName}. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
