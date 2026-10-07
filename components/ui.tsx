import type { ReactNode } from "react";
import Link from "next/link";
import { HeroSlider } from "@/components/hero-slider";

/* ─── Button Link ─────────────────────────────────────────────── */
type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "light" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: ButtonLinkProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-md transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 select-none";

  const sizes = {
    sm: "min-h-8 px-3 py-1.5 text-xs",
    md: "min-h-10 px-4 py-2.5 text-sm",
    lg: "min-h-12 px-6 py-3 text-base",
  };

  const variants = {
    primary:
      "bg-field text-white hover:bg-forest focus-visible:ring-field shadow-sm hover:shadow-md active:scale-[0.98]",
    secondary:
      "border border-field/25 bg-white text-field hover:bg-mist hover:border-field/40 focus-visible:ring-field shadow-card",
    light:
      "border border-white/30 bg-white/12 text-white hover:bg-white/20 focus-visible:ring-white backdrop-blur-sm",
    ghost:
      "text-field hover:bg-field/8 focus-visible:ring-field",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm",
  };

  return (
    <Link
      href={href}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

/* ─── Section Heading ─────────────────────────────────────────── */
export function SectionHeading({
  eyebrow,
  title,
  body,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold leading-snug text-charcoal md:text-4xl">
        {title}
      </h2>
      {body ? (
        <p className="mt-3 text-base leading-7 text-slate">{body}</p>
      ) : null}
    </div>
  );
}

/* ─── Status Badge ────────────────────────────────────────────── */
const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; dot: string; label?: string }
> = {
  approved:     { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  pending:      { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500" },
  under_review: { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500",  label: "Under Review" },
  rejected:     { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500" },
  active:       { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  inactive:     { bg: "bg-slate-100",  text: "text-slate-600",   dot: "bg-slate-400" },
  normal:       { bg: "bg-slate-100",  text: "text-slate-600",   dot: "bg-slate-400" },
  important:    { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500" },
  urgent:       { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500" },
  PRESENT:      { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  LATE:         { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500" },
  ABSENT:       { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500" },
  EXCUSED:      { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500" },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? {
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
  };
  const display = cfg.label ?? status.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${cfg.bg} ${cfg.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} aria-hidden="true" />
      {display}
    </span>
  );
}

/* ─── Page Hero ───────────────────────────────────────────────── */
export function PageHero({
  eyebrow,
  title,
  body,
  image,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  image?: string; // kept for backward compat, slider overrides
  children?: ReactNode;
}) {
  return (
    <section className="relative text-white overflow-hidden min-h-[320px] md:min-h-[380px]">
      {/* Looping background slideshow */}
      <HeroSlider initialImage={image} />
      {/* Content */}
      <div className="relative z-10 mx-auto grid max-w-7xl gap-6 px-4 py-16 md:py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold drop-shadow">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl drop-shadow-lg">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/85 md:text-lg drop-shadow">{body}</p>
        </div>
        {children}
      </div>
    </section>
  );
}


/* ─── Empty State ─────────────────────────────────────────────── */
export function EmptyState({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-field/20 bg-white px-6 py-16 text-center">
      {icon ? (
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-mist text-slate">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-charcoal">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate">{body}</p>
    </div>
  );
}

/* ─── Info Card ───────────────────────────────────────────────── */
export function InfoCard({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <article className="h-full rounded-lg border border-field/10 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      {children ? (
        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-md bg-mist text-field">
          {children}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-charcoal">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate">{body}</p>
    </article>
  );
}

/* ─── Portal Stat Card ────────────────────────────────────────── */
export function PortalStatCard({
  label,
  value,
  icon,
  accent = "default",
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  accent?: "default" | "gold" | "green" | "red" | "blue";
}) {
  const accents = {
    default: "border-field/10",
    gold:    "border-brass/30 bg-brass/5",
    green:   "border-emerald-200 bg-emerald-50",
    red:     "border-red-200 bg-red-50",
    blue:    "border-blue-200 bg-blue-50",
  };

  return (
    <article
      className={`rounded-lg border bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover ${accents[accent]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate">{label}</p>
        {icon ? (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-mist text-field">
            {icon}
          </span>
        ) : null}
      </div>
      <strong className="mt-3 block text-3xl font-bold tracking-tight text-charcoal">
        {value}
      </strong>
    </article>
  );
}

/* ─── Alert ───────────────────────────────────────────────────── */
export function Alert({
  variant = "info",
  children,
}: {
  variant?: "info" | "success" | "warning" | "error";
  children: ReactNode;
}) {
  const styles = {
    info:    "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    error:   "bg-red-50 border-red-200 text-red-800",
  };

  return (
    <div
      role="alert"
      className={`rounded-md border px-4 py-3 text-sm font-medium leading-6 ${styles[variant]}`}
    >
      {children}
    </div>
  );
}

/* ─── Section Container ───────────────────────────────────────── */
export function Section({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`mx-auto max-w-7xl px-4 py-14 md:py-16 ${className}`}>
      {children}
    </section>
  );
}
