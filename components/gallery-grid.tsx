"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  LayoutGrid,
  Calendar,
  Layers,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  GalleryAlbum,
  OFFICIAL_ALBUMS,
} from "@/lib/gallery-data";

interface GalleryGridProps {
  initialAlbums?: GalleryAlbum[];
}

export function GalleryGrid({
  initialAlbums = OFFICIAL_ALBUMS,
}: GalleryGridProps) {
  // State for active album opened in Messenger-style viewer
  const [activeAlbum, setActiveAlbum] = useState<GalleryAlbum | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"slideshow" | "grid">("slideshow");
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [hiddenCaptions, setHiddenCaptions] = useState<Record<string, boolean>>({});

  const openAlbum = (album: GalleryAlbum, photoIndex: number = 0) => {
    setActiveAlbum(album);
    setActivePhotoIdx(photoIndex);
    setViewMode("slideshow");
  };

  const toggleCaption = (albumId: string) => {
    setHiddenCaptions((current) => ({
      ...current,
      [albumId]: !current[albumId],
    }));
  };

  const closeViewer = useCallback(() => {
    setActiveAlbum(null);
  }, []);

  const nextPhoto = useCallback(() => {
    if (!activeAlbum) return;
    setActivePhotoIdx((prev) => (prev + 1) % activeAlbum.photos.length);
  }, [activeAlbum]);

  const prevPhoto = useCallback(() => {
    if (!activeAlbum) return;
    setActivePhotoIdx(
      (prev) => (prev - 1 + activeAlbum.photos.length) % activeAlbum.photos.length
    );
  }, [activeAlbum]);

  // Keyboard navigation like Messenger
  useEffect(() => {
    if (!activeAlbum) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeAlbum, closeViewer, nextPhoto, prevPhoto]);

  // Lock body scroll when viewer is open
  useEffect(() => {
    if (activeAlbum) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeAlbum]);

  return (
    <div className="space-y-12">
      {/* Album List (Consolidated in One Place like Messenger post) */}
      {/* Album List (2-column compact grid matching user's desired dimensions) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {initialAlbums.map((album) => {
          const totalPhotos = album.photos.length;
          const photo1 = album.photos[0]?.src || album.coverImage;
          const photo2 = album.photos[1]?.src;
          const photo3 = album.photos[2]?.src;
          const remaining = Math.max(0, totalPhotos - 3);
          const captionHidden = hiddenCaptions[album.id] ?? false;

          return (
            <article
              key={album.id}
              className="card-lift flex flex-col overflow-hidden rounded-2xl md:rounded-3xl border border-field/15 bg-white shadow-card hover:border-gold/50 hover:shadow-xl transition-all"
            >
              {/* Top Header Information */}
              <div className="border-b border-field/10 bg-cream/30 p-4 sm:p-5 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-field/10 px-2.5 py-0.5 text-3xs font-bold uppercase tracking-wider text-field border border-field/20">
                      <Layers className="h-3 w-3" />
                      {album.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-3xs font-semibold text-slate">
                      <Calendar className="h-3 w-3 text-gold" />
                      {album.date}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAlbum(album, 0)}
                    className="btn-press inline-flex items-center gap-1.5 rounded-lg bg-field px-3 py-1.5 text-3xs font-black uppercase tracking-wider text-white shadow-xs hover:bg-forest transition-all shrink-0"
                  >
                    <Camera className="h-3.5 w-3.5 text-gold" />
                    View Overall ({totalPhotos})
                  </button>
                </div>

                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-charcoal line-clamp-1">
                    {album.title}
                  </h2>
                  <div className="mt-1 flex items-start justify-between gap-3">
                    {!captionHidden ? (
                      <p className="text-2xs text-slate line-clamp-2 leading-relaxed">
                        {album.description}
                      </p>
                    ) : (
                      <p className="text-2xs font-semibold text-slate/70">Caption hidden</p>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleCaption(album.id)}
                      className="shrink-0 rounded-md border border-field/15 px-2 py-1 text-3xs font-bold uppercase tracking-wider text-field hover:bg-field hover:text-white"
                    >
                      {captionHidden ? "Show Caption" : "Hide Caption"}
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Messenger-Style Multi-Photo Collage or Full Single Photo ── */}
              <div
                className={`grid ${totalPhotos >= 2 ? "grid-cols-3" : "grid-cols-1"} gap-1.5 bg-charcoal p-1.5 h-56 sm:h-64 md:h-72 cursor-pointer select-none`}
                onClick={() => openAlbum(album, 0)}
              >
                {/* Large Main Feature */}
                <div className={`group relative ${totalPhotos >= 2 ? "col-span-2" : "col-span-1"} h-full overflow-hidden rounded-lg bg-forest-deep`}>
                  <img
                    src={photo1}
                    alt={album.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-50 group-hover:opacity-30 transition-opacity" />

                  {/* Badge */}
                  <div className="absolute bottom-2.5 left-2.5 z-10">
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/75 px-2.5 py-1 text-3xs font-bold text-white border border-white/20 backdrop-blur-md line-clamp-1 max-w-[200px]">
                      <Sparkles className="h-3 w-3 text-gold shrink-0" />
                      {album.photos[0]?.title || "Featured"}
                    </span>
                  </div>
                </div>

                {/* Right Column: 2 stacked thumbnails with "+N more" badge (only if 2+ photos) */}
                {totalPhotos >= 2 && (
                  <div className="grid grid-rows-2 gap-1.5 h-full">
                    {/* Photo 2 */}
                    {photo2 ? (
                      <div
                        className="group relative h-full overflow-hidden rounded-lg bg-forest-deep"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAlbum(album, 1);
                        }}
                      >
                        <img
                          src={photo2}
                          alt="Photo 2"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                      </div>
                    ) : (
                      <div className="h-full rounded-lg bg-forest-deep/50" />
                    )}

                    {/* Photo 3 with Messenger-style "+N more" overlay */}
                    {photo3 ? (
                      <div
                        className="group relative h-full overflow-hidden rounded-lg bg-forest-deep"
                        onClick={(e) => {
                          e.stopPropagation();
                          openAlbum(album, 2);
                        }}
                      >
                        <img
                          src={photo3}
                          alt="Photo 3"
                          className="h-full w-full object-cover"
                        />
                        {/* Messenger Overlay */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 group-hover:bg-black/80 backdrop-blur-xs transition-all text-white p-1.5 text-center">
                          <span className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                            +{remaining + 1}
                          </span>
                          <span className="text-3xs font-bold uppercase tracking-wider text-gold">
                            See All
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full rounded-lg bg-forest-deep/50" />
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Quick Bar */}
              <div className="mt-auto bg-white px-4 py-2.5 flex items-center justify-between text-2xs text-slate border-t border-field/10">
                <span className="font-medium text-charcoal text-3xs sm:text-2xs">
                  {totalPhotos} photos in album
                </span>
                <button
                  type="button"
                  onClick={() => openAlbum(album, 0)}
                  className="text-field font-bold hover:text-forest flex items-center gap-1 text-3xs sm:text-2xs"
                >
                  Open Album
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* =========================================================================
          MESSENGER-STYLE OVERALL VIEWER MODAL
          ========================================================================= */}
      {activeAlbum && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-xl animate-fade-in select-none">
          {/* Top Bar (Messenger style) */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-black/60 px-4 md:px-6 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-field/80 text-gold border border-gold/40">
                <Camera className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm md:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                  {activeAlbum.title}
                </h3>
                <p className="text-2xs text-cream/70">
                  Photo {activePhotoIdx + 1} of {activeAlbum.photos.length}
                </p>
              </div>
            </div>

            {/* Viewer Controls */}
            <div className="flex items-center gap-2">
              {/* Toggle Grid Sheet vs Slideshow */}
              <button
                type="button"
                onClick={() =>
                  setViewMode(viewMode === "slideshow" ? "grid" : "slideshow")
                }
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold uppercase transition-all ${
                  viewMode === "grid"
                    ? "bg-gold text-charcoal shadow-sm"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
                title={
                  viewMode === "grid"
                    ? "Switch to Slideshow"
                    : "View All in Grid"
                }
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {viewMode === "grid" ? "Slideshow" : "All Photos"}
                </span>
              </button>

              {/* Hide / Unhide Thumbnail Bar */}
              {viewMode === "slideshow" && (
                <button
                  type="button"
                  onClick={() => setShowThumbnails(!showThumbnails)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold uppercase transition-all ${
                    showThumbnails
                      ? "bg-white/10 text-white hover:bg-white/20"
                      : "bg-gold text-charcoal shadow-sm"
                  }`}
                  title={
                    showThumbnails
                      ? "Hide bottom thumbnail bar"
                      : "Unhide bottom thumbnail bar"
                  }
                >
                  {showThumbnails ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">
                    {showThumbnails ? "Hide Bar" : "Unhide Bar"}
                  </span>
                </button>
              )}

              {/* Close Button */}
              <button
                type="button"
                onClick={closeViewer}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-red-600 hover:text-white transition-all ml-1"
                aria-label="Close photo viewer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </header>

          {/* Viewer Body */}
          {viewMode === "slideshow" ? (
            /* ── Slideshow Mode ── */
            <div className="relative flex flex-1 flex-col justify-between overflow-hidden">
              {/* Main Photo Center Stage */}
              <div className="relative flex flex-1 items-center justify-center p-4 md:p-8">
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={prevPhoto}
                  className="absolute left-4 md:left-8 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white border border-white/20 hover:bg-gold hover:text-charcoal transition-all shadow-xl backdrop-blur-md"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={nextPhoto}
                  className="absolute right-4 md:right-8 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white border border-white/20 hover:bg-gold hover:text-charcoal transition-all shadow-xl backdrop-blur-md"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Active Image */}
                <div className="relative max-h-full max-w-5xl flex items-center justify-center">
                  <img
                    src={activeAlbum.photos[activePhotoIdx].src}
                    alt={activeAlbum.photos[activePhotoIdx].title}
                    className="max-h-[68vh] md:max-h-[72vh] w-auto max-w-full rounded-xl object-contain shadow-2xl drop-shadow-2xl"
                  />
                </div>
              </div>

              {/* Caption Bar */}
              <div className="bg-gradient-to-t from-black via-black/90 to-transparent px-6 py-3 text-center text-white">
                <h4 className="text-base md:text-lg font-bold text-white drop-shadow">
                  {activeAlbum.photos[activePhotoIdx].title}
                </h4>
                <p className="text-xs text-cream/80 max-w-2xl mx-auto mt-0.5 line-clamp-1">
                  {activeAlbum.photos[activePhotoIdx].desc}
                </p>
              </div>

              {/* Bottom Messenger Thumbnail Strip (Collapsible) */}
              <footer
                className={`border-t border-white/10 bg-black/80 transition-all duration-300 ease-in-out shrink-0 overflow-hidden ${
                  showThumbnails ? "max-h-28 px-4 py-3 opacity-100" : "max-h-0 p-0 border-t-0 opacity-0"
                }`}
              >
                <div className="mx-auto flex max-w-5xl items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                  {activeAlbum.photos.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition-all ${
                        idx === activePhotoIdx
                          ? "border-gold ring-2 ring-gold scale-105 opacity-100"
                          : "border-white/15 opacity-40 hover:opacity-80"
                      }`}
                    >
                      <img
                        src={p.src}
                        alt={p.title}
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] font-bold text-white text-center py-0.5">
                        #{idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </footer>

              {/* Bottom Centered Hide / Unhide Pill */}
              <div className="flex justify-center py-1 bg-black/60 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowThumbnails(!showThumbnails)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1 text-2xs font-bold uppercase tracking-wider text-gold hover:bg-gold hover:text-charcoal transition-all border border-white/15 backdrop-blur-md"
                >
                  {showThumbnails ? (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      <span>Hide Bottom Bar</span>
                    </>
                  ) : (
                    <>
                      <ChevronUp className="h-3 w-3" />
                      <span>Unhide Bottom Bar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* ── Overall Grid Sheet Mode (Show all photos at once) ── */
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex items-center justify-between text-white border-b border-white/10 pb-4">
                  <div>
                    <h4 className="text-lg font-bold text-white">
                      Overall Photos ({activeAlbum.photos.length})
                    </h4>
                    <p className="text-xs text-cream/70">
                      Click any photo to inspect in full view
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setViewMode("slideshow")}
                    className="rounded-xl bg-white/15 px-4 py-2 text-xs font-bold uppercase text-white hover:bg-gold hover:text-charcoal transition-all"
                  >
                    Back to Single View
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-12">
                  {activeAlbum.photos.map((p, idx) => (
                    <figure
                      key={p.id}
                      onClick={() => {
                        setActivePhotoIdx(idx);
                        setViewMode("slideshow");
                      }}
                      className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/15 bg-forest-deep shadow-md cursor-pointer"
                    >
                      <img
                        src={p.src}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors" />
                      <figcaption className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-2.5 text-white">
                        <span className="block text-xs font-bold truncate group-hover:text-gold transition-colors">
                          #{idx + 1} {p.title}
                        </span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
