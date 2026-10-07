"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Download,
  Printer,
  Calendar,
  Search,
  Filter,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ScanLine,
  Smile,
  FileSpreadsheet,
  Building2,
  RefreshCw,
} from "lucide-react";
import { PortalCard, PortalShell } from "@/components/portal-shell";
import { createBrowserClient } from "@/lib/supabase/client";

type AttendanceSession = {
  id: string;
  title: string;
  session_date: string;
  session_type?: string;
  location?: string;
  is_open: boolean;
};

type AttendanceRecordRow = {
  id: string;
  session_id: string;
  cadet_id: string;
  date: string;
  time_in: string | null;
  status: string;
  verification_method?: string | null;
  source?: string | null;
  remarks?: string | null;
  cadet?: {
    first_name: string;
    last_name: string;
    student_id: string;
    course: string;
    year_level: string;
    section: string;
    company?: string | null;
    platoon?: string | null;
  } | null;
  session?: {
    title: string;
    session_date: string;
    location?: string | null;
  } | null;
};

export default function AdminAttendanceMasterPage() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("ALL");
  const [records, setRecords] = useState<AttendanceRecordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [companyFilter, setCompanyFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");

  const supabase = createBrowserClient();

  useEffect(() => {
    async function loadSessions() {
      const { data } = await supabase
        .from("attendance_sessions")
        .select("id, title, session_date, session_type, location, is_open")
        .order("created_at", { ascending: false });

      if (data) {
        setSessions(data);
        if (data.length > 0 && selectedSessionId === "ALL") {
          // Keep ALL as option, or admin can select specific
        }
      }
    }
    loadSessions();
  }, [supabase]);

  useEffect(() => {
    async function loadRecords() {
      setLoading(true);
      try {
        let query = supabase
          .from("attendance_records")
          .select(`
            id,
            session_id,
            cadet_id,
            date,
            time_in,
            status,
            verification_method,
            source,
            remarks,
            cadet:profiles!cadet_id (
              first_name,
              last_name,
              student_id,
              course,
              year_level,
              section,
              company,
              platoon
            ),
            session:attendance_sessions!session_id (
              title,
              session_date,
              location
            )
          `)
          .order("date", { ascending: false })
          .order("time_in", { ascending: false });

        if (selectedSessionId !== "ALL") {
          query = query.eq("session_id", selectedSessionId);
        }

        const { data, error } = await query;
        if (!error && data) {
          setRecords(data as any);
        } else {
          setRecords([]);
        }
      } catch {
        setRecords([]);
      } finally {
        setLoading(false);
      }
    }
    loadRecords();
  }, [selectedSessionId, supabase]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const name = `${r.cadet?.first_name || ""} ${r.cadet?.last_name || ""}`.toLowerCase();
      const sid = (r.cadet?.student_id || "").toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch = !query || name.includes(query) || sid.includes(query);

      const comp = (r.cadet?.company || "").toUpperCase();
      const matchesCompany =
        companyFilter === "ALL" ||
        (companyFilter === "ALPHA" && comp.includes("ALPHA")) ||
        (companyFilter === "BRAVO" && comp.includes("BRAVO")) ||
        (companyFilter === "CHARLIE" && comp.includes("CHARLIE"));

      const method = (r.verification_method || r.source || "").toLowerCase();
      const matchesMethod =
        methodFilter === "ALL" ||
        (methodFilter === "QR" && (method.includes("qr") || method === "")) ||
        (methodFilter === "FACE" && method.includes("face")) ||
        (methodFilter === "MANUAL" && method.includes("manual"));

      return matchesSearch && matchesCompany && matchesMethod;
    });
  }, [records, searchQuery, companyFilter, methodFilter]);

  const stats = useMemo(() => {
    let qr = 0;
    let face = 0;
    let manual = 0;
    filteredRecords.forEach((r) => {
      const m = (r.verification_method || r.source || "").toLowerCase();
      if (m.includes("face")) face++;
      else if (m.includes("manual")) manual++;
      else qr++;
    });
    return {
      total: filteredRecords.length,
      qr,
      face,
      manual,
    };
  }, [filteredRecords]);

  const activeSessionTitle = useMemo(() => {
    if (selectedSessionId === "ALL") return "All Drill Sessions & Formations";
    const found = sessions.find((s) => s.id === selectedSessionId);
    return found ? `${found.title} (${found.session_date})` : "Formation Attendance";
  }, [selectedSessionId, sessions]);

  // Export CSV Handler
  const handleExportCsv = () => {
    const headers = [
      "Cadet Name",
      "Student ID",
      "Course & Year",
      "Section",
      "Company",
      "Platoon",
      "Drill Session",
      "Date",
      "Time In",
      "Status",
      "Attendance Method",
      "Remarks",
    ];

    const rows = filteredRecords.map((r) => {
      const m = (r.verification_method || r.source || "").toLowerCase();
      const methodLabel = m.includes("face") ? "FACE" : m.includes("manual") ? "MANUAL" : "QR";

      return [
        `"${r.cadet?.first_name || ""} ${r.cadet?.last_name || ""}"`,
        `"${r.cadet?.student_id || ""}"`,
        `"${r.cadet?.course || "ROTC"} ${r.cadet?.year_level || ""}"`,
        `"${r.cadet?.section || ""}"`,
        `"${r.cadet?.company || "Alpha"}"`,
        `"${r.cadet?.platoon || "1st Platoon"}"`,
        `"${r.session?.title || "Formation"}"`,
        `"${r.date || ""}"`,
        `"${r.time_in || "Recorded"}"`,
        `"${r.status || "PRESENT"}"`,
        `"${methodLabel}"`,
        `"${r.remarks || ""}"`,
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const filename = `SE_ROTC_Master_Attendance_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <PortalShell
      type="admin"
      title="Official Master Attendance Ledger"
      subtitle="Export military-compliant roster reports to Excel/CSV or print official Department of Military Science & Tactics PDF records."
      currentPath="/admin/attendance"
    >
      {/* ─── PRINT ONLY STYLING & OFFICIAL MILITARY HEADER ─── */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          nav, header, aside, .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 11px !important;
          }
          .print-table th, .print-table td {
            border: 1px solid #333 !important;
            padding: 4px 6px !important;
            color: black !important;
          }
          .print-table th {
            background-color: #eee !important;
          }
        }
        @media screen {
          .print-only {
            display: none;
          }
        }
      `}</style>

      {/* Official Military Letterhead (Visible when printed) */}
      <div className="print-only mb-6 text-center">
        <p className="text-xs font-serif font-bold uppercase tracking-wider text-black">
          HEADQUARTERS, SAN ENRIQUE ROTC UNIT (ACTIVATED)
        </p>
        <p className="text-xs font-serif text-black">
          DEPARTMENT OF MILITARY SCIENCE AND TACTICS (DMST)
        </p>
        <p className="text-xs font-serif text-black mb-2">
          San Enrique, Negros Occidental, Philippines
        </p>
        <div className="border-t-2 border-b-2 border-black py-1 my-2">
          <h1 className="text-sm font-bold uppercase tracking-widest text-black">
            OFFICIAL MUSTER ROLL & CADET ATTENDANCE RECORD
          </h1>
          <p className="text-xs italic text-black">
            Formation Session: {activeSessionTitle}
          </p>
        </div>
      </div>

      {/* ─── SCREEN CONTROLS & FILTER BAR (Hidden on Print) ─── */}
      <div className="no-print mb-6 space-y-4">
        {/* Top Filter Card */}
        <div className="rounded-2xl border border-brass/30 bg-forest/90 p-5 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Session Selector */}
            <div className="flex-1">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brass">
                <Calendar className="h-4 w-4 text-brass" /> Select Drill Session
              </label>
              <select
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="w-full rounded-xl border border-brass/30 bg-field/80 px-3.5 py-2.5 text-sm font-semibold text-white focus:border-brass focus:outline-none"
              >
                <option value="ALL">All Recorded Drill Sessions (Consolidated Master Ledger)</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} • {s.session_date} {s.is_open ? "(🟢 Active)" : "(Closed)"}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons: Excel / CSV & Print PDF */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-5">
              <button
                onClick={handleExportCsv}
                disabled={filteredRecords.length === 0}
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500 disabled:opacity-50"
              >
                <FileSpreadsheet className="h-4 w-4" /> Export to Excel / CSV
              </button>

              <button
                onClick={handlePrint}
                disabled={filteredRecords.length === 0}
                type="button"
                className="inline-flex items-center gap-2 rounded-xl bg-brass px-4 py-2.5 text-xs font-bold text-dark shadow hover:bg-brass/90 disabled:opacity-50"
              >
                <Printer className="h-4 w-4" /> Print / Save PDF
              </button>
            </div>
          </div>

          {/* Sub Filters: Search, Company, Method */}
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-white/10 pt-4 sm:grid-cols-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search cadet name or student ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-field/60 py-2 pl-9 pr-3 text-xs text-white placeholder-muted-foreground focus:border-brass focus:outline-none"
              />
            </div>

            {/* Company Filter */}
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="rounded-xl border border-white/15 bg-field/60 px-3 py-2 text-xs font-medium text-white focus:border-brass focus:outline-none"
            >
              <option value="ALL">All Companies (Alpha, Bravo, Charlie)</option>
              <option value="ALPHA">Alpha Company</option>
              <option value="BRAVO">Bravo Company</option>
              <option value="CHARLIE">Charlie Company</option>
            </select>

            {/* Method Filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="rounded-xl border border-white/15 bg-field/60 px-3 py-2 text-xs font-medium text-white focus:border-brass focus:outline-none"
            >
              <option value="ALL">All Verification Methods (QR + Face + Manual)</option>
              <option value="QR">QR Code Scan (Standard)</option>
              <option value="FACE">Face Recognition (Backup)</option>
              <option value="MANUAL">Manual Admin Override</option>
            </select>
          </div>
        </div>

        {/* Statistical Summary Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-brass/20 bg-forest/70 p-4">
            <span className="text-2xs font-bold uppercase tracking-wider text-brass">Total Recorded</span>
            <p className="mt-1 text-2xl font-extrabold text-white">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-blue-500/20 bg-forest/70 p-4">
            <span className="text-2xs font-bold uppercase tracking-wider text-blue-400">📷 QR Scanned</span>
            <p className="mt-1 text-2xl font-extrabold text-white">{stats.qr}</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-forest/70 p-4">
            <span className="text-2xs font-bold uppercase tracking-wider text-emerald-400">😊 Face Verified</span>
            <p className="mt-1 text-2xl font-extrabold text-white">{stats.face}</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-forest/70 p-4">
            <span className="text-2xs font-bold uppercase tracking-wider text-amber-400">📝 Manual Override</span>
            <p className="mt-1 text-2xl font-extrabold text-white">{stats.manual}</p>
          </div>
        </div>
      </div>

      {/* ─── MASTER ATTENDANCE DATA TABLE ─── */}
      <div className="overflow-hidden rounded-2xl border border-brass/30 bg-forest/90 shadow-xl">
        <div className="no-print flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-field/40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brass" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Official Formation Roster Ledger ({filteredRecords.length} records)
            </span>
          </div>
          <span className="text-2xs text-white/60">AFP / ROTC DMST Compliant Format</span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-sm text-muted-foreground">
            <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-brass" />
            Loading attendance records from database...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-20 text-center text-sm text-muted-foreground">
            No attendance records found for the selected session and filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="print-table w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-field/70 text-2xs uppercase tracking-wider text-brass">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Cadet Name</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Course & Sec</th>
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Formation Session</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Time In</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white">
                {filteredRecords.map((r, idx) => {
                  const m = (r.verification_method || r.source || "").toLowerCase();
                  const isFace = m.includes("face");
                  const isManual = m.includes("manual");

                  return (
                    <tr key={r.id} className="hover:bg-white/5">
                      <td className="py-2.5 px-4 font-mono text-white/50">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-bold text-white">
                        {r.cadet?.first_name} {r.cadet?.last_name}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-brass">{r.cadet?.student_id || "--"}</td>
                      <td className="py-2.5 px-4 text-white/80">
                        {r.cadet?.course || "ROTC"} {r.cadet?.year_level ? `(${r.cadet.year_level})` : ""} • Sec {r.cadet?.section || "A"}
                      </td>
                      <td className="py-2.5 px-4 text-white/80">
                        {r.cadet?.company || "Alpha"} • {r.cadet?.platoon || "1st Platoon"}
                      </td>
                      <td className="py-2.5 px-4 text-white/70">{r.session?.title || "Drill"}</td>
                      <td className="py-2.5 px-4 font-mono text-white/70">{r.date}</td>
                      <td className="py-2.5 px-4 font-mono text-emerald-400 font-bold">{r.time_in || "Recorded"}</td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-3xs font-extrabold uppercase ${
                            isFace
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                              : isManual
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                          }`}
                        >
                          {isFace ? "FACE" : isManual ? "MANUAL" : "QR"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-3xs font-extrabold text-emerald-300 border border-emerald-500/30">
                          {r.status || "PRESENT"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── PRINT SIGNATURE BLOCK (Visible only on print/PDF) ─── */}
      <div className="print-only mt-12 text-black">
        <div className="grid grid-cols-3 gap-8 text-center text-xs">
          <div>
            <div className="border-b border-black mb-1 h-12"></div>
            <p className="font-bold">PREPARED BY:</p>
            <p className="text-2xs">Cadet S1 / Platoon Leader</p>
          </div>
          <div>
            <div className="border-b border-black mb-1 h-12"></div>
            <p className="font-bold">ATTESTED BY:</p>
            <p className="text-2xs">Chief Clerk, San Enrique ROTC</p>
          </div>
          <div>
            <div className="border-b border-black mb-1 h-12"></div>
            <p className="font-bold">APPROVED BY:</p>
            <p className="text-2xs">Commandant / DMST Officer</p>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
