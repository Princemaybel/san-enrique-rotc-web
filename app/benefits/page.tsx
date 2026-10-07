import {
  Award,
  Briefcase,
  Crosshair,
  Dumbbell,
  GraduationCap,
  HeartHandshake,
  Medal,
  Radio,
  ShieldCheck,
  Sparkles,
  UsersRound,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { PageHero, SectionHeading } from "@/components/ui";
import { FacebookPostCard } from "@/components/facebook-post-card";
import { createOptionalPublicSupabaseClient } from "@/lib/supabase/public-server";

export const revalidate = 60;

const coreBenefits = [
  {
    category: "Academic & Legal Mandate",
    title: "NSTP Graduation Prerequisite (RA 9163)",
    desc: "Fully fulfills the mandatory 6-unit National Service Training Program (NSTP) graduation requirement under Philippine Republic Act No. 9163.",
    highlights: [
      "Official academic credit units recorded in university transcript",
      "Qualifies graduate for certificate of completion from AFP RESCOM",
      "Seamless credit transfer across Philippine higher education institutions",
    ],
    icon: GraduationCap,
    badge: "Academic Credit",
  },
  {
    category: "Military Career Pathway",
    title: "AFP Reserve Commissioning (RA 7077)",
    desc: "Graduates of Basic ROTC receive an official AFP Reservist Serial Number. Advance ROTC graduates qualify for commissioning as 2nd Lieutenant / Ensign.",
    highlights: [
      "Assigned to the Ready Reserve Force of the Armed Forces of the Philippines",
      "Priority eligibility for Officer Candidate School (OCS / OCC / POTC)",
      "Direct pathway for Call to Active Duty (CAD) as commissioned officer",
    ],
    icon: Medal,
    badge: "Military Horizon",
  },
  {
    category: "Government & Civil Service",
    title: "Uniformed Services Recruitment Advantage",
    desc: "ROTC training provides distinct competitive bonus points when applying for key government, law enforcement, and uniformed services positions.",
    highlights: [
      "Competitive edge in Philippine Army, Air Force, Navy, and Coast Guard",
      "Preferred background for PNP, BFP, BJMP, and BuCor examinations",
      "Leadership credentials recognized in National Civil Service careers",
    ],
    icon: Briefcase,
    badge: "Career Edge",
  },
  {
    category: "Life-Saving Skills",
    title: "DRRM & Emergency Response Certification",
    desc: "Rigorous hands-on training in Humanitarian Assistance and Disaster Relief (HADR) making cadets certified first responders during national calamities.",
    highlights: [
      "Basic Life Support (BLS) and CPR emergency resuscitation",
      "Mass casualty incident triage, bandaging, and casualty evacuation",
      "Disaster management, typhoon response, and flood rescue protocols",
    ],
    icon: HeartHandshake,
    badge: "Civil Defense",
  },
  {
    category: "Tactical & Survival Competency",
    title: "Marksmanship, Field Craft & Navigation",
    desc: "Comprehensive practical instruction in fundamental weapon handling, rifle marksmanship safety, terrain analysis, and survival techniques.",
    highlights: [
      "Rifle marksmanship fundamentals and range safety discipline",
      "Topographic map reading, compass azimuth calculation, and terrain pacing",
      "Small unit tactical movement, field signals, and jungle survival basics",
    ],
    icon: Crosshair,
    badge: "Tactical Skills",
  },
  {
    category: "Cadet Officer Privileges",
    title: "Advance ROTC Subsidies & Leadership Grants",
    desc: "Cadet Officers enrolled in Advance ROTC (MS 31/32/41/42) enjoy exclusive leadership allowances, uniform stipends, and tactical privileges.",
    highlights: [
      "Monthly subsistence allowance and training equipment provisions",
      "Comprehensive leadership retreats and command tactical seminars",
      "Prestigious command appointments in the Corps Battalion Staff",
    ],
    icon: Award,
    badge: "Officer Grants",
  },
];

const developmentalOutcomes = [
  {
    title: "Executive Leadership & Command Presence",
    desc: "Learn to command platoons, direct logistics operations, and maintain composure under rigorous simulated operational stress.",
    icon: ShieldCheck,
  },
  {
    title: "Physical Conditioning & Endurance",
    desc: "Achieve peak physical fitness through military calisthenics, stamina runs, obstacle navigation, and tactical agility drills.",
    icon: Dumbbell,
  },
  {
    title: "Lifelong Brotherhood & Professional Network",
    desc: "Build enduring bonds of camaraderie with fellow cadets, alumni officers, and uniformed defense personnel across the region.",
    icon: UsersRound,
  },
  {
    title: "Tactical Communications & Staff Operations",
    desc: "Master standard military radio protocols, written staff briefings, operations orders (OPORD), and incident management systems.",
    icon: Radio,
  },
];

export default async function BenefitsPage() {
  const supabase = createOptionalPublicSupabaseClient();
  let benefitPosts: {
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
      .eq("category", "benefits")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      benefitPosts = data.map((item) => ({
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

  if (benefitPosts.length === 0) {
    benefitPosts = [
      {
        id: "benefit-fb-1",
        title: "SCHOLARSHIP & CAREER PRIVILEGES: Benefits of Completing ROTC",
        content:
          "Cadets who complete the San Enrique ROTC Advanced Course receive preferential selection in Philippine Army, Air Force, and Navy Officer Candidate Courses (OCC), government civil service eligibility, AFP educational financial assistance, and official incorporation into the 6th Regional Community Defense Group (6RCDG) Reserve Force standby roster.\n\nGraduates also receive formal training certifications recognized during tri-bureau recruitment (PNP, BFP, BJMP).",
        category: "benefits",
        priority: "important",
        image_url: "/images/benefits.jpg",
        created_at: new Date().toISOString(),
      },
    ];
  }

  return (
    <SiteShell>
      <PageHero
        image="/images/benefits.jpg"
        eyebrow="Cadet Advantages & Career Pathways"
        title="Skills, Credentials & Horizons Beyond Formation"
        body="Enlisting in the San Enrique ROTC Unit provides prestigious academic credits, military reserve commissions, leadership mastery, and certified emergency response skills that distinguish you for life."
      />

      <main className="mx-auto max-w-7xl px-4 py-14 space-y-16">
        {/* Flagship Benefits Matrix */}
        <section className="space-y-6">
          <SectionHeading
            eyebrow="Comprehensive Value"
            title="What You Gain as an ROTC Cadet"
            body="From academic prerequisites to high-stakes defense credentials, explore the multifold advantages of completing the San Enrique ROTC program."
          />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coreBenefits.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="card-lift flex flex-col justify-between rounded-2xl border border-field/10 bg-white p-6 shadow-card hover:border-gold/40 hover:shadow-card-hover transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-field/10 text-field border border-field/10">
                        <Icon className="h-5 w-5 text-field" aria-hidden="true" />
                      </div>
                      <span className="rounded-full bg-mist px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider text-field border border-field/10">
                        {item.badge}
                      </span>
                    </div>

                    <span className="mt-4 block text-2xs font-bold uppercase tracking-widest text-gold">
                      {item.category}
                    </span>
                    <h3 className="mt-1 text-base font-black text-charcoal leading-snug">{item.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate">{item.desc}</p>

                    <div className="mt-4 border-t border-field/10 pt-4 space-y-2">
                      {item.highlights.map((h) => (
                        <div key={h} className="flex items-start gap-2 text-2xs font-medium text-slate">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-field" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Official Benefits Dispatches & Updates (1 Single Column) ── */}
        <section className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-field/20 bg-field/10 px-3 py-1 text-3xs font-mono font-bold uppercase tracking-wider text-field mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              BENEFITS FEED • OFFICIAL UPDATES
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-charcoal tracking-tight">
              Published Cadet Benefits & Privilege Bulletins
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate">
              Recent official notices regarding educational subsidies, allowances, and commissioning pathways.
            </p>
          </div>

          {/* 1 Single Column Centered Facebook Feed */}
          <div className="mx-auto max-w-3xl space-y-6">
            {benefitPosts.map((post) => (
              <FacebookPostCard
                key={post.id}
                post={{
                  id: post.id,
                  title: post.title,
                  content: post.content,
                  category: "benefits",
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

        {/* Holistic Character & Leadership Development */}
        <section className="rounded-2xl border border-field/15 bg-mist/60 p-8 md:p-10 shadow-sm">
          <div className="max-w-3xl">
            <span className="text-xs font-black uppercase tracking-widest text-field">Holistic Growth</span>
            <h2 className="mt-1 text-2xl md:text-3xl font-black text-charcoal">
              Core Developmental Competencies
            </h2>
            <p className="mt-2 text-xs md:text-sm leading-relaxed text-slate">
              Beyond technical military knowledge, our curriculum shapes well-rounded, emotionally mature individuals equipped to lead in corporate boardrooms, public governance, or tactical command posts.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {developmentalOutcomes.map((d) => {
              const Icon = d.icon;
              return (
                <div
                  key={d.title}
                  className="card-lift rounded-xl border border-field/10 bg-white p-5 shadow-card hover:border-field/30"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-field text-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3 text-sm font-black text-charcoal leading-snug">{d.title}</h3>
                  <p className="mt-2 text-2xs leading-relaxed text-slate">{d.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pathways After Graduation */}
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-4">
            <SectionHeading
              eyebrow="Future Trajectory"
              title="Where ROTC Can Take Your Career"
              body="Graduation from the San Enrique ROTC program opens doors across multiple civilian, governmental, and defense domains."
            />
            <div className="space-y-3 pt-2">
              <div className="card-lift rounded-xl border border-field/10 bg-white p-4 shadow-card">
                <h4 className="text-xs font-bold text-field uppercase tracking-wider">Option A: Civilian Professional & Active Reservist</h4>
                <p className="mt-1 text-xs text-slate">
                  Pursue your chosen civilian profession (Engineering, IT, Education, Criminology, Business) while serving as a proud Ready Reservist ready for national mobilization.
                </p>
              </div>
              <div className="card-lift rounded-xl border border-field/10 bg-white p-4 shadow-card">
                <h4 className="text-xs font-bold text-field uppercase tracking-wider">Option B: Officer Candidate Course (AFP OCC)</h4>
                <p className="mt-1 text-xs text-slate">
                  Transition directly into full-time military service as a regular commissioned officer in the Philippine Army, Air Force, or Navy through the 1-year OCC program.
                </p>
              </div>
              <div className="card-lift rounded-xl border border-field/10 bg-white p-4 shadow-card">
                <h4 className="text-xs font-bold text-field uppercase tracking-wider">Option C: Law Enforcement & Tri-Bureau Agencies</h4>
                <p className="mt-1 text-xs text-slate">
                  Leverage your tactical discipline and military credentials for accelerated career entry into the Philippine National Police (PNP), Bureau of Fire Protection (BFP), or BJMP.
                </p>
              </div>
            </div>
          </div>

          <div className="card-lift rounded-2xl border border-gold/30 bg-gradient-to-br from-forest via-field to-forest p-8 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-3 py-1 text-2xs font-bold uppercase tracking-wider text-gold border border-gold/30">
                <Sparkles className="h-3.5 w-3.5" />
                Cadet Enrollment Open
              </div>
              <h3 className="text-2xl font-black leading-tight text-white">
                Take the First Step Toward Military Leadership
              </h3>
              <p className="text-xs leading-relaxed text-cream/80">
                Registration is open for all incoming and currently enrolled collegiate students. Review documentation requirements and register online through the digital portal.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/register"
                  className="btn-press inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-5 py-3 text-xs font-black uppercase tracking-wider text-charcoal shadow-md hover:bg-gold/90 transition-all"
                >
                  Register Now
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/requirements"
                  className="btn-press inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-white/20 transition-all"
                >
                  Check Requirements
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
