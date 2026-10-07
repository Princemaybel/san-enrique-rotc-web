import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui";
import { events as demoEvents } from "@/lib/content";
import { createOptionalPublicSupabaseClient } from "@/lib/supabase/public-server";

export const revalidate = 60;

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createOptionalPublicSupabaseClient();
  let event: { title: string; description: string; location: string; event_date: string; start_time: string | null; end_time: string | null; requirements: string | null; uniform_info: string | null; instructions: string | null } | null = null;

  if (supabase && !id.startsWith("demo-")) {
    const { data } = await supabase.from("events").select("title,description,location,event_date,start_time,end_time,requirements,uniform_info,instructions").eq("id", id).eq("is_published", true).maybeSingle();
    event = data;
  }

  if (!event && id.startsWith("demo-")) {
    const demo = demoEvents[Number(id.replace("demo-", ""))];
    if (demo) event = { title: demo.title, description: demo.body, location: demo.place, event_date: demo.date, start_time: null, end_time: null, requirements: "Requirements are provided by the unit administrator.", uniform_info: "Uniform information will be announced before the activity.", instructions: "Arrive early and bring required identification." };
  }

  return (
    <SiteShell>
      <PageHero eyebrow="Event Details" title={event?.title ?? "Event not found"} body={event ? event.description : "This event is unavailable or unpublished."} />
      <main className="mx-auto max-w-4xl px-4 py-14">
        {event ? (
          <div className="grid gap-4">
            <p className="flex gap-3 rounded-lg border border-field/10 bg-white p-4 font-bold text-field"><CalendarDays className="h-5 w-5 text-brass" /> {new Date(event.event_date).toLocaleDateString()} {event.start_time ?? ""}</p>
            <p className="flex gap-3 rounded-lg border border-field/10 bg-white p-4 font-bold text-field"><MapPin className="h-5 w-5 text-brass" /> {event.location}</p>
            {[["Requirements", event.requirements], ["Uniform", event.uniform_info], ["Instructions", event.instructions]].map(([title, body]) => body ? (
              <section key={title} className="rounded-lg border border-field/10 bg-white p-5 shadow-sm">
                <h2 className="font-black text-field">{title}</h2>
                <p className="mt-2 text-field/70">{body}</p>
              </section>
            ) : null)}
          </div>
        ) : null}
        <Link href="/events" className="mt-8 inline-flex rounded-md border border-field/20 px-5 py-3 font-black text-field">Back to Events</Link>
      </main>
    </SiteShell>
  );
}
