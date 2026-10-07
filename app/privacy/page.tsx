import { ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui";

const privacySections = [
  {
    title: "1. Republic Act No. 10173 (Data Privacy Act of 2012) Compliance",
    content:
      "The San Enrique ROTC Unit and Department of Military Science & Tactics (DMST) adhere strictly to the provisions of the Philippine Data Privacy Act of 2012 (RA 10173). All cadet records, personal identifiers, emergency contacts, medical assessments, and attendance logs collected via this digital portal and mobile application are processed exclusively for official academic NSTP accreditation, drill roster verification, and AFP reserve mobilization records.",
  },
  {
    title: "2. Information We Collect",
    content:
      "We collect student identification numbers, full legal names, date of birth, emergency contact details, blood type, medical clearance documents, formation attendance timestamps, GPS-tagged muster scans, and academic course affiliations required for official military enlistment rosters.",
  },
  {
    title: "3. Access Control & Row Level Security (RLS)",
    content:
      "Cadet data is stored in secured, encrypted database systems protected by multi-tier authentication and strict Row-Level Security (RLS) policies. Only authorized DMST officers, training non-commissioned officers, and unit commandants possess clearance to access full administrative records.",
  },
  {
    title: "4. Data Retention & Certificate Issuance",
    content:
      "Official completion records and AFP Reservist serial numbers are archived in accordance with Department of National Defense (DND) and Reserve Command (RESCOM) document retention protocols for permanent credential verification and transcript validation.",
  },
  {
    title: "5. Cadet Rights",
    content:
      "Cadets maintain the right to inspect their personal profile information, verify recorded drill attendance, dispute erroneous merit/demerit entries, and request corrections through the DMST Administrative Clerk.",
  },
];

export default function PrivacyPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Data Protection"
        title="Privacy & Data Governance Policy"
        body="Learn how the San Enrique ROTC Unit safeguards cadet information, personal records, and attendance data in compliance with Philippine statutory regulations."
      />
      <main className="mx-auto max-w-4xl px-4 py-14 space-y-8">
        <div className="card-lift rounded-2xl border border-field/10 bg-white p-8 shadow-card space-y-6">
          <div className="flex items-center gap-3 text-field border-b border-field/10 pb-4">
            <ShieldCheck className="h-6 w-6 text-gold" />
            <h2 className="text-lg font-black text-charcoal">Official Cadet Data Protection Standards</h2>
          </div>

          <div className="space-y-6">
            {privacySections.map((sec) => (
              <div key={sec.title} className="space-y-2">
                <h3 className="text-sm font-black text-charcoal">{sec.title}</h3>
                <p className="text-xs leading-relaxed text-slate">{sec.content}</p>
              </div>
            ))}
          </div>

          <div className="border-t border-field/10 pt-4 text-2xs text-slate">
            Last Updated: Academic Year 2024–2025 • Department of Military Science & Tactics
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
