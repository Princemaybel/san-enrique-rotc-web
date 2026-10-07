import { PortalCard, PortalShell } from "@/components/portal-shell";
import { Shield, Clock, UserCheck, Key, FileEdit, CheckCircle2 } from "lucide-react";

export default function AdminAuditLogsPage() {
  const auditEvents = [
    {
      id: "evt-001",
      action: "CADET_APPLICATION_APPROVED",
      actor: "Commandant Admin (admin@sanenrique.edu.ph)",
      target: "Cadet Juan dela Cruz (2024-0001)",
      timestamp: "Today at 08:32:15",
      status: "SUCCESS",
      ip: "192.168.1.104",
    },
    {
      id: "evt-002",
      action: "QR_SESSION_TOKEN_ROTATED",
      actor: "Commandant Admin (admin@sanenrique.edu.ph)",
      target: "Session: Alpha Platoon Saturday Drill",
      timestamp: "Today at 08:15:00",
      status: "SUCCESS",
      ip: "192.168.1.104",
    },
    {
      id: "evt-003",
      action: "DIGITAL_ID_GENERATED",
      actor: "System Auth Service",
      target: "Cadet Maria Santos (2024-0002)",
      timestamp: "Yesterday at 16:40:22",
      status: "SUCCESS",
      ip: "Supabase Service Role",
    },
    {
      id: "evt-004",
      action: "ANNOUNCEMENT_PUBLISHED",
      actor: "Operations Officer",
      target: "Notice: Bring school ID to formations",
      timestamp: "Sep 12, 2026 at 14:10:05",
      status: "SUCCESS",
      ip: "192.168.1.112",
    },
  ];

  return (
    <PortalShell
      type="admin"
      title="System Audit Trail & Security Ledger"
      subtitle="Immutable activity ledger recording administrative decisions, approvals, and authorization events."
      currentPath="/admin/audit-logs"
    >
      <div className="rounded-xl border border-field/10 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-field/10 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-charcoal">Security & Compliance Log</h2>
            <p className="text-2xs text-slate">Recording all write operations executed across Supabase</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-field">
            <Shield className="h-4 w-4" /> Tamper-Evident Trail
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-field/10 bg-mist/60 text-xs font-bold uppercase tracking-wider text-charcoal">
              <tr>
                <th className="px-5 py-3.5">Action Event</th>
                <th className="px-5 py-3.5">Administrator / Actor</th>
                <th className="px-5 py-3.5">Target Entity</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Origin IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-field/10">
              {auditEvents.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-mist/30">
                  <td className="px-5 py-4">
                    <span className="inline-block rounded bg-field/10 px-2 py-0.5 font-mono text-2xs font-bold text-field">
                      {item.action}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs font-semibold text-charcoal">{item.actor}</td>
                  <td className="px-5 py-4 text-xs text-slate">{item.target}</td>
                  <td className="px-5 py-4 text-xs text-slate">{item.timestamp}</td>
                  <td className="px-5 py-4 font-mono text-2xs text-slate">{item.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortalShell>
  );
}
