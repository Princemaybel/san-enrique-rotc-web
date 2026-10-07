import { PortalCard, PortalShell } from "@/components/portal-shell";
import { Mail, Clock, Send, MessageSquare, Check, Shield } from "lucide-react";

export default function AdminMessagesPage() {
  const messages = [
    {
      id: "msg-001",
      sender: "Engr. Roberto Gomez",
      email: "rgomez@university.edu.ph",
      subject: "Inquiry regarding NSTP/ROTC Equivalency Crediting",
      message: "Good day, Command HQ. I would like to verify if transferees with partial MS 1 completion from another state university can credit their training modules this semester?",
      date: "Today at 09:14 AM",
      status: "UNREAD",
    },
    {
      id: "msg-002",
      sender: "Clara Mendoza",
      email: "clara.mendoza@student.edu",
      subject: "Medical Clearance Submission Notice",
      message: "Sir, I have submitted my formal medical clearance for light drill exercises following my knee rehabilitation. Kindly verify my application record.",
      date: "Yesterday at 02:40 PM",
      status: "READ",
    },
  ];

  return (
    <PortalShell
      type="admin"
      title="Inquiries & Communications Dispatch"
      subtitle="Review inquiries submitted from the public website contact directory."
      currentPath="/admin/messages"
    >
      <div className="grid gap-6">
        {/* Broadcast Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-field/10 bg-white p-5 shadow-card">
          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-brass">Communications Hub</span>
            <h2 className="text-base font-bold text-charcoal">Public & Cadet Inbox</h2>
          </div>
          <span className="text-xs text-slate font-medium">Messages linked to Supabase `contact_messages`</span>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {messages.map((item) => (
            <article
              key={item.id}
              className={`rounded-xl border bg-white p-6 shadow-card transition-all ${
                item.status === "UNREAD" ? "border-field/30 bg-mist/20" : "border-field/10"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-field/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-mist text-field font-bold text-xs">
                    {item.sender[0]}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-charcoal">{item.sender}</h3>
                    <span className="text-2xs text-slate">{item.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xs text-slate">{item.date}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-3xs font-bold ${
                      item.status === "UNREAD" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <h4 className="text-sm font-semibold text-charcoal">{item.subject}</h4>
                <p className="mt-1.5 text-xs leading-5 text-slate">{item.message}</p>
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-field/10 pt-3">
                <a
                  href={`mailto:${item.email}?subject=RE: ${item.subject}`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-field px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-forest"
                >
                  <Send className="h-3 w-3" /> Reply via Email
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
