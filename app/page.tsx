import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  MapPin,
  QrCode,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { HeroSlider } from "@/components/hero-slider";
import { HomeAlbumSlider } from "@/components/home-album-slider";
import { OFFICIAL_ALBUMS, GalleryAlbum, GallerySlideItem } from "@/lib/gallery-data";
import { announcements as demoAnnouncements, events as demoEvents } from "@/lib/content";
import { createOptionalPublicSupabaseClient } from "@/lib/supabase/public-server";
import { FacebookPostCard } from "@/components/facebook-post-card";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const communityDefenseCenters = [
  {
    title: "601st (Iloilo) Community Defense Center",
    subtitle: "6RCDG • Reserve Command, Philippine Army",
    logo: "/logo/601st (iloilo) community defense center.png",
  },
  {
    title: "602nd (Iloilo) Community Defense Center",
    subtitle: "6RCDG • Reserve Command, Philippine Army",
    logo: "/logo/602nd (iloilo) community defense center.png",
  },
  {
    title: "603rd (Iloilo) Community Defense Center",
    subtitle: "6RCDG • Reserve Command, Philippine Army",
    logo: "/logo/603rd (iloilo) community defense center.png",
  },
  {
    title: "604th (Iloilo) Community Defense Center",
    subtitle: "6RCDG • Reserve Command, Philippine Army",
    logo: "/logo/604th (iloilo) community defense center.png",
  },
  {
    title: "605th (Iloilo) Community Defense Center",
    subtitle: "6RCDG • Reserve Command, Philippine Army",
    logo: "/logo/605th (iloilo) community defense center.png",
  },
  {
    title: "606th (Iloilo) Community Defense Center",
    subtitle: "6RCDG • Reserve Command, Philippine Army",
    logo: "/logo/606th (iloilo) community defense center.png",
  },
  {
    title: "6th (Iloilo) Community Defense Center",
    subtitle: "6RCDG • Regional Community Defense Group",
    logo: "/logo/6th (iloilo) community defense center.png",
  },
] as const;


const benefits = [
  ["Leadership Development", "Practice responsibility, preparation, and calm decision-making."],
  ["Discipline & Responsibility", "Build habits that support training, school, and service."],
  ["Teamwork & Camaraderie", "Work with peers through shared duties and unit activities."],
  ["Physical Fitness", "Support readiness through practical movement and formation work."],
  ["Civic Engagement", "Understand service and constructive community participation."],
  ["Personal Development", "Strengthen confidence, communication, and accountability."],
] as const;

const process = [
  ["01", "Explore Requirements", "Review eligibility, documents, reminders, and registration steps."],
  ["02", "Submit Application", "Create your account and send your cadet information."],
  ["03", "Admin Verification", "Administrators review details, documents, and approval status."],
  ["04", "Access Services", "Approved cadets can login to the portal and Android app."],
] as const;

async function getHomeAnnouncements() {
  const supabase = createOptionalPublicSupabaseClient();
  if (supabase) {
    const { data } = await supabase
      .from("announcements")
      .select("id,title,content,category,priority,created_at,image_url")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(6);

    if (data && data.length > 0) {
      return data;
    }
  }

  // High-fidelity Facebook-style default posts for unit announcements, requirements, benefits, gallery & about
  return [
    {
      id: "fb-post-1",
      title: "Muster Inspection & Formation Schedule for General Assembly",
      content: "All enrolled San Enrique ROTC cadets are hereby directed to assemble at the University Grandstand this coming Saturday at 0630H sharp. Uniform of the Day (UOTD): Complete Type 'A' Fatigue Uniform with headgear and polished combat boots. Bring your personal digital QR Pass generated from the Cadet Portal or Mobile App for rapid scanner gate check-in.",
      category: "announcement",
      priority: "urgent" as const,
      created_at: new Date().toISOString(),
      image_url: "/images/announcements.jpg",
    },
    {
      id: "fb-post-2",
      title: "MS 41-42 Cadet Graduation & Field Training Exercises",
      content: "Congratulations to the graduating class of Military Science 41-42! Our cadets successfully completed rigorous tactical defense maneuvers, basic marksmanship drills, disaster response simulations, and tactical squad leadership training.",
      category: "gallery",
      priority: "normal" as const,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      image_url: "/images/gallery.jpg",
    },
    {
      id: "fb-post-3",
      title: "Updated Enlistment Requirements for Academic Year 2026-2027",
      content: "Prospective cadets and incoming tertiary students: Registration is now open on the official web portal! Please ensure you have your Certificate of Registration (COR), medical clearance certificate, two 2x2 ID photos in white background, and a valid student ID ready for upload during the online application process.",
      category: "requirements",
      priority: "important" as const,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      image_url: "/images/requiremets.jpg",
    },
    {
      id: "fb-post-4",
      title: "Cadet Academic Merits, Tuition Incentives & Service Privileges",
      content: "Did you know that serving with the San Enrique ROTC unit entitles you to academic leadership credits, civil service examination exemptions upon commission, priority qualification for Armed Forces of the Philippines (AFP) scholarships, and emergency response certifications?",
      category: "benefits",
      priority: "normal" as const,
      created_at: new Date(Date.now() - 259200000).toISOString(),
      image_url: "/images/benefits.jpg",
    },
  ];
}

async function getHomeEvents() {
  const supabase = createOptionalPublicSupabaseClient();
  if (supabase) {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("events")
      .select("id,title,description,location,event_date,start_time,event_type,image_url")
      .eq("is_published", true)
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .limit(4);

    if (data && data.length > 0) {
      return data;
    }

    // If no upcoming events, fetch the latest published events
    const { data: latestEvents } = await supabase
      .from("events")
      .select("id,title,description,location,event_date,start_time,event_type,image_url")
      .eq("is_published", true)
      .order("event_date", { ascending: false })
      .limit(4);

    if (latestEvents && latestEvents.length > 0) {
      return latestEvents;
    }
  }

  return demoEvents.slice(0, 4).map((item, index) => ({
    id: `demo-${index}`,
    title: item.title,
    description: item.body,
    location: item.place,
    event_date: item.date,
    start_time: null,
    event_type: "training",
    image_url: null,
  }));
}

async function getHomeGalleryAlbums() {
  const supabase = createOptionalPublicSupabaseClient();
  let dbAlbums: GalleryAlbum[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("gallery_albums")
      .select(
        "id,title,description,cover_image_url,category,created_at,updated_at,gallery_images(id,title,description,image_url,category,is_published,created_at)"
      )
      .eq("is_published", true)
      .order("updated_at", { ascending: false })
      .limit(12);

    if (data && data.length > 0) {
      dbAlbums = data
        .map((album: any) => {
          const photos: GallerySlideItem[] = (album.gallery_images ?? [])
            .filter((image: any) => image.is_published !== false)
            .map((image: any) => ({
              id: image.id,
              src: image.image_url,
              title: album.title,
              category: album.category || image.category || "Unit Activity",
              desc: album.description || image.description || "Official San Enrique ROTC photographic record.",
            }));

          return {
            id: album.id,
            title: album.title,
            category: album.category || "Unit Activity",
            date: "Published Gallery",
            description: album.description || "Official San Enrique ROTC photo archive.",
            coverImage: album.cover_image_url || photos[0]?.src || "/images/gallery.jpg",
            photos,
          };
        })
        .filter((album) => album.photos.length > 0);
    }
  }

  const dbTitles = new Set(dbAlbums.map((album) => album.title.toLowerCase()));
  const builtInAlbums = OFFICIAL_ALBUMS.filter((album) => !dbTitles.has(album.title.toLowerCase()));

  return [...dbAlbums, ...builtInAlbums].slice(0, 12);
}

export default async function HomePage() {
  const [homeGalleryAlbums, homeAnnouncements, homeEvents] = await Promise.all([
    getHomeGalleryAlbums(),
    getHomeAnnouncements(),
    getHomeEvents(),
  ]);

  return (
    <SiteShell>
      <main>
        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Looping background slideshow */}
          <HeroSlider initialImage="/images/home.jpg" />
          {/* Subtle Ambient Radial Glows */}
          <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-field/10 blur-3xl z-10" />
          <div className="pointer-events-none absolute -right-20 top-40 h-96 w-96 rounded-full bg-gold/10 blur-3xl z-10" />

          <div className="relative z-10 mx-auto grid min-h-[88vh] max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-[1fr_0.9fr]">
            {/* Left */}
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-white/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-gold shadow-sm backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-gold animate-pulse-soft" aria-hidden="true" />
                San Enrique ROTC Unit • Official Command
              </span>
              <h1 className="mt-5 max-w-2xl text-5xl font-extrabold leading-[1.08] tracking-tight text-white md:text-6xl lg:text-7xl drop-shadow-lg">
                Discipline.{" "}
                <span className="text-gold">Leadership.</span>{" "}
                Service.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/80 md:text-lg drop-shadow">
                Official ROTC command portal for cadet registration, dynamic formation attendance,
                tactical training updates, and digital military credential services.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/register" size="lg" className="shadow-lg shadow-field/20 hover:shadow-glow-field btn-press">
                  Register as a Cadet
                </ButtonLink>
                <ButtonLink href="/cadet" variant="secondary" size="lg" className="border-gold/40 hover:border-gold shadow-sm btn-press">
                  Explore Cadet Portal
                </ButtonLink>
              </div>

              {/* Trust indicators */}
              <div className="mt-10 flex flex-wrap items-center gap-6 text-xs font-semibold uppercase tracking-wider text-slate">
                {["Free Registration", "Admin-Verified", "Supabase Secured", "Live QR Ledger"].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-field-emerald" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — command card */}
            <div className="animate-fade-up delay-200">
              <div className="relative overflow-hidden rounded-2xl border-2 border-gold/40 bg-white/40 p-2.5 shadow-2xl backdrop-blur-md transition-transform duration-300 hover:scale-[1.01]">
                {/* Radar sweep scanning line */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-gold/30 via-field/20 to-transparent animate-radar-sweep" />

                <div className="field-hero relative overflow-hidden rounded-xl p-6 text-white shadow-inner">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between border-b border-white/15 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-xl border border-gold/50 bg-dark/80 text-gold shadow-lg shadow-black/40">
                        <ShieldCheck className="h-6 w-6 text-gold" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-glow" />
                          <p className="text-2xs font-extrabold uppercase tracking-[0.22em] text-gold-light">
                            COMMAND OPERATIONS
                          </p>
                        </div>
                        <h2 className="text-lg font-extrabold tracking-tight">San Enrique ROTC Platform</h2>
                      </div>
                    </div>
                    <span className="rounded-md border border-emerald-400/30 bg-emerald-500/20 px-2.5 py-1 text-2xs font-mono font-bold text-emerald-300 shadow-sm">
                      ONLINE • SUPABASE
                    </span>
                  </div>

                  {/* Operational Cards Grid */}
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/15 bg-dark/60 p-3.5 backdrop-blur-sm transition-all hover:border-gold/40 hover:bg-dark/80">
                      <span className="text-3xs font-mono uppercase tracking-widest text-gold-light block font-bold">SECURE CLOUD</span>
                      <strong className="mt-1 block text-sm font-bold text-white">Cadet Roster</strong>
                      <span className="mt-1 text-2xs text-white/70 block">PostgreSQL Database</span>
                    </div>
                    <div className="rounded-xl border border-white/15 bg-dark/60 p-3.5 backdrop-blur-sm transition-all hover:border-gold/40 hover:bg-dark/80">
                      <span className="text-3xs font-mono uppercase tracking-widest text-gold-light block font-bold">DYNAMIC QR</span>
                      <strong className="mt-1 block text-sm font-bold text-white">Assembly Ledger</strong>
                      <span className="mt-1 text-2xs text-white/70 block">Formation Token Sync</span>
                    </div>
                    <div className="rounded-xl border border-white/15 bg-dark/60 p-3.5 backdrop-blur-sm transition-all hover:border-gold/40 hover:bg-dark/80">
                      <span className="text-3xs font-mono uppercase tracking-widest text-gold-light block font-bold">VERIFIED PASS</span>
                      <strong className="mt-1 block text-sm font-bold text-white">Digital Military ID</strong>
                      <span className="mt-1 text-2xs text-white/70 block">Instant Generation</span>
                    </div>
                    <div className="rounded-xl border border-white/15 bg-dark/60 p-3.5 backdrop-blur-sm transition-all hover:border-gold/40 hover:bg-dark/80">
                      <span className="text-3xs font-mono uppercase tracking-widest text-gold-light block font-bold">MOBILE EXPO</span>
                      <strong className="mt-1 block text-sm font-bold text-white">Android Application</strong>
                      <span className="mt-1 text-2xs text-white/70 block">Offline Scanner Cache</span>
                    </div>
                  </div>

                  {/* System Coordinates Bar */}
                  <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-3 text-3xs font-mono text-white/60">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      STATUS: OPERATIONAL
                    </span>
                    <span className="text-gold-light font-bold">UNIT: SAN ENRIQUE ROTC</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Community Defense Centers Rolling Ticker Strip ──── */}
        <section className="relative overflow-hidden border-y border-field/15 bg-white py-3.5 shadow-xs">
          {/* Subtle edge fades */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 md:w-28 bg-gradient-to-r from-white via-white/85 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 md:w-28 bg-gradient-to-l from-white via-white/85 to-transparent z-10" />

          {/* Infinite Rolling Track */}
          <div className="animate-ticker-roll flex items-center gap-6 py-1">
            {[0, 1].map((half) => (
              <div key={half} className="flex items-center gap-6 shrink-0">
                {communityDefenseCenters.map((unit, i) => (
                  <div
                    key={`${half}-${i}`}
                    className="group flex items-center gap-3.5 px-4 py-2.5 rounded-xl border border-field/15 bg-mist/40 hover:bg-white hover:border-gold/50 hover:shadow-card transition-all shrink-0 w-[330px] md:w-[360px] select-none cursor-default"
                  >
                    <div className="relative h-11 w-11 shrink-0 grid place-items-center rounded-lg bg-white p-1 border border-field/15 shadow-2xs group-hover:border-gold/40 transition-colors">
                      <img
                        src={unit.logo}
                        alt={unit.title}
                        className="h-full w-full object-contain drop-shadow-xs"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xs md:text-sm font-black text-charcoal truncate group-hover:text-field transition-colors">
                        {unit.title}
                      </h3>
                      <p className="mt-0.5 text-3xs md:text-2xs font-mono font-medium text-slate truncate">
                        {unit.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* ── Official Command Feed & Dispatches (Facebook Style) ── */}
        <section className="py-12 md:py-16 bg-cream">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-field/20 bg-field/10 px-3 py-1 text-3xs font-mono font-bold uppercase tracking-wider text-field mb-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  COMMAND POST • LIVE DISPATCHES
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-charcoal tracking-tight">
                  Unit Feed & Official Updates
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-slate max-w-2xl leading-relaxed">
                  Latest military bulletins, drill guidelines, enlistment requirements, and field activity photos published by San Enrique ROTC Command Headquarters.
                </p>
              </div>

              <Link
                href="/announcements"
                className="inline-flex items-center gap-2 rounded-xl border border-field/20 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-field shadow-sm hover:bg-field hover:text-white transition-all self-start md:self-auto shrink-0"
              >
                All Bulletins
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Facebook Posts Feed - Single Column Centered */}
            <div className="mx-auto max-w-2xl space-y-6">
              {homeAnnouncements.map((post) => (
                <FacebookPostCard
                  key={post.id}
                  post={{
                    id: post.id,
                    title: post.title,
                    content: post.content,
                    category: post.category,
                    priority: post.priority as any,
                    image_url: post.image_url,
                    created_at: post.created_at,
                    author: "San Enrique ROTC Unit Command",
                    authorAvatar: "/logo.png",
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── Updated Gallery Album Groups ────────────────────── */}
        <section className="pt-8 pb-12 md:pt-10 md:pb-16 overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4 md:mb-6">
            <SectionHeading
              eyebrow="Latest Gallery Groups"
              title="Updated ROTC album groups"
              body="The newest published gallery albums automatically appear here, including MS41-42, 1st Instruction, ceremonies, and school activities."
            />
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 rounded-xl border border-field/20 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-field shadow-sm hover:bg-field hover:text-white transition-all self-start md:self-auto"
            >
              View Full Gallery
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mx-auto max-w-7xl px-4">
            <HomeAlbumSlider albums={homeGalleryAlbums} />
          </div>
        </section>

        {/* ── Upcoming Events & Activities (Featured Solo Section) ─ */}
        <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <SectionHeading
              eyebrow="Upcoming Events & Activities"
              title="Latest training & operations"
              body="Stay up to date with official drills, graduation ceremonies, and unit field operations."
            />
            <Link
              href="/events"
              className="inline-flex items-center gap-1.5 rounded-xl border border-field/20 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-field shadow-sm hover:bg-field hover:text-white transition-all self-start sm:self-auto"
            >
              All Events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {homeEvents.map((item) => {
              const dateObj = new Date(item.event_date);
              const eventPhoto = item.image_url || "/images/events.jpg";

              return (
                <article
                  key={item.id}
                  className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-field/10 bg-white shadow-card transition-all duration-300 hover:border-gold/45 hover:shadow-xl"
                >
                  {/* Left: Picture with date badge */}
                  <div className="relative h-48 sm:h-auto sm:w-48 md:w-52 shrink-0 overflow-hidden bg-forest-deep">
                    <img
                      src={eventPhoto}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                    <div className="absolute top-3 left-3 flex flex-col items-center justify-center rounded-xl bg-field/90 backdrop-blur-md px-3 py-1.5 text-center text-white border border-white/20 shadow-md">
                      <span className="text-3xs font-black uppercase tracking-wider text-brass">
                        {dateObj.toLocaleString("en", { month: "short" })}
                      </span>
                      <strong className="text-xl font-black leading-none text-white">
                        {dateObj.getDate()}
                      </strong>
                    </div>
                  </div>

                  {/* Right: Info */}
                  <div className="flex flex-1 flex-col justify-between p-5 md:p-6">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded bg-gold/15 px-2.5 py-0.5 text-3xs font-black uppercase tracking-wider text-field">
                          {item.event_type}
                        </span>
                        <span className="text-3xs font-bold text-slate">
                          {item.event_date}
                        </span>
                      </div>
                      <h3 className="mt-2.5 text-lg md:text-xl font-black text-charcoal group-hover:text-field transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate">
                        <MapPin className="h-3.5 w-3.5 text-brass shrink-0" />
                        <span className="line-clamp-1">{item.location}</span>
                      </p>
                      <p className="mt-2.5 line-clamp-2 text-xs leading-5 text-slate">
                        {item.description}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-field/10 pt-3">
                      <span className="text-xs font-bold text-charcoal">
                        {item.start_time ? `Time: ${item.start_time}` : "Official Schedule"}
                      </span>
                      <Link
                        href={`/events/${item.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-field hover:text-forest transition-colors"
                      >
                        View Details
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── About The Unit ────────────────────────────────────── */}
        <section className="bg-mist">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="flex flex-col rounded-xl border border-field/10 bg-white p-5 shadow-card">
              <div className="flex-1 rounded-lg bg-field p-8 text-white">
                <BookOpenCheck className="h-9 w-9 text-brass" aria-hidden="true" />
                <p className="mt-12 text-xs font-semibold uppercase tracking-[0.18em] text-brass">
                  San Enrique ROTC Unit
                </p>
                <p className="mt-3 text-xl font-bold leading-snug">
                  Department of Military Science & Tactics • Building leaders of tomorrow through discipline and service.
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <SectionHeading
                eyebrow="About San Enrique ROTC"
                title="Developing discipline, honor and leadership"
                body="The San Enrique Reserve Officers' Training Corps Unit trains, molds, and equips cadet students with basic military fundamentals, leadership command, civic readiness, and disaster response skills for national defense and nation building."
              />
              <div className="mt-6 grid gap-2 sm:grid-cols-3">
                {["Discipline", "Loyalty", "Service"].map((item) => (
                  <div
                    key={item}
                    className="rounded-md border border-field/10 bg-white px-4 py-3 text-sm font-semibold text-charcoal shadow-card"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <ButtonLink href="/about">Read Full History</ButtonLink>
              </div>
            </div>
          </div>
        </section>

        {/* ── Benefits ────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 py-16">
          <SectionHeading
            eyebrow="Benefits"
            title="Practical growth for cadets"
            align="center"
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map(([title, body], index) => (
              <article
                key={title}
                className="rounded-lg border border-field/10 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <span className="text-xs font-bold text-brass">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-base font-semibold text-charcoal">{title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── Registration process ─────────────────────────────── */}
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16">
            <SectionHeading
              eyebrow="Registration Process"
              title="From application to cadet services"
            />
            <div className="relative mt-10 grid gap-4 lg:grid-cols-4">
              {/* Connector line */}
              <div
                className="absolute left-0 right-0 top-7 hidden h-px bg-field/10 lg:block"
                aria-hidden="true"
              />
              {process.map(([number, title, body]) => (
                <article
                  key={number}
                  className="relative rounded-lg border border-field/10 bg-cream p-5"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-field text-xs font-bold text-white shadow-sm">
                    {number}
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-charcoal">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate">{body}</p>
                </article>
              ))}
            </div>
            <div className="mt-8">
              <ButtonLink href="/register">Start Registration</ButtonLink>
            </div>
          </div>
        </section>

        {/* ── Digital services ─────────────────────────────────── */}
        <section className="field-hero text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass">
                Digital Cadet Services
              </p>
              <h2 className="mt-3 text-3xl font-bold leading-snug md:text-4xl">
                Your ROTC services, connected
              </h2>
              <p className="mt-4 max-w-md text-base leading-7 text-white/70">
                The web portal and Android app share Supabase Auth, secure profiles, QR
                attendance, events, announcements, and digital ID data.
              </p>
              <ul className="mt-6 grid gap-2.5">
                {[
                  "Digital Cadet ID",
                  "Attendance Records",
                  "Announcements",
                  "Event Updates",
                  "Secure Profile",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-white/85">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-brass" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <ButtonLink href="/cadet" variant="light" size="lg">
                  Explore Cadet Portal
                </ButtonLink>
              </div>
            </div>
            <div className="rounded-xl border border-white/12 bg-white/8 p-5 backdrop-blur-sm">
              <div className="rounded-lg bg-cream p-5 text-charcoal">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass">
                  Mobile Preview
                </p>
                <h3 className="mt-2 text-xl font-bold text-charcoal">Cadet Home</h3>
                <div className="mt-4 grid gap-2.5">
                  <div className="rounded-md bg-field p-4 text-white">
                    <QrCode className="h-7 w-7 text-brass" aria-hidden="true" />
                    <p className="mt-2 text-sm font-semibold">QR Attendance</p>
                  </div>
                  <div className="rounded-md border border-field/10 bg-white px-4 py-3 text-sm font-semibold text-charcoal">
                    Digital ID
                  </div>
                  <div className="rounded-md border border-field/10 bg-white px-4 py-3 text-sm font-semibold text-charcoal">
                    Attendance Summary
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Gallery preview ──────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 py-16">
          <SectionHeading eyebrow="Gallery Preview" title="Formation, training, and service" />
          <div className="mt-8 grid auto-rows-[160px] gap-3 md:grid-cols-4">
            {["Formation", "Training", "Ceremonies", "Community Service", "School Activities"].map(
              (item, index) => (
                <div
                  key={item}
                  className={`flex flex-col justify-end rounded-lg bg-field p-4 text-white shadow-card ${
                    index === 0 ? "md:col-span-2 md:row-span-2" : ""
                  }`}
                >
                  <Camera
                    className={`text-brass ${index === 0 ? "h-8 w-8" : "h-6 w-6"}`}
                    aria-hidden="true"
                  />
                  <p className={`mt-2 font-semibold ${index === 0 ? "text-xl" : "text-sm"}`}>
                    {item}
                  </p>
                </div>
              )
            )}
          </div>
          <div className="mt-6">
            <ButtonLink href="/gallery" variant="secondary">
              Full Gallery
            </ButtonLink>
          </div>
        </section>

        {/* ── CTA banner (Elevated Card) ─────────────────────────── */}
        <section className="bg-cream py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="relative overflow-hidden rounded-2xl border border-gold/35 bg-gradient-to-r from-forest-deep via-forest to-forest-dark px-6 py-10 sm:px-10 sm:py-12 text-white shadow-xl">
              {/* Subtle Ambient Radial Glow */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
              <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-field/20 blur-3xl" />

              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/10 px-3 py-1 text-3xs font-bold uppercase tracking-wider text-gold mb-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                    Enlistment & Cadet Portal
                  </div>
                  <h2 className="text-2xl font-black md:text-3xl lg:text-4xl tracking-tight text-white">
                    Ready to begin your ROTC journey?
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">
                    Register online and access your personal digital QR pass, training documents, and command updates through the official San Enrique ROTC platform.
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-3">
                  <ButtonLink
                    href="/register"
                    size="lg"
                    className="shadow-lg shadow-black/20 hover:shadow-glow-field btn-press"
                  >
                    Register Now
                  </ButtonLink>
                  <ButtonLink
                    href="/download"
                    variant="secondary"
                    size="lg"
                    className="border-gold/40 hover:border-gold shadow-sm btn-press"
                  >
                    Download App
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
