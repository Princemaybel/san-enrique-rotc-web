"use client";

import Link from "next/link";
import { Check, Printer, QrCode, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ExportCsvButton } from "@/components/export-csv-button";
import { PortalShell } from "@/components/portal-shell";
import { StatusBadge } from "@/components/ui";
import { createBrowserClient } from "@/lib/supabase/client";

type CadetRow = {
  id: string;
  first_name: string;
  last_name: string;
  student_id: string;
  email: string;
  course: string;
  year_level: string;
  section: string | null;
  status: string;
  created_at: string;
};

export default function CadetsPage() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [cadets, setCadets] = useState<CadetRow[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadCadets() {
    setLoading(true);
    setMessage("");

    let request = supabase
      .from("profiles")
      .select("id,first_name,last_name,student_id,email,course,year_level,section,status,created_at")
      .eq("role", "cadet")
      .order("created_at", { ascending: false });

    if (query.trim()) {
      const safeQuery = query.trim().replaceAll("%", "");
      request = request.or(`first_name.ilike.%${safeQuery}%,last_name.ilike.%${safeQuery}%,student_id.ilike.%${safeQuery}%,email.ilike.%${safeQuery}%`);
    }
    if (statusFilter !== "all") request = request.eq("status", statusFilter);

    const { data, error } = await request;
    if (error) {
      setCadets([]);
      setMessage(error.message);
    } else {
      setCadets((data ?? []) as CadetRow[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadCadets();
  }, []);

  async function updateCadetStatus(id: string, status: "approved" | "rejected") {
    setMessage("");
    try {
      const response = await fetch("/api/admin/cadets/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cadetId: id, status }),
      });
      const result = await response.json();
      if (!result.ok) {
        setMessage(result.error || "Failed to update cadet status.");
        return;
      }
      await loadCadets();
    } catch (err: any) {
      setMessage(err?.message || "Failed to update cadet status.");
    }
  }

  const csvHeaders = ["Cadet Name", "Student ID", "Email", "Course", "Year Level", "Section", "Status", "Registered Date"];
  const csvRows = cadets.map((cadet) => [
    `${cadet.first_name} ${cadet.last_name}`,
    cadet.student_id,
    cadet.email,
    cadet.course,
    cadet.year_level,
    cadet.section ?? "Unassigned",
    cadet.status,
    new Date(cadet.created_at).toISOString().slice(0, 10),
  ]);

  return (
    <PortalShell
      type="admin"
      title="Cadet Personnel Roster"
      subtitle="Verify, activate, or suspend registered cadet profiles."
      currentPath="/admin/cadets"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-field/10 bg-white p-4 shadow-card">
        <form
          className="grid flex-1 gap-3 sm:grid-cols-[1fr_180px_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            loadCadets();
          }}
        >
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-slate/50" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, student ID, or email..."
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
            <option value="inactive">Inactive</option>
          </select>

          <button type="submit" className="rounded-md bg-field px-5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-forest">
            Apply Filter
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/cadets/print"
            className="inline-flex items-center gap-1.5 rounded-md bg-field px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-forest"
          >
            <Printer className="h-3.5 w-3.5 text-brass" />
            Print QR Badges
          </Link>
          <ExportCsvButton filename="SE_ROTC_Cadet_Roster" headers={csvHeaders} rows={csvRows} label="Export Roster (CSV)" />
        </div>
      </div>

      {message ? <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{message}</div> : null}

      <div className="rounded-xl border border-field/10 bg-white shadow-card">
        <div className="flex flex-wrap items-center justify-between border-b border-field/10 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-charcoal">Enlisted Cadets</h2>
            <p className="text-2xs text-slate">{loading ? "Loading roster..." : `Total profiles displayed: ${cadets.length}`}</p>
          </div>
          <span className="text-xs font-semibold text-slate">RLS restricts this roster to approved admins</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-field/10 bg-mist/60 text-xs font-bold uppercase tracking-wider text-charcoal">
              <tr>
                <th className="px-5 py-3.5">Cadet Name & Email</th>
                <th className="px-5 py-3.5">Student ID</th>
                <th className="px-5 py-3.5">Course / Year</th>
                <th className="px-5 py-3.5">Unit / Section</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-field/10">
              {cadets.length ? (
                cadets.map((cadet) => (
                  <tr key={cadet.id} className="transition-colors hover:bg-mist/30">
                    <td className="px-5 py-4">
                      <strong className="block font-semibold text-charcoal">{cadet.first_name} {cadet.last_name}</strong>
                      <span className="text-xs text-slate">{cadet.email}</span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs font-semibold text-slate">{cadet.student_id}</td>
                    <td className="px-5 py-4 text-xs font-medium text-charcoal">{cadet.course} <span className="text-slate">({cadet.year_level})</span></td>
                    <td className="px-5 py-4 text-xs font-medium text-charcoal">{cadet.section ?? "Unassigned"}</td>
                    <td className="px-5 py-4"><StatusBadge status={cadet.status} /></td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <StatusButton label="Approve" icon={<Check className="h-3.5 w-3.5" />} variant="approve" onClick={() => updateCadetStatus(cadet.id, "approved")} />
                        <StatusButton label="Reject" icon={<X className="h-3.5 w-3.5" />} variant="reject" onClick={() => updateCadetStatus(cadet.id, "rejected")} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-xs text-slate">
                    {loading ? "Loading cadets..." : "No cadets found matching the search criteria."}
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

function StatusButton({ label, icon, variant, onClick }: { label: string; icon: React.ReactNode; variant: "approve" | "reject"; onClick: () => void }) {
  const isApprove = variant === "approve";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold shadow-xs transition-all active:scale-[0.98] ${
        isApprove ? "bg-emerald-600 text-white hover:bg-emerald-700" : "border border-red-200 bg-white text-red-700 hover:bg-red-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
