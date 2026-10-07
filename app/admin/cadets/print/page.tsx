"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import {
  ArrowLeft,
  CheckSquare,
  Filter,
  Layers,
  Printer,
  RefreshCw,
  Scissors,
  Search,
  Square,
  UsersRound,
} from "lucide-react";
import { PortalShell } from "@/components/portal-shell";
import { createBrowserClient } from "@/lib/supabase/client";

type CadetProfile = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  student_id: string;
  course: string;
  year_level: string;
  section: string | null;
  company?: string | null;
  platoon?: string | null;
  status: string;
};

type CadetWithQr = CadetProfile & {
  publicQrId: string;
  qrPayload: string;
  qrSvg: string;
};

type PaperSize = "letter" | "a4" | "folio" | "legal";
type GridDensity = "12" | "20" | "6";

const PAPER_CONFIGS: Record<
  PaperSize,
  { name: string; subtitle: string; pageCss: string; badge: string }
> = {
  letter: {
    name: "Short Bond Paper (Letter)",
    subtitle: "8.5\" × 11\" (215.9 × 279.4 mm) - Philippine Standard",
    pageCss: "@page { size: letter portrait; margin: 8mm 6mm; }",
    badge: "Recommended",
  },
  a4: {
    name: "A4 Paper",
    subtitle: "8.27\" × 11.69\" (210 × 297 mm) - International Standard",
    pageCss: "@page { size: A4 portrait; margin: 8mm 6mm; }",
    badge: "Recommended",
  },
  folio: {
    name: "Long Bond Paper (Folio)",
    subtitle: "8.5\" × 13\" (215.9 × 330.2 mm) - Philippine Long Standard",
    pageCss: "@page { size: 8.5in 13in portrait; margin: 8mm 6mm; }",
    badge: "PH Long",
  },
  legal: {
    name: "US Legal",
    subtitle: "8.5\" × 14\" (215.9 × 355.6 mm)",
    pageCss: "@page { size: legal portrait; margin: 8mm 6mm; }",
    badge: "Legal",
  },
};

export default function PrintCadetBadgesPage() {
  const supabase = useMemo(() => createBrowserClient(), []);

  const [cadets, setCadets] = useState<CadetWithQr[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Filter & configuration state
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("approved");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [paperSize, setPaperSize] = useState<PaperSize>("letter");
  const [gridDensity, setGridDensity] = useState<GridDensity>("12");
  const [showCutGuides, setShowCutGuides] = useState(true);
  const [includePlatoon, setIncludePlatoon] = useState(true);

  // Load cadets and their QR codes
  async function loadCadetData() {
    setLoading(true);
    setErrorMsg("");

    try {
      const [{ data: profilesData, error: profError }, { data: qrData, error: qrError }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select(
              "id,user_id,first_name,last_name,middle_name,student_id,course,year_level,section,company,platoon,status"
            )
            .eq("role", "cadet")
            .order("last_name", { ascending: true }),
          supabase
            .from("qr_codes")
            .select("cadet_id,user_id,public_qr_id,status")
            .eq("status", "active"),
        ]);

      if (profError) throw profError;
      if (qrError) console.warn("Notice: QR codes query:", qrError.message);

      const qrByCadetId = new Map<string, string>();
      const qrByUserId = new Map<string, string>();
      for (const qr of qrData ?? []) {
        if (qr.cadet_id && qr.public_qr_id) qrByCadetId.set(qr.cadet_id, qr.public_qr_id);
        if (qr.user_id && qr.public_qr_id) qrByUserId.set(qr.user_id, qr.public_qr_id);
      }

      setGenerating(true);

      const processed: CadetWithQr[] = await Promise.all(
        (profilesData ?? []).map(async (prof) => {
          // Resolve public QR ID:
          // 1. From active qr_codes table (cadet_id)
          // 2. From active qr_codes table (user_id)
          // 3. Fallback canonical SE-ROTC format recognized by mobile scanner
          const rawId = prof.student_id?.trim().toUpperCase() || "CADET";
          const publicQrId =
            qrByCadetId.get(prof.id) ||
            qrByUserId.get(prof.user_id) ||
            `ROTC-CADET-${rawId}`;

          // Format compatible with scanner JSON validation
          const qrPayload = JSON.stringify({
            org: "SAN_ENRIQUE_ROTC",
            v: 1,
            qid: publicQrId,
          });

          // Generate crystal-clear vector SVG
          let qrSvg = "";
          try {
            qrSvg = await QRCode.toString(qrPayload, {
              type: "svg",
              margin: 1,
              color: {
                dark: "#0B2A1D",
                light: "#FFFFFF",
              },
            });
          } catch (e) {
            console.error("Failed to generate QR SVG for", prof.student_id, e);
          }

          return {
            ...prof,
            publicQrId,
            qrPayload,
            qrSvg,
          };
        })
      );

      setCadets(processed);

      // Default: auto-select all approved cadets
      const approvedIds = new Set(
        processed
          .filter((c) => (statusFilter === "all" ? true : c.status === statusFilter))
          .map((c) => c.id)
      );
      setSelectedIds(approvedIds);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load cadets.");
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  }

  useEffect(() => {
    loadCadetData();
  }, []);

  // Filtered cadets for selection view
  const filteredCadets = useMemo(() => {
    return cadets.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (companyFilter !== "all" && (c.company || "Alpha") !== companyFilter) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const fullName = `${c.first_name} ${c.last_name}`.toLowerCase();
        const studentId = (c.student_id || "").toLowerCase();
        const course = (c.course || "").toLowerCase();
        if (!fullName.includes(q) && !studentId.includes(q) && !course.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [cadets, statusFilter, companyFilter, query]);

  // Selected cadets that will actually print
  const printableCadets = useMemo(() => {
    return cadets.filter((c) => selectedIds.has(c.id));
  }, [cadets, selectedIds]);

  // Distinct companies for filter dropdown
  const companies = useMemo(() => {
    const set = new Set<string>();
    cadets.forEach((c) => {
      if (c.company) set.add(c.company);
    });
    return Array.from(set);
  }, [cadets]);

  // Toggle single cadet selection
  function toggleCadet(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // Select all currently filtered cadets
  function selectAllFiltered() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredCadets.forEach((c) => next.add(c.id));
      return next;
    });
  }

  // Deselect all currently filtered cadets
  function deselectAllFiltered() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      filteredCadets.forEach((c) => next.delete(c.id));
      return next;
    });
  }

  // Trigger system print dialog
  function handlePrint() {
    window.print();
  }

  // Grid styling based on density
  const gridConfig = useMemo(() => {
    switch (gridDensity) {
      case "20": // 4 cols x 5 rows
        return {
          colsClass: "grid-cols-4",
          cardHeight: "h-[50mm]",
          qrSizeClass: "w-[24mm] h-[24mm]",
          nameSizeClass: "text-[9.5pt] leading-tight",
          subSizeClass: "text-[7pt]",
          paddingClass: "p-2",
          perSheet: 20,
        };
      case "6": // 2 cols x 3 rows (Large Lanyard)
        return {
          colsClass: "grid-cols-2",
          cardHeight: "h-[85mm]",
          qrSizeClass: "w-[42mm] h-[42mm]",
          nameSizeClass: "text-[14pt] leading-tight",
          subSizeClass: "text-[9.5pt]",
          paddingClass: "p-4",
          perSheet: 6,
        };
      case "12": // 3 cols x 4 rows (Standard Recommended)
      default:
        return {
          colsClass: "grid-cols-3",
          cardHeight: "h-[62mm]",
          qrSizeClass: "w-[30mm] h-[30mm]",
          nameSizeClass: "text-[11pt] leading-tight",
          subSizeClass: "text-[8pt]",
          paddingClass: "p-2.5",
          perSheet: 12,
        };
    }
  }, [gridDensity]);

  const estimatedSheets = Math.ceil(printableCadets.length / gridConfig.perSheet);

  return (
    <PortalShell
      type="admin"
      title="Print Cadet QR Badges"
      subtitle="Arrange square QR codes with names on the bottom for high-speed scissor cut and distribution."
      currentPath="/admin/cadets/print"
    >
      {/* ─── Injected Dynamic Print Styles ─── */}
      <style jsx global>{`
        @media print {
          /* Force page dimensions based on selected bond paper size */
          ${PAPER_CONFIGS[paperSize].pageCss}

          /* Hide Portal shell, sidebars, navigation, top bar, headers, buttons */
          html,
          body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .no-print,
          nav,
          aside,
          header,
          footer,
          button,
          .portal-sidebar,
          .portal-topbar {
            display: none !important;
          }

          .print-container {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }

          .print-sheet {
            page-break-after: always;
            break-after: page;
            display: grid !important;
            width: 100% !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: none !important;
            background: transparent !important;
          }

          .print-card {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }
        }
      `}</style>

      {/* ─── TOP CONTROL BAR (Screen Only) ─── */}
      <div className="no-print mb-6 space-y-4 rounded-xl border border-field/15 bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-field/10 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/cadets"
              className="inline-flex items-center gap-1.5 rounded-lg border border-field/20 bg-mist/50 px-3 py-1.5 text-xs font-semibold text-charcoal hover:bg-mist"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Cadets
            </Link>
            <div className="h-4 w-px bg-field/20" />
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
              <p className="text-xs font-bold text-charcoal">
                {loading
                  ? "Loading cadets..."
                  : `${printableCadets.length} Cadets Selected for Print`}
              </p>
            </div>
            {printableCadets.length > 0 && (
              <span className="rounded-full bg-brass/15 px-2.5 py-0.5 text-2xs font-black text-field">
                ~{estimatedSheets} sheet{estimatedSheets === 1 ? "" : "s"} of {PAPER_CONFIGS[paperSize].name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadCadetData}
              disabled={loading || generating}
              className="inline-flex items-center gap-1.5 rounded-md border border-field/20 bg-white px-3 py-2 text-xs font-semibold text-charcoal hover:bg-mist disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={printableCadets.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all hover:bg-emerald-800 active:scale-95 disabled:opacity-50"
            >
              <Printer className="h-4 w-4 text-brass" /> Print Now ({printableCadets.length})
            </button>
          </div>
        </div>

        {/* Paper & Grid Format Selectors */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Paper Size Selector */}
          <div>
            <label className="block text-2xs font-black uppercase tracking-wider text-field">
              1. Bond Paper Size (Recommended: Short/A4)
            </label>
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value as PaperSize)}
              className="mt-1 w-full rounded-md border border-field/20 bg-white px-3 py-2 text-xs font-bold text-charcoal shadow-2xs focus:border-field focus:ring-1 focus:ring-field"
            >
              <option value="letter">⭐ Short Bond Paper (Letter: 8.5" × 11")</option>
              <option value="a4">⭐ A4 Paper (8.27" × 11.69" / 210 × 297 mm)</option>
              <option value="folio">Long Bond Paper (Folio: 8.5" × 13")</option>
              <option value="legal">US Legal (8.5" × 14")</option>
            </select>
            <p className="mt-1 text-3xs text-slate">{PAPER_CONFIGS[paperSize].subtitle}</p>
          </div>

          {/* Cards per Sheet Selector */}
          <div>
            <label className="block text-2xs font-black uppercase tracking-wider text-field">
              2. Grid Density (Cards / Sheet)
            </label>
            <select
              value={gridDensity}
              onChange={(e) => setGridDensity(e.target.value as GridDensity)}
              className="mt-1 w-full rounded-md border border-field/20 bg-white px-3 py-2 text-xs font-bold text-charcoal shadow-2xs focus:border-field focus:ring-1 focus:ring-field"
            >
              <option value="12">⭐ 12 Badges / Page (3 × 4 - Recommended)</option>
              <option value="20">20 Badges / Page (4 × 5 - Compact)</option>
              <option value="6">6 Badges / Page (2 × 3 - Large / Lanyard)</option>
            </select>
            <p className="mt-1 text-3xs text-slate">
              {gridDensity === "12" && "Square QR + prominent name, best for regular bond paper."}
              {gridDensity === "20" && "Maximum paper savings, smaller scissors cut boundaries."}
              {gridDensity === "6" && "Larger font and QR code, perfect for plastic ID sleeves."}
            </p>
          </div>

          {/* Platoon Filter */}
          <div>
            <label className="block text-2xs font-black uppercase tracking-wider text-field">
              3. Filter by Company
            </label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="mt-1 w-full rounded-md border border-field/20 bg-white px-3 py-2 text-xs font-semibold text-charcoal shadow-2xs focus:border-field focus:ring-1 focus:ring-field"
            >
              <option value="all">All Companies ({cadets.length})</option>
              <option value="Alpha">Alpha Company</option>
              <option value="Bravo">Bravo Company</option>
              <option value="Charlie">Charlie Company</option>
              <option value="Headquarters">Headquarters</option>
              {companies.map((c) =>
                !["Alpha", "Bravo", "Charlie", "Headquarters"].includes(c) ? (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ) : null
              )}
            </select>
            <p className="mt-1 text-3xs text-slate">Print one company at a time for orderly distribution.</p>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-2xs font-black uppercase tracking-wider text-field">
              4. Registration Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 w-full rounded-md border border-field/20 bg-white px-3 py-2 text-xs font-semibold text-charcoal shadow-2xs focus:border-field focus:ring-1 focus:ring-field"
            >
              <option value="approved">Approved Only (Verified Cadets)</option>
              <option value="all">All Signed-Up Profiles</option>
              <option value="pending">Pending Profiles</option>
            </select>
            <p className="mt-1 text-3xs text-slate">Defaults to verified/approved cadets only.</p>
          </div>
        </div>

        {/* Selection & Options Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-field/10 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={selectAllFiltered}
              className="inline-flex items-center gap-1.5 rounded-md bg-field/10 px-3 py-1.5 text-xs font-bold text-field hover:bg-field/20"
            >
              <CheckSquare className="h-3.5 w-3.5" /> Select All Filtered ({filteredCadets.length})
            </button>
            <button
              type="button"
              onClick={deselectAllFiltered}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate/20 bg-white px-3 py-1.5 text-xs font-semibold text-slate hover:bg-mist"
            >
              <Square className="h-3.5 w-3.5" /> Deselect All
            </button>

            <div className="relative ml-2">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate/50" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or student ID..."
                className="w-48 rounded-md border border-field/20 bg-white py-1.5 pl-8 pr-3 text-xs text-charcoal focus:border-field focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-charcoal">
            <label className="inline-flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                checked={showCutGuides}
                onChange={(e) => setShowCutGuides(e.target.checked)}
                className="h-4 w-4 rounded border-field/30 text-field focus:ring-field"
              />
              <Scissors className="h-3.5 w-3.5 text-field/70" /> Dashed Scissor Cut Lines
            </label>

            <label className="inline-flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                checked={includePlatoon}
                onChange={(e) => setIncludePlatoon(e.target.checked)}
                className="h-4 w-4 rounded border-field/30 text-field focus:ring-field"
              />
              <Layers className="h-3.5 w-3.5 text-field/70" /> Show Platoon & ID Tag
            </label>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="no-print mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
          {errorMsg}
        </div>
      )}

      {/* ─── LIVE PRINT PREVIEW SECTION ─── */}
      <div className="print-container">
        {/* Banner only on screen */}
        <div className="no-print mb-3 flex items-center justify-between rounded-lg bg-mist/60 px-4 py-2 text-xs text-slate">
          <span>
            📋 <strong>Print Preview</strong> below shows how your sheet will print onto{" "}
            <strong>{PAPER_CONFIGS[paperSize].name}</strong>. Cards can be checked/unchecked to
            include or exclude them.
          </span>
          <span className="font-mono text-2xs">
            Showing {printableCadets.length} of {cadets.length} cadets
          </span>
        </div>

        {printableCadets.length === 0 ? (
          <div className="no-print rounded-xl border border-dashed border-field/20 bg-white p-12 text-center">
            <UsersRound className="mx-auto h-10 w-10 text-field/40" />
            <h3 className="mt-3 text-sm font-bold text-charcoal">No Cadets Selected</h3>
            <p className="mt-1 text-xs text-slate">
              Please check at least one cadet above, or click "Select All Filtered".
            </p>
            <button
              type="button"
              onClick={selectAllFiltered}
              className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-field px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-forest"
            >
              <CheckSquare className="h-3.5 w-3.5" /> Select All Available ({cadets.length})
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sheet wrapper: renders in a responsive CSS grid on screen, and standard page break on print */}
            <div
              className={`print-sheet grid gap-3 ${gridConfig.colsClass} rounded-xl border border-field/15 bg-white p-4 shadow-sm`}
            >
              {printableCadets.map((cadet) => {
                const isSelected = selectedIds.has(cadet.id);
                const fullName = `${cadet.first_name} ${cadet.last_name}`.trim();
                const unitTag = [
                  cadet.company ? `${cadet.company} Co.` : "Alpha Co.",
                  cadet.platoon || "1st Platoon",
                ].join(" • ");

                return (
                  <div
                    key={cadet.id}
                    onClick={() => toggleCadet(cadet.id)}
                    className={`print-card group relative flex flex-col items-center justify-between text-center transition-all ${
                      gridConfig.cardHeight
                    } ${gridConfig.paddingClass} ${
                      showCutGuides
                        ? "border border-dashed border-slate-300"
                        : "border border-slate-100"
                    } ${
                      isSelected
                        ? "bg-white hover:border-emerald-600 cursor-pointer"
                        : "opacity-40 bg-slate-50 cursor-pointer"
                    }`}
                  >
                    {/* Screen-only checkbox in top-right */}
                    <div className="no-print absolute right-1.5 top-1.5 z-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCadet(cadet.id)}
                        className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Organization Banner (Top) */}
                    <div className="w-full border-b border-slate-200 pb-0.5 text-center">
                      <p className="text-[7pt] font-black uppercase tracking-[0.18em] text-slate-700">
                        SAN ENRIQUE ROTC UNIT
                      </p>
                    </div>

                    {/* 1. SQUARE QR CODE (On Top) */}
                    <div
                      className={`my-auto flex items-center justify-center ${gridConfig.qrSizeClass}`}
                      dangerouslySetInnerHTML={{ __html: cadet.qrSvg }}
                    />

                    {/* 2. CADET NAME (Directly at the bottom of the QR code) */}
                    <div className="w-full border-t border-slate-200 pt-1 text-center">
                      <h4
                        className={`font-black uppercase tracking-tight text-slate-900 ${gridConfig.nameSizeClass}`}
                      >
                        {fullName}
                      </h4>

                      {/* Optional Student ID & Unit Tag */}
                      {includePlatoon && (
                        <div className="mt-0.5 flex flex-wrap items-center justify-center gap-1">
                          <span
                            className={`font-mono font-bold text-slate-700 ${gridConfig.subSizeClass}`}
                          >
                            {cadet.student_id}
                          </span>
                          <span className="text-[6pt] text-slate-400">•</span>
                          <span
                            className={`font-semibold text-slate-600 ${gridConfig.subSizeClass}`}
                          >
                            {unitTag}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PortalShell>
  );
}

