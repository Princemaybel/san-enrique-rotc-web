"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { INSTRUCTION_PHOTOS, GallerySlideItem } from "@/lib/gallery-data";
export { INSTRUCTION_PHOTOS };
export type { GallerySlideItem };

export function GallerySlider({
  items = INSTRUCTION_PHOTOS,
  autoPlayInterval = 3800,
}: {
  items?: GallerySlideItem[];
  autoPlayInterval?: number;
}) {
  const n = items.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedModal, setSelectedModal] = useState<GallerySlideItem | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % n);
  }, [n]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + n) % n);
  }, [n]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
  };

  // Automatic slide loop
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isHovered, nextSlide, autoPlayInterval]);

  return (
    <div
      className="relative w-full select-none py-1 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── 3-Picture Stage (Proportional height hugging the 3:2 cards) ── */}
      <div className="relative w-full h-[300px] xs:h-[360px] sm:h-[460px] md:h-[540px] lg:h-[600px] flex items-center justify-center overflow-hidden">
        {/* Soft edge fade so pictures blend smoothly at the edge of the monitor */}
        <div className="pointer-events-none absolute left-0 inset-y-0 w-8 sm:w-16 md:w-28 bg-gradient-to-r from-cream via-cream/60 to-transparent z-25" />
        <div className="pointer-events-none absolute right-0 inset-y-0 w-8 sm:w-16 md:w-28 bg-gradient-to-l from-cream via-cream/60 to-transparent z-25" />

        {items.map((item, idx) => {
          let diff = idx - currentIndex;
          if (diff > n / 2) diff -= n;
          if (diff <= -n / 2) diff += n;

          // Render slides in view and flanking edges (-2 to +2)
          if (Math.abs(diff) > 2) return null;

          const isCenter = diff === 0;

          // Spatial positioning across full viewport width
          let translateX = "0%";
          let scale = "1";
          let opacity = 1;
          let zIndex = 20;

          if (isCenter) {
            translateX = "0%";
            scale = "1";
            opacity = 1;
            zIndex = 20;
          } else if (diff === -1) {
            translateX = "-75%";
            scale = "0.88";
            opacity = 0.45;
            zIndex = 10;
          } else if (diff === 1) {
            translateX = "75%";
            scale = "0.88";
            opacity = 0.45;
            zIndex = 10;
          } else if (diff === -2) {
            translateX = "-150%";
            scale = "0.78";
            opacity = 0.2;
            zIndex = 5;
          } else {
            translateX = "150%";
            scale = "0.78";
            opacity = 0.2;
            zIndex = 5;
          }

          return (
            <div
              key={item.id}
              onClick={() => {
                if (isCenter) {
                  setSelectedModal(item);
                } else if (diff < 0) {
                  prevSlide();
                } else {
                  nextSlide();
                }
              }}
              style={{
                transform: `translateX(${translateX}) scale(${scale})`,
                opacity: opacity,
                zIndex: zIndex,
              }}
              className="absolute w-[88%] sm:w-[78%] md:w-[68%] lg:w-[62%] aspect-[3/2] rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform"
            >
              <img
                src={item.src}
                alt={item.title}
                className="h-full w-full object-cover object-center"
              />

              {/* Dark Shadow Overlay on Side Pictures (Center picture is bright and in focus!) */}
              {!isCenter && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-[0.5px] transition-opacity hover:bg-black/30" />
              )}
            </div>
          );
        })}

        {/* Floating Side Chevrons */}
        <button
          type="button"
          onClick={prevSlide}
          className="absolute left-3 sm:left-6 md:left-10 top-1/2 -translate-y-1/2 z-40 flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-black/60 text-white border border-white/20 backdrop-blur-md hover:bg-field hover:text-white transition-all shadow-2xl opacity-75 hover:opacity-100"
          aria-label="Previous Photo"
        >
          <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
        {/* Slide Dots Indicator (Inside the picture at the bottom) */}
        <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 bg-black/60 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/20 shadow-xl">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToSlide(i)}
              className={`h-2 rounded-full transition-all duration-500 shrink-0 ${
                i === currentIndex
                  ? "w-7 bg-gold shadow-glow-gold"
                  : "w-2 bg-white/40 hover:bg-white/75"
              }`}
              aria-label={`Go to photo ${i + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={nextSlide}
          className="absolute right-3 sm:right-6 md:right-10 top-1/2 -translate-y-1/2 z-40 flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-black/60 text-white border border-white/20 backdrop-blur-md hover:bg-field hover:text-white transition-all shadow-2xl opacity-75 hover:opacity-100"
          aria-label="Next Photo"
        >
          <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
      </div>

      {/* Lightbox Modal (Clicking center picture opens high-res modal) */}
      {selectedModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
          onClick={() => setSelectedModal(null)}
        >
          <div
            className="relative max-w-5xl w-full overflow-hidden rounded-2xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[3/2] w-full bg-black flex items-center justify-center">
              <img
                src={selectedModal.src}
                alt={selectedModal.title}
                className="h-full w-full object-contain"
              />
              <button
                type="button"
                onClick={() => setSelectedModal(null)}
                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white border border-white/20 hover:bg-gold hover:text-charcoal transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
