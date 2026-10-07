"use client";

import { useEffect, useState, useRef, useMemo } from "react";

const ALL_SLIDES = [
  "/images/home.jpg",
  "/images/about.jpg",
  "/images/benefits.jpg",
  "/images/requiremets.jpg",
  "/images/events.jpg",
  "/images/gallery.jpg",
  "/images/announcements.jpg",
  "/images/contact.jpg",
];

interface HeroSliderProps {
  initialImage?: string;
  interval?: number;
}

export function HeroSlider({ initialImage, interval = 4500 }: HeroSliderProps) {
  // If an initial image is provided, arrange slides so it starts first
  const slides = useMemo(() => {
    if (!initialImage) return ALL_SLIDES;
    const cleanInitial = initialImage.trim();
    const filtered = ALL_SLIDES.filter((s) => s !== cleanInitial);
    return [cleanInitial, ...filtered];
  }, [initialImage]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [incomingIdx, setIncomingIdx] = useState<number | null>(null);
  const [isSliding, setIsSliding] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      // Pick next slide
      const nextIndex = (currentIdx + 1) % slides.length;
      setIncomingIdx(nextIndex);
      setIsSliding(false);

      // Trigger sliding in next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsSliding(true);
        });
      });

      // Complete transition after 1100ms
      transitionTimeoutRef.current = setTimeout(() => {
        setCurrentIdx(nextIndex);
        setIncomingIdx(null);
        setIsSliding(false);
      }, 1100);
    }, interval);

    return () => {
      clearInterval(timer);
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [currentIdx, interval, slides.length]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Current Slide */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${slides[currentIdx]})`,
          transform: isSliding ? "translateX(-100%) scale(1.05)" : "translateX(0%) scale(1)",
          transition: isSliding ? "transform 1100ms cubic-bezier(0.4, 0.0, 0.2, 1)" : "none",
          willChange: "transform",
        }}
      />

      {/* Incoming Slide (slides in from right to left) */}
      {incomingIdx !== null && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${slides[incomingIdx]})`,
            transform: isSliding ? "translateX(0%) scale(1)" : "translateX(100%) scale(1.05)",
            transition: isSliding ? "transform 1100ms cubic-bezier(0.4, 0.0, 0.2, 1)" : "none",
            willChange: "transform",
          }}
        />
      )}

      {/* Deep Military Forest Gradient Overlay for optimal legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-forest/90 via-forest/75 to-forest/85" />
      <div className="absolute inset-0 bg-gradient-to-t from-forest via-transparent to-forest/60" />

      {/* Slide dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === currentIdx ? "w-6 bg-gold" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
