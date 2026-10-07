  import {
  Mail,
  ShieldCheck,
  Clock,
  HelpCircle,
  Building2,
  CalendarDays,
} from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { SiteShell } from "@/components/site-shell";
import { PageHero, SectionHeading } from "@/components/ui";

const directory = [
  {
    title: "Command Headquarters",
    detail: "Department of Military Science & Tactics (DMST), San Enrique Campus",
    icon: Building2,
  },
  {
    title: "Official Communication",
    detail: "rotc@sanenrique.edu.ph",
    icon: Mail,
  },
  {
    title: "Administrative Office Hours",
    detail: "Monday – Friday: 0800H – 1700H (Non-Drill Days)",
    icon: Clock,
  },
  {
    title: "Weekend Muster & Drill Call",
    detail: "Saturday Formations: 0600H – 1700H (Parade Ground)",
    icon: CalendarDays,
  },
];

const faqs = [
  {
    q: "Is ROTC mandatory for all college students?",
    a: "Under Republic Act No. 9163 (NSTP Act), students must complete one (1) NSTP component to graduate. ROTC is the premier military leadership component that grants both academic NSTP credits and official military reserve enlistment with the AFP.",
  },
  {
    q: "What is the minimum attendance requirement to pass ROTC?",
    a: "Cadets must attend at least 80% of all scheduled drill formations and lecture modules. Unauthorized absences exceeding 20% of total training hours may result in a dropped or incomplete grade in accordance with DMST regulations.",
  },
  {
    q: "How does the Digital QR Attendance System work?",
    a: "Every verified cadet receives an encrypted, dynamic digital Military ID in the San Enrique ROTC Web Portal and Mobile App. Duty officers scan your QR code at the formation muster gates for instantaneous, tamper-proof attendance logging.",
  },
  {
    q: "Can female students join the ROTC Officer Candidate Course?",
    a: "Yes. Female cadets are fully integrated into all leadership positions, tactical field craft drills, and the Cadet Officer Candidate Course (COCC), with equal opportunities to attain high battalion command appointments.",
  },
  {
    q: "What happens if I have a medical condition during training?",
    a: "Students with verified medical or physical restrictions must submit a physician's clinical certificate to the DMST dispensary. Accommodations or alternate non-strenuous administrative assignments will be designated.",
  },
  {
    q: "How do I receive my AFP Reservist Serial Number upon completion?",
    a: "Upon completing MS 11 and MS 12 with passing grades, the unit submits the roster to the 604th CDC / 6RCDG RESCOM. Successful graduates are issued an official General Order (GO) containing their national reservist serial number.",
  },
];

export default function ContactPage() {
  return (
    <SiteShell>
      <PageHero
image="/images/contact.jpg"
              eyebrow="Command Directory & Assistance"
        title="Contact San Enrique ROTC Unit"
        body="Reach the Department of Military Science & Tactics for enrollment verification, record certifications, training schedules, and general cadet inquiries."
      />

      <main className="mx-auto max-w-7xl px-4 py-14 space-y-16">
        {/* Main Directory & Contact Form Grid */}
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="space-y-6">
            <div className="card-lift rounded-2xl border border-field/10 bg-white p-7 shadow-card">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-gold">
                Command Headquarters
              </span>
              <h2 className="mt-2 text-2xl font-black text-charcoal">Unit Directory</h2>
              <p className="mt-2 text-xs leading-relaxed text-slate">
                Direct official inquiries, cadet clearance requests, and verification credentials during scheduled office hours.
              </p>

              <div className="mt-6 space-y-3.5">
                {directory.map((d) => {
                  const Icon = d.icon;
                  return (
                    <div
                      key={d.title}
                      className="flex items-start gap-3.5 rounded-xl border border-field/10 bg-mist/60 p-3.5"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-field text-gold">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <strong className="block text-xs font-bold text-charcoal">{d.title}</strong>
                        <span className="text-2xs text-slate">{d.detail}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Operational Notice */}
            <div className="card-lift rounded-2xl border border-gold/30 bg-gradient-to-br from-forest via-field to-forest p-6 text-white shadow-xl">
              <div className="flex items-center gap-2 text-gold">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-wider">Official Protocol</span>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-cream/85">
                Drill notices, muster call adjustments, and weather advisory alerts are broadcast in real-time via the Announcements section and the Cadet Mobile Application.
              </p>
            </div>
          </section>

          {/* Form */}
          <ContactForm />
        </div>

        {/* Frequently Asked Questions (FAQ) Section */}
        <section className="space-y-6">
          <SectionHeading
            eyebrow="Cadet Knowledge Base"
            title="Frequently Asked Questions"
            body="Find immediate answers to standard questions regarding ROTC enrollment, training rules, attendance protocols, and reserve commissioning."
          />

          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="card-lift rounded-xl border border-field/10 bg-white p-6 shadow-card hover:border-field/30 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-field/10 text-field">
                    <HelpCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-charcoal leading-snug">{faq.q}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
