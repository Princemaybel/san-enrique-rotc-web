import Link from "next/link";
import { Search, AlertCircle, Megaphone } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { EmptyState, PageHero } from "@/components/ui";
import { FacebookPostCard } from "@/components/facebook-post-card";
import { createOptionalPublicSupabaseClient } from "@/lib/supabase/public-server";

export const revalidate = 60;

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const supabase = createOptionalPublicSupabaseClient();
  const query = params.q?.trim() ?? "";

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
      .in("category", ["announcement", "general", "training"])
      .order("created_at", { ascending: false })
      .limit(30);

    if (query) request = request.ilike("title", `%${query}%`);

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

  // Fallback official announcements if DB is empty
  const fallbackAnnouncements = [
    {
      id: "ann-1",
      title: "MANDATORY FORMATION: Upcoming Sunday General Muster & Inspection",
      content:
        "Attention all San Enrique ROTC Cadets (MS11, MS12, MS21, MS22). The General Assembly and Command Drill Inspection will commence promptly this coming training Sunday at 0630H. Ensure complete Type A Fatigue Uniform with properly polished combat boots and regulation haircut.\n\nAttendance is mandatory and counts towards final commissioning grades. Cadets on medical waiver must report directly to the Battalion Medic with valid physician clearance.",
      category: "announcement",
      priority: "urgent" as const,
      image_url: "/gallery/1st-instruction/instruction-1.jpg",
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: "ann-2",
      title: "MIDTERM DRILL SCHEDULE: Regional Annual Tactical Inspection (RAATI) Briefing",
      content:
        "All Platoon Leaders and Company Executive Officers are directed to assemble at the DMST Headquarters this Friday at 1600H for the operational briefing on the forthcoming Regional Annual Administrative and Tactical Inspection (RAATI).\n\nPlatoon leaders must prepare physical rosters, rifle accountability logs, and tactical gear inspections ahead of time.",
      category: "announcement",
      priority: "important" as const,
      image_url: "/images/announcements.jpg",
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ];

  const items = rows.length ? rows : fallbackAnnouncements;

  return (
    <SiteShell>
      <PageHero
        image="/images/announcements.jpg"
        eyebrow="Official Command Bulletins"
        title="Unit Announcements & Orders"
        body="Real-time directives, muster schedules, and training notices published exclusively by the San Enrique ROTC Unit Command."
      />

      <main className="mx-auto max-w-7xl px-4 py-12">
        {/* Search Bar - Centered */}
        <div className="mx-auto max-w-2xl mb-8">
          <form className="flex gap-3 rounded-2xl border border-field/15 bg-white p-3 shadow-card">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-slate/60" />
              <input
                name="q"
                defaultValue={query}
                placeholder="Search unit announcements and drill orders..."
                className="w-full rounded-xl border-0 bg-transparent py-2 pl-10 pr-3 text-sm text-charcoal placeholder:text-slate/50 focus:outline-none focus:ring-0"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-field px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-forest transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Announcements Feed - 1 Single Centered Column */}
        {items.length ? (
          <div className="mx-auto max-w-3xl space-y-6">
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
            title="No Announcements Found"
            body="There are no announcements matching your current search parameters."
          />
        )}
      </main>
    </SiteShell>
  );
}
