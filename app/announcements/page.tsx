import Link from "next/link";
import { Megaphone, Search, Calendar, Tag, AlertCircle } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { EmptyState, PageHero, StatusBadge } from "@/components/ui";
import { announcements as demoAnnouncements } from "@/lib/content";
import { createOptionalPublicSupabaseClient } from "@/lib/supabase/public-server";

export const revalidate = 60;

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const supabase = createOptionalPublicSupabaseClient();
  const query = params.q?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  let rows: {
    id: string;
    title: string;
    content: string;
    category: string;
    priority: string;
    created_at: string;
  }[] = [];

  if (supabase) {
    let request = supabase
      .from("announcements")
      .select("id,title,content,category,priority,created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(24);
    if (query) request = request.ilike("title", `%${query}%`);
    if (category) request = request.eq("category", category);
    const { data } = await request;
    rows = data ?? [];
  }

  const items = rows.length
    ? rows
    : demoAnnouncements.map((item, index) => ({
        id: `demo-${index}`,
        title: item.title,
        content: item.body,
        category: item.label,
        priority: "normal",
        created_at: new Date().toISOString(),
      }));

  return (
    <SiteShell>
      <PageHero
image="/images/announcements.jpg"
              eyebrow="Announcements & Bulletins"
        title="Official Notices & Dispatches"
        body="Stay informed with real-time updates, military drill schedules, requirements, and unit protocols."
      />
      <main className="mx-auto max-w-7xl px-4 py-12">
        {/* Search & Filter Bar */}
        <form className="mb-8 grid gap-3 rounded-xl border border-field/10 bg-white p-4 shadow-card sm:grid-cols-[1fr_200px_auto]">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 h-4 w-4 text-slate/60" />
            <input
              name="q"
              defaultValue={query}
              placeholder="Search announcements..."
              className="w-full rounded-md border border-field/20 bg-white py-2.5 pl-10 pr-3 text-sm text-charcoal placeholder:text-slate/50 transition-colors focus:border-field focus:outline-none focus:ring-2 focus:ring-field/15"
            />
          </div>
          <div className="relative flex items-center">
            <Tag className="absolute left-3.5 h-4 w-4 text-slate/60" />
            <input
              name="category"
              defaultValue={category}
              placeholder="Category (e.g. Cadets)"
              className="w-full rounded-md border border-field/20 bg-white py-2.5 pl-10 pr-3 text-sm text-charcoal placeholder:text-slate/50 transition-colors focus:border-field focus:outline-none focus:ring-2 focus:ring-field/15"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-field px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-forest hover:shadow active:scale-[0.98]"
          >
            Apply Filter
          </button>
        </form>

        {items.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-field/10 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-field/25 hover:shadow-card-hover"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-field/10 pb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brass">
                      <Megaphone className="h-3.5 w-3.5" />
                      {item.category}
                    </span>
                    <StatusBadge status={item.priority} />
                  </div>
                  <h2 className="mt-3.5 text-lg font-bold leading-snug text-charcoal">
                    {item.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate">
                    {item.content}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-field/10 pt-4 text-xs">
                  <span className="flex items-center gap-1 text-slate">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(item.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <Link
                    href={`/announcements/${item.id}`}
                    className="font-semibold text-field hover:text-forest transition-colors"
                  >
                    Read Details &rarr;
                  </Link>
                </div>
              </article>
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
