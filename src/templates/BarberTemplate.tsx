"use client";
import React from 'react';
import { CustomerConfig } from '@/types/config';
import { sanitizeUrl, sanitizeWhatsapp } from '@/lib/url';
import { m, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import { ArrowRight, ArrowDownRight, MapPin, InstagramLogo, FacebookLogo } from '@phosphor-icons/react/dist/ssr';

export const BarberTemplate = ({ config }: { config: CustomerConfig }) => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);

  return (
    <div className="w-full min-h-screen bg-primary text-secondary font-sans selection:bg-accent selection:text-white overflow-x-hidden">
      
      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-difference" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-primary/80 backdrop-blur-md border-b-2 border-secondary/20 px-6 py-4 flex justify-between items-center transition-all">
        <div className="text-secondary text-xl font-black tracking-tighter uppercase flex items-center gap-2">
          <span className="w-3 h-3 bg-accent"></span>
          {config.businessName}
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-xs font-black font-mono uppercase tracking-[0.2em] text-secondary/60">
          <a href="#about" className="hover:text-accent transition-colors">About</a>
          <a href="#services" className="hover:text-accent transition-colors">Services</a>
          {config.catalog && <a href="#catalog" className="hover:text-accent transition-colors">Products</a>}
          {config.images?.gallery && <a href="#gallery" className="hover:text-accent transition-colors">Space</a>}
        </div>
        
        <a 
          href={`https://wa.me/${sanitizeWhatsapp(config.contact.whatsapp)}?text=Halo%20${encodeURIComponent(config.businessName)},%20saya%20ingin%20booking%20jadwal%20cukur`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-primary bg-secondary px-4 py-2 uppercase text-xs font-black tracking-[0.2em] hover:bg-accent hover:text-white transition-all"
        >
          <span>Book</span>
          <ArrowRight weight="bold" />
        </a>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full min-h-[100dvh] flex flex-col md:flex-row border-b-2 border-secondary/20">
        
        {/* Left: Typography Focus */}
        <div className="w-full md:w-[55%] flex flex-col justify-end pt-32 pb-12 px-6 md:px-12 md:pb-24 border-r-2 border-secondary/20 z-10 bg-primary">
          <m.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[4rem] sm:text-[6rem] md:text-[7rem] lg:text-[10rem] font-black leading-[0.8] text-secondary tracking-tighter break-words uppercase font-sans"
          >
            {config.businessName.split(' ')[0]}
            <br />
            <span className="text-transparent" style={{ WebkitTextStroke: '2px #52525b' }}>
              {config.businessName.split(' ').slice(1).join(' ')}
            </span>
          </m.h1>
          
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-12 md:mt-24 max-w-md border-t-2 border-secondary/20 pt-6"
          >
            <p className="text-lg md:text-xl text-secondary/70 font-medium leading-relaxed font-mono uppercase tracking-tight">
              {config.tagline}
            </p>
          </m.div>
        </div>

        {/* Right: Asset (Parallax) */}
        <div className="w-full md:w-[45%] min-h-[50vh] md:min-h-[100dvh] relative overflow-hidden bg-zinc-900">
          {config.images?.hero ? (
            <m.div style={{ y: y1 }} className="absolute inset-0 -top-[20%] -bottom-[20%]">
              <Image 
                src={config.images.hero}
                alt="Barber"
                fill
                sizes="(min-width: 768px) 45vw, 100vw"
                priority
                className="object-cover grayscale contrast-[1.3] brightness-75 mix-blend-luminosity" 
              />
            </m.div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-zinc-700 uppercase tracking-[0.2em] text-xs font-black">Asset Missing</span>
            </div>
          )}
        </div>
      </section>

      {/* The Craft (About) */}
      <section id="about" className="flex flex-col md:flex-row border-b-2 border-secondary/20 bg-primary">
        <div className="w-full md:w-1/3 p-6 md:p-12 border-b-2 md:border-b-0 md:border-r-2 border-secondary/20 flex items-start">
          <h2 className="text-xs font-black font-mono uppercase tracking-[0.2em] text-accent">
            [ About the Craft ]
          </h2>
        </div>
        <div className="w-full md:w-2/3 p-6 md:p-24 lg:p-32">
          <p className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl leading-[1.1] font-black text-secondary tracking-tighter uppercase">
            {config.description}
          </p>
        </div>
      </section>

      {/* Menu / Services */}
      <section id="services" className="w-full bg-primary">
        <div className="p-6 md:p-12 border-b-2 border-secondary/20">
          <h2 className="text-xs font-black font-mono uppercase tracking-[0.2em] text-accent">
            [ Service Menu ]
          </h2>
        </div>
        
        <div className="flex flex-col">
          {config.services.map((svc, i) => (
            <m.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              key={i} 
              className="group flex flex-col sm:flex-row border-b-2 border-secondary/20 hover:bg-secondary transition-colors duration-500 cursor-pointer"
            >
              <div className="w-full sm:w-2/3 p-6 md:p-12 border-b-2 sm:border-b-0 sm:border-r-2 border-secondary/20 group-hover:border-primary/20 transition-colors duration-500">
                <div className="flex items-center gap-6">
                  <ArrowDownRight weight="bold" className="text-secondary/50 group-hover:text-primary transition-colors duration-500 shrink-0" size={32} />
                  <div>
                    <h3 className="text-4xl md:text-6xl font-black text-secondary tracking-tighter uppercase group-hover:text-primary transition-colors duration-500">
                      {svc.name}
                    </h3>
                    {svc.desc && (
                      <p className="text-secondary/60 mt-4 text-lg max-w-lg leading-relaxed font-medium group-hover:text-primary/70 transition-colors duration-500">
                        {svc.desc}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-1/3 p-6 md:p-12 flex items-center justify-end sm:justify-start">
                <span className="text-2xl md:text-4xl font-black font-mono text-accent group-hover:text-primary transition-colors duration-500">
                  {svc.price}
                </span>
              </div>
            </m.div>
          ))}
        </div>
      </section>

      {/* Catalog / Products */}
      {config.catalog && config.catalog.length > 0 && (
        <section id="catalog" className="w-full bg-primary border-b-2 border-secondary/20">
          <div className="p-6 md:p-12 border-b-2 border-secondary/20">
            <h2 className="text-xs font-black font-mono uppercase tracking-[0.2em] text-accent">
              [ Product Catalog ]
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {config.catalog.map((item, i) => (
              <div key={i} className="group relative flex flex-col border-b-2 border-secondary/20 lg:border-b-0 lg:border-r-2 last:border-r-0 hover:bg-secondary/5 transition-colors duration-500">
                <div className="w-full aspect-square relative bg-primary/50 overflow-hidden border-b-2 border-secondary/20">
                  <Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                  <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 text-xs font-black font-mono uppercase tracking-widest">
                    {item.price}
                  </div>
                </div>
                <div className="p-8 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="text-2xl font-black text-secondary uppercase tracking-tighter mb-3">{item.name}</h3>
                    {item.desc && <p className="text-secondary/60 font-medium leading-relaxed">{item.desc}</p>}
                  </div>
                  <div className="mt-8 flex justify-end">
                    <a href={`https://wa.me/${sanitizeWhatsapp(config.contact.whatsapp)}?text=I%20want%20to%20buy%20${item.name}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-secondary hover:text-accent uppercase text-xs font-black tracking-[0.2em] transition-colors">
                      Purchase <ArrowRight weight="bold" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gallery */}
      {config.images?.gallery && config.images.gallery.length > 0 && (
        <section id="gallery" className="w-full border-b-2 border-secondary/20 py-12 md:py-24 bg-primary">
           <div className="px-6 md:px-12 mb-12">
            <h2 className="text-xs font-black font-mono uppercase tracking-[0.2em] text-accent">
              [ The Space ]
            </h2>
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6 px-6 md:px-12 pb-8">
            {config.images.gallery.map((img, i) => (
              <div key={i} className="flex-none w-[85vw] sm:w-[50vw] md:w-[35vw] snap-center relative aspect-[3/4] bg-zinc-900 overflow-hidden border-2 border-zinc-800 group">
                <Image src={img} alt="Gallery" fill sizes="(max-width: 640px) 85vw, (max-width: 768px) 50vw, 35vw" className="object-cover grayscale contrast-[1.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Custom Contact Footer */}
      <footer className="w-full bg-primary flex flex-col md:flex-row relative z-10">
        <div className="w-full md:w-1/2 p-6 md:p-12 border-b-2 md:border-b-0 md:border-r-2 border-secondary/20 flex flex-col justify-between min-h-[400px]">
          <div>
            <h3 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-4">{config.businessName}</h3>
            <p className="text-secondary/60 text-lg max-w-sm font-medium">{config.contact.address}</p>
          </div>
          
          <div className="flex flex-col gap-4 mt-12">
            <a href={sanitizeUrl(config.contact.mapsLink)} target="_blank" rel="noreferrer" className="flex items-center gap-4 text-sm font-black font-mono uppercase tracking-[0.2em] text-secondary/60 hover:text-accent transition-colors group w-fit">
              <MapPin size={20} className="group-hover:text-accent transition-colors" /> Location
            </a>
            {config.contact.instagram && (
              <a href={sanitizeUrl(config.contact.instagram)} target="_blank" rel="noreferrer" className="flex items-center gap-4 text-sm font-black font-mono uppercase tracking-[0.2em] text-secondary/60 hover:text-accent transition-colors group w-fit">
                <InstagramLogo size={20} className="group-hover:text-accent transition-colors" /> Instagram
              </a>
            )}
            {config.contact.facebook && (
              <a href={sanitizeUrl(config.contact.facebook)} target="_blank" rel="noreferrer" className="flex items-center gap-4 text-sm font-black font-mono uppercase tracking-[0.2em] text-secondary/60 hover:text-accent transition-colors group w-fit">
                <FacebookLogo size={20} className="group-hover:text-accent transition-colors" /> Facebook
              </a>
            )}
          </div>
        </div>
        
        <a 
          href={`https://wa.me/${sanitizeWhatsapp(config.contact.whatsapp)}?text=Halo%20${encodeURIComponent(config.businessName)},%20saya%20ingin%20booking%20jadwal%20cukur`} 
          target="_blank" 
          rel="noreferrer"
          className="w-full md:w-1/2 p-6 md:p-24 flex items-center justify-center group hover:bg-secondary hover:text-primary transition-colors duration-500 cursor-pointer"
        >
          <div className="flex items-center gap-8 overflow-hidden">
            <span className="text-6xl md:text-8xl lg:text-[8rem] font-black tracking-tighter uppercase leading-none">Inquire</span>
            <ArrowRight size={80} className="transform -translate-x-full opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
          </div>
        </a>
      </footer>
    </div>
  );
};
