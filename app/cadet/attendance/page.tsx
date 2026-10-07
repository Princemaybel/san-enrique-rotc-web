"use client";

import { useState, useEffect, useMemo } from "react";
import { PortalShell } from "@/components/portal-shell";
import { StatusBadge, EmptyState } from "@/components/ui";
import {
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  ShieldCheck,
  FileText,
  Send,
  Check,
  QrCode,
  Search,
  X,
} from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";

/* ─── Types ────────────────────────────────────────────────────── */
type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";
type FilterOption = "ALL" | AttendanceStatus;

interface AttendanceSession {
  id: string;
  title?: string | null;
  session_type?: string | null;
  session_date?: string | null;
  created_at?: string | null;
}

interface AttendanceRecord {
  id: string;
  cadet_id: string;
  session_id: string;
  status: AttendanceStatus;
  created_at: string;
  verification_method?: string | null;
  is_late?: boolean | null;
  remarks?: string | null;
  session?: AttendanceSession | null;
}

/* ─── Helpers ──────────────────────────────────────────────────── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSessionLabel(record: AttendanceRecord): string {
  const s = record.session;
  if (!s) return `Session ${record.session_id.slice(0, 8)}`;
  return s.title ?? s.session_type ?? `Session ${s.id.slice(0, 8)}`;
}

/* ─── Loading Skeleton ─────────────────────────────────────────── */
function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-0 divide-y divide-field/5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-6 py-4">
          <div className="h-4 w-24 rounded bg-slate/10" />
          <div className="h-4 flex-1 rounded bg-slate/10" />
          <div className="h-4 w-16 rounded bg-slate/10" />
          <div className="h-5 w-20 rounded-full bg-slate/10" />
          <div className="h-4 w-20 rounded bg-slate/10" />
        </div>
      ))}
    </div>
  );
}

/* ─── Stat Card ────────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  icon,
  colorClass,
  borderClass,
  textClass,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
  borderClass: string;
  textClass: string;
}) {
  return (
    <div
      className={`rounded-xl border p-5 shadow-card ${colorClass} ${borderClass}`}
    >
      <div className={`flex items-center justify-between ${textClass}`}>
        <span className="text-xs font-semibold">{label}</span>
        {icon}
      </div>
      <strong className={`mt-2 block text-2xl font-bold ${textClass}`}>
        {value}
      </strong>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────── */
export default function CadetAttendancePage() {
  /* — Excuse modal state — */
  const [showExcuseModal, setShowExcuseModal] = useState(false);
  const [sessionName, setSessionName] = useState("Saturday Morning Drill");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  /* — Data state — */
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* — Filter / search state — */
  const [activeFilter, setActiveFilter] = useState<FilterOption>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  /* ── Fetch ─────────────────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createBrowserClient();

        /* 1. Auth user */
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("Not authenticated.");

        /* 2. Profile → cadet id */
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();
        if (profileError || !profile) throw new Error("Profile not found.");

        /* 3. Attendance records */
        const { data: rows, error: recordsError } = await supabase
          .from("attendance_records")
          .select(
            `
            id,
            cadet_id,
            session_id,
            status,
            created_at,
            verification_method,
            is_late,
            remarks
          `
          )
          .eq("cadet_id", profile.id)
          .order("created_at", { ascending: false });

        if (recordsError) throw new Error(recordsError.message);

        const rawRows: AttendanceRecord[] = (rows ?? []) as AttendanceRecord[];

        /* 4. Fetch sessions if any records exist */
        if (rawRows.length > 0) {
          const sessionIds = [...new Set(rawRows.map((r) => r.session_id))];

          const { data: sessions } = await supabase
            .from("attendance_sessions")
            .select("id, title, session_type, session_date, created_at")
            .in("id", sessionIds);

          const sessionMap = new Map<string, AttendanceSession>(
            (sessions ?? []).map((s: AttendanceSession) => [s.id, s])
          );

          const enriched = rawRows.map((r) => ({
            ...r,
            session: sessionMap.get(r.session_id) ?? null,
          }));

          if (!cancelled) setRecords(enriched);
        } else {
          if (!cancelled) setRecords([]);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Stats ─────────────────────────────────────────────────────── */
  const stats = useMemo(() => {
    const total = records.length;
    const present = records.filter((r) => r.status === "PRESENT").length;
    const late = records.filter((r) => r.status === "LATE").length;
    const absent = records.filter((r) => r.status === "ABSENT").length;
    const attendancePct = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, late, absent, attendancePct };
  }, [records]);

  /* ── Filtered records ───────────────────────────────────────────── */
  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesFilter =
        activeFilter === "ALL" || r.status === activeFilter;
      const label = getSessionLabel(r).toLowerCase();
      const matchesSearch =
        searchQuery.trim() === "" ||
        label.includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [records, activeFilter, searchQuery]);

  /* ── Excuse modal handler ───────────────────────────────────────── */
  const handleSubmitExcuse = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setShowExcuseModal(false);
      setSubmitted(false);
      setReason("");
    }, 2000);
  };

  const filterButtons: { label: string; value: FilterOption }[] = [
    { label: "All", value: "ALL" },
    { label: "Present", value: "PRESENT" },
    { label: "Late", value: "LATE" },
    { label: "Absent", value: "ABSENT" },
    { label: "Excused", value: "EXCUSED" },
  ];

  return (
    <PortalShell
      type="cadet"
      title="Attendance & Formations"
      subtitle="Complete ledger of training attendance, parade drills, and excuses."
      currentPath="/cadet/attendance"
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

        {/* ── Stat cards ── */}
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard
            label="Total Formations"
            value={stats.total}
            icon={<Calendar className="h-4 w-4" />}
            colorClass="bg-white"
            borderClass="border-field/10"
            textClass="text-slate"
          />
          <StatCard
            label="Present"
            value={stats.present}
            icon={<CheckCircle2 className="h-4 w-4" />}
            colorClass="bg-emerald-50/50"
            borderClass="border-emerald-200"
            textClass="text-emerald-800"
          />
          <StatCard
            label="Late"
            value={stats.late}
            icon={<Clock className="h-4 w-4" />}
            colorClass="bg-amber-50/50"
            borderClass="border-amber-200"
            textClass="text-amber-800"
          />
          <StatCard
            label="Absent"
            value={stats.absent}
            icon={<XCircle className="h-4 w-4" />}
            colorClass="bg-red-50/50"
            borderClass="border-red-200"
            textClass="text-red-800"
          />
        </div>

        {/* ── Attendance % progress bar ── */}
        {!loading && records.length > 0 && (
          <div className="rounded-xl border border-field/10 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-charcoal">
                Attendance Rate
              </span>
              <span className="text-sm font-bold text-field">
                {stats.attendancePct}%
              </span>
            </div>
            <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-mist">
              <div
                className="h-full rounded-full bg-field transition-all duration-700"
                style={{ width: `${stats.attendancePct}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-slate">
              {stats.present} present out of {stats.total} formations
            </p>
          </div>
        )}

        {/* ── Attendance log ── */}
        <div className="rounded-xl border border-field/10 bg-white shadow-card">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-field/10 px-6 py-4">
            <div>
              <h2 className="text-base font-bold text-charcoal">
                Attendance Log
              </h2>
              <p className="text-2xs text-slate">
                Records scanned using the Android Cadet App
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowExcuseModal(true)}
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md border border-field/20 bg-white px-3.5 py-1.5 text-xs font-bold text-charcoal shadow-xs hover:bg-mist"
              >
                <FileText className="h-3.5 w-3.5 text-brass" />
                File Absence Excuse
              </button>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-field">
                <ShieldCheck className="h-4 w-4" /> DB Protected
              </span>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3 border-b border-field/10 px-6 py-3">
            <div className="flex items-center gap-1.5 rounded-lg border border-field/15 bg-mist p-1">
              {filterButtons.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActiveFilter(value)}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    activeFilter === value
                      ? "bg-field text-white shadow-sm"
                      : "text-slate hover:text-charcoal"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="relative ml-auto min-w-0 flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate/50" />
              <input
                type="search"
                placeholder="Search session name…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-field/20 py-1.5 pl-8 pr-3 text-xs text-charcoal placeholder-slate/50 focus:border-field focus:outline-none"
              />
            </div>
          </div>

          {/* Body */}
          {loading ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <div className="p-8">
              {records.length === 0 ? (
                <EmptyState
                  icon={<QrCode className="h-7 w-7" />}
                  title="No Formations Recorded"
                  body="No QR records yet — attend a drill session and scan your QR code to start tracking your attendance."
                />
              ) : (
                <EmptyState
                  icon={<Search className="h-7 w-7" />}
                  title="No Matching Records"
                  body="Try adjusting the filter or search query."
                />
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-field/10 text-left">
                    <th className="px-6 py-3 font-semibold text-slate">Date</th>
                    <th className="px-4 py-3 font-semibold text-slate">
                      Session
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate">
                      Time Scanned
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate">
                      Status
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate">
                      Method
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-field/5">
                  {filtered.map((record) => (
                    <tr
                      key={record.id}
                      className="transition-colors hover:bg-mist/40"
                    >
                      <td className="whitespace-nowrap px-6 py-3.5 font-medium text-charcoal">
                        {formatDate(record.created_at)}
                      </td>
                      <td className="px-4 py-3.5 text-charcoal">
                        {getSessionLabel(record)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate">
                        {formatTime(record.created_at)}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={record.status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate">
                        {record.verification_method === "qr_scan" ||
                        record.verification_method === "QR_SCAN"
                          ? "QR Scan"
                          : record.verification_method === "manual" ||
                            record.verification_method === "MANUAL"
                          ? "Manual"
                          : record.verification_method ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Excuse Filing Modal ── */}
      {showExcuseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-field/15 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-charcoal">
                  Submit Official Absence Excuse
                </h3>
                <p className="mt-1 text-xs text-slate">
                  Excuses are routed directly to your company commandant and
                  administrator for review.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowExcuseModal(false)}
                className="ml-4 rounded-md p-1 text-slate hover:bg-mist hover:text-charcoal"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitExcuse} className="mt-5 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold text-charcoal">
                  Formation Session
                </span>
                <input
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-field/20 px-3 py-2 text-xs text-charcoal focus:border-field focus:outline-none"
                  required
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-charcoal">
                  Reason / Justification
                </span>
                <textarea
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide details regarding medical illness, emergency, or official academic conflict..."
                  className="mt-1 w-full rounded-md border border-field/20 px-3 py-2 text-xs text-charcoal focus:border-field focus:outline-none"
                  required
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-charcoal">
                  Medical / Supporting Document (Optional)
                </span>
                <input
                  type="file"
                  className="mt-1 w-full rounded-md border border-field/20 px-3 py-1.5 text-xs text-charcoal file:mr-3 file:rounded file:border-0 file:bg-mist file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-field"
                />
              </label>

              {submitted && (
                <div className="flex items-center gap-2 rounded-md bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
                  <Check className="h-4 w-4" /> Excuse filed successfully and
                  queued for admin review.
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setShowExcuseModal(false)}
                  type="button"
                  className="rounded-md border border-field/20 px-4 py-2 text-xs font-semibold text-charcoal hover:bg-mist"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitted}
                  className="inline-flex items-center gap-1.5 rounded-md bg-field px-4 py-2 text-xs font-bold text-white hover:bg-forest disabled:opacity-60"
                >
                  <Send className="h-3.5 w-3.5" /> Submit Excuse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
