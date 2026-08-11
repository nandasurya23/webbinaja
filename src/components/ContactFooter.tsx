"use client";
import React from 'react';
import { MapPin, WhatsappLogo } from '@phosphor-icons/react/dist/ssr';
import { m } from 'motion/react';
import { cn } from '@/lib/utils';
import { sanitizeUrl, sanitizeWhatsapp } from '@/lib/url';

interface ContactFooterProps {
  businessName: string;
  address: string;
  whatsapp: string;
  mapsLink: string;
  accentColor?: string;
  className?: string;
}

export const ContactFooter: React.FC<ContactFooterProps> = ({
  businessName, address, whatsapp, mapsLink, className
}) => {
  return (
    <footer className={cn("w-full bg-zinc-950 text-white py-24 px-6 md:px-12", className)}>
      <m.div 
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-16"
      >
        <div className="md:w-1/2">
          <h3 className="text-4xl md:text-5xl font-medium tracking-tight mb-8">
            {businessName}
          </h3>
          <p className="text-zinc-400 max-w-sm text-lg leading-relaxed">
            Elevating your experience with uncompromising quality and service.
          </p>
        </div>

        <div className="md:w-1/3 space-y-12">
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-medium mb-6">Location</h4>
            <a href={sanitizeUrl(mapsLink)} target="_blank" rel="noreferrer" className="flex items-start gap-4 hover:text-white text-zinc-300 transition-colors group">
              <MapPin weight="regular" size={24} className="mt-1 flex-shrink-0 text-zinc-500 group-hover:text-white transition-colors" />
              <span className="text-lg leading-relaxed">{address}</span>
            </a>
          </div>
          
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-medium mb-6">Inquiries</h4>
            <a href={`https://wa.me/${sanitizeWhatsapp(whatsapp)}`} target="_blank" rel="noreferrer" className="flex items-center gap-4 hover:text-white text-zinc-300 transition-colors group">
              <WhatsappLogo weight="regular" size={24} className="flex-shrink-0 text-zinc-500 group-hover:text-white transition-colors" />
              <span className="text-lg">WhatsApp Us</span>
            </a>
          </div>
        </div>
      </m.div>
      
      <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-600 text-sm">
        <span>&copy; {new Date().getFullYear()} {businessName}. All rights reserved.</span>
        <span>Powered by Webbinaja</span>
      </div>
    </footer>
  );
};
