"use client";

import { useState, useEffect } from "react";
import {
  Smartphone,
  Download,
  X,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface AppLaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: "login" | "download" | "general";
}

export function AppLaunchModal({ isOpen, onClose, reason = "general" }: AppLaunchModalProps) {
  const [downloadUrl, setDownloadUrl] = useState("/downloads/san-enrique-rotc.apk");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDownloadUrl(process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL || "/downloads/san-enrique-rotc.apk");
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 p-4 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-gold/30 bg-white p-6 md:p-8 shadow-2xl transition-all"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate hover:bg-mist hover:text-charcoal transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-field text-gold shadow-md">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xs font-black uppercase tracking-widest text-gold flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Official Mobile Cadet App
            </span>
            <h3 className="text-xl font-black text-charcoal">
              {reason === "login" ? "Open in ROTC App" : "Install San Enrique ROTC"}
            </h3>
          </div>
        </div>

        {/* Explanation */}
        <p className="mt-4 text-xs md:text-sm leading-relaxed text-slate">
          {reason === "login"
            ? "For the fastest attendance scanning and instant military alerts, use the official Android application on your smartphone."
            : "Install the official San Enrique ROTC application to access your personal dynamic QR code, attendance logs, and formation notices."}
        </p>

        {/* Highlight Perks */}
        <div className="mt-4 rounded-xl border border-field/10 bg-mist/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-2xs font-bold text-field">
            <CheckCircle2 className="h-4 w-4 text-field shrink-0" />
            <span>High-Speed Gate QR Attendance Pass</span>
          </div>
          <div className="flex items-center gap-2 text-2xs font-bold text-field">
            <CheckCircle2 className="h-4 w-4 text-field shrink-0" />
            <span>Offline Digital Military ID Access</span>
          </div>
          <div className="flex items-center gap-2 text-2xs font-bold text-field">
            <CheckCircle2 className="h-4 w-4 text-field shrink-0" />
            <span>Instant Drill & Weather Broadcasts</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
          <a
            href={downloadUrl}
            className="btn-press flex items-center justify-center gap-2.5 rounded-xl bg-field px-5 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-forest transition-all"
          >
            <Download className="h-4 w-4 text-gold" />
            Download Official Android APK
          </a>

          <div className="flex items-center justify-between gap-3 pt-2">
            <Link
              href="/download"
              onClick={onClose}
              className="text-2xs font-bold text-field hover:underline"
            >
              View Installation Guide
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="text-2xs font-bold text-slate hover:text-charcoal"
            >
              Continue on Web Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper utility to attempt opening the native app via deep link or prompt install modal.
 */
export function useAppLauncher() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalReason, setModalReason] = useState<"login" | "download" | "general">("general");

  function openAppOrInstall(reason: "login" | "download" | "general" = "login") {
    setModalReason(reason);


    const isAndroid =
      typeof window !== "undefined" && /Android/i.test(navigator.userAgent || "");

    if (isAndroid) {
      // Try launching custom scheme / intent
      const appSchemeUrl = "sanenriquerotc://login";
      const start = Date.now();
      window.location.href = appSchemeUrl;

      // Fallback if app not installed: show modal after 1.2s if page remains active
      setTimeout(() => {
        if (Date.now() - start < 2000) {
          setModalOpen(true);
        }
      }, 1200);
    } else {
      // On desktop or iOS, open install modal
      setModalOpen(true);
    }
  }

  return {
    modalOpen,
    modalReason,
    openAppOrInstall,
    closeModal: () => setModalOpen(false),
  };
}

