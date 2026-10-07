import Link from "next/link";
import { MapPin, Search, Clock, Calendar } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { EmptyState, PageHero } from "@/components/ui";
import { events as demoEvents } from "@/lib/content";
import { createOptionalPublicSupabaseClient } from "@/lib/supabase/public-server";

export const revalidate = 60;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; view?: string }>;
}) {
  const params = await searchParams;
  const supabase = createOptionalPublicSupabaseClient();
  const query = params.q?.trim() ?? "";
  const view = params.view === "past" ? "past" : "upcoming";
  const today = new Date().toISOString().slice(0, 10);
  let rows: {
    id: string;
    title: string;
    description: string;
    location: string;
    event_date: string;
    start_time: string | null;
    event_type: string;
    image_url: string | null;
  }[] = [];

  if (supabase) {
    let request = supabase
      .from("events")
      .select("id,title,description,location,event_date,start_time,event_type,image_url")
      .eq("is_published", true)
      .order("event_date", { ascending: view !== "past" })
      .limit(24);
    request = view === "past" ? request.lt("event_date", today) : request.gte("event_date", today);
    if (query) request = request.ilike("title", `%${query}%`);
    const { data } = await request;
    rows = data ?? [];
  }

  const items = rows.length
    ? rows
    : demoEvents.map((item, index) => ({
        id: `demo-${index}`,
        title: item.title,
        description: item.body,
        location: item.place,
        event_date: item.date,
        start_time: null,
        event_type: "training",
        image_url: "/images/events.jpg",
      }));

  return (
    <SiteShell>
      <PageHero
        image="/images/events.jpg"
        eyebrow="Schedule of Activities"
        title="Events, Drills & Training Operations"
        body="Access training schedules, military ceremonies, physical fitness tests, and leadership workshops."
      />
      <main className="mx-auto max-w-7xl px-4 py-12">
        {/* Filter bar */}
        <form className="mb-8 grid gap-3 rounded-xl border border-field/10 bg-white p-4 shadow-card sm:grid-cols-[1fr_180px_auto]">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-slate/60" />
            <input
              name="q"
              defaultValue={query}
              placeholder="Search training or events..."
              className="w-full rounded-md border border-field/20 bg-white py-2.5 pl-10 pr-3 text-sm text-charcoal placeholder:text-slate/50 transition-colors focus:border-field focus:outline-none focus:ring-2 focus:ring-field/15"
            />
          </div>
          <select
            name="view"
            defaultValue={view}
            className="rounded-md border border-field/20 bg-white px-3 py-2.5 text-sm font-semibold text-charcoal transition-colors focus:border-field focus:outline-none focus:ring-2 focus:ring-field/15"
          >
            <option value="upcoming">Upcoming Events</option>
            <option value="past">Past Events</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-field px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-forest hover:shadow active:scale-[0.98]"
          >
            Filter
          </button>
        </form>

        {items.length ? (
          <div className="grid gap-5">
            {items.map((item) => {
              const dateObj = new Date(item.event_date);
              const hasImage = Boolean(item.image_url);
              const eventPhoto = item.image_url || "/images/events.jpg";

              return (
                <article
                  key={item.id}
                  className="group flex flex-col md:flex-row overflow-hidden rounded-2xl border border-field/10 bg-white shadow-card transition-all duration-300 hover:border-gold/40 hover:shadow-xl"
                >
                  {/* Left Side: Picture with Date Badge */}
                  <div className="relative h-52 md:h-auto md:w-72 lg:w-80 shrink-0 overflow-hidden bg-forest-deep">
                    <img
                      src={eventPhoto}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />

                    {/* Date Badge Overlay */}
                    <div className="absolute top-3 left-3 flex flex-col items-center justify-center rounded-xl bg-field/90 backdrop-blur-md px-3 py-2 text-center text-white border border-white/20 shadow-lg">
                      <span className="text-3xs font-black uppercase tracking-wider text-brass">
                        {dateObj.toLocaleString("en", { month: "short" })}
                      </span>
                      <strong className="text-2xl font-black leading-none text-white">
                        {dateObj.getDate()}
                      </strong>
                      <span className="text-3xs text-white/80 font-semibold">{dateObj.getFullYear()}</span>
                    </div>

                    {/* Event Type Badge */}
                    <span className="absolute bottom-3 left-3 rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-3xs font-black uppercase tracking-wider text-white border border-white/20">
                      {item.event_type}
                    </span>
                  </div>

                  {/* Right Side: Title, Details, Description, and Button */}
                  <div className="flex flex-1 flex-col justify-between p-5 md:p-6">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded bg-gold/15 px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider text-field">
                          {item.event_type}
                        </span>
                        {item.start_time && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-slate">
                            <Clock className="h-3.5 w-3.5 text-brass" />
                            {item.start_time}
                          </span>
                        )}
                      </div>

                      <h2 className="mt-2 text-xl md:text-2xl font-black text-charcoal group-hover:text-field transition-colors">
                        {item.title}
                      </h2>

                      <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate">
                        <MapPin className="h-4 w-4 shrink-0 text-brass" />
                        <span className="line-clamp-1">{item.location}</span>
                      </div>

                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-field/10 flex items-center justify-between">
                      <span className="text-xs text-slate">
                        Date: <strong>{item.event_date}</strong>
                      </span>
                      <Link
                        href={`/events/${item.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-field px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-all hover:bg-forest active:scale-95"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Calendar className="h-8 w-8 text-brass" />}
            title="No Scheduled Events"
            body="There are currently no events matching your filter criteria."
          />
        )}
      </main>
    </SiteShell>
  );
}
