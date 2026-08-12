"use client";
import React from 'react';
import { CustomerConfig } from '@/types/config';
import { sanitizeUrl, sanitizeWhatsapp } from '@/lib/url';
import { m } from 'motion/react';
import Image from 'next/image';
import { PawPrint, Bone, Cat, Dog, FishSimple, Heart, MapPin, InstagramLogo, FacebookLogo, TiktokLogo, Storefront, Clock, ArrowRight } from '@phosphor-icons/react/dist/ssr';

export const PetshopTemplate = ({ config }: { config: CustomerConfig }) => {
  return (
    <div className="min-h-screen bg-primary text-secondary font-sans selection:bg-accent selection:text-primary overflow-x-hidden">
      
      {/* Playful Navbar */}
      <nav className="w-full px-6 py-6 max-w-7xl mx-auto flex justify-between items-center z-50">
        <div className="text-2xl md:text-3xl font-bold tracking-tight text-accent font-outfit flex items-center gap-2">
          {config.businessName} <PawPrint weight="fill" className="text-accent" />
        </div>
        <a 
          href={`https://wa.me/${sanitizeWhatsapp(config.contact.whatsapp)}?text=Halo%20${encodeURIComponent(config.businessName)},%20saya%20ingin%20booking%20grooming/belanja`}
          target="_blank"
          rel="noreferrer"
          className="hidden md:flex items-center gap-2 px-8 py-3 bg-accent text-primary font-bold rounded-full hover:bg-accent/90 hover:-translate-y-1 transition-all shadow-lg shadow-accent/30"
        >
          <span>Say Hello</span>
          <ArrowRight weight="bold" />
        </a>
      </nav>

      {/* Hero Section: Organic Irregular Grid */}
      <section className="px-6 pt-12 pb-24 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 min-h-[70vh]">
          
          {/* Main Text Content */}
          <div className="lg:col-span-6 flex flex-col justify-center px-4 md:px-12 py-12">
            <m.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 text-accent rounded-full font-bold text-sm w-max mb-8"
            >
              <Heart weight="fill" /> For Your Furry Friends
            </m.div>
            
            <m.h1 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight mb-8 leading-[1.05] text-secondary font-outfit"
            >
              {config.tagline}
            </m.h1>
            
            <m.p 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-2xl max-w-xl text-secondary/80 font-medium leading-relaxed mb-12"
            >
              {config.description}
            </m.p>
            
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <a 
                href={`https://wa.me/${sanitizeWhatsapp(config.contact.whatsapp)}?text=Halo%20${encodeURIComponent(config.businessName)},%20saya%20ingin%20booking%20grooming/belanja`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-primary font-bold text-lg rounded-full hover:bg-accent/90 hover:scale-105 transition-all shadow-lg shadow-accent/40"
              >
                Book a Visit <PawPrint weight="fill" />
              </a>
            </m.div>
          </div>
          
          {/* Irregular Image Grid */}
          <div className="lg:col-span-6 grid grid-cols-2 grid-rows-2 gap-4 md:gap-6 h-[50vh] lg:h-auto">
            {config.images?.gallery && config.images.gallery.length >= 2 ? (
              <>
                <m.div 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
                  className="row-span-2 relative overflow-hidden bg-accent/20 rounded-[2rem] md:rounded-[3rem] md:rounded-tr-[5rem] md:rounded-bl-[5rem]"
                >
                  <Image src={config.images.gallery[0]} alt="Pet 1" fill sizes="(max-width: 1024px) 50vw, 25vw" priority className="object-cover" />
                </m.div>
                <m.div 
                  initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative overflow-hidden bg-accent/20 rounded-[2rem] md:rounded-[3rem] md:rounded-tl-[4rem]"
                >
                  <Image src={config.images.gallery[1]} alt="Pet 2" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
                </m.div>
                <m.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
                  className="relative overflow-hidden bg-secondary/10 rounded-[2rem] md:rounded-[3rem] md:rounded-br-[4rem] flex items-center justify-center"
                >
                  {config.images.gallery[2] ? (
                    <Image src={config.images.gallery[2]} alt="Pet 3" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover" />
                  ) : (
                    <PawPrint weight="duotone" size={64} className="text-accent/40" />
                  )}
                </m.div>
              </>
            ) : config.images?.hero ? (
              <m.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
                className="col-span-2 row-span-2 relative overflow-hidden bg-accent/20 rounded-[3rem] md:rounded-[5rem] rounded-tr-none md:rounded-bl-none"
              >
                <Image src={config.images.hero} alt="Hero Pet" fill sizes="100vw" priority className="object-cover" />
              </m.div>
            ) : null}
          </div>
          
        </div>
      </section>

      {/* Services / Pricing */}
      <section className="py-24 px-6 max-w-[1600px] mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-secondary font-outfit">Pet Services</h2>
          <p className="text-xl text-secondary/80 font-medium max-w-2xl mx-auto">Treated with love, just like our own.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {config.services.map((svc, i) => {
            const iconsList = [
              <Cat key={0} weight="duotone" size={48} />,
              <Dog key={1} weight="duotone" size={48} />,
              <Bone key={2} weight="duotone" size={48} />,
              <FishSimple key={3} weight="duotone" size={48} />,
              <Heart key={4} weight="duotone" size={48} />,
              <PawPrint key={5} weight="duotone" size={48} />
            ];
            const Icon = iconsList[i % iconsList.length];
            // Cycle through organic border radius shapes
            const radiusClasses = [
              "rounded-[2rem] rounded-tr-[4rem]",
              "rounded-[2rem] rounded-tl-[4rem]",
              "rounded-[2rem] rounded-br-[4rem]",
              "rounded-[2rem] rounded-bl-[4rem]",
            ];
            const radius = radiusClasses[i % radiusClasses.length];
            
            return (
              <m.div 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, amount: 0.2 }} 
                transition={{ duration: 0.5, delay: i * 0.1 }}
                key={i} 
                className={`bg-primary p-8 md:p-10 shadow-xl shadow-accent/10 border-2 border-accent/20 flex flex-col items-start group hover:-translate-y-2 hover:border-accent/50 transition-all duration-300 ${radius}`}
              >
                <div className="w-20 h-20 bg-accent/10 rounded-[1.5rem] flex items-center justify-center mb-8 text-accent group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                  {Icon}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-secondary font-outfit">{svc.name}</h3>
                {svc.desc && <p className="text-secondary/80 text-lg mb-8 flex-grow font-medium leading-relaxed">{svc.desc}</p>}
                <div className="text-xl md:text-2xl font-black text-accent mt-auto font-outfit px-4 py-2 bg-accent/10 rounded-full">
                  {svc.price}
                </div>
              </m.div>
            );
          })}
        </div>
      </section>

      {/* Catalog / Produk */}
      {config.catalog && config.catalog.length > 0 && (
        <section className="py-24 px-6 max-w-[1600px] mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-secondary font-outfit">Produk Kami</h2>
            <p className="text-xl text-secondary/80 font-medium max-w-2xl mx-auto">Pilihan terbaik untuk hewan kesayanganmu.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {config.catalog.map((item, i) => {
              const radiusClasses = [
                "rounded-[2rem] rounded-tr-[4rem]",
                "rounded-[2rem] rounded-tl-[4rem]",
                "rounded-[2rem] rounded-br-[4rem]",
                "rounded-[2rem] rounded-bl-[4rem]",
              ];
              const radius = radiusClasses[i % radiusClasses.length];

              return (
                <m.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  key={i}
                  className={`bg-primary shadow-xl shadow-accent/10 border-2 border-accent/20 overflow-hidden flex flex-col items-start group hover:-translate-y-2 hover:border-accent/50 transition-all duration-300 ${radius}`}
                >
                  {item.image && (
                    <div className="w-full aspect-square relative overflow-hidden">
                      <Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="p-8 md:p-10 flex flex-col items-start flex-grow">
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 text-secondary font-outfit">{item.name}</h3>
                    {item.desc && <p className="text-secondary/80 text-lg mb-8 flex-grow font-medium leading-relaxed">{item.desc}</p>}
                    <div className="text-xl md:text-2xl font-black text-accent mt-auto font-outfit px-4 py-2 bg-accent/10 rounded-full">
                      {item.price}
                    </div>
                  </div>
                </m.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Playful Footer */}
      <footer className="bg-accent pt-24 pb-12 px-6 text-center mt-12 rounded-t-[3rem] md:rounded-t-[5rem] relative overflow-hidden text-primary">
        
        {/* Background Decorative Paws */}
        <PawPrint weight="fill" className="absolute -top-10 -left-10 text-primary/20 opacity-50 rotate-45" size={200} />
        <PawPrint weight="fill" className="absolute top-20 -right-20 text-primary/20 opacity-50 -rotate-12" size={300} />
        
        <div className="relative z-10 max-w-[1600px] mx-auto flex flex-col items-center">
          <h3 className="text-4xl md:text-6xl font-black mb-6 font-outfit drop-shadow-sm">{config.businessName}</h3>
          <p className="text-primary/90 font-bold text-lg md:text-xl mb-12 max-w-md mx-auto">{config.contact.address}</p>
          
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 font-bold text-lg">
            <a href={sanitizeUrl(config.contact.mapsLink)} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary/80 transition-colors bg-primary/10 px-6 py-3 rounded-full">
              <MapPin weight="fill" /> Google Maps
            </a>
            <a href={`https://wa.me/${sanitizeWhatsapp(config.contact.whatsapp)}?text=Halo%20${encodeURIComponent(config.businessName)},%20saya%20ingin%20booking%20grooming/belanja`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary/80 transition-colors bg-primary/10 px-6 py-3 rounded-full">
              WhatsApp
            </a>
            {config.contact.instagram && (
              <a href={sanitizeUrl(config.contact.instagram)} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary/80 transition-colors bg-primary/10 px-6 py-3 rounded-full">
                <InstagramLogo weight="fill" /> Instagram
              </a>
            )}
            {config.contact.facebook && (
              <a href={sanitizeUrl(config.contact.facebook)} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary/80 transition-colors bg-primary/10 px-6 py-3 rounded-full">
                <FacebookLogo weight="fill" /> Facebook
              </a>
            )}
            {config.contact.tiktok && (
              <a href={sanitizeUrl(config.contact.tiktok)} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary/80 transition-colors bg-primary/10 px-6 py-3 rounded-full">
                <TiktokLogo weight="fill" /> TikTok
              </a>
            )}
            {config.contact.marketplace && (
              <a href={sanitizeUrl(config.contact.marketplace)} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-primary/80 transition-colors bg-primary/10 px-6 py-3 rounded-full">
                <Storefront weight="fill" /> Marketplace
              </a>
            )}
            {config.business?.openingHours?.[0] && (
              <span className="flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full">
                <Clock weight="fill" /> {config.business.openingHours[0]}
              </span>
            )}
          </div>

          <div className="mt-20 font-bold text-primary/60 text-sm">
            &copy; {new Date().getFullYear()} {config.businessName}. Made with <Heart weight="fill" className="inline text-primary/90" />
          </div>
        </div>
      </footer>
    </div>
  );
};
