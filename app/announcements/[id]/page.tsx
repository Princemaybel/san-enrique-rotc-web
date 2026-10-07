import Link from "next/link";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui";
import { announcements as demoAnnouncements } from "@/lib/content";
import { createOptionalPublicSupabaseClient } from "@/lib/supabase/public-server";

export const revalidate = 60;

export default async function AnnouncementDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createOptionalPublicSupabaseClient();
  let item: { title: string; content: string; category: string; created_at: string } | null = null;

  if (supabase && !id.startsWith("demo-")) {
    const { data } = await supabase.from("announcements").select("title,content,category,created_at").eq("id", id).eq("is_published", true).maybeSingle();
    item = data;
  }

  if (!item && id.startsWith("demo-")) {
    const demo = demoAnnouncements[Number(id.replace("demo-", ""))];
    if (demo) item = { title: demo.title, content: demo.body, category: demo.label, created_at: new Date().toISOString() };
  }

  return (
    <SiteShell>
      <PageHero eyebrow={item?.category ?? "Announcement"} title={item?.title ?? "Announcement not found"} body={item ? new Date(item.created_at).toLocaleDateString() : "This announcement is unavailable or unpublished."} />
      <main className="mx-auto max-w-3xl px-4 py-14">
        <p className="leading-8 text-field/75">{item?.content ?? "Please return to the announcements page."}</p>
        <Link href="/announcements" className="mt-8 inline-flex rounded-md border border-field/20 px-5 py-3 font-black text-field">Back to Announcements</Link>
      </main>
    </SiteShell>
  );
}
