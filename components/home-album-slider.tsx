"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Camera, ChevronLeft, ChevronRight, Images } from "lucide-react";
import type { GalleryAlbum } from "@/lib/gallery-data";

const visibleCount = 4;

export function HomeAlbumSlider({
  albums,
  autoPlayInterval = 4500,
}: {
  albums: GalleryAlbum[];
  autoPlayInterval?: number;
}) {
  const safeAlbums = useMemo(() => albums.filter((album) => album.photos.length > 0), [albums]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const totalAlbums = safeAlbums.length;

  useEffect(() => {
    if (isPaused || totalAlbums <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalAlbums);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPaused, totalAlbums, autoPlayInterval]);

  if (!safeAlbums.length) return null;

  const currentAlbum = safeAlbums[currentIndex % safeAlbums.length];

  function prevAlbum() {
    setCurrentIndex((prev) => (prev - 1 + totalAlbums) % totalAlbums);
  }

  function nextAlbum() {
    setCurrentIndex((prev) => (prev + 1) % totalAlbums);
  }

  const cover = currentAlbum.coverImage || currentAlbum.photos[0]?.src || "/images/gallery.jpg";
  const photo2 = currentAlbum.photos[1]?.src;
  const photo3 = currentAlbum.photos[2]?.src;
  const photo4 = currentAlbum.photos[3]?.src;

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Featured Album Showcase Card */}
      <div className="relative rounded-2xl md:rounded-3xl border border-field/15 bg-white shadow-xl overflow-hidden">
        <div className="grid lg:grid-cols-[400px_1fr] min-h-[340px] md:min-h-[380px]">
          
          {/* Left Info Panel */}
          <div className="flex flex-col justify-between bg-gradient-to-b from-field to-forest-deep p-6 md:p-8 text-white relative">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-white/10 px-3 py-1 text-3xs font-black uppercase tracking-wider text-gold">
                  <Images className="h-3.5 w-3.5 text-gold" />
                  Album {currentIndex + 1} of {totalAlbums}
                </span>
                <span className="rounded-full bg-gold px-2.5 py-0.5 text-3xs font-bold uppercase text-charcoal">
                  {currentAlbum.category}
                </span>
              </div>

              <h3 className="mt-4 text-2xl md:text-3xl font-black leading-tight text-white tracking-tight">
                {currentAlbum.title}
              </h3>

              {/* Scrollable Caption Container */}
              <div className="mt-3 max-h-36 md:max-h-44 overflow-y-auto pr-2 custom-scrollbar select-text">
                <p className="text-xs md:text-sm leading-relaxed text-white/90 whitespace-pre-line">
                  {currentAlbum.description}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/15 flex items-center justify-between gap-4">
              <span className="text-2xs font-bold text-white/70">
                {currentAlbum.photos.length} Captured Photos
              </span>
              <Link
                href="/gallery"
                className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-gold hover:text-white transition-colors"
              >
                Open Full Album
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Photo Collage */}
          <div className="relative bg-charcoal p-2 md:p-3 grid grid-cols-3 grid-rows-2 gap-2 min-h-[260px] md:min-h-[340px]">
            {/* Main Cover (Spans 2 cols, 2 rows) */}
            <div className="relative col-span-2 row-span-2 overflow-hidden rounded-xl bg-forest-deep group">
              <img
                src={cover}
                alt={currentAlbum.title}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/10" />
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-3xs font-black uppercase tracking-wider text-white border border-white/20">
                <Camera className="h-3 w-3 text-gold" />
                Featured Cover
              </span>
            </div>

            {/* Top Right Photo */}
            <div className="relative overflow-hidden rounded-xl bg-forest-deep group">
              {photo2 ? (
                <>
                  <img
                    src={photo2}
                    alt="Preview 2"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-forest text-3xs text-white/40 font-bold uppercase">
                  Photo
                </div>
              )}
            </div>

            {/* Bottom Right Photo */}
            <div className="relative overflow-hidden rounded-xl bg-forest-deep group">
              {photo3 ? (
                <>
                  <img
                    src={photo3}
                    alt="Preview 3"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center text-white text-center p-1">
                    <span className="text-base md:text-lg font-black text-white drop-shadow">
                      +{currentAlbum.photos.length > 3 ? currentAlbum.photos.length - 2 : 1}
                    </span>
                    <span className="text-3xs font-black uppercase text-gold">See All</span>
                  </div>
                </>
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-forest text-3xs text-white/40 font-bold uppercase">
                  Photo
                </div>
              )}
            </div>

            {/* Navigation Chevron Buttons on the Collage Area */}
            <button
              type="button"
              onClick={prevAlbum}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-black/75 text-white border border-white/30 backdrop-blur-md hover:bg-gold hover:text-charcoal hover:border-gold transition-all shadow-2xl active:scale-95"
              aria-label="Previous album"
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </button>
            <button
              type="button"
              onClick={nextAlbum}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-black/75 text-white border border-white/30 backdrop-blur-md hover:bg-gold hover:text-charcoal hover:border-gold transition-all shadow-2xl active:scale-95"
              aria-label="Next album"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide Dots Indicator */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {safeAlbums.map((album, index) => (
          <button
            key={album.id}
            type="button"
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-8 bg-field shadow-md"
                : "w-2 bg-field/25 hover:bg-field/50"
            }`}
            aria-label={`Go to ${album.title}`}
          />
        ))}
      </div>
    </div>
  );
}
