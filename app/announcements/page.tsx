import Link from "next/link";
import { Search, Tag, AlertCircle, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { EmptyState, PageHero } from "@/components/ui";
import { FacebookPostCard } from "@/components/facebook-post-card";
import { announcements as demoAnnouncements } from "@/lib/content";
import { createOptionalPublicSupabaseClient } from "@/lib/supabase/public-server";

export const revalidate = 60;

const CATEGORY_FILTERS = [
  { label: "All Dispatches", value: "" },
  { label: "📢 Announcements", value: "announcement" },
  { label: "📸 Gallery", value: "gallery" },
  { label: "📜 Requirements", value: "requirements" },
  { label: "⭐ Benefits", value: "benefits" },
  { label: "🎖️ About Unit", value: "about" },
];

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const supabase = createOptionalPublicSupabaseClient();
  const query = params.q?.trim() ?? "";
  const selectedCategory = params.category?.trim().toLowerCase() ?? "";

  let rows: {
    id: string;
    title: string;
    content: string;
    category: string;
    priority: "normal" | "important" | "urgent";
    image_url?: string | null;
    created_at: string;
  }[] = [];

  if (supabase) {
    let request = supabase
      .from("announcements")
      .select("id,title,content,category,priority,image_url,created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(30);

    if (query) request = request.ilike("title", `%${query}%`);
    if (selectedCategory) request = request.ilike("category", `%${selectedCategory}%`);

    const { data } = await request;
    if (data) {
      rows = data.map((item) => ({
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

  // Fallbacks if database is empty or offline
  const fallbackPosts = [
    {
      id: "fb-1",
      title: "MANDATORY FORMATION: Upcoming Sunday General Muster & Inspection",
      content:
        "Attention all San Enrique ROTC Cadets (MS11, MS12, MS21, MS22). The General Assembly and Command Drill Inspection will commence promptly this coming training Sunday at 0630H. Ensure complete Type A Fatigue Uniform with properly polished combat boots and regulation haircut.\n\nAttendance is mandatory and counts towards final commissioning grades. Cadets on medical waiver must report directly to the Battalion Medic with valid physician clearance.",
      category: "announcement",
      priority: "urgent" as const,
      image_url: "/images/training.jpg",
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: "fb-2",
      title: "CEREMONIAL PASS-IN-REVIEW: Advanced Cadets MS41/MS42 Recognition",
      content:
        "Congratulations to the graduating class of Advanced ROTC Officer Candidates for exemplary performance during the Regional Annual Administrative and Tactical Inspection (RAATI). Your discipline, dedication to national defense, and tactical competence reflect the highest traditions of our armed forces.",
      category: "gallery",
      priority: "important" as const,
      image_url: "/images/graduates.jpg",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "fb-3",
      title: "ENLISTMENT REQUIREMENTS: 1st & 2nd Year College Students",
      content:
        "Official requirements for joining San Enrique ROTC Unit this Academic Term:\n\n1. Valid Certificate of Registration (COR) from accredited partner colleges\n2. Two (2) copies 2x2 ID picture in white background with name tag\n3. Medical Clearance signed by a licensed government or school physician\n4. Duly notarized Parent/Guardian Consent Form\n\nSubmit physical copies directly to the ROTC Admin Office, or upload your scanned credentials through your cadet student portal.",
      category: "requirements",
      priority: "normal" as const,
      image_url: "/images/cadets.jpg",
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: "fb-4",
      title: "SCHOLARSHIP & CAREER PRIVILEGES: Benefits of Completing ROTC",
      content:
        "Cadets who complete the San Enrique ROTC Advanced Course receive preferential selection in Philippine Army, Air Force, and Navy Officer Candidate Courses (OCC), government service eligibility, AFP educational financial assistance, and official incorporation into the 6th Regional Community Defense Group (6RCDG) Reserve Force standby roster.",
      category: "benefits",
      priority: "normal" as const,
      image_url: "/images/parade.jpg",
      created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
    {
      id: "fb-5",
      title: "UNIT MISSION & JURISDICTION: 604th CDC / San Enrique ROTC",
      content:
        "San Enrique ROTC Unit operates under the operational command of the 604th Community Defense Center, 6th Regional Community Defense Group (6RCDG), Reserve Command, Philippine Army. Dedicated to fostering military leadership, patriotism, disaster response readiness, and civic action across Western Visayas.",
      category: "about",
      priority: "normal" as const,
      image_url: "/images/hero-rotc.jpg",
      created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    },
  ];

  const items = rows.length ? rows : fallbackPosts;

  return (
    <SiteShell>
      <PageHero
        image="/images/announcements.jpg"
        eyebrow="Command Dispatches & Official Feed"
        title="Official Dispatches & Updates"
        body="Real-time bulletins, muster announcements, enlistment requirements, and field activity photos published by San Enrique ROTC Command Headquarters."
      />

      <main className="mx-auto max-w-7xl px-4 py-12">
        {/* Category Navigation Pills */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {CATEGORY_FILTERS.map((filter) => {
            const isActive =
              (!selectedCategory && !filter.value) ||
              selectedCategory === filter.value;
            return (
              <Link
                key={filter.label}
                href={filter.value ? `/announcements?category=${filter.value}` : "/announcements"}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-field text-white shadow-sm ring-2 ring-field/20"
                    : "bg-white text-charcoal border border-field/15 hover:bg-mist hover:text-field"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        {/* Search Bar */}
        <form className="mb-10 flex gap-3 rounded-2xl border border-field/15 bg-white p-3 shadow-card sm:max-w-xl">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-slate/60" />
            <input
              name="q"
              defaultValue={query}
              placeholder="Search dispatches, drill dates, keywords..."
              className="w-full rounded-xl border-0 bg-transparent py-2.5 pl-10 pr-3 text-sm text-charcoal placeholder:text-slate/50 focus:outline-none focus:ring-0"
            />
          </div>
          {selectedCategory && (
            <input type="hidden" name="category" value={selectedCategory} />
          )}
          <button
            type="submit"
            className="rounded-xl bg-field px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-forest transition-colors"
          >
            Search
          </button>
        </form>

        {/* Feed Grid */}
        {items.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {items.map((item) => (
              <FacebookPostCard
                key={item.id}
                post={{
                  id: item.id,
                  title: item.title,
                  content: item.content,
                  category: item.category,
                  priority: item.priority,
                  image_url: item.image_url,
                  created_at: item.created_at,
                  author: "San Enrique ROTC Unit Command",
                  authorAvatar: "/logo.png",
                }}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<AlertCircle className="h-8 w-8 text-brass" />}
            title="No Dispatches Found"
            body="There are no announcements matching your current search parameters."
          />
        )}
      </main>
    </SiteShell>
  );
}
