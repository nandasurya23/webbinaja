"use client";
import React from 'react';
import { CustomerConfig } from '@/types/config';
import { sanitizeUrl, sanitizeWhatsapp } from '@/lib/url';
import { m, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import { ArrowRight, MapPin, InstagramLogo, FacebookLogo, TiktokLogo, Storefront, Clock } from '@phosphor-icons/react/dist/ssr';

export const RestaurantTemplate = ({ config }: { config: CustomerConfig }) => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 150]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <div className="min-h-screen bg-primary text-secondary font-sans selection:bg-accent selection:text-primary overflow-x-hidden">
      
      {/* Editorial Navbar */}
      <nav className="fixed top-0 left-0 w-full px-8 py-6 md:px-16 flex justify-between items-center z-50 bg-primary/80 backdrop-blur-md border-b border-accent/20 transition-all">
        <div className="text-xl md:text-2xl font-light tracking-[0.2em] uppercase font-outfit text-secondary">
          {config.businessName}
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-[10px] font-medium tracking-[0.3em] uppercase text-secondary/60">
          <a href="#about" className="hover:text-accent transition-colors">Story</a>
          <a href="#services" className="hover:text-accent transition-colors">Menu</a>
          {config.catalog && <a href="#catalog" className="hover:text-accent transition-colors">Specials</a>}
          {config.images?.gallery && <a href="#gallery" className="hover:text-accent transition-colors">Ambiance</a>}
        </div>
        
        <div className="flex justify-end">
          <a 
            href={`https://wa.me/${sanitizeWhatsapp(config.contact.whatsapp)}?text=Halo%20${encodeURIComponent(config.businessName)},%20saya%20ingin%20reservasi%20meja`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 uppercase tracking-[0.3em] text-[10px] font-medium text-secondary hover:text-accent transition-all group"
          >
            <span>Reservations</span>
            <ArrowRight weight="light" className="group-hover:translate-x-2 transition-transform duration-500" />
          </a>
        </div>
      </nav>

      {/* Editorial Hero */}
      <section id="hero" className="relative w-full h-[100dvh] overflow-hidden flex flex-col justify-center bg-primary">
        <m.div style={{ y: y1, scale: 1.05 }} className="absolute inset-0 z-0">
          {config.images?.hero ? (
            <Image 
              src={config.images.hero}
              alt={config.businessName}
              fill
              sizes="100vw"
              priority
              className="object-cover opacity-60 brightness-75 contrast-125" 
            />
          ) : (
            <div className="absolute inset-0 bg-primary/90" />
          )}
        </m.div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-transparent to-primary z-10" />

        <div className="relative z-20 px-8 py-12 md:px-16 flex flex-col items-center text-center mt-20">
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl sm:text-6xl md:text-[7rem] lg:text-[9rem] font-light tracking-[-0.02em] text-secondary leading-[0.85] font-sans mb-8">
              {config.tagline.split(' ').map((word, i) => (
                <span key={i} className="block italic">{word}</span>
              ))}
            </h1>
          </m.div>
          
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            style={{ opacity }}
            className="mt-12 md:mt-24"
          >
            <span className="text-[10px] uppercase tracking-[0.4em] text-accent">Discover</span>
            <div className="w-[1px] h-16 bg-accent/30 mx-auto mt-6 animate-pulse"></div>
          </m.div>
        </div>
      </section>

      {/* Story Text */}
      <section id="about" className="py-32 md:py-48 px-8 md:px-16 max-w-5xl mx-auto text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-24 bg-accent/20"></div>
        
        <m.p 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl md:text-4xl lg:text-5xl leading-[1.6] text-secondary/80 font-light font-sans"
        >
          {config.description}
        </m.p>
      </section>

      {/* Fine Dining Menu */}
      <section id="services" className="py-32 md:py-48 px-8 md:px-16 bg-secondary/5 relative border-y border-accent/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center mb-24 md:mb-32">
            <span className="text-[10px] font-outfit uppercase tracking-[0.4em] text-accent mb-6">
              Menu Degustation
            </span>
            <div className="w-12 h-[1px] bg-accent/30"></div>
          </div>
          
          <div className="flex flex-col gap-12 md:gap-20">
            {config.services.map((svc, i) => (
              <m.div 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                key={i} 
                className="flex flex-col group relative"
              >
                <div className="flex flex-col md:flex-row justify-between items-baseline gap-4 md:gap-12 relative z-10">
                  <div className="md:w-3/4">
                    <h3 className="text-3xl md:text-5xl font-light mb-4 text-secondary font-sans group-hover:text-accent transition-colors duration-500">
                      {svc.name}
                    </h3>
                  </div>
                  <div className="md:w-1/4 flex md:justify-end shrink-0">
                    <span className="text-xl md:text-2xl text-accent font-light font-outfit tracking-widest">{svc.price}</span>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-12 mt-2">
                  <div className="md:w-3/4">
                    {svc.desc && <p className="text-secondary/60 text-base md:text-lg max-w-2xl leading-relaxed italic">{svc.desc}</p>}
                  </div>
                  {/* Dotted Leader for desktop */}
                  <div className="hidden md:block absolute left-0 bottom-6 w-full border-b border-dotted border-accent/20 -z-10 group-hover:border-accent/40 transition-colors duration-500"></div>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* Culinary Masterpieces (Catalog) */}
      {config.catalog && config.catalog.length > 0 && (
        <section id="catalog" className="py-32 md:py-48 px-8 md:px-16 relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center mb-24 md:mb-32">
              <span className="text-[10px] font-outfit uppercase tracking-[0.4em] text-accent mb-6">
                Culinary Highlights
              </span>
              <div className="w-12 h-[1px] bg-accent/30"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
              {config.catalog.map((item, i) => (
                <m.div 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 1, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
                  key={i} 
                  className="group flex flex-col items-center text-center cursor-pointer"
                >
                  <div className="w-full aspect-[4/5] relative overflow-hidden mb-8 border border-accent/10">
                    <Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-light mb-3 text-secondary font-sans group-hover:text-accent transition-colors duration-500">
                    {item.name}
                  </h3>
                  {item.desc && <p className="text-secondary/60 text-sm max-w-xs mb-6 leading-relaxed italic">{item.desc}</p>}
                  <span className="text-lg text-accent font-light font-outfit tracking-widest">{item.price}</span>
                </m.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Floating Gallery Images */}
      {config.images?.gallery && config.images.gallery.length > 0 && (
        <section id="gallery" className="py-32 md:py-48 px-8 md:px-16 max-w-7xl mx-auto flex flex-col md:flex-row gap-16 md:gap-24 items-center relative border-t border-accent/10">
           
           <div className="w-full md:w-[45%] aspect-[3/4] relative overflow-hidden bg-secondary/5 p-4 border border-accent/10">
             <div className="w-full h-full relative overflow-hidden">
               <Image src={config.images.gallery[0]} alt="Ambiance" fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover hover:scale-110 transition-transform duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)]" />
             </div>
           </div>
           
           <div className="w-full md:w-[55%] flex flex-col gap-16 md:gap-24 relative">
             <div className="absolute -left-12 top-1/2 w-24 h-[1px] bg-accent/30 hidden md:block"></div>
             
             <div className="aspect-[4/3] relative overflow-hidden bg-secondary/5 w-[85%] mx-auto md:ml-auto md:mr-0 p-4 border border-accent/10">
               <div className="w-full h-full relative overflow-hidden">
                 {config.images.gallery[1] && <Image src={config.images.gallery[1]} alt="Dish" fill sizes="(max-width: 768px) 85vw, 47vw" className="object-cover hover:scale-110 transition-transform duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)]" />}
               </div>
             </div>
             
             <div className="text-center md:text-left md:pl-16">
               <a 
                 href={`https://wa.me/${sanitizeWhatsapp(config.contact.whatsapp)}?text=Halo%20${encodeURIComponent(config.businessName)},%20saya%20ingin%20reservasi%20meja`}
                 target="_blank"
                 rel="noreferrer"
                 className="inline-flex items-center gap-6 text-lg md:text-xl uppercase tracking-[0.3em] font-outfit font-light text-accent hover:text-secondary transition-colors duration-500 group"
               >
                 Reserve Your Experience 
                 <ArrowRight weight="light" className="group-hover:translate-x-4 transition-transform duration-500" />
               </a>
             </div>
           </div>
        </section>
      )}

      {/* Ultra-Minimal Footer */}
      <footer className="pt-32 pb-16 px-8 md:px-16 max-w-7xl mx-auto flex flex-col justify-between items-center text-center gap-16 border-t border-accent/20">
        
        <div className="flex flex-col items-center">
          <h3 className="text-2xl font-light tracking-[0.2em] uppercase mb-8 font-outfit text-secondary">{config.businessName}</h3>
          <p className="text-secondary/60 text-sm tracking-widest max-w-sm mb-12 leading-relaxed uppercase">
            {config.contact.address}
          </p>
          <a 
            href={sanitizeUrl(config.contact.mapsLink)} 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.3em] text-accent hover:text-secondary transition-colors duration-500"
          >
            <MapPin size={16} weight="light" /> View Map
          </a>
        </div>

        <div className="flex flex-col gap-12 w-full">
          <div className="flex flex-wrap justify-center gap-10 md:gap-16">
            <a href={`https://wa.me/${sanitizeWhatsapp(config.contact.whatsapp)}?text=Halo%20${encodeURIComponent(config.businessName)},%20saya%20ingin%20reservasi%20meja`} target="_blank" rel="noreferrer" className="text-[10px] uppercase tracking-[0.3em] text-secondary/60 hover:text-accent transition-colors duration-500 flex items-center gap-2">
              WhatsApp
            </a>
            {config.contact.instagram && (
              <a href={sanitizeUrl(config.contact.instagram)} target="_blank" rel="noreferrer" className="text-[10px] uppercase tracking-[0.3em] text-secondary/60 hover:text-accent transition-colors duration-500 flex items-center gap-2">
                <InstagramLogo size={16} weight="light" /> Instagram
              </a>
            )}
            {config.contact.facebook && (
              <a href={sanitizeUrl(config.contact.facebook)} target="_blank" rel="noreferrer" className="text-[10px] uppercase tracking-[0.3em] text-secondary/60 hover:text-accent transition-colors duration-500 flex items-center gap-2">
                <FacebookLogo size={16} weight="light" /> Facebook
              </a>
            )}
            {config.contact.tiktok && (
              <a href={sanitizeUrl(config.contact.tiktok)} target="_blank" rel="noreferrer" className="text-[10px] uppercase tracking-[0.3em] text-secondary/60 hover:text-accent transition-colors duration-500 flex items-center gap-2">
                <TiktokLogo size={16} weight="light" /> TikTok
              </a>
            )}
            {config.contact.marketplace && (
              <a href={sanitizeUrl(config.contact.marketplace)} target="_blank" rel="noreferrer" className="text-[10px] uppercase tracking-[0.3em] text-secondary/60 hover:text-accent transition-colors duration-500 flex items-center gap-2">
                <Storefront size={16} weight="light" /> Marketplace
              </a>
            )}
            {config.business?.openingHours?.[0] && (
              <span className="text-[10px] uppercase tracking-[0.3em] text-secondary/60 flex items-center gap-2">
                <Clock size={16} weight="light" /> {config.business.openingHours[0]}
              </span>
            )}
          </div>
          <div className="text-secondary/40 text-[9px] uppercase tracking-[0.4em] pt-8 border-t border-accent/10">
            &copy; {new Date().getFullYear()} {config.businessName}. Elegance Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
