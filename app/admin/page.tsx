"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  ClipboardList,
  CheckCircle2,
  Calendar,
  Megaphone,
  ScanLine,
  Printer,
  FileSpreadsheet,
  ArrowRight,
  Clock,
  AlertTriangle,
  Check,
  X,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PortalShell } from "@/components/portal-shell";
import { createBrowserClient } from "@/lib/supabase/client";

type PendingCadet = {
  id: string;
  first_name: string;
  last_name: string;
  student_id: string;
  course: string;
  year_level: string;
  section: string | null;
  created_at: string;
  profile_picture?: string | null;
};

type RecentAttendance = {
  id: string;
  scanned_at: string;
  method?: string;
  profiles?: {
    first_name: string;
    last_name: string;
    student_id: string;
  } | null;
  attendance_sessions?: {
    title: string;
  } | null;
};

export default function AdminPage() {
  const supabase = createBrowserClient();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalCadets: 0,
    pendingCadets: 0,
    approvedCadets: 0,
    totalSessions: 0,
    totalAttendances: 0,
    totalAnnouncements: 0,
    totalEvents: 0,
  });

  const [pendingList, setPendingList] = useState<PendingCadet[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<RecentAttendance[]>([]);
  const [actionMessage, setActionMessage] = useState("");

  async function loadDashboardData() {
    try {
      // 1. Cadet counts
      const [
        { count: totalCadetsCount },
        { count: pendingCadetsCount },
        { count: approvedCadetsCount },
        { count: sessionsCount },
        { count: attendancesCount },
        { count: announcementsCount },
        { count: eventsCount },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "cadet"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "cadet").eq("status", "pending"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "cadet").eq("status", "approved"),
        supabase.from("attendance_sessions").select("*", { count: "exact", head: true }),
        supabase.from("attendance_records").select("*", { count: "exact", head: true }),
        supabase.from("announcements").select("*", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("events").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        totalCadets: totalCadetsCount ?? 0,
        pendingCadets: pendingCadetsCount ?? 0,
        approvedCadets: approvedCadetsCount ?? 0,
        totalSessions: sessionsCount ?? 0,
        totalAttendances: attendancesCount ?? 0,
        totalAnnouncements: announcementsCount ?? 0,
        totalEvents: eventsCount ?? 0,
      });

      // 2. Fetch up to 5 latest pending cadets
      const { data: pendingData } = await supabase
        .from("profiles")
        .select("id,first_name,last_name,student_id,course,year_level,section,created_at,profile_picture")
        .eq("role", "cadet")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);

      setPendingList((pendingData as PendingCadet[]) ?? []);

      // 3. Fetch latest 5 attendance scans
      const { data: attendanceData } = await supabase
        .from("attendance_records")
        .select(`
          id,
          scanned_at,
          method,
          profiles:cadet_id (first_name, last_name, student_id),
          attendance_sessions:session_id (title)
        `)
        .order("scanned_at", { ascending: false })
        .limit(5);

      setRecentAttendance((attendanceData as unknown as RecentAttendance[]) ?? []);
    } catch (err: any) {
      console.warn("Dashboard stats error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function handleQuickApprove(id: string, status: "approved" | "rejected") {
    setActionMessage("");
    try {
      const response = await fetch("/api/admin/cadets/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cadetId: id, status }),
      });
      const result = await response.json();
      if (!result.ok) {
        setActionMessage(result.error || "Failed to update cadet status.");
        return;
      }
      setActionMessage(`Cadet successfully ${status}!`);
      loadDashboardData();
    } catch (err: any) {
      setActionMessage(err?.message || "Failed to update status.");
    }
  }

  return (
    <PortalShell
      type="admin"
      title="Command Headquarters"
      subtitle="Operational readiness overview, personnel ledger statistics, and quick command tools."
      currentPath="/admin"
    >
      {/* ── Top Bar with Status and Refresh ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono font-bold tracking-wider text-charcoal uppercase">
            UNIT STATUS: READY • SAN ENRIQUE COMMAND
          </span>
        </div>

        <button
          onClick={() => { setRefreshing(true); loadDashboardData(); }}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-field/20 bg-white px-3 py-1.5 text-xs font-bold text-charcoal shadow-2xs hover:bg-mist transition-all active:scale-95"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-field ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Syncing..." : "Sync Live Data"}
        </button>
      </div>

      {/* ── Pending Verification Alert Banner (if pending cadets > 0) ── */}
      {stats.pendingCadets > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border-2 border-amber-300 bg-amber-50/90 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-500 text-white shadow-xs">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <strong className="block text-sm font-black text-amber-950">
                {stats.pendingCadets} Cadet {stats.pendingCadets === 1 ? "Application" : "Applications"} Awaiting Verification
              </strong>
              <p className="text-xs text-amber-800">
                New cadets have submitted registrations and require identity verification before they can sign in.
              </p>
            </div>
          </div>
          <Link
            href="/admin/applications"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-amber-700 transition-all active:scale-95"
          >
            Review All
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* ── Action Notification Message ── */}
      {actionMessage && (
        <div className="mb-6 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          {actionMessage}
        </div>
      )}

      {/* ── Live KPI Metrics Grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Cadets */}
        <div className="group relative overflow-hidden rounded-xl border border-field/15 bg-white p-5 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold uppercase tracking-widest text-slate">TOTAL CADETS</span>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-mist text-field border border-field/10">
              <Users className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-charcoal">
              {loading ? "..." : stats.totalCadets}
            </span>
            <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {stats.approvedCadets} Approved
            </span>
          </div>
          <p className="mt-2 text-2xs text-slate">Enrolled in San Enrique ROTC Unit</p>
        </div>

        {/* Pending Applications */}
        <div className="group relative overflow-hidden rounded-xl border border-field/15 bg-white p-5 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold uppercase tracking-widest text-slate">PENDING REVIEW</span>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
              <ClipboardList className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-amber-600">
              {loading ? "..." : stats.pendingCadets}
            </span>
            <span className="text-2xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Action Required
            </span>
          </div>
          <p className="mt-2 text-2xs text-slate">Awaiting administrative approval</p>
        </div>

        {/* Attendance Records */}
        <div className="group relative overflow-hidden rounded-xl border border-field/15 bg-white p-5 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold uppercase tracking-widest text-slate">DRILL ATTENDANCES</span>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-field/10 text-field border border-field/20">
              <ScanLine className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-charcoal">
              {loading ? "..." : stats.totalAttendances}
            </span>
            <span className="text-2xs font-bold text-field bg-field/5 px-2 py-0.5 rounded-md border border-field/20">
              {stats.totalSessions} Sessions
            </span>
          </div>
          <p className="mt-2 text-2xs text-slate">QR, Face & Manual scans recorded</p>
        </div>

        {/* Announcements & Bulletins */}
        <div className="group relative overflow-hidden rounded-xl border border-field/15 bg-white p-5 shadow-card hover:shadow-card-hover transition-all">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold uppercase tracking-widest text-slate">DISPATCHES & EVENTS</span>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Megaphone className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black tracking-tight text-charcoal">
              {loading ? "..." : stats.totalAnnouncements}
            </span>
            <span className="text-2xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              {stats.totalEvents} Events
            </span>
          </div>
          <p className="mt-2 text-2xs text-slate">Broadcast memos live on cadet portal</p>
        </div>
      </div>

      {/* ── Tactical Command Quick Launcher Bar ── */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-charcoal flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-brass" />
            TACTICAL QUICK LAUNCHER
          </h2>
          <span className="text-3xs font-mono text-slate">1-CLICK COMMAND TOOLS</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Admin Scanner */}
          <Link
            href="/admin/qr-scanner"
            className="group flex items-center gap-3.5 rounded-xl border border-field/20 bg-field p-3.5 text-white shadow-sm hover:bg-forest hover:shadow-md transition-all active:scale-[0.98]"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-dark/60 text-brass border border-brass/30">
              <ScanLine className="h-5 w-5" />
            </div>
            <div>
              <strong className="block text-xs font-bold uppercase tracking-wider">Launch Scanner</strong>
              <span className="text-2xs text-white/70">Admin QR & Face Scanner</span>
            </div>
          </Link>

          {/* 2. Attendance Ledger */}
          <Link
            href="/admin/attendance"
            className="group flex items-center gap-3.5 rounded-xl border border-field/15 bg-white p-3.5 text-charcoal shadow-xs hover:border-field/40 hover:bg-mist/60 hover:shadow transition-all active:scale-[0.98]"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mist text-field border border-field/10">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <strong className="block text-xs font-bold uppercase tracking-wider">Attendance Ledger</strong>
              <span className="text-2xs text-slate">Export AFP Excel / PDF</span>
            </div>
          </Link>

          {/* 3. Print QR Badges */}
          <Link
            href="/admin/cadets/print"
            className="group flex items-center gap-3.5 rounded-xl border border-field/15 bg-white p-3.5 text-charcoal shadow-xs hover:border-field/40 hover:bg-mist/60 hover:shadow transition-all active:scale-[0.98]"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mist text-field border border-field/10">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <strong className="block text-xs font-bold uppercase tracking-wider">Print QR Badges</strong>
              <span className="text-2xs text-slate">Batch print cadet ID passes</span>
            </div>
          </Link>

          {/* 4. Broadcast Dispatch */}
          <Link
            href="/admin/announcements"
            className="group flex items-center gap-3.5 rounded-xl border border-field/15 bg-white p-3.5 text-charcoal shadow-xs hover:border-field/40 hover:bg-mist/60 hover:shadow transition-all active:scale-[0.98]"
          >
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mist text-field border border-field/10">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <strong className="block text-xs font-bold uppercase tracking-wider">Post Dispatch</strong>
              <span className="text-2xs text-slate">Publish memo to mobile app</span>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Two-Column Operational Split ── */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Left Column: Inline Pending Verification Queue */}
        <div className="rounded-xl border border-field/15 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between border-b border-field/10 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-black text-charcoal tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-field" />
                PENDING VERIFICATION QUEUE
              </h3>
              <p className="text-2xs text-slate mt-0.5">Quickly verify recently submitted cadet registrations</p>
            </div>
            <Link
              href="/admin/applications"
              className="text-2xs font-bold uppercase tracking-wider text-field hover:text-forest flex items-center gap-1"
            >
              View Full Queue <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate">Loading pending registrations...</div>
          ) : pendingList.length === 0 ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
              <strong className="block text-xs font-bold text-charcoal">Queue is Clear!</strong>
              <p className="text-2xs text-slate mt-1">All registered cadets have been verified and processed.</p>
            </div>
          ) : (
            <div className="divide-y divide-field/10">
              {pendingList.map((cadet) => (
                <div key={cadet.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-field/10 border border-field/20 grid place-items-center shrink-0 font-bold text-xs text-field">
                      {cadet.first_name[0]}{cadet.last_name[0]}
                    </div>
                    <div className="min-w-0">
                      <strong className="block text-xs font-bold text-charcoal truncate">
                        {cadet.first_name} {cadet.last_name}
                      </strong>
                      <span className="text-3xs font-mono text-field font-semibold">
                        ID: {cadet.student_id} • {cadet.course} {cadet.year_level}
                      </span>
                      <span className="block text-3xs text-slate">
                        Submitted {new Date(cadet.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      onClick={() => handleQuickApprove(cadet.id, "approved")}
                      className="inline-flex items-center gap-1 rounded-md bg-field px-2.5 py-1.5 text-2xs font-bold text-white shadow-2xs hover:bg-forest transition-colors"
                      title="Approve Cadet"
                    >
                      <Check className="h-3 w-3" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleQuickApprove(cadet.id, "rejected")}
                      className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-2xs font-bold text-red-700 hover:bg-red-100 transition-colors"
                      title="Reject Cadet"
                    >
                      <X className="h-3 w-3" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Recent Drill Attendance Feed */}
        <div className="rounded-xl border border-field/15 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between border-b border-field/10 pb-3 mb-4">
            <div>
              <h3 className="text-sm font-black text-charcoal tracking-tight flex items-center gap-2">
                <Clock className="h-4 w-4 text-field" />
                RECENT DRILL SCANS
              </h3>
              <p className="text-2xs text-slate mt-0.5">Live attendance verification activity</p>
            </div>
            <Link
              href="/admin/attendance"
              className="text-2xs font-bold uppercase tracking-wider text-field hover:text-forest flex items-center gap-1"
            >
              Ledger <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate">Loading attendance stream...</div>
          ) : recentAttendance.length === 0 ? (
            <div className="py-10 text-center">
              <ScanLine className="mx-auto h-8 w-8 text-slate/40 mb-2" />
              <strong className="block text-xs font-bold text-charcoal">No Scans Recorded Yet</strong>
              <p className="text-2xs text-slate mt-1">Attendance scans from mobile or web QR scanner will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-field/10">
              {recentAttendance.map((rec) => (
                <div key={rec.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <strong className="block text-xs font-bold text-charcoal truncate">
                      {rec.profiles ? `${rec.profiles.first_name} ${rec.profiles.last_name}` : "Cadet"}
                    </strong>
                    <span className="text-3xs text-slate font-mono">
                      {rec.attendance_sessions?.title || "Drill Session"}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block text-3xs font-mono font-bold uppercase rounded-sm bg-mist px-1.5 py-0.5 text-field border border-field/10">
                      {rec.method || "QR"}
                    </span>
                    <span className="block text-3xs text-slate mt-0.5">
                      {new Date(rec.scanned_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalShell>
  );
}
