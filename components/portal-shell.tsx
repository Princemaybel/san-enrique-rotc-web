"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  ClipboardList,
  FileText,
  GalleryHorizontal,
  Gauge,
  IdCard,
  Megaphone,
  Settings,
  Shield,
  UsersRound,
  QrCode,
  ScanLine,
  Menu,
  X,
} from "lucide-react";

/* ─── Navigation config ───────────────────────────────────────── */
const adminGroups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard",  href: "/admin",            Icon: Gauge },
    ],
  },
  {
    label: "Drill & Attendance",
    items: [
      { label: "QR Scanner (Admin)", href: "/admin/qr-scanner",          Icon: ScanLine },
      { label: "Attendance & Drills", href: "/admin/attendance",          Icon: ClipboardList },
      { label: "Attendance Sessions", href: "/admin/attendance-sessions", Icon: ClipboardList },
    ],
  },
  {
    label: "Cadets",
    items: [
      { label: "Cadet Directory",   href: "/admin/cadets",        Icon: UsersRound },
      { label: "Print QR Badges",   href: "/admin/cadets/print",  Icon: QrCode },
      { label: "Applications",      href: "/admin/applications",  Icon: ClipboardList },
      { label: "ID Cards & Passes", href: "/admin/id-cards",      Icon: IdCard },
      { label: "Grades & Performance", href: "/admin/grades",    Icon: FileText },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Announcements",    href: "/admin/announcements", Icon: Megaphone },
      { label: "Events & Trainings", href: "/admin/events",      Icon: ClipboardList },
      { label: "Gallery",          href: "/admin/gallery",       Icon: GalleryHorizontal },
      { label: "PDF Modules",      href: "/admin/modules",       Icon: FileText },
      { label: "Inquiries",        href: "/admin/messages",      Icon: Bell },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Attendance Reports", href: "/admin/reports",    Icon: FileText },
      { label: "Settings",           href: "/admin/settings",   Icon: Settings },
      { label: "Audit Logs",         href: "/admin/audit-logs", Icon: Shield },
    ],
  },
];

const cadetGroups = [
  {
    label: "My Portal",
    items: [
      { label: "Dashboard",        href: "/cadet",            Icon: Gauge },
      { label: "My Digital ID",    href: "/cadet/digital-id", Icon: IdCard },
      { label: "My Attendance QR", href: "/cadet/my-qr",      Icon: QrCode },
      { label: "My Profile",       href: "/cadet/profile",    Icon: UsersRound },
    ],
  },
  {
    label: "Activity",
    items: [
      { label: "Attendance History", href: "/cadet/attendance",    Icon: ClipboardList },
      { label: "Events & Assembly",  href: "/cadet/events",        Icon: ClipboardList },
      { label: "Announcements",      href: "/cadet/announcements", Icon: Megaphone },
      { label: "Notifications",      href: "/cadet/notifications", Icon: Bell },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Training Manuals", href: "/cadet/documents", Icon: FileText },
      { label: "Account Settings", href: "/cadet/settings",  Icon: Settings },
    ],
  },
];

/* ─── Sidebar Nav Content (reused for both desktop + mobile) ─── */
function SidebarContent({
  groups,
  currentPath,
  portalLabel,
  onLinkClick,
}: {
  groups: typeof adminGroups;
  currentPath?: string;
  portalLabel: string;
  onLinkClick?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="border-b border-white/8 px-4 py-4">
        <Link
          href="/"
          onClick={onLinkClick}
          className="flex items-center gap-3 rounded-md p-1.5 transition-colors hover:bg-white/8"
        >
          <span className="grid h-9 w-9 place-items-center rounded-md bg-field text-brass">
            <Shield className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white/90">SAN ENRIQUE ROTC</p>
            <p className="text-2xs font-medium capitalize text-white/45">{portalLabel}</p>
          </div>
        </Link>
      </div>

      {/* Nav groups */}
      <nav aria-label={`${portalLabel} navigation`} className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-1.5 px-2 text-2xs font-semibold uppercase tracking-[0.14em] text-white/35">
              {group.label}
            </p>
            <ul className="grid gap-0.5">
              {group.items.map(({ label, href, Icon }) => {
                const active =
                  currentPath === href ||
                  (href !== "/admin" &&
                    href !== "/cadet" &&
                    currentPath?.startsWith(href));
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onLinkClick}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
                        active
                          ? "border-l-2 border-brass bg-field/60 pl-2.5 text-white"
                          : "text-white/60 hover:bg-white/8 hover:text-white/90"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${active ? "text-brass" : "text-white/40"}`}
                        aria-hidden="true"
                      />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/8 px-4 py-3">
        <Link
          href="/"
          onClick={onLinkClick}
          className="block text-center text-xs text-white/35 transition-colors hover:text-white/60"
        >
          ← Back to public website
        </Link>
      </div>
    </>
  );
}

/* ─── Portal Shell ────────────────────────────────────────────── */
export function PortalShell({
  title,
  subtitle,
  type,
  children,
  currentPath,
}: {
  title: string;
  subtitle: string;
  type: "admin" | "cadet";
  children: React.ReactNode;
  currentPath?: string;
}) {
  const groups = type === "admin" ? adminGroups : cadetGroups;
  const portalLabel = type === "admin" ? "Admin Portal" : "Cadet Portal";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-mist">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">

        {/* ── Desktop Sidebar ── */}
        <aside className="hidden flex-col justify-between border-r border-field/10 bg-charcoal text-white lg:flex">
          <SidebarContent
            groups={groups}
            currentPath={currentPath}
            portalLabel={portalLabel}
          />
        </aside>

        {/* ── Mobile Sidebar Drawer ── */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-dark/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-charcoal text-white shadow-2xl transition-transform duration-300 lg:hidden ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          aria-label={`${portalLabel} navigation`}
        >
          {/* Close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-md text-white/50 hover:bg-white/10 hover:text-white"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarContent
            groups={groups}
            currentPath={currentPath}
            portalLabel={portalLabel}
            onLinkClick={() => setMobileOpen(false)}
          />
        </aside>

        {/* ── Main content ── */}
        <main className="min-w-0 overflow-hidden">
          <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-field/15 bg-white/95 px-5 py-4 backdrop-blur-md md:px-8 shadow-xs">
            <div className="flex items-center gap-3.5">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-field/20 text-charcoal transition-colors hover:bg-mist lg:hidden"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-2xs font-extrabold uppercase tracking-[0.2em] text-field">
                    {portalLabel} • SECURE TERMINAL
                  </p>
                </div>
                <h1 className="mt-0.5 text-xl font-black text-charcoal md:text-2xl tracking-tight">{title}</h1>
                {subtitle && (
                  <p className="text-xs text-slate line-clamp-1">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2.5">
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-3xs font-mono font-bold text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                SYSTEM ONLINE
              </span>

              {type === "admin" && currentPath !== "/admin/qr-scanner" && (
                <Link
                  href="/admin/qr-scanner"
                  className="inline-flex items-center gap-2 rounded-lg bg-field px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-forest hover:shadow active:scale-[0.98]"
                >
                  <ScanLine className="h-4 w-4 text-brass" />
                  <span className="hidden sm:inline">Admin</span> QR Scanner
                </Link>
              )}
            </div>
          </header>
          <div className="px-5 py-6 md:px-8 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

/* ─── Portal Card ─────────────────────────────────────────────── */
export function PortalCard({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-field/10 bg-white p-5 shadow-card">
      <h2 className="text-base font-semibold text-charcoal">{title}</h2>
      <p className="mt-1.5 text-sm leading-6 text-slate">{body}</p>
      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
