import { PortalShell } from "@/components/portal-shell";
import { PortalStatCard } from "@/components/ui";
import { Users, ClipboardList, CheckCircle, Calendar, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const metrics = [
    { label: "Cadet Records", value: "Open", icon: <Users className="h-5 w-5" />, accent: "default" as const },
    { label: "Applications", value: "Review", icon: <ClipboardList className="h-5 w-5" />, accent: "gold" as const },
    { label: "Approvals", value: "Manage", icon: <CheckCircle className="h-5 w-5" />, accent: "green" as const },
    { label: "Attendance Today", value: "Scan", icon: <CheckCircle className="h-5 w-5" />, accent: "default" as const },
    { label: "Training Events", value: "Plan", icon: <Calendar className="h-5 w-5" />, accent: "blue" as const },
    { label: "Inquiries", value: "Open", icon: <MessageSquare className="h-5 w-5" />, accent: "red" as const },
  ];

  return (
    <PortalShell
      type="admin"
      title="Command Overview"
      subtitle="Real-time personnel statistics, application reviews, and operational updates."
      currentPath="/admin"
    >
      {/* Quick Actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/cadets"
            className="inline-flex items-center gap-2 rounded-md bg-field px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-forest"
          >
            Manage Cadets
          </Link>
          <Link
            href="/admin/applications"
            className="inline-flex items-center gap-2 rounded-md border border-field/20 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-charcoal shadow-sm transition-all hover:bg-mist"
          >
            Review Applications
          </Link>
          <Link
            href="/admin/id-cards"
            className="inline-flex items-center gap-2 rounded-md border border-field/20 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-charcoal shadow-sm transition-all hover:bg-mist"
          >
            Digital ID Rollout
          </Link>
        </div>
        <span className="text-2xs font-semibold text-slate">
          Fast dashboard mode. Open each module for live Supabase records.
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((item) => (
          <PortalStatCard
            key={item.label}
            label={item.label}
            value={item.value}
            icon={item.icon}
            accent={item.accent}
          />
        ))}
      </div>

      {/* Operational Highlights Box */}
      <div className="mt-8 rounded-xl border border-field/10 bg-white p-6 shadow-card">
        <h2 className="text-base font-bold text-charcoal">Quick Navigation & Guidance</h2>
        <p className="mt-1 text-xs text-slate">
          Verify and approve pending cadet submissions before they can log in to the Android application.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/applications"
            className="group flex items-center justify-between rounded-lg border border-field/10 bg-mist/40 p-4 transition-colors hover:border-field/30 hover:bg-mist"
          >
            <div>
              <strong className="block text-sm font-bold text-charcoal">Review Submissions</strong>
              <span className="text-2xs text-slate">Check student IDs & verification photos</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate transition-transform group-hover:translate-x-1 group-hover:text-field" />
          </Link>

          <Link
            href="/admin/attendance"
            className="group flex items-center justify-between rounded-lg border border-field/10 bg-mist/40 p-4 transition-colors hover:border-field/30 hover:bg-mist"
          >
            <div>
              <strong className="block text-sm font-bold text-charcoal">QR Attendance Sessions</strong>
              <span className="text-2xs text-slate">Generate live session tokens for drill events</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate transition-transform group-hover:translate-x-1 group-hover:text-field" />
          </Link>

          <Link
            href="/admin/announcements"
            className="group flex items-center justify-between rounded-lg border border-field/10 bg-mist/40 p-4 transition-colors hover:border-field/30 hover:bg-mist"
          >
            <div>
              <strong className="block text-sm font-bold text-charcoal">Publish Dispatches</strong>
              <span className="text-2xs text-slate">Broadcast memos to the mobile app & web</span>
            </div>
            <ArrowRight className="h-4 w-4 text-slate transition-transform group-hover:translate-x-1 group-hover:text-field" />
          </Link>
        </div>
      </div>
    </PortalShell>
  );
}
