import {
  CheckCircle2,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  ClipboardCheck,
  UserCheck,
  Scissors,
  Shirt,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { PageHero, SectionHeading } from "@/components/ui";
import { FacebookPostCard } from "@/components/facebook-post-card";
import { createOptionalPublicSupabaseClient } from "@/lib/supabase/public-server";

export const revalidate = 60;

const eligibilityTiers = [
  {
    tier: "Basic ROTC (MS 11 / MS 12)",
    target: "1st Year & 2nd Year College Students",
    desc: "Mandatory foundation course fulfilling the 6-unit National Service Training Program (NSTP) graduation requirement.",
    criteria: [
      "Currently enrolled undergraduate student of the institution",
      "Filipino citizen of good moral character with no criminal record",
      "Medically, physically, and psychologically fit for military drill training",
      "Willing to abide by the Cadet Honor Code and unit regulations",
    ],
    badge: "NSTP Basic",
  },
  {
    tier: "Advance ROTC (MS 31/32 & MS 41/42)",
    target: "Aspiring Cadet Officers (2nd to 4th Year)",
    desc: "Elite officer candidate development program leading to AFP Reserve Commissioning as 2nd Lieutenant / Ensign.",
    criteria: [
      "Successfully completed Basic ROTC (MS 1 & MS 2) with high marks",
      "Passed the Cadet Qualifying Examination and Physical Fitness Test (PFT)",
      "General Weighted Average (GWA) in good academic standing (no failing grades)",
      "Endorsed by the ROTC Commandant and DMST board of officers",
    ],
    badge: "Officer Course",
  },
];

const documents = [
  {
    title: "PSA Birth Certificate",
    spec: "1 Original Copy + 2 Clear Photocopies",
    desc: "Official Philippine Statistics Authority (PSA) issued birth certificate verifying Filipino citizenship and legal age.",
    icon: FileText,
  },
  {
    title: "Certificate of Registration (COR)",
    spec: "Current Academic Term",
    desc: "Official institutional enrollment assessment form proving bona fide student status.",
    icon: ClipboardCheck,
  },
  {
    title: "Medical Fitness Clearance",
    spec: "Signed by Licensed Physician",
    desc: "Standard physical examination clearance confirming candidate is fit for moderate to strenuous military calisthenics.",
    icon: UserCheck,
  },
  {
    title: "Parent / Guardian Consent & Waiver",
    spec: "Signed & Notarized (if minor)",
    desc: "Formal consent and liability waiver authorizing the student's participation in ROTC field and drill exercises.",
    icon: FileCheck2,
  },
  {
    title: "Formal Military 2x2 ID Photos",
    spec: "4 Copies (White Background)",
    desc: "Glossy 2x2 ID photos adhering to military haircut standards with nametag (SURNAME, FIRST NAME, M.I.).",
    icon: ShieldCheck,
  },
  {
    title: "ROTC Student Data Sheet (SDS)",
    spec: "Accomplished via Online Portal",
    desc: "Digital enrollment form submitted via the cadet portal containing personal, emergency, and blood type info.",
    icon: FileText,
  },
];

const groomingStandards = [
  {
    category: "Male Cadets",
    rules: [
      "Haircut: Standard military 4x5 or white-side wall cut (clean fade, 0 on sides/back, trimmed top)",
      "Clean-shaven facial hair (no mustache, beard, or sideburns extending below ear opening)",
      "Natural hair color only (no bleached or unnatural dyes)",
      "No earrings, visible body piercings, or necklaces during military formation",
      "Fingernails trimmed short, clean, and unpolished",
    ],
  },
  {
    category: "Female Cadets",
    rules: [
      "Hair styling: Cleanly secured inside a standard black hairnet bun at the back of the head (no loose strands or bangs)",
      "Natural hair color only (unnatural streaks or bright dyes strictly prohibited)",
      "Subtle, natural makeup allowed during formal ceremonies; strictly no makeup during field exercises",
      "Single pair of small plain gold/silver stud earrings only (Class A/B uniforms only; no jewelry in BDU)",
      "Fingernails trimmed short, clean, and free of colored nail polish",
    ],
  },
];

const uniformTypes = [
  {
    name: "Class C - BDU Fatigue (Field Dress)",
    purpose: "Standard drill formations, tactical training, and field tactical exercises.",
    components: "Philippine Army Camouflage BDU, tactical combat boots, olive drab tactical web belt with brass buckle, and corps beret with insignia.",
  },
  {
    name: "Type D - Physical Training (PT) Uniform",
    purpose: "Physical fitness tests (PFT), calisthenics, stamina runs, and sports meets.",
    components: "Official ROTC white/green athletic shirt, dark athletic shorts/joggers, white socks, and running shoes.",
  },
  {
    name: "Class B - Bush Jacket / Gala Uniform",
    purpose: "Cadet officers and honor guards during official school events and military parades.",
    components: "Tailored khaki/green bush jacket with brass buttons, rank epaulets, trousers/skirt, and polished dress shoes.",
  },
];

const onboardingSteps = [
  {
    step: "01",
    title: "Digital Registration",
    desc: "Fill out the online cadet registration form with personal details, student ID, and emergency contact information.",
  },
  {
    step: "02",
    title: "Document Submission",
    desc: "Submit hard copies of your PSA birth certificate, medical clearance, parent consent form, and 2x2 ID pictures to the DMST office.",
  },
  {
    step: "03",
    title: "Admin Verification",
    desc: "The Department of Military Science & Tactics verifies your records and issues your official Cadet Serial Number.",
  },
  {
    step: "04",
    title: "Mobile App Activation & Platoon Muster",
    desc: "Log in to the Web Portal & Cadet Mobile App to access your digital Military ID and report to your assigned company for muster.",
  },
];

export default async function RequirementsPage() {
  const supabase = createOptionalPublicSupabaseClient();
  let requirementPosts: {
    id: string;
    title: string;
    content: string;
    category: string;
    priority: "normal" | "important" | "urgent";
    image_url?: string | null;
    created_at: string;
  }[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("announcements")
      .select("id,title,content,category,priority,image_url,created_at")
      .eq("is_published", true)
      .eq("category", "requirements")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      requirementPosts = data.map((item) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        category: item.category,
        priority: (item.priority as any) || "normal",
        image_url: item.image_url ?? null,
        created_at: item.created_at,
      }));
    }
  }

  if (requirementPosts.length === 0) {
    requirementPosts = [
      {
        id: "req-fb-1",
        title: "ENLISTMENT REQUIREMENTS & DOCUMENT SUBMISSION CHECKLIST",
        content:
          "Official requirements for joining San Enrique ROTC Unit this Academic Term:\n\n1. Valid Certificate of Registration (COR) from accredited partner colleges\n2. Two (2) copies 2x2 ID picture in white background with military haircut\n3. Medical Clearance signed by a licensed government or school physician\n4. Duly notarized Parent/Guardian Consent Form (for minors)\n\nSubmit physical copies directly to the ROTC Admin Office, or upload your scanned credentials through your cadet student portal.",
        category: "requirements",
        priority: "important",
        image_url: "/images/cadets.jpg",
        created_at: new Date().toISOString(),
      },
    ];
  }

  return (
    <SiteShell>
      <PageHero
        image="/images/requiremets.jpg"
        eyebrow="Cadet Onboarding & Regulations"
        title="Enlistment Qualifications, Documents & Standards"
        body="Ensure you meet all eligibility criteria, prepare documentary requirements, and adhere to strict grooming and uniform regulations prior to drill muster."
      />

      <main className="mx-auto max-w-7xl px-4 py-14 space-y-16">
        {/* Eligibility Criteria Tiers */}
        <section className="space-y-6">
          <SectionHeading
            eyebrow="Enlistment Levels"
            title="Eligibility Qualifications"
            body="Review the entry requirements for Basic ROTC trainees and Advance ROTC Cadet Officer candidates."
          />

          <div className="grid gap-6 md:grid-cols-2">
            {eligibilityTiers.map((t) => (
              <div
                key={t.tier}
                className="card-lift flex flex-col justify-between rounded-2xl border border-field/15 bg-white p-7 shadow-card hover:border-gold/40 hover:shadow-card-hover transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-field/10 px-3 py-1 text-2xs font-black uppercase tracking-wider text-field border border-field/10">
                      {t.badge}
                    </span>
                    <span className="text-2xs font-bold text-slate">{t.target}</span>
                  </div>

                  <h3 className="mt-4 text-xl font-black text-charcoal">{t.tier}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate">{t.desc}</p>

                  <div className="mt-5 border-t border-field/10 pt-4 space-y-2.5">
                    {t.criteria.map((c) => (
                      <div key={c} className="flex items-start gap-2.5 text-xs text-slate">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-field" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Documentary Checklist */}
        <section className="space-y-6">
          <SectionHeading
            eyebrow="Documentary Checklist"
            title="Required Records & Credentials"
            body="Submit complete hard copy requirements to the Department of Military Science & Tactics (DMST) during enlistment week."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((d) => {
              const Icon = d.icon;
              return (
                <div
                  key={d.title}
                  className="card-lift flex flex-col justify-between rounded-xl border border-field/10 bg-white p-6 shadow-card hover:border-field/30"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mist text-field border border-field/10">
                        <Icon className="h-5 w-5 text-field" />
                      </div>
                      <span className="text-2xs font-bold text-gold uppercase tracking-wider bg-gold/10 px-2 py-0.5 rounded">
                        {d.spec}
                      </span>
                    </div>

                    <h3 className="mt-4 text-base font-black text-charcoal">{d.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate">{d.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Official Requirements Dispatches & Updates (1 Single Column) ── */}
        <section className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-field/20 bg-field/10 px-3 py-1 text-3xs font-mono font-bold uppercase tracking-wider text-field mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              REQUIREMENTS FEED • LIVE NOTICES
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-charcoal tracking-tight">
              Published Enlistment & Documentation Bulletins
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate">
              Checklists, medical waiver forms, and document deadline notices published by the Admin.
            </p>
          </div>

          {/* 1 Single Column Centered Facebook Feed */}
          <div className="mx-auto max-w-2xl space-y-6">
            {requirementPosts.map((post) => (
              <FacebookPostCard
                key={post.id}
                post={{
                  id: post.id,
                  title: post.title,
                  content: post.content,
                  category: "requirements",
                  priority: post.priority,
                  image_url: post.image_url,
                  created_at: post.created_at,
                  author: "San Enrique ROTC Unit Command",
                  authorAvatar: "/logo.png",
                }}
              />
            ))}
          </div>
        </section>

        {/* Grooming & Uniform Standards */}
        <section className="rounded-2xl border border-field/15 bg-mist/60 p-8 md:p-10 shadow-sm space-y-8">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-field">Discipline & Appearance</span>
            <h2 className="mt-1 text-2xl md:text-3xl font-black text-charcoal">
              Grooming, Haircut & Uniform Regulations
            </h2>
            <p className="mt-2 text-xs md:text-sm leading-relaxed text-slate max-w-3xl">
              As an ROTC cadet, personal appearance reflects military discipline, institutional pride, and respect for the uniform of the Armed Forces of the Philippines.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {groomingStandards.map((g) => (
              <div key={g.category} className="card-lift rounded-xl border border-field/10 bg-white p-6 shadow-card">
                <div className="flex items-center gap-2.5 text-field">
                  <Scissors className="h-5 w-5 text-field" />
                  <h3 className="text-lg font-black text-charcoal">{g.category} Standards</h3>
                </div>
                <ul className="mt-4 space-y-2.5 border-t border-field/10 pt-4">
                  {g.rules.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-xs leading-relaxed text-slate">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-field" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-black text-charcoal flex items-center gap-2">
              <Shirt className="h-5 w-5 text-field" />
              Prescribed Cadet Uniforms
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {uniformTypes.map((u) => (
                <div key={u.name} className="card-lift rounded-xl border border-field/10 bg-white p-5 shadow-card">
                  <h4 className="text-xs font-black text-field uppercase tracking-wider">{u.name}</h4>
                  <p className="mt-1 text-2xs font-semibold text-charcoal">{u.purpose}</p>
                  <p className="mt-2 text-2xs leading-relaxed text-slate">{u.components}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Step-by-Step Onboarding Timeline */}
        <section className="space-y-6">
          <SectionHeading
            eyebrow="Onboarding Protocol"
            title="Step-by-Step Enlistment Procedure"
            body="Follow this sequence to ensure your cadet profile is formally registered and active in the command roster."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {onboardingSteps.map((s) => (
              <div
                key={s.step}
                className="card-lift flex flex-col justify-between rounded-xl border border-field/10 bg-white p-6 shadow-card hover:border-field/30"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-field text-gold font-black text-sm">
                    {s.step}
                  </div>
                  <h3 className="mt-4 text-base font-black text-charcoal">{s.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Action strip */}
        <section className="rounded-2xl border border-field/20 bg-field p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-black uppercase tracking-widest text-gold">Ready to Enlist?</span>
            <h3 className="mt-1 text-2xl font-black">Submit Your Online Registration Today</h3>
            <p className="mt-2 text-xs md:text-sm text-cream/80">
              Complete your online registration now to secure your spot in the upcoming semester&apos;s cadet roster.
            </p>
          </div>
          <Link
            href="/register"
            className="btn-press inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3.5 text-xs font-black uppercase tracking-wider text-charcoal shadow-md hover:bg-gold/90 transition-all shrink-0"
          >
            Register as Cadet
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
    </SiteShell>
  );
}
