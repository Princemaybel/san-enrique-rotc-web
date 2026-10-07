"use client";

import { useState, useEffect, useMemo } from "react";
import { PortalShell } from "@/components/portal-shell";
import { StatusBadge, EmptyState } from "@/components/ui";
import { Megaphone, Search, X, ChevronDown } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";

/* ─── Types ────────────────────────────────────────────────────── */
type Priority = "normal" | "important" | "urgent";

interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: Priority;
  published: boolean;
  created_at: string;
}

/* ─── Helpers ──────────────────────────────────────────────────── */
function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0,
  important: 1,
  normal: 2,
};

/* ─── Loading Skeleton ─────────────────────────────────────────── */
function AnnouncementSkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-field/10 bg-white p-5 shadow-card"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="h-5 w-48 rounded bg-slate/10" />
            <div className="h-5 w-16 rounded-full bg-slate/10" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-3.5 w-full rounded bg-slate/10" />
            <div className="h-3.5 w-4/5 rounded bg-slate/10" />
          </div>
          <div className="mt-3 h-3 w-28 rounded bg-slate/10" />
        </div>
      ))}
    </div>
  );
}

/* ─── Detail Modal ─────────────────────────────────────────────── */
function AnnouncementModal({
  item,
  onClose,
}: {
  item: Announcement;
  onClose: () => void;
}) {
  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl rounded-xl border border-field/15 bg-white shadow-2xl">
        {/* Modal header */}
        <div className="flex items-start justify-between border-b border-field/10 px-6 py-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <StatusBadge status={item.priority} />
            <span className="text-2xs text-slate">
              {formatLongDate(item.created_at)}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 shrink-0 rounded-md p-1 text-slate hover:bg-mist hover:text-charcoal"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal body */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
          <h2 className="text-xl font-bold leading-snug text-charcoal">
            {item.title}
          </h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate">
            {item.body}
          </p>
        </div>

        {/* Modal footer */}
        <div className="flex justify-end border-t border-field/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-field/20 px-5 py-2 text-xs font-semibold text-charcoal hover:bg-mist"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Announcement Card ────────────────────────────────────────── */
function AnnouncementCard({
  item,
  index,
  onClick,
}: {
  item: Announcement;
  index: number;
  onClick: () => void;
}) {
  const urgentBorder =
    item.priority === "urgent"
      ? "border-l-4 border-l-red-400"
      : item.priority === "important"
      ? "border-l-4 border-l-amber-400"
      : "border-l-4 border-l-slate-200";

  /* Staggered fade-in via inline style delay — no custom CSS needed */
  const delay = `${index * 60}ms`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full rounded-xl border border-field/10 bg-white p-5 shadow-card text-left
        transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover
        animate-[fadeInUp_0.35s_ease_both]
        ${urgentBorder}
      `}
      style={{ animationDelay: delay }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-sm font-bold text-charcoal">{item.title}</h3>
        <StatusBadge status={item.priority} />
      </div>
      <p className="mt-2.5 line-clamp-2 text-xs leading-5 text-slate">
        {item.body}
      </p>
      <div className="mt-3 flex items-center justify-between">
        <time
          dateTime={item.created_at}
          className="text-2xs font-medium text-slate/70"
        >
          {formatLongDate(item.created_at)}
        </time>
        <span className="text-2xs font-semibold text-field">
          Read more →
        </span>
      </div>
    </button>
  );
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function CadetAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Announcement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");

  /* ── Fetch ─────────────────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;

    async function fetchAnnouncements() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createBrowserClient();

        const { data, error: fetchError } = await supabase
          .from("announcements")
          .select("id, title, content, priority, is_published, created_at")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (fetchError) throw new Error(fetchError.message);

        if (!cancelled) {
          const mapped: Announcement[] = (data ?? []).map((row: any) => ({
            id: row.id,
            title: row.title,
            body: row.content || "",
            priority: (row.priority || "normal") as Priority,
            published: Boolean(row.is_published),
            created_at: row.created_at,
          }));
          setAnnouncements(mapped);
        }
      } catch (err: unknown) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load announcements."
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchAnnouncements();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Filtered & sorted ─────────────────────────────────────────── */
  const filtered = useMemo(() => {
    return announcements
      .filter((a) => {
        const matchesPriority =
          priorityFilter === "all" || a.priority === priorityFilter;
        const matchesSearch =
          searchQuery.trim() === "" ||
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.body.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesPriority && matchesSearch;
      })
      .sort(
        (a, b) =>
          PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [announcements, priorityFilter, searchQuery]);

  return (
    <PortalShell
      type="cadet"
      title="Announcements"
      subtitle="Official ROTC notices, directives, and updates posted by administration."
      currentPath="/cadet/announcements"
    >
      <div className="grid gap-6">
        {/* ── Error banner ── */}
        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
          >
            {error}
          </div>
        )}

        {/* ── Filter / search bar ── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0 sm:max-w-sm">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate/50" />
            <input
              type="search"
              placeholder="Search announcements…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-field/20 bg-white py-2 pl-8 pr-3 text-xs text-charcoal placeholder-slate/50 shadow-card focus:border-field focus:outline-none"
            />
          </div>

          {/* Priority dropdown */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value as Priority | "all")
              }
              className="appearance-none rounded-md border border-field/20 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-charcoal shadow-card focus:border-field focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="important">Important</option>
              <option value="normal">Normal</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate/60" />
          </div>

          {/* Count pill */}
          {!loading && (
            <span className="ml-auto rounded-full bg-mist px-3 py-1 text-2xs font-semibold text-slate">
              {filtered.length}{" "}
              {filtered.length === 1 ? "announcement" : "announcements"}
            </span>
          )}
        </div>

        {/* ── Feed ── */}
        {loading ? (
          <AnnouncementSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Megaphone className="h-7 w-7" />}
            title={
              announcements.length === 0
                ? "No Announcements Posted"
                : "No Matching Announcements"
            }
            body={
              announcements.length === 0
                ? "Check back later for official ROTC notices."
                : "Try adjusting your search or filter."
            }
          />
        ) : (
          <div className="grid gap-4">
            {filtered.map((item, i) => (
              <AnnouncementCard
                key={item.id}
                item={item}
                index={i}
                onClick={() => setSelected(item)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <AnnouncementModal item={selected} onClose={() => setSelected(null)} />
      )}
    </PortalShell>
  );
}
