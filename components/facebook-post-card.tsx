"use client";

import { useState } from "react";
import {
  Globe,
  MoreHorizontal,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink,
  Heart,
  Award,
} from "lucide-react";

export type FacebookPost = {
  id: string;
  title: string;
  content: string;
  category: string;
  priority?: "normal" | "important" | "urgent";
  image_url?: string | null;
  created_at: string;
  author?: string;
  authorAvatar?: string;
  likesCount?: number;
};

const categoryBadgeConfig: Record<string, { label: string; color: string; icon: string }> = {
  announcement: { label: "ANNOUNCEMENT", color: "bg-blue-50 text-blue-700 border-blue-200", icon: "📢" },
  gallery: { label: "UNIT GALLERY", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: "📸" },
  requirements: { label: "REQUIREMENTS", color: "bg-amber-50 text-amber-800 border-amber-200", icon: "📜" },
  benefits: { label: "CADET BENEFITS", color: "bg-purple-50 text-purple-700 border-purple-200", icon: "⭐" },
  about: { label: "UNIT PROFILE", color: "bg-field/10 text-field border-field/20", icon: "🎖️" },
  training: { label: "TRAINING DRILL", color: "bg-red-50 text-red-700 border-red-200", icon: "🎯" },
  general: { label: "COMMAND DISPATCH", color: "bg-mist text-charcoal border-field/15", icon: "📌" },
};

export function FacebookPostCard({ post }: { post: FacebookPost }) {
  const [saluted, setSaluted] = useState(false);
  const [saluteCount, setSaluteCount] = useState(post.likesCount ?? 28);
  const [showFullText, setShowFullText] = useState(false);

  const normalizedCategory = (post.category || "general").toLowerCase();
  const badge = categoryBadgeConfig[normalizedCategory] || categoryBadgeConfig.general;

  function handleSalute() {
    if (saluted) {
      setSaluted(false);
      setSaluteCount((c) => Math.max(0, c - 1));
    } else {
      setSaluted(true);
      setSaluteCount((c) => c + 1);
    }
  }

  const isLong = post.content.length > 220;
  const displayText = isLong && !showFullText ? `${post.content.slice(0, 220)}...` : post.content;

  // Format date nicely
  const postDate = new Date(post.created_at);
  const dateFormatted = isNaN(postDate.getTime())
    ? "Official Dispatch"
    : postDate.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  return (
    <article className="overflow-hidden rounded-xl border border-field/15 bg-white shadow-card hover:shadow-card-hover transition-all">
      {/* ── 1. Facebook-Style Post Header ── */}
      <div className="flex items-start justify-between p-4 sm:p-5">
        <div className="flex items-center gap-3">
          {/* Unit Insignia Avatar */}
          <div className="relative h-11 w-11 shrink-0 rounded-full border-2 border-gold/40 p-0.5 bg-white shadow-2xs">
            <img
              src={post.authorAvatar || "/logo.png"}
              alt="San Enrique ROTC Command"
              className="h-full w-full rounded-full object-contain"
            />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <strong className="text-sm font-bold text-charcoal hover:text-field transition-colors">
                {post.author || "San Enrique ROTC Command"}
              </strong>
              {/* Verified Blue / Gold Military Badge */}
              <CheckCircle2 className="h-4 w-4 text-field fill-field/20" />
            </div>

            <div className="flex items-center gap-2 text-3xs sm:text-2xs text-slate mt-0.5">
              <span>{dateFormatted}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Public Command
              </span>
            </div>
          </div>
        </div>

        {/* Category Pill Tag */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-3xs font-mono font-bold uppercase tracking-wider ${badge.color}`}
          >
            <span>{badge.icon}</span>
            <span>{badge.label}</span>
          </span>
          <button
            type="button"
            className="text-slate hover:text-charcoal p-1 rounded-full hover:bg-mist transition-colors"
            title="Post options"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── 2. Post Text Content & Description ── */}
      <div className="px-4 pb-3 sm:px-5">
        {post.title && (
          <h3 className="text-base sm:text-lg font-black text-charcoal leading-snug tracking-tight mb-2">
            {post.title}
          </h3>
        )}
        <p className="whitespace-pre-line text-xs sm:text-sm text-charcoal/85 leading-relaxed">
          {displayText}
          {isLong && (
            <button
              onClick={() => setShowFullText(!showFullText)}
              className="ml-1.5 font-bold text-field hover:text-forest underline text-xs"
            >
              {showFullText ? "Show less" : "See more"}
            </button>
          )}
        </p>
      </div>

      {/* ── 3. Prominent Photo Attachment ── */}
      {post.image_url ? (
        <div className="relative w-full h-[420px] overflow-hidden bg-forest-deep/90">
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.01]"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/images/gallery.jpg";
            }}
          />
        </div>
      ) : null}

      {/* ── 4. Reactions & Interaction Metrics Bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 text-3xs sm:text-2xs text-slate border-b border-field/10">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-field text-white shadow-2xs">
            <Award className="h-3 w-3" />
          </span>
          <span className="font-semibold">{saluteCount} Cadets Saluted</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Official Bulletin</span>
          <span>•</span>
          <span>Verified</span>
        </div>
      </div>

      {/* ── 5. Facebook-Style Action Buttons Bar ── */}
      <div className="grid grid-cols-3 px-2 py-1.5 sm:px-3">
        {/* Like / Salute */}
        <button
          onClick={handleSalute}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
            saluted ? "text-field bg-field/10" : "text-slate hover:bg-mist hover:text-charcoal"
          }`}
        >
          <ThumbsUp className={`h-4 w-4 ${saluted ? "fill-field text-field" : ""}`} />
          <span>{saluted ? "Saluted" : "Salute"}</span>
        </button>

        {/* Inquire / Notice */}
        <button
          onClick={() => alert(`Official Dispatch: "${post.title}". For questions, coordinate through your Platoon Leader or visit the Command Headquarters.`)}
          className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold text-slate hover:bg-mist hover:text-charcoal transition-all"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Inquire</span>
        </button>

        {/* Share / Copy */}
        <button
          onClick={() => {
            if (navigator?.clipboard) {
              navigator.clipboard.writeText(window.location.origin + `/announcements`);
              alert("Dispatch link copied to clipboard!");
            }
          }}
          className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold text-slate hover:bg-mist hover:text-charcoal transition-all"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </button>
      </div>
    </article>
  );
}

