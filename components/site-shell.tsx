"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookOpenCheck,
  CalendarDays,
  GalleryHorizontal,
  Home,
  Info,
  LogIn,
  Mail,
  Menu,
  Smartphone,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const navItems = [
  ["Home", "/", Home],
  ["About", "/about", Info],
  ["Benefits", "/benefits", Sparkles],
  ["Requirements", "/requirements", BookOpenCheck],
  ["Announcements", "/announcements", Bell],
  ["Events", "/events", CalendarDays],
  ["Gallery", "/gallery", GalleryHorizontal],
  ["Contact", "/contact", Mail],
] as const;

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* Track scroll for header shadow */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  /* Close menu on route change */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /* Prevent body scroll when menu open */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="min-h-screen bg-cream">
      {/* ── Header ── */}
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-200 ${
          scrolled
            ? "border-field/15 bg-cream/95 shadow-sm backdrop-blur-md"
            : "border-transparent bg-cream/90 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 font-bold text-charcoal focus-visible:rounded-md group py-1"
          >
            <span className="relative flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center transition-transform group-hover:scale-105">
              <img
                src="/logo.png"
                alt="San Enrique ROTC Logo"
                className="h-full w-full object-contain drop-shadow-sm"
              />
            </span>
            <span className="shrink-0 leading-tight">
              <span className="block whitespace-nowrap text-sm font-black uppercase tracking-wider text-charcoal group-hover:text-field transition-colors sm:text-base">
                SAN ENRIQUE ROTC
              </span>
              <span className="hidden whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-field sm:block">
                Cadet Services Portal
              </span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-0.5 xl:flex 2xl:gap-1"
          >
            {navItems.map(([label, href]) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative inline-flex items-center rounded-md px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors duration-150 2xl:px-2.5 2xl:text-xs ${
                    active
                      ? "bg-field/10 text-field font-black"
                      : "text-charcoal/70 hover:bg-field/5 hover:text-charcoal"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {label}
                  {active && (
                    <span
                      className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-brass"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <Link
              href="/download"
              className="inline-flex items-center gap-1 rounded-md border border-gold/40 bg-gold/10 px-2.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-gold hover:bg-gold/20 transition-all"
            >
              <Smartphone className="h-3 w-3" />
              App
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-md border border-field/25 px-3 py-1.5 text-xs font-bold text-charcoal transition-colors hover:border-field/50 hover:bg-field/5"
            >
              <LogIn className="h-3.5 w-3.5" />
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex min-h-8 items-center gap-1.5 rounded-md bg-field px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-forest hover:shadow-md active:scale-[0.98]"
            >
              <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
              Register
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-md border border-field/20 text-charcoal transition-colors hover:bg-field/5 xl:hidden"
          >
            {open ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Nav Drawer */}
        <div
          id="mobile-nav"
          aria-hidden={!open}
          className={`overflow-hidden border-t border-field/10 transition-all duration-300 ease-in-out xl:hidden ${
            open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <nav
            aria-label="Mobile navigation"
            className="mx-auto grid max-w-7xl gap-0.5 px-4 py-3"
          >
            {navItems.map(([label, href, Icon]) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2.5 rounded-md px-3 py-3 text-sm font-semibold uppercase tracking-wide transition-colors ${
                    active
                      ? "bg-field text-white"
                      : "text-charcoal/75 hover:bg-field/8 hover:text-charcoal"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </Link>
              );
            })}
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-field/10 pt-3">
              <Link
                href="/download"
                className="inline-flex items-center justify-center gap-1 rounded-md border border-gold/40 bg-gold/10 px-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-charcoal hover:bg-gold/20"
              >
                <Smartphone className="h-3.5 w-3.5 text-gold" />
                App
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-1 rounded-md border border-field/25 px-3 py-3 text-center text-sm font-semibold text-charcoal hover:bg-field/5"
              >
                <LogIn className="h-3.5 w-3.5" />
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-field px-3 py-3 text-center text-sm font-semibold text-white hover:bg-forest"
              >
                Register
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {children}

      {/* ── Footer ── */}
      <footer className="border-t border-field/15 bg-charcoal text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3.5">
              <span className="relative flex h-20 w-20 md:h-24 md:w-24 shrink-0 items-center justify-center">
                <img src="/logo.png" alt="San Enrique ROTC" className="h-full w-full object-contain" />
              </span>
              <span className="font-black text-white text-lg md:text-xl tracking-wider">SAN ENRIQUE ROTC</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/55">
              Official information, cadet registration, training updates, and digital cadet
              services — connected through one platform.
            </p>
          </div>

          <FooterColumn
            title="Quick Links"
            links={[
              ["About", "/about"],
              ["Benefits", "/benefits"],
              ["Requirements", "/requirements"],
              ["Contact", "/contact"],
            ]}
          />
          <FooterColumn
            title="Cadet Services"
            links={[
              ["Register", "/register"],
              ["Application Status", "/status"],
              ["Cadet Portal", "/cadet"],
              ["Download App", "/download"],
            ]}
          />
          <FooterColumn
            title="Legal"
            links={[
              ["Privacy Policy", "/privacy"],
              ["Terms of Use", "/terms"],
            ]}
          />
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
            <p className="text-xs text-white/40">
              &copy; 2026 San Enrique ROTC. All rights reserved.
            </p>
            <p className="text-xs text-white/30">
              Powered by Supabase
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: [string, string][];
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">{title}</p>
      <ul className="mt-4 grid gap-2.5">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link
              href={href}
              className="text-sm text-white/55 transition-colors hover:text-white"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
