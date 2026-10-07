import Link from "next/link";
import { ShieldAlert, Home, UserCheck, Phone, ArrowLeft, BookOpen } from "lucide-react";
import { SiteShell } from "@/components/site-shell";

export default function NotFound() {
  return (
    <SiteShell>
      <main className="min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="mx-auto max-w-2xl w-full text-center space-y-8">
          {/* Tactical Badge & 404 Visual */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-gold shadow-sm">
              <ShieldAlert className="h-4 w-4 text-gold" />
              Tactical Out-of-Bounds Error
            </div>

            <div className="relative">
              <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-field/20 select-none">
                404
              </h1>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl md:text-3xl font-black text-charcoal">
                  Coordinates Not Found
                </p>
                <p className="text-xs font-bold uppercase tracking-widest text-gold mt-1">
                  Sector or Resource Unreachable
                </p>
              </div>
            </div>

            <p className="max-w-md mx-auto text-xs md:text-sm text-slate leading-relaxed">
              The command route or tactical sector you are attempting to reach does not exist, has been repositioned, or requires higher security clearance.
            </p>
          </div>

          {/* Quick Nav Suggestions */}
          <div className="card-lift rounded-2xl border border-field/15 bg-white p-6 shadow-card space-y-4 text-left">
            <span className="text-2xs font-black uppercase tracking-widest text-field block">
              Suggested Waypoints
            </span>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/"
                className="flex items-center gap-3 rounded-xl border border-field/10 bg-mist/50 p-3 hover:border-gold/40 hover:bg-mist transition-all group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-field text-gold group-hover:scale-105 transition-transform">
                  <Home className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-charcoal">Main Headquarters</h4>
                  <span className="text-2xs text-slate">Return to Home Command</span>
                </div>
              </Link>

              <Link
                href="/cadet"
                className="flex items-center gap-3 rounded-xl border border-field/10 bg-mist/50 p-3 hover:border-gold/40 hover:bg-mist transition-all group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-field text-gold group-hover:scale-105 transition-transform">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-charcoal">Cadet Portal</h4>
                  <span className="text-2xs text-slate">Access Your Military ID</span>
                </div>
              </Link>

              <Link
                href="/requirements"
                className="flex items-center gap-3 rounded-xl border border-field/10 bg-mist/50 p-3 hover:border-gold/40 hover:bg-mist transition-all group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-field text-gold group-hover:scale-105 transition-transform">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-charcoal">Enlistment Checklist</h4>
                  <span className="text-2xs text-slate">Qualifications & Documents</span>
                </div>
              </Link>

              <Link
                href="/contact"
                className="flex items-center gap-3 rounded-xl border border-field/10 bg-mist/50 p-3 hover:border-gold/40 hover:bg-mist transition-all group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-field text-gold group-hover:scale-105 transition-transform">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-charcoal">Duty Officer Support</h4>
                  <span className="text-2xs text-slate">Inquire with DMST</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="btn-press inline-flex items-center gap-2 rounded-xl bg-field px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-forest transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Base
            </Link>
            <Link
              href="/register"
              className="btn-press inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-xs font-black uppercase tracking-wider text-charcoal shadow-md hover:bg-gold/90 transition-all"
            >
              Enlist as Cadet
            </Link>
          </div>
        </div>
      </main>
    </SiteShell>
  );
}

