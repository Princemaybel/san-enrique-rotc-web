"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal-shell";
import { PortalStatCard, StatusBadge, Alert, EmptyState } from "@/components/ui";
import {
  Bell,
  Calendar,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  IdCard,
  QrCode,
  Shield,
  User,
} from "lucide-react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase/client";

/* ─── Types ─────────────────────────────────────────────────────── */
interface Profile {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  student_id: string | null;
  course: string | null;
  year_level: string | null;
  section: string | null;
  status: string | null;
  role: string;
  user_id: string;
}

interface Application {
  id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected" | "under_review";
}

interface AttendanceStats {
  total: number;
  present: number;
  late: number;
  absent: number;
}

/* ─── Attendance Ring ────────────────────────────────────────────── */
function AttendanceRing({ percentage }: { percentage: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percentage));
  const offset = circumference - (clamped / 100) * circumference;

  const color =
    clamped >= 80 ? "#1F5D3A" : clamped >= 60 ? "#B88A32" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={88} height={88} viewBox="0 0 88 88" aria-hidden="true">
        <circle
          cx={44}
          cy={44}
          r={radius}
          fill="none"
          stroke="#EEF5EF"
          strokeWidth={10}
        />
        <circle
          cx={44}
          cy={44}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 44 44)"
        />
      </svg>
      <span className="absolute text-sm font-bold text-charcoal">
        {clamped}%
      </span>
    </div>
  );
}

/* ─── Quick Action Button ────────────────────────────────────────── */
function QuickAction({
  href,
  icon,
  label,
  sublabel,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border border-field/10 bg-white px-4 py-3 shadow-card transition-all hover:bg-mist hover:shadow-card-hover active:scale-[0.98]"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-mist text-field">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-charcoal">{label}</p>
        <p className="truncate text-2xs text-slate">{sublabel}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate/50" aria-hidden />
    </Link>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function CadetDashboardPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [attendance, setAttendance] = useState<AttendanceStats>({
    total: 0,
    present: 0,
    late: 0,
    absent: 0,
  });
  const [unreadCount, setUnreadCount] = useState(0);

  /* ── Date ── */
  const today = new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const supabase = createBrowserClient();

        /* 1. Auth */
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          setError("You must be signed in to view the dashboard.");
          setLoading(false);
          return;
        }

        const uid = user.id;

        /* 2. Profile */
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, first_name, middle_name, last_name, student_id, course, year_level, section, status, role, user_id")
          .eq("user_id", uid)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          throw new Error(profileError.message);
        }

        setProfile(profileData ?? null);

        /* 3. Application status */
        const { data: appData } = await supabase
          .from("applications")
          .select("id, user_id, status")
          .eq("user_id", uid)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        setApplication(appData ?? null);

        /* 4. Attendance stats (via profile id as cadet_id) */
        if (profileData?.id) {
          const { data: attData, error: attError } = await supabase
            .from("attendance_records")
            .select("status")
            .eq("cadet_id", profileData.id);

          if (attError) throw new Error(attError.message);

          const records = attData ?? [];
          const stats: AttendanceStats = {
            total: records.length,
            present: records.filter((r) => r.status === "PRESENT").length,
            late: records.filter((r) => r.status === "LATE").length,
            absent: records.filter((r) => r.status === "ABSENT").length,
          };
          setAttendance(stats);
        }

        /* 5. Unread notifications */
        if (profileData?.id) {
          const { count, error: notificationError } = await supabase
            .from("notifications")
            .select("id", { count: "exact", head: true })
            .eq("profile_id", profileData.id)
            .eq("is_read", false);

          if (notificationError) throw new Error(notificationError.message);
          setUnreadCount(count ?? 0);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, []);

  /* ── Derived ── */
  const attendancePct =
    attendance.total > 0
      ? Math.round(((attendance.present + attendance.late * 0.5) / attendance.total) * 100)
      : 0;

  const fullName = profile
    ? [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(" ")
    : "";
  const firstName = profile?.first_name ?? "Cadet";

  /* ── Render ── */
  return (
    <PortalShell
      type="cadet"
      title="Cadet Operations Center"
      subtitle="Your personal ROTC profile, attendance status, upcoming assemblies, and military ID."
      currentPath="/cadet"
    >
      <div className="space-y-6">

        {/* Error alert */}
        {error && <Alert variant="error">{error}</Alert>}

        {/* ── Welcome Banner ── */}
        <div className="relative overflow-hidden rounded-xl border border-field/15 bg-gradient-to-br from-charcoal via-forest to-field px-6 py-6 shadow-card">
          {/* decorative shield */}
          <Shield
            className="absolute -right-6 -top-6 h-32 w-32 text-white/5"
            aria-hidden
          />
          <p className="text-xs font-semibold uppercase tracking-widest text-brass">
            {loading ? "Syncing cadet records..." : today}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white">
            Welcome back, {firstName}!
          </h2>
          <p className="mt-1 text-sm text-white/65">
            {profile
              ? `${profile.course ?? "—"} · ${profile.section ?? "Section —"} · ${profile.year_level ?? "Year —"}`
              : "Complete your profile to see your unit information."}
          </p>

          {application && (
            <div className="mt-4">
              <StatusBadge status={application.status} />
            </div>
          )}
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <PortalStatCard
            label="Enrollment Status"
            value={application ? application.status.replace(/_/g, " ") : "Not Applied"}
            icon={<User className="h-5 w-5" />}
            accent={
              application?.status === "approved"
                ? "green"
                : application?.status === "rejected"
                ? "red"
                : "gold"
            }
          />
          <PortalStatCard
            label="Attendance Rate"
            value={`${attendancePct}%`}
            icon={<CheckCircle className="h-5 w-5" />}
            accent={attendancePct >= 80 ? "green" : attendancePct > 0 ? "gold" : "default"}
          />
          <PortalStatCard
            label="Formations Logged"
            value={attendance.total}
            icon={<Calendar className="h-5 w-5" />}
            accent="default"
          />
          <PortalStatCard
            label="Unread Notifications"
            value={unreadCount > 0 ? `${unreadCount} Unread` : "All Clear"}
            icon={<Bell className="h-5 w-5" />}
            accent={unreadCount > 0 ? "gold" : "default"}
          />
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* ── Left column: ID Card + QR Card ── */}
          <div className="space-y-5 lg:col-span-2">

            {/* Digital ID Card */}
            <div className="flex flex-col justify-between rounded-xl border border-field/10 bg-white p-6 shadow-card">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-mist text-field">
                  <IdCard className="h-6 w-6 text-brass" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-charcoal">Official Digital Cadet ID</h3>
                  <p className="text-2xs text-slate">
                    Cryptographically verified military identification pass
                  </p>
                </div>
                {application?.status === "approved" && (
                  <StatusBadge status="approved" />
                )}
              </div>

              {/* ID preview strip */}
              <div className="my-5 flex items-center gap-4 rounded-lg border border-dashed border-field/20 bg-mist/60 p-4">
                <span className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-charcoal/10 text-2xl font-bold text-charcoal">
                  {firstName.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-charcoal">
                    {fullName || "—"}
                  </p>
                  <p className="text-xs text-slate">
                    {profile?.student_id ?? "Student ID Pending"}
                  </p>
                  <p className="text-xs text-slate">
                    {profile?.section ?? "Section —"} · {profile?.year_level ?? "Year —"}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-field/20" aria-hidden />
              </div>

              <div className="border-t border-field/10 pt-4">
                <Link
                  href="/cadet/digital-id"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-field px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-forest active:scale-[0.98]"
                >
                  <IdCard className="h-4 w-4" aria-hidden />
                  View Digital Cadet ID
                </Link>
              </div>
            </div>

            {/* QR Card */}
            <div className="flex flex-col justify-between rounded-xl border border-field/10 bg-white p-6 shadow-card">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-mist">
                  <QrCode className="h-6 w-6 text-brass" aria-hidden />
                </span>
                <div>
                  <h3 className="font-bold text-charcoal">QR Attendance Pass</h3>
                  <p className="text-2xs text-slate">
                    Fast attendance validation for drill-day formations
                  </p>
                </div>
              </div>

              {/* QR preview placeholder */}
              <div className="my-5 flex items-center justify-center rounded-lg border border-dashed border-field/20 bg-mist/60 py-6">
                <div className="text-center">
                  <QrCode className="mx-auto h-12 w-12 text-field/30" aria-hidden />
                  <p className="mt-2 text-xs font-semibold text-slate">
                    Tap to reveal your live QR code
                  </p>
                </div>
              </div>

              <div className="border-t border-field/10 pt-4">
                <Link
                  href="/cadet/my-qr"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-field/20 bg-white px-4 py-2 text-xs font-semibold text-charcoal transition-all hover:bg-mist active:scale-[0.98]"
                >
                  <QrCode className="h-4 w-4" aria-hidden />
                  Open My QR Pass
                </Link>
              </div>
            </div>
          </div>

          {/* ── Right column: Attendance ring + Quick actions ── */}
          <div className="space-y-5">

            {/* Attendance ring card */}
            <div className="rounded-xl border border-field/10 bg-white p-6 shadow-card">
              <h3 className="text-sm font-bold text-charcoal">Attendance Overview</h3>
              <p className="text-2xs text-slate">Based on recorded formation entries</p>

              <div className="mt-5 flex items-center gap-5">
                <AttendanceRing percentage={attendancePct} />
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-field" />
                    <span className="text-slate">
                      Present:{" "}
                      <strong className="text-charcoal">{attendance.present}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-brass" />
                    <span className="text-slate">
                      Late:{" "}
                      <strong className="text-charcoal">{attendance.late}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    <span className="text-slate">
                      Absent:{" "}
                      <strong className="text-charcoal">{attendance.absent}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {attendance.total === 0 && (
                <p className="mt-4 text-center text-2xs text-slate">
                  No formations recorded yet.
                </p>
              )}
            </div>

            {/* Quick actions */}
            <div className="rounded-xl border border-field/10 bg-white p-5 shadow-card">
              <h3 className="mb-3 text-sm font-bold text-charcoal">Quick Actions</h3>
              <div className="space-y-2">
                <QuickAction
                  href="/cadet/my-qr"
                  icon={<QrCode className="h-4 w-4" />}
                  label="View My QR Pass"
                  sublabel="Open attendance QR code"
                />
                <QuickAction
                  href="/cadet/digital-id"
                  icon={<IdCard className="h-4 w-4" />}
                  label="View Digital ID"
                  sublabel="Open digital cadet ID card"
                />
                <QuickAction
                  href="/cadet/attendance"
                  icon={<ClipboardList className="h-4 w-4" />}
                  label="Attendance History"
                  sublabel="View full formation ledger"
                />
                <QuickAction
                  href="/cadet/notifications"
                  icon={
                    <div className="relative">
                      <Bell className="h-4 w-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-brass text-[8px] font-bold text-white">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </div>
                  }
                  label="Notifications"
                  sublabel={
                    unreadCount > 0
                      ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}`
                      : "No new notifications"
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Profile Info Strip ── */}
        {profile ? (
          <div className="rounded-xl border border-field/10 bg-white p-6 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-charcoal">Cadet Profile Summary</h3>
              <Link
                href="/cadet/profile"
                className="text-xs font-semibold text-field hover:underline"
              >
                Edit Profile →
              </Link>
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {(
                [
                  { label: "Full Name", value: fullName },
                  { label: "Student ID", value: profile.student_id ?? "—" },
                  { label: "Course", value: profile.course ?? "—" },
                  { label: "Status", value: profile.status ?? "—" },
                  { label: "Year Level", value: profile.year_level ?? "—" },
                  { label: "Section", value: profile.section ?? "—" },
                ] as { label: string; value: string }[]
              ).map(({ label, value }) => (
                <div key={label}>
                  <dt className="text-2xs font-semibold uppercase tracking-wider text-slate">
                    {label}
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-charcoal">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : !error ? (
          <EmptyState
            icon={<User className="h-6 w-6" />}
            title="Profile Not Set Up"
            body="Your cadet profile has not been created yet. Please complete your application to generate your profile record."
          />
        ) : null}
      </div>
    </PortalShell>
  );
}
