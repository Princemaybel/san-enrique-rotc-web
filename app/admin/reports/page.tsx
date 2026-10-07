"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { PortalShell } from "@/components/portal-shell";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  BarChart3, Calendar, CheckCircle, Clock, Download,
  Filter, Printer, Search, Users, X, XCircle,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────── */
type AttendanceRow = {
  id: string;
  date: string;
  time_in: string | null;
  status: "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";
  verification_method: string | null;
  profiles: { first_name: string; last_name: string; student_id: string; section: string | null; course: string | null } | null;
  attendance_sessions: { title: string; session_date: string } | null;
};

type Summary = { total: number; present: number; late: number; absent: number; excused: number };

/* ─── Helpers ────────────────────────────────────────────────────── */
const STATUS_STYLE: Record<string, string> = {
  PRESENT: "bg-emerald-100 text-emerald-800",
  LATE:    "bg-amber-100 text-amber-800",
  ABSENT:  "bg-red-100 text-red-800",
  EXCUSED: "bg-blue-100 text-blue-800",
};

function pct(n: number, d: number) {
  return d ? Math.round((n / d) * 100) : 0;
}

function exportCsv(rows: AttendanceRow[], filename: string) {
  const headers = ["Cadet Name", "Student ID", "Course", "Section", "Date", "Time In", "Status", "Session", "Method"];
  const data = rows.map((r) => [
    `${r.profiles?.first_name ?? ""} ${r.profiles?.last_name ?? ""}`.trim(),
    r.profiles?.student_id ?? "",
    r.profiles?.course ?? "",
    r.profiles?.section ?? "",
    r.date,
    r.time_in ?? "",
    r.status,
    r.attendance_sessions?.title ?? "",
    r.verification_method ?? "",
  ]);
  const csv = [headers, ...data].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Component ──────────────────────────────────────────────────── */
export default function AdminReportsPage() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [records, setRecords] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("attendance_records")
      .select(`
        id, date, time_in, status, verification_method,
        profiles ( first_name, last_name, student_id, section, course ),
        attendance_sessions ( title, session_date )
      `)
      .order("date", { ascending: false })
      .limit(500);

    if (dateFrom) query = query.gte("date", dateFrom);
    if (dateTo) query = query.lte("date", dateTo);

    const { data, error } = await query;
    if (!error) setRecords((data ?? []) as unknown as AttendanceRow[]);
    setLoading(false);
  }, [dateFrom, dateTo]);

  useEffect(() => { load(); }, [load]);

  /* Client-side filters */
  const filtered = records.filter((r) => {
    const name = `${r.profiles?.first_name} ${r.profiles?.last_name}`.toLowerCase();
    const sid = (r.profiles?.student_id ?? "").toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || sid.includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const summary: Summary = filtered.reduce(
    (acc, r) => {
      acc.total++;
      if (r.status === "PRESENT") acc.present++;
      else if (r.status === "LATE") acc.late++;
      else if (r.status === "ABSENT") acc.absent++;
      else if (r.status === "EXCUSED") acc.excused++;
      return acc;
    },
    { total: 0, present: 0, late: 0, absent: 0, excused: 0 }
  );

  return (
    <PortalShell
      type="admin"
      title="Attendance Reports"
      subtitle="View, filter, and export real-time attendance records from Supabase."
      currentPath="/admin/reports"
    >
      {/* ── Filter bar ── */}
      <div className="mb-5 rounded-xl border border-field/10 bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-end gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cadet name or ID…"
              className="w-full rounded-lg border border-field/20 py-2 pl-9 pr-8 text-sm outline-none focus:border-field"
            />
            {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-slate" /></button>}
          </div>

          {/* Status filter */}
          <div className="flex flex-wrap gap-1.5">
            {["ALL", "PRESENT", "LATE", "ABSENT", "EXCUSED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${statusFilter === s ? "bg-field text-white" : "border border-field/20 bg-white text-charcoal hover:bg-mist"}`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate">From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-lg border border-field/20 px-2 py-1.5 text-sm outline-none focus:border-field" />
            <label className="text-xs font-semibold text-slate">To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-lg border border-field/20 px-2 py-1.5 text-sm outline-none focus:border-field" />
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="rounded-md border border-field/20 px-2 py-1.5 text-xs text-slate hover:bg-mist">Clear</button>
            )}
          </div>

          {/* Export buttons */}
          <button
            onClick={() => exportCsv(filtered, `SE_ROTC_Attendance_${new Date().toISOString().slice(0, 10)}`)}
            className="inline-flex items-center gap-2 rounded-lg bg-field px-4 py-2 text-sm font-bold text-white hover:bg-forest"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-field/20 bg-white px-4 py-2 text-sm font-bold text-charcoal hover:bg-mist print:hidden"
          >
            <Printer className="h-4 w-4" /> Print / PDF
          </button>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Present", value: summary.present, color: "text-emerald-700", bg: "bg-emerald-50", icon: CheckCircle },
          { label: "Late", value: summary.late, color: "text-amber-700", bg: "bg-amber-50", icon: Clock },
          { label: "Absent", value: summary.absent, color: "text-red-700", bg: "bg-red-50", icon: XCircle },
          { label: "Total Records", value: summary.total, color: "text-field", bg: "bg-mist", icon: Users },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className={`flex items-center gap-3 rounded-xl p-4 ${bg}`}>
            <Icon className={`h-6 w-6 ${color}`} />
            <div>
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-xs font-semibold text-slate">{label} {summary.total > 0 && label !== "Total Records" ? `(${pct(value, summary.total)}%)` : ""}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-xl border border-field/10 bg-white shadow-card print:shadow-none">
        <div className="flex items-center justify-between border-b border-field/10 p-4">
          <div>
            <h2 className="text-base font-black text-charcoal">Attendance Ledger</h2>
            <p className="text-xs text-slate">{filtered.length} record{filtered.length !== 1 ? "s" : ""} shown</p>
          </div>
          <BarChart3 className="h-5 w-5 text-brass" />
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate">Loading records…</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate">No records found. Try adjusting your filters.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-field/10 bg-mist/50 text-xs font-bold uppercase tracking-wider text-slate">
              <tr>
                <th className="px-4 py-3 text-left">Cadet</th>
                <th className="px-4 py-3 text-left">Section</th>
                <th className="px-4 py-3 text-left">Session</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Time In</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-field/5">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-mist/30">
                  <td className="px-4 py-3">
                    <p className="font-bold text-charcoal">{r.profiles?.first_name} {r.profiles?.last_name}</p>
                    <p className="text-xs text-slate">{r.profiles?.student_id}</p>
                  </td>
                  <td className="px-4 py-3 text-slate">{r.profiles?.section ?? "—"}</td>
                  <td className="px-4 py-3 text-slate">{r.attendance_sessions?.title ?? "—"}</td>
                  <td className="px-4 py-3 text-slate">{r.date}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate">{r.time_in ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_STYLE[r.status] ?? "bg-slate/10 text-slate"}`}>{r.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate">{r.verification_method ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          nav, aside, button, .print\\:hidden { display: none !important; }
          body { background: white; }
          table { font-size: 11px; }
        }
      `}</style>
    </PortalShell>
  );
}
