"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal-shell";
import { BookOpen, Download, FileText, Search, X } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";

type Module = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_url: string;
  file_name: string | null;
  created_at: string;
};

function ModuleSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-field/10 bg-white p-5">
          <div className="h-3 w-20 rounded bg-mist" />
          <div className="mt-3 h-5 w-3/4 rounded bg-mist" />
          <div className="mt-2 h-4 w-full rounded bg-mist" />
          <div className="mt-4 h-9 w-full rounded bg-mist" />
        </div>
      ))}
    </div>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  Doctrine:       "bg-blue-100 text-blue-800",
  Conduct:        "bg-purple-100 text-purple-800",
  Syllabus:       "bg-emerald-100 text-emerald-800",
  "Mobile App":   "bg-cyan-100 text-cyan-800",
  Safety:         "bg-red-100 text-red-800",
  Leadership:     "bg-amber-100 text-amber-800",
  "Field Training": "bg-orange-100 text-orange-800",
  General:        "bg-slate/10 text-slate",
};

export default function CadetDocumentsPage() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("modules")
        .select("id,title,description,category,file_url,file_name,created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      setModules((data ?? []) as Module[]);
      setLoading(false);
    }
    load();
  }, []);

  const usedCategories = ["All", ...Array.from(new Set(modules.map((m) => m.category)))];

  const filtered = modules.filter((m) => {
    const matchCat = activeCategory === "All" || m.category === activeCategory;
    const matchSearch =
      !search.trim() ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      (m.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
      m.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <PortalShell type="cadet" title="PDF Modules" subtitle="Download and study training manuals published by your unit admin." currentPath="/cadet/documents">

      {/* ── Search & Category Filter ── */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules…"
            className="w-full rounded-lg border border-field/20 bg-white py-2 pl-9 pr-9 text-sm outline-none focus:border-field focus:ring-2 focus:ring-field/15"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-charcoal">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {usedCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                activeCategory === cat
                  ? "bg-field text-white"
                  : "border border-field/20 bg-white text-charcoal hover:bg-mist"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Result count ── */}
      {!loading && (
        <div className="mb-5 flex items-center gap-2 text-sm text-slate">
          <BookOpen className="h-4 w-4 text-brass" />
          <span>
            {filtered.length} module{filtered.length !== 1 ? "s" : ""}
            {search || activeCategory !== "All" ? " found" : " available"}
          </span>
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <ModuleSkeleton />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-field/20 bg-white py-16">
          <FileText className="mb-3 h-12 w-12 text-field/30" />
          <p className="text-base font-bold text-charcoal">
            {search || activeCategory !== "All" ? "No modules match your search." : "No PDF modules yet."}
          </p>
          <p className="mt-1 text-sm text-slate">
            {search || activeCategory !== "All"
              ? "Try a different keyword or category."
              : "Check back later — your admin will publish training materials soon."}
          </p>
          {(search || activeCategory !== "All") && (
            <button
              onClick={() => { setSearch(""); setActiveCategory("All"); }}
              className="mt-4 rounded-md border border-field/20 px-4 py-2 text-sm font-bold text-charcoal hover:bg-mist"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((mod) => (
            <article
              key={mod.id}
              className="flex flex-col rounded-xl border border-field/10 bg-white p-5 shadow-card transition-shadow hover:shadow-md"
            >
              <span className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-xs font-bold ${CATEGORY_COLORS[mod.category] ?? "bg-slate/10 text-slate"}`}>
                {mod.category}
              </span>

              <div className="mt-3 flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/15">
                  <FileText className="h-5 w-5 text-brass" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-black text-charcoal leading-snug">{mod.title}</h3>
                  {mod.file_name && (
                    <p className="mt-0.5 truncate text-xs text-slate/60">{mod.file_name}</p>
                  )}
                </div>
              </div>

              {mod.description && (
                <p className="mt-3 flex-1 text-sm text-slate line-clamp-3">{mod.description}</p>
              )}

              <p className="mt-3 text-xs text-slate/50">
                {new Date(mod.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
              </p>

              <a
                href={mod.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-field px-4 py-2.5 text-sm font-bold text-white hover:bg-forest transition-colors"
              >
                <Download className="h-4 w-4" /> Open / Download PDF
              </a>
            </article>
          ))}
        </div>
      )}
    </PortalShell>
  );
}
