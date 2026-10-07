"use client";

import { useEffect, useState } from "react";
import { Plus, Calendar, Clock, MapPin, Users, CheckCircle2, PauseCircle, PlayCircle, AlertCircle } from "lucide-react";
import { PortalCard, PortalShell } from "@/components/portal-shell";
import { createBrowserClient } from "@/lib/supabase/client";

type AttendanceSession = {
  id: string;
  title: string;
  session_type: string;
  session_date: string;
  location: string;
  is_open: boolean;
  status: string;
  created_at: string;
};

export default function AdminAttendanceSessionsPage() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [sessionType, setSessionType] = useState("Regular formation");
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState("San Enrique ROTC Parade Grounds");
  const [creating, setCreating] = useState(false);

  const supabase = createBrowserClient();

  const loadSessions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("attendance_sessions")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSessions(data as AttendanceSession[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    setErrorMsg(null);

    // Fetch admin profile
    const { data: userData } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", userData.user?.id || "")
      .single();

    // Create session
    const { error } = await supabase.from("attendance_sessions").insert({
      title: title.trim(),
      session_type: sessionType,
      session_date: sessionDate,
      location: location.trim(),
      is_open: true,
      status: "active",
      created_by: profile?.id || null,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setShowCreateModal(false);
      setTitle("");
      loadSessions();
    }
    setCreating(false);
  };

  const toggleSessionStatus = async (session: AttendanceSession) => {
    const nextIsOpen = !session.is_open;
    const nextStatus = nextIsOpen ? "active" : "completed";

    await supabase
      .from("attendance_sessions")
      .update({ is_open: nextIsOpen, status: nextStatus })
      .eq("id", session.id);

    loadSessions();
  };

  return (
    <PortalShell
      type="admin"
      title="Attendance Session Management"
      subtitle="Create, schedule, pause, and conclude drill formations. Active sessions are scanned via the Admin QR Scanner."
      currentPath="/admin/attendance-sessions"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-charcoal">All Formation Sessions</h2>
          <p className="text-xs text-slate">Manage operational assembly sessions for the ROTC unit.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-field px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-forest transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4 text-brass" />
          Create New Session
        </button>
      </div>

      {/* Sessions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`rounded-xl border bg-white p-5 shadow-card transition-all ${
              s.is_open ? "border-emerald-300 ring-1 ring-emerald-200" : "border-field/10"
            }`}
          >
            <div className="flex items-start justify-between">
              <span
                className={`rounded px-2 py-0.5 text-3xs font-bold uppercase ${
                  s.is_open ? "bg-emerald-100 text-emerald-800" : "bg-slate/10 text-slate"
                }`}
              >
                {s.is_open ? "ACTIVE NOW" : s.status || "CONCLUDED"}
              </span>
              <button
                onClick={() => toggleSessionStatus(s)}
                type="button"
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-3xs font-bold transition-colors ${
                  s.is_open
                    ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                {s.is_open ? (
                  <>
                    <PauseCircle className="h-3 w-3" /> End Session
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-3 w-3" /> Reopen
                  </>
                )}
              </button>
            </div>

            <h3 className="mt-3 text-base font-bold text-charcoal">{s.title}</h3>
            <p className="text-xs font-semibold text-brass mt-0.5">{s.session_type || "Formation Drill"}</p>

            <div className="mt-4 space-y-2 border-t border-field/10 pt-3 text-xs text-slate">
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-field" />
                <span>Date: {s.session_date}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-field" />
                <span className="truncate">{s.location || "Parade Grounds"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sessions.length === 0 && !loading && (
        <div className="rounded-xl border border-dashed border-field/20 p-12 text-center text-slate">
          No attendance sessions created yet. Click &quot;Create New Session&quot; to begin.
        </div>
      )}

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/75 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-brass/30 bg-white p-6 shadow-2xl animate-fade-up">
            <h3 className="text-lg font-bold text-charcoal">Create Attendance Session</h3>
            <p className="mt-1 text-xs text-slate">
              Configure a drill assembly session. Cadets can immediately be scanned once active.
            </p>

            <form onSubmit={handleCreateSession} className="mt-5 space-y-4 text-xs">
              <label className="grid gap-1.5 font-medium text-charcoal">
                Session Title *
                <input
                  type="text"
                  required
                  placeholder="e.g. Saturday Drill & Ceremony"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-md border border-field/20 px-3 py-2 text-sm text-charcoal focus:border-field focus:outline-none"
                />
              </label>

              <label className="grid gap-1.5 font-medium text-charcoal">
                Session Type
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                  className="rounded-md border border-field/20 px-3 py-2 text-sm text-charcoal focus:border-field focus:outline-none"
                >
                  <option value="Regular formation">Regular formation</option>
                  <option value="Physical training">Physical training</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Lecture">Lecture</option>
                  <option value="Special event">Special event</option>
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1.5 font-medium text-charcoal">
                  Date
                  <input
                    type="date"
                    required
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="rounded-md border border-field/20 px-3 py-2 text-sm text-charcoal focus:border-field focus:outline-none"
                  />
                </label>
                <label className="grid gap-1.5 font-medium text-charcoal">
                  Location
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="rounded-md border border-field/20 px-3 py-2 text-sm text-charcoal focus:border-field focus:outline-none"
                  />
                </label>
              </div>

              {errorMsg && (
                <div className="rounded-md border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-field/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-md border border-field/20 px-4 py-2 text-xs font-semibold text-slate hover:bg-mist"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-md bg-field px-4 py-2 text-xs font-bold text-white hover:bg-forest disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Start Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
