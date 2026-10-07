"use client";

import { Check, Eye, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal-shell";
import { StatusBadge } from "@/components/ui";
import { createBrowserClient } from "@/lib/supabase/client";

type ApplicationRow = {
  id: string;
  profile_id: string | null;
  full_name: string;
  student_id: string;
  course: string;
  year_level: string;
  section: string | null;
  status: string;
  created_at: string;
};

export default function ApplicationsPage() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadApplications() {
    setLoading(true);
    setMessage("");

    let request = supabase
      .from("applications")
      .select("id,profile_id,full_name,student_id,course,year_level,section,status,created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (query.trim()) {
      const safeQuery = query.trim().replaceAll("%", "");
      request = request.or(`full_name.ilike.%${safeQuery}%,student_id.ilike.%${safeQuery}%`);
    }

    if (statusFilter !== "all") request = request.eq("status", statusFilter);

    const { data, error } = await request;
    if (error) {
      setApplications([]);
      setMessage(error.message);
    } else {
      setApplications((data ?? []) as ApplicationRow[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadApplications();
  }, []);

  async function reviewApplication(id: string, status: "under_review" | "approved" | "rejected") {
    const application = applications.find((item) => item.id === id);
    const reviewedAt = new Date().toISOString();
    setMessage("");

    const { error } = await supabase.from("applications").update({ status, reviewed_at: reviewedAt }).eq("id", id);
    if (error) {
      setMessage(error.message);
      return;
    }

    if (application?.profile_id) {
      if (status === "approved") {
        await supabase.from("profiles").update({ status: "approved" }).eq("id", application.profile_id).eq("role", "cadet");
        await supabase.from("cadets").upsert(
          {
            profile_id: application.profile_id,
            cadet_number: application.student_id,
            unit: application.section ?? "SAN ENRIQUE ROTC",
            activated_at: reviewedAt,
          },
          { onConflict: "profile_id" },
        );
      }

      if (status === "rejected") {
        await supabase.from("profiles").update({ status: "rejected" }).eq("id", application.profile_id).eq("role", "cadet");
      }
    }

    await supabase.from("audit_logs").insert({
      action: `application_${status}`,
      entity_type: "applications",
      entity_id: id,
      details: { status },
    });

    await loadApplications();
  }

  return (
    <PortalShell
      type="admin"
      title="Application Submissions"
      subtitle="Examine incoming cadet enrollees, mark under review, and render approval decisions."
      currentPath="/admin/applications"
    >
      <div className="mb-6 rounded-xl border border-field/10 bg-white p-4 shadow-card">
        <form
          className="grid gap-3 sm:grid-cols-[1fr_180px_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            loadApplications();
          }}
        >
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-slate/50" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by cadet name or student ID..."
              className="w-full rounded-md border border-field/20 bg-white py-2 pl-10 pr-3 text-xs text-charcoal focus:border-field focus:outline-none focus:ring-2 focus:ring-field/15"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-md border border-field/20 bg-white px-3 py-2 text-xs font-semibold text-charcoal focus:border-field focus:outline-none focus:ring-2 focus:ring-field/15"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <button type="submit" className="rounded-md bg-field px-5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-forest">
            Apply Filter
          </button>
        </form>
      </div>

      {message ? <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{message}</div> : null}

      <div className="rounded-xl border border-field/10 bg-white shadow-card">
        <div className="flex flex-wrap items-center justify-between border-b border-field/10 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-charcoal">Enrollee Applications</h2>
            <p className="text-2xs text-slate">{loading ? "Loading submissions..." : `Showing ${applications.length} submissions`}</p>
          </div>
          <span className="text-xs font-semibold text-slate">Actions are enforced by Supabase RLS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-field/10 bg-mist/60 text-xs font-bold uppercase tracking-wider text-charcoal">
              <tr>
                <th className="px-5 py-3.5">Applicant Name</th>
                <th className="px-5 py-3.5">Student ID</th>
                <th className="px-5 py-3.5">Course / Year</th>
                <th className="px-5 py-3.5">Submitted Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-field/10">
              {applications.length ? (
                applications.map((app) => (
                  <tr key={app.id} className="transition-colors hover:bg-mist/30">
                    <td className="px-5 py-4 font-semibold text-charcoal">{app.full_name}</td>
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate">{app.student_id}</td>
                    <td className="px-5 py-4 text-xs text-charcoal">
                      {app.course} <span className="text-slate">({app.year_level})</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate">{new Date(app.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4"><StatusBadge status={app.status} /></td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <ReviewButton label="Review" icon={<Eye className="h-3.5 w-3.5" />} variant="review" onClick={() => reviewApplication(app.id, "under_review")} />
                        <ReviewButton label="Approve" icon={<Check className="h-3.5 w-3.5" />} variant="approve" onClick={() => reviewApplication(app.id, "approved")} />
                        <ReviewButton label="Reject" icon={<X className="h-3.5 w-3.5" />} variant="reject" onClick={() => reviewApplication(app.id, "rejected")} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-xs text-slate">
                    {loading ? "Loading applications..." : "No applications found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  );
}

function ReviewButton({ label, icon, variant, onClick }: { label: string; icon: React.ReactNode; variant: "review" | "approve" | "reject"; onClick: () => void }) {
  const styles = {
    review: "border border-blue-200 bg-white text-blue-700 hover:bg-blue-50",
    approve: "bg-emerald-600 text-white hover:bg-emerald-700",
    reject: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] ${styles[variant]}`}
    >
      {icon}
      {label}
    </button>
  );
}
