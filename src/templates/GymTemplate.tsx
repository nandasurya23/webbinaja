"use client";
import React from 'react';
import { CustomerConfig } from '@/types/config';
import { motion, useScroll, useTransform } from 'motion/react';
import Image from 'next/image';
import { Barbell, Trophy, Flame, Heartbeat, PersonSimpleRun, Lightning, ArrowRight, MapPin, InstagramLogo, FacebookLogo } from '@phosphor-icons/react';

export const GymTemplate = ({ config }: { config: CustomerConfig }) => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-red-600 overflow-x-hidden uppercase">
      
      {/* Kinetic Navbar */}
      <nav className="w-full px-6 py-8 flex justify-between items-center absolute top-0 z-50 mix-blend-difference pointer-events-none">
        <div className="text-3xl font-black italic tracking-tighter text-white pointer-events-auto font-outfit">
          {config.businessName}
        </div>
        <a 
          href={`https://wa.me/${config.contact.whatsapp}?text=Halo%20${encodeURIComponent(config.businessName)},%20saya%20ingin%20daftar%20membership/kelas`}
          target="_blank"
          rel="noreferrer"
          className="pointer-events-auto px-8 py-3 bg-red-600 text-white font-black italic skew-x-[-15deg] hover:bg-white hover:text-red-600 transition-colors shadow-[8px_8px_0_0_#ffffff] hover:shadow-[4px_4px_0_0_#ff0000] active:shadow-none active:translate-x-1 active:translate-y-1"
        >
          <span className="block skew-x-[15deg] tracking-widest text-lg">Join Now</span>
        </a>
      </nav>

      {/* Hero: Aggressive Typography */}
      <section className="relative pt-40 pb-20 px-6 max-w-[1600px] mx-auto min-h-[90vh] flex flex-col justify-center border-b-[12px] border-red-600">
        
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
           {config.images?.hero && (
             <motion.div style={{ y: y1 }} className="absolute inset-0 opacity-40 grayscale contrast-150 mix-blend-luminosity">
                <Image src={config.images.hero} alt="Gym Hero" fill className="object-cover" priority />
             </motion.div>
           )}
           <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
           
           {/* Kinetic Stripes */}
           <div className="absolute right-[-10%] top-0 h-[200%] w-32 bg-red-600/10 rotate-45 transform origin-top blur-xl" />
           <div className="absolute right-[10%] top-[-20%] h-[200%] w-16 bg-white/5 rotate-45 transform origin-top blur-md" />
        </div>

        <div className="relative z-10 w-full md:w-3/4 lg:w-2/3">
          <motion.h1 
            initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-7xl sm:text-8xl md:text-[9rem] lg:text-[11rem] font-black italic leading-[0.8] tracking-tighter mb-12 font-outfit"
          >
            <span className="block text-transparent bg-clip-text mb-4" style={{ WebkitTextStroke: '2px white' }}>
              {config.tagline.split(' ')[0]}
            </span>
            <span className="block text-white drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]">
              {config.tagline.split(' ').slice(1).join(' ')}
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl md:text-4xl font-black italic max-w-2xl text-zinc-400 font-outfit"
          >
            {config.description}
          </motion.p>
        </div>
      </section>

      {/* Gallery Reel */}
      {config.images?.gallery && config.images.gallery.length > 0 && (
        <section className="w-full bg-red-600 py-12 overflow-hidden border-b-[12px] border-zinc-900">
          <div className="flex gap-4 px-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory">
            {config.images.gallery.map((img, i) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                key={i} 
                className="flex-none w-[80vw] md:w-[40vw] lg:w-[30vw] aspect-video relative skew-x-[-10deg] overflow-hidden snap-center bg-zinc-950 border-4 border-zinc-900 group"
              >
                <Image src={img} alt="Gallery" fill className="object-cover skew-x-[10deg] scale-125 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Memberships / Services */}
      <section className="py-32 px-6 max-w-[1600px] mx-auto">
        <motion.h2 
          initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
          className="text-6xl md:text-8xl font-black italic mb-20 text-white font-outfit tracking-tighter"
        >
          Programs
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {config.services.map((svc, i) => {
            const iconsList = [
              <Barbell key={0} weight="fill" size={64} />,
              <Trophy key={1} weight="fill" size={64} />,
              <Flame key={2} weight="fill" size={64} />,
              <Lightning key={3} weight="fill" size={64} />,
              <Heartbeat key={4} weight="fill" size={64} />,
              <PersonSimpleRun key={5} weight="fill" size={64} />
            ];
            const Icon = iconsList[i % iconsList.length];
            return (
              <motion.div 
                initial={{ opacity: 0, y: 50 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, amount: 0.2 }} 
                transition={{ duration: 0.5, delay: i * 0.1 }}
                key={i} 
                className="bg-zinc-900 border-t-8 border-red-600 p-8 md:p-12 hover:bg-red-600 transition-colors duration-300 group cursor-default relative overflow-hidden flex flex-col"
              >
                <div className="absolute -right-10 -bottom-10 opacity-5 text-red-500 group-hover:text-black group-hover:opacity-20 transition-all transform -rotate-12 scale-150 pointer-events-none">
                  {Icon}
                </div>
                
                <div className="text-red-600 group-hover:text-black mb-8 transition-colors drop-shadow-lg">
                  {Icon}
                </div>
                
                <h3 className="text-3xl md:text-4xl font-black italic tracking-tight mb-4 font-outfit">{svc.name}</h3>
                <div className="text-5xl font-black italic mb-8 font-outfit tracking-tighter">{svc.price}</div>
                
                {svc.desc && <p className="text-zinc-400 font-bold tracking-wide group-hover:text-white relative z-10 flex-grow text-lg">{svc.desc}</p>}
                
                <div className="mt-8 pt-8 border-t border-zinc-800 group-hover:border-red-800 flex items-center justify-between font-black italic text-red-600 group-hover:text-black transition-colors">
                  <span>View Details</span>
                  <ArrowRight weight="bold" size={24} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Aggressive Footer */}
      <footer className="bg-red-600 py-24 px-6 text-center border-t-[16px] border-white relative overflow-hidden">
        
        {/* Background text texture */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none overflow-hidden">
           <span className="text-[25rem] font-black italic leading-none text-black font-outfit whitespace-nowrap">
             NO EXCUSES
           </span>
        </div>
        
        <div className="relative z-10 max-w-[1600px] mx-auto flex flex-col items-center">
          <h3 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-8 font-outfit text-white drop-shadow-[4px_4px_0_0_#000000]">{config.businessName}</h3>
          
          <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
            <p className="text-black font-black italic text-xl md:text-2xl bg-white px-6 py-2 skew-x-[-10deg]">
              <span className="block skew-x-[10deg]">{config.contact.address}</span>
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 font-black italic text-xl md:text-3xl">
            <a href={config.contact.mapsLink} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white hover:text-black transition-colors">
              <MapPin weight="fill" /> Location
            </a>
            <a href={`https://wa.me/${config.contact.whatsapp}?text=Halo%20${encodeURIComponent(config.businessName)},%20saya%20ingin%20daftar%20membership/kelas`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white hover:text-black transition-colors">
              Join
            </a>
            {config.contact.instagram && (
              <a href={config.contact.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white hover:text-black transition-colors">
                <InstagramLogo weight="fill" /> IG
              </a>
            )}
            {config.contact.facebook && (
              <a href={config.contact.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-white hover:text-black transition-colors">
                <FacebookLogo weight="fill" /> FB
              </a>
            )}
          </div>
          
          <div className="mt-24 text-black font-bold italic tracking-widest text-sm">
            &copy; {new Date().getFullYear()} {config.businessName}. BUILT TO WIN.
          </div>
        </div>
      </footer>
    </div>
  );
};
