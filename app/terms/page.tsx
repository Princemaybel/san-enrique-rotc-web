import { Scale } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui";

const termsSections = [
  {
    title: "1. Authorized Usage & Access",
    content:
      "Access to the San Enrique ROTC Web Cadet Portal and Android Application is strictly restricted to currently enrolled cadets, designated corps officers, non-commissioned officer instructors, and official DMST administrators. Unauthorized access attempts, credential sharing, or account proxying will result in immediate disciplinary and administrative action.",
  },
  {
    title: "2. QR Attendance Code Integrity & The Cadet Honor Code",
    content:
      "The dynamic QR code generated in your mobile application is your personal, non-transferable military identification. Generating screenshots, sharing QR passes for proxy muster check-ins, or falsifying attendance constitutes an egregious violation of the Cadet Honor Code ('A cadet does not lie, cheat, steal, nor tolerate those who do') and is subject to immediate dismissal from the ROTC program with a failing NSTP mark.",
  },
  {
    title: "3. Compliance with Drill Orders & Directives",
    content:
      "All users agree to adhere to published training schedules, uniform of the day (UOTD) announcements, grooming standards, and lawful command instructions issued by the Commandant and appointed Cadet Officers.",
  },
  {
    title: "4. Digital Conduct & Cyber Decorum",
    content:
      "Cadets must maintain respectful, professional military decorum across all inquiry channels, messaging boards, and public forums associated with the unit. Cyberbullying, insubordination, harassment, or unauthorized leaks of operational orders are strictly prohibited under AFP and university student manuals.",
  },
  {
    title: "5. Modifications to Unit Policies",
    content:
      "The Department of Military Science & Tactics reserves the right to amend training schedules, formation protocols, and technical portal features in accordance with higher headquarters directives from 604th CDC / 6RCDG ARESCOM.",
  },
];

export default function TermsPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Regulations & Protocol"
        title="Terms of Service & Code of Cadet Conduct"
        body="Read the operational terms, honor code requirements, and digital regulations governing your use of the San Enrique ROTC Portal and Mobile App."
      />
      <main className="mx-auto max-w-4xl px-4 py-14 space-y-8">
        <div className="card-lift rounded-2xl border border-field/10 bg-white p-8 shadow-card space-y-6">
          <div className="flex items-center gap-3 text-field border-b border-field/10 pb-4">
            <Scale className="h-6 w-6 text-gold" />
            <h2 className="text-lg font-black text-charcoal">Cadet Terms of Service & Disciplinary Covenant</h2>
          </div>

          <div className="space-y-6">
            {termsSections.map((sec) => (
              <div key={sec.title} className="space-y-2">
                <h3 className="text-sm font-black text-charcoal">{sec.title}</h3>
                <p className="text-xs leading-relaxed text-slate">{sec.content}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-field/10 pt-4 text-2xs text-slate">
            Effective: Academic Year 2024–2025 • Department of Military Science & Tactics, San Enrique Unit
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
