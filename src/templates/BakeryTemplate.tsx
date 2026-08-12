"use client";
import React from 'react';
import { CustomerConfig } from '@/types/config';
import { sanitizeUrl, sanitizeWhatsapp } from '@/lib/url';
import { m } from 'motion/react';
import Image from 'next/image';
import { Slider } from '@/components/Slider';
import { Cake, Coffee, Cookie, IceCream, MapPin, InstagramLogo, FacebookLogo, TiktokLogo, Storefront, Clock, ArrowRight } from '@phosphor-icons/react/dist/ssr';

export const BakeryTemplate = ({ config }: { config: CustomerConfig }) => {
  return (
    <div className="min-h-screen bg-primary text-secondary font-sans selection:bg-accent selection:text-primary overflow-x-hidden">
      
      {/* Playful & Warm Navbar */}
      <nav className="w-full px-6 py-6 md:px-12 md:py-8 flex justify-between items-center relative z-50 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 text-2xl md:text-3xl font-medium tracking-tight text-secondary font-outfit">
          {config.images?.logo && (
            <Image src={config.images.logo} alt={config.businessName} width={36} height={36} className="rounded-full object-cover shrink-0" />
          )}
          {config.businessName}
        </div>
        <a 
          href={`https://wa.me/${sanitizeWhatsapp(config.contact.whatsapp)}?text=Halo%20${encodeURIComponent(config.businessName)},%20saya%20ingin%20pesan%20kue/roti`}
          target="_blank"
          rel="noreferrer"
          className="px-6 py-3 rounded-full bg-accent text-primary font-medium hover:bg-accent/90 transition-colors flex items-center gap-2 group"
        >
          <span>Order Now</span>
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </a>
      </nav>

      {/* Hero: Sweet & Soft */}
      <section className="px-6 py-12 md:py-24 max-w-7xl mx-auto flex flex-col items-center text-center">
        <m.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-8xl font-medium tracking-tight mb-8 max-w-4xl leading-[1.05] text-secondary font-outfit"
        >
          {config.tagline}
        </m.h1>
        
        <m.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl md:text-2xl max-w-2xl leading-relaxed mb-16 text-secondary/60 font-medium"
        >
          {config.description}
        </m.p>
        
        {/* Dynamic Slider for Gallery */}
        <m.div 
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="w-full relative z-10"
        >
          {config.images?.gallery && config.images.gallery.length > 0 ? (
            <Slider images={config.images.gallery} aspectRatio="aspect-[4/3] md:aspect-[16/9]" rounded="rounded-[2rem] md:rounded-[3rem]" />
          ) : config.images?.hero ? (
            <div className="w-full aspect-[4/3] md:aspect-video relative rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-secondary/10">
              <Image src={config.images.hero} alt="Hero" fill sizes="100vw" priority className="object-cover" />
            </div>
          ) : null}
        </m.div>
      </section>

      {/* Menu Options (Bento Grid Style) */}
      <section className="py-24 md:py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-5xl font-medium mb-4 text-secondary font-outfit">Baked Fresh Daily</h2>
          <p className="text-secondary/50 text-lg">Our carefully crafted selection.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {config.services.map((svc, i) => {
            const iconsList = [
              <Cake key={0} weight="light" size={48} />,
              <Coffee key={1} weight="light" size={48} />,
              <Cookie key={2} weight="light" size={48} />,
              <IceCream key={3} weight="light" size={48} />
            ];
            const Icon = iconsList[i % iconsList.length];
            return (
              <m.div 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, amount: 0.2 }} 
                transition={{ duration: 0.6, delay: i * 0.1 }}
                key={i} 
                className="bg-primary p-8 md:p-10 rounded-[2rem] border border-secondary/10 flex flex-col group hover:-translate-y-2 transition-transform duration-500"
              >
                <div className="w-20 h-20 bg-accent/10 rounded-2xl flex items-center justify-center mb-8 text-accent group-hover:scale-110 group-hover:bg-accent/20 transition-all duration-500">
                  {Icon}
                </div>
                <h3 className="text-2xl md:text-3xl font-medium mb-4 text-secondary font-outfit">{svc.name}</h3>
                {svc.desc && <p className="text-secondary/50 text-lg leading-relaxed mb-8 flex-grow">{svc.desc}</p>}
                <div className="text-xl md:text-2xl font-medium text-accent font-outfit mt-auto">
                  {svc.price}
                </div>
              </m.div>
            );
          })}
        </div>
      </section>

      {/* Catalog / Produk Pilihan */}
      {config.catalog && config.catalog.length > 0 && (
        <section className="py-24 md:py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-4xl md:text-5xl font-medium mb-4 text-secondary font-outfit">Produk Pilihan</h2>
            <p className="text-secondary/50 text-lg">Favorit pelanggan kami.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {config.catalog.map((item, i) => (
              <m.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                key={i}
                className="bg-primary rounded-[2rem] border border-secondary/10 overflow-hidden flex flex-col group hover:-translate-y-2 transition-transform duration-500"
              >
                {item.image && (
                  <div className="w-full aspect-square relative overflow-hidden">
                    <Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-8 md:p-10 flex flex-col flex-grow">
                  <h3 className="text-2xl md:text-3xl font-medium mb-4 text-secondary font-outfit">{item.name}</h3>
                  {item.desc && <p className="text-secondary/50 text-lg leading-relaxed mb-8 flex-grow">{item.desc}</p>}
                  <div className="text-xl md:text-2xl font-medium text-accent font-outfit mt-auto">{item.price}</div>
                </div>
              </m.div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-16 md:py-24 px-6 mt-12 bg-secondary text-primary rounded-t-[3rem] md:rounded-t-[5rem] max-w-[1600px] mx-auto flex flex-col items-center text-center">
        <h3 className="text-3xl md:text-4xl font-medium mb-6 font-outfit">{config.businessName}</h3>
        <p className="text-primary/80 mb-12 text-lg max-w-sm">{config.contact.address}</p>
        
        <div className="flex flex-wrap justify-center gap-6 md:gap-12 font-medium">
          <a href={sanitizeUrl(config.contact.mapsLink)} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary/60 transition-colors">
            <MapPin size={20} /> Location
          </a>
          <a href={`https://wa.me/${sanitizeWhatsapp(config.contact.whatsapp)}?text=Halo%20${encodeURIComponent(config.businessName)},%20saya%20ingin%20pesan%20kue/roti`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary/60 transition-colors">
            WhatsApp
          </a>
          {config.contact.instagram && (
            <a href={sanitizeUrl(config.contact.instagram)} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary/60 transition-colors">
              <InstagramLogo size={20} /> Instagram
            </a>
          )}
          {config.contact.facebook && (
            <a href={sanitizeUrl(config.contact.facebook)} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary/60 transition-colors">
              <FacebookLogo size={20} /> Facebook
            </a>
          )}
          {config.contact.tiktok && (
            <a href={sanitizeUrl(config.contact.tiktok)} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary/60 transition-colors">
              <TiktokLogo size={20} /> TikTok
            </a>
          )}
          {config.contact.marketplace && (
            <a href={sanitizeUrl(config.contact.marketplace)} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary/60 transition-colors">
              <Storefront size={20} /> Marketplace
            </a>
          )}
          {config.business?.openingHours?.[0] && (
            <span className="flex items-center gap-2">
              <Clock size={20} /> {config.business.openingHours[0]}
            </span>
          )}
        </div>

        <div className="mt-16 text-primary/50 text-sm">
          &copy; {new Date().getFullYear()} {config.businessName}
        </div>
      </footer>
    </div>
  );
};
