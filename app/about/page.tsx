import {
  Award,
  Compass,
  ShieldCheck,
  UsersRound,
  Target,
  Flag,
  BookOpen,
  Scale,
  Crosshair,
  Radio,
  Medal,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { InfoCard, PageHero, SectionHeading } from "@/components/ui";
import { FacebookPostCard } from "@/components/facebook-post-card";
import { createOptionalPublicSupabaseClient } from "@/lib/supabase/public-server";

export const revalidate = 60;

const values = [
  {
    title: "Discipline & Command",
    desc: "Cadets cultivate mental resilience, personal accountability, and instinctive responsiveness under structured military command environments.",
    icon: ShieldCheck,
  },
  {
    title: "Patriotism & Civic Duty",
    desc: "Instilling deep loyalty to the Republic of the Philippines, upholding the Constitution, and championing selfless community nation-building.",
    icon: Flag,
  },
  {
    title: "Integrity & Honor",
    desc: "Uncompromising dedication to moral uprightness, truthfulness, and ethical conduct in all academic, military, and civilian endeavors.",
    icon: Award,
  },
  {
    title: "Tactical Competence",
    desc: "Mastery of fundamental military tactics, map reading, field communications, small unit operations, and marksmanship fundamentals.",
    icon: Crosshair,
  },
  {
    title: "Humanitarian Service",
    desc: "Preparing cadets as certified first responders for Disaster Risk Reduction and Humanitarian Assistance and Disaster Relief (HADR) missions.",
    icon: UsersRound,
  },
  {
    title: "Camaraderie & Esprit de Corps",
    desc: "Fostering unshakeable brotherhood, mutual trust, and solidarity across the entire cadet battalion and corps of officers.",
    icon: Medal,
  },
];

const chainOfCommand = [
  {
    role: "Supervising Command",
    title: "604th Community Defense Center (604th CDC)",
    desc: "6th Regional Community Defense Group (6RCDG), Reserve Command (RESCOM), Philippine Army.",
    badge: "Supervisory HQ",
  },
  {
    role: "Unit Commandant",
    title: "Office of the ROTC Commandant",
    desc: "Commissioned PA Officer directing military instruction, tactical standards, unit operations, and overall discipline.",
    badge: "Command",
  },
  {
    role: "Executive Officer / Admin NCO",
    title: "Department of Military Science & Tactics",
    desc: "Supervises administrative documentation, student records, enlistment verifications, and logistical support.",
    badge: "Administration",
  },
  {
    role: "Cadet Corps Commander",
    title: "Headquarters Cadet Battalion",
    desc: "Highest-ranking cadet officer leading the corps of cadets during parade formations, drills, and field training exercises.",
    badge: "Corps Leadership",
  },
];

const pillars = [
  {
    num: "01",
    title: "Basic Military Science (MS 1 & MS 2)",
    desc: "Foundational classroom and field instruction covering Military History, Organization of the AFP, Philippine Military Customs & Traditions, Military Justice, Drills and Ceremonies, and Basic Marksmanship.",
    icon: BookOpen,
  },
  {
    num: "02",
    title: "Cadet Officer Candidate Course (COCC / Advance ROTC)",
    desc: "Rigorous leadership development program for aspiring cadet officers, focusing on troop leading procedures (TLP), staff functions (S1 to S7), instructional techniques, and tactical decision games.",
    icon: Target,
  },
  {
    num: "03",
    title: "Disaster Risk Reduction & HADR",
    desc: "Practical certification in Basic Life Support (BLS), standard first aid, earthquake & flood evacuation protocols, urban search and rescue basics, and mass casualty triage management.",
    icon: Radio,
  },
  {
    num: "04",
    title: "Civil-Military Operations (CMO)",
    desc: "Active community engagement including medical-dental missions, coastal cleanup drives, tree planting initiatives, peace advocacy seminars, and civic assistance operations.",
    icon: Scale,
  },
];

export default async function AboutPage() {
  const supabase = createOptionalPublicSupabaseClient();
  let aboutPosts: {
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
      .eq("category", "about")
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      aboutPosts = data.map((item) => ({
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

  if (aboutPosts.length === 0) {
    aboutPosts = [
      {
        id: "about-fb-1",
        title: "UNIT MISSION & JURISDICTION: 604th CDC / San Enrique ROTC",
        content:
          "San Enrique ROTC Unit operates under the operational command of the 604th Community Defense Center, 6th Regional Community Defense Group (6RCDG), Reserve Command, Philippine Army. Dedicated to fostering military leadership, patriotism, disaster response readiness, and civic action across Western Visayas.\n\nOur instructors and tactical non-commissioned officers maintain the highest standards of the Armed Forces of the Philippines.",
        category: "about",
        priority: "normal",
        image_url: "/images/hero-rotc.jpg",
        created_at: new Date().toISOString(),
      },
    ];
  }

  return (
    <SiteShell>
      <PageHero
        image="/images/about.jpg"
        eyebrow="Unit Lineage & Heritage"
        title="San Enrique ROTC Unit"
        body="Affiliated with the 604th Community Defense Center, 6RCDG, Reserve Command, Philippine Army. Forging disciplined collegiate leaders, resilient first responders, and patriotic guardians of the Republic."
      />

      <main className="mx-auto max-w-7xl px-4 py-14 space-y-16">
        {/* Mission & Vision Showcase */}
        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="card-lift flex flex-col justify-between rounded-2xl border border-field/20 bg-gradient-to-br from-forest via-field to-forest p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold/40 bg-gold/10 text-gold shadow-sm">
                <Compass className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="mt-6 text-xs font-black uppercase tracking-[0.25em] text-gold flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                Institutional Heritage
              </p>
              <h2 className="mt-2 text-2xl md:text-3xl font-black leading-snug tracking-tight">
                Forging Tomorrow's Reserve Officers & Civic Guardians
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-cream/85">
                The San Enrique ROTC Unit under the Department of Military Science & Tactics (DMST) operates under the statutory mandate of Republic Act No. 7077 (Citizen Armed Forces of the Philippines Reservist Act) and Republic Act No. 9163 (National Service Training Program Act).
              </p>
              <p className="mt-3 text-sm leading-relaxed text-cream/80">
                We empower youth with the strategic knowledge, physical stamina, and moral courage necessary to defend national sovereignty, assist during humanitarian emergencies, and lead our communities with uncompromising honor.
              </p>
            </div>

            <div className="mt-8 border-t border-white/15 pt-6 relative z-10">
              <span className="text-2xs font-bold uppercase tracking-widest text-gold">Operational Jurisdiction</span>
              <p className="mt-1 text-xs font-semibold text-white/95">
                604th CDC • 6th Regional Community Defense Group • RESCOM, Philippine Army
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-6">
            <SectionHeading
              eyebrow="Guiding Mandate"
              title="The Mission & Vision"
              body="Dedicated to producing exemplary citizen-soldiers whose character, physical readiness, and tactical prowess serve as the backbone of our national defense reserve."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="card-lift rounded-xl border border-field/10 bg-white p-6 shadow-card hover:border-field/30">
                <div className="flex items-center gap-2.5 text-field">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-field/10 text-field">
                    <Target className="h-5 w-5 text-field" />
                  </div>
                  <h3 className="text-lg font-black text-charcoal">The Mission</h3>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate">
                  To instruct, train, and develop collegiate students in basic and advance military science, instilling patriotism, military discipline, and humanitarian responsiveness to produce capable reserve officers and enlisted personnel for the Armed Forces of the Philippines.
                </p>
              </div>

              <div className="card-lift rounded-xl border border-field/10 bg-white p-6 shadow-card hover:border-field/30">
                <div className="flex items-center gap-2.5 text-field">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10 text-gold">
                    <Flag className="h-5 w-5 text-field" />
                  </div>
                  <h3 className="text-lg font-black text-charcoal">The Vision</h3>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate">
                  A center of excellence in military instruction and youth development, recognized for producing disciplined, morally upright, physically superior, and civic-minded reservists ready to answer the call of duty for nation-building and disaster mitigation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cadet Honor Code & Creed Banner */}
        <section className="rounded-2xl border border-gold/30 bg-gradient-to-r from-forest via-charcoal to-forest p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#D4A843_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-gold">
              <ShieldCheck className="h-4 w-4" />
              The Cadet Honor Code
            </div>
            <blockquote className="text-2xl md:text-3xl font-black italic tracking-wide text-cream leading-snug">
              &ldquo;A Cadet does not lie, cheat, steal, nor tolerate those who do.&rdquo;
            </blockquote>
            <p className="text-xs md:text-sm text-cream/80 max-w-2xl mx-auto leading-relaxed">
              This timeless ethical benchmark governs every action of the San Enrique Cadet Corps. It represents our solemn commitment to absolute truthfulness, personal accountability, and mutual honor in both military and civilian spheres.
            </p>
          </div>
        </section>

        {/* Core Values Grid */}
        <section className="space-y-6">
          <SectionHeading
            eyebrow="Foundational Principles"
            title="Core Values of the Cadet Corps"
            body="Our six core pillars guide classroom instruction, physical conditioning, and leadership development across all training semesters."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="card-lift flex flex-col justify-between rounded-xl border border-field/10 bg-white p-6 shadow-card hover:border-gold/40 hover:shadow-card-hover transition-all"
                >
                  <div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-mist text-field border border-field/10">
                      <Icon className="h-5 w-5 text-field" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 text-base font-black text-charcoal">{v.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate">{v.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Training Pillars */}
        <section className="space-y-6">
          <SectionHeading
            eyebrow="Curriculum & Instruction"
            title="Comprehensive Training Pillars"
            body="A balanced military and civic curriculum structured to prepare cadets for both reserve duty and civilian leadership roles."
          />

          <div className="grid gap-6 md:grid-cols-2">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.num}
                  className="card-lift flex gap-4 rounded-xl border border-field/10 bg-white p-6 shadow-card hover:border-field/30"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-field text-gold font-black text-sm shadow-sm">
                    {p.num}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-field" />
                      <h3 className="text-base font-bold text-charcoal">{p.title}</h3>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate">{p.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Official Unit Profile & Lineage Dispatches (1 Single Column) ── */}
        <section className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-field/20 bg-field/10 px-3 py-1 text-3xs font-mono font-bold uppercase tracking-wider text-field mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              UNIT PROFILE • OFFICIAL DISPATCHES
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-charcoal tracking-tight">
              Unit Heritage & Command Updates
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate">
              Dispatches on unit history, mission achievements, and leadership doctrine.
            </p>
          </div>

          {/* 1 Single Column Centered Facebook Feed */}
          <div className="mx-auto max-w-2xl space-y-6">
            {aboutPosts.map((post) => (
              <FacebookPostCard
                key={post.id}
                post={{
                  id: post.id,
                  title: post.title,
                  content: post.content,
                  category: "about",
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

        {/* Chain of Command & Structure */}
        <section className="space-y-6">
          <SectionHeading
            eyebrow="Command Structure"
            title="Organizational Chain of Command"
            body="The hierarchical framework ensuring administrative efficiency, strict military discipline, and clear command and control."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {chainOfCommand.map((node) => (
              <div
                key={node.role}
                className="card-lift flex flex-col justify-between rounded-xl border border-field/10 bg-white p-5 shadow-card hover:border-field/30"
              >
                <div>
                  <span className="inline-block rounded-full bg-mist px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider text-field border border-field/10">
                    {node.badge}
                  </span>
                  <h3 className="mt-3 text-sm font-black text-charcoal">{node.role}</h3>
                  <h4 className="text-xs font-bold text-field mt-0.5">{node.title}</h4>
                  <p className="mt-2 text-2xs leading-relaxed text-slate">{node.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Enlistment Action Strip */}
        <section className="rounded-2xl border border-field/20 bg-field p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-black uppercase tracking-widest text-gold">Join the Ranks</span>
            <h3 className="mt-1 text-2xl font-black">Begin Your Military Leadership Journey</h3>
            <p className="mt-2 text-xs md:text-sm text-cream/80">
              Enlist in the San Enrique ROTC program today. Fulfill your NSTP graduation requirement while acquiring lifelong leadership skills, tactical competencies, and military reserve qualification.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/register"
              className="btn-press inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-3 text-xs font-black uppercase tracking-wider text-charcoal shadow-md hover:bg-gold/90 transition-all"
            >
              Enlist Now
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/requirements"
              className="btn-press inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-5 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-white/20 transition-all"
            >
              View Checklist
            </Link>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
