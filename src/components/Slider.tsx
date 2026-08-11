"use client";
import React, { useRef } from 'react';
import Image from 'next/image';
import { CaretLeft, CaretRight } from '@phosphor-icons/react/dist/ssr';

interface SliderProps {
  images: string[];
  aspectRatio?: string; // e.g., 'aspect-video', 'aspect-[4/3]'
  rounded?: string; // e.g., 'rounded-2xl'
  /**
   * When true, each slide fills the full track width instead of the
   * default "peek" width (50-80%, showing a sliver of the next slide).
   * Use this when the slider sits inside a container styled to look like a
   * single-photo frame/mockup (e.g. decorative browser dots or a HUD
   * overlay) — the peek effect there reads as a broken/cropped image
   * rather than a carousel, since there's no visual room for "next slide
   * incoming" framing.
   */
  fullWidth?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  images,
  aspectRatio = 'aspect-video',
  rounded = 'rounded-3xl',
  fullWidth = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!images || images.length === 0) {
    return <div className={`w-full ${aspectRatio} bg-neutral-200 ${rounded} flex items-center justify-center text-neutral-500`}>No images available</div>;
  }

  return (
    <div className="relative group w-full">
      {/* Slider Track */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-4 md:gap-6 w-full"
      >
        {images.map((src, i) => (
          <div
            key={i}
            className={`flex-none ${fullWidth ? 'w-full' : 'w-full sm:w-[80%] md:w-[60%] lg:w-[50%]'} snap-center relative ${aspectRatio} ${rounded} overflow-hidden bg-neutral-100 shadow-sm border border-black/5`}
          >
            <Image
              src={src}
              alt={`Gallery image ${i + 1}`}
              fill
              sizes={fullWidth ? '100vw' : '(max-width: 768px) 100vw, 50vw'}
              priority={fullWidth && i === 0}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Nav Buttons (Visible on hover on desktop) */}
      {images.length > 1 && (
        <>
          <button 
            onClick={() => scroll('left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border border-black/10 shadow-lg flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hidden md:flex"
            aria-label="Previous image"
          >
            <CaretLeft weight="bold" size={20} />
          </button>
          
          <button 
            onClick={() => scroll('right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border border-black/10 shadow-lg flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 hidden md:flex"
            aria-label="Next image"
          >
            <CaretRight weight="bold" size={20} />
          </button>
        </>
      )}
    </div>
  );
};
