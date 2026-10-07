import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui";
import { GalleryGrid } from "@/components/gallery-grid";
import { FacebookPostCard } from "@/components/facebook-post-card";
import {
  OFFICIAL_ALBUMS,
  GalleryAlbum,
  GallerySlideItem,
} from "@/lib/gallery-data";
import { createOptionalPublicSupabaseClient } from "@/lib/supabase/public-server";

export const revalidate = 60;

export default async function GalleryPage() {
  const supabase = createOptionalPublicSupabaseClient();
  let dbAlbums: GalleryAlbum[] = [];
  let galleryDispatches: {
    id: string;
    title: string;
    content: string;
    category: string;
    priority: "normal" | "important" | "urgent";
    image_url?: string | null;
    created_at: string;
  }[] = [];

  if (supabase) {
    // 1. Fetch Albums
    const { data } = await supabase
      .from("gallery_albums")
      .select(
        "id,title,description,cover_image_url,category,created_at,gallery_images(id,title,description,image_url,category,is_published,created_at)"
      )
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(30);

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

    // 2. Fetch Gallery Dispatches / Photo Updates
    const { data: dispatches } = await supabase
      .from("announcements")
      .select("id,title,content,category,priority,image_url,created_at")
      .eq("is_published", true)
      .eq("category", "gallery")
      .order("created_at", { ascending: false });

    if (dispatches && dispatches.length > 0) {
      galleryDispatches = dispatches.map((item) => ({
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

  const dbAlbumTitles = new Set(dbAlbums.map((album) => album.title.toLowerCase()));
  const builtInAlbumsMissingFromSupabase = OFFICIAL_ALBUMS.filter(
    (album) => !dbAlbumTitles.has(album.title.toLowerCase())
  );
  const albums: GalleryAlbum[] = [...builtInAlbumsMissingFromSupabase, ...dbAlbums];

  // Fallback gallery dispatch if none in database yet
  if (galleryDispatches.length === 0) {
    galleryDispatches = [
      {
        id: "gallery-fb-1",
        title: "CEREMONIAL PASS-IN-REVIEW: Advanced Cadets MS41/MS42 Recognition",
        content:
          "Congratulations to the graduating class of Advanced ROTC Officer Candidates for exemplary performance during the Regional Annual Administrative and Tactical Inspection (RAATI). Your discipline, dedication to national defense, and tactical competence reflect the highest traditions of our armed forces.",
        category: "gallery",
        priority: "important",
        image_url: "/images/graduates.jpg",
        created_at: new Date().toISOString(),
      },
    ];
  }

  return (
    <SiteShell>
      <PageHero
        image="/images/gallery.jpg"
        eyebrow="Cadet Visual Archives"
        title="Formations, Drills & Service in Action"
        body="Explore official photography from the MS41-42 graduation rites, 1st Instruction muster, battalion assemblies, leadership mentorship, and field training."
      />
      <main className="mx-auto max-w-7xl px-4 py-12 md:py-16 space-y-16">
        {/* Curated Album Groups */}
        <GalleryGrid initialAlbums={albums} />

        {/* ── Official Photo Dispatches & Highlights (1 Single Column) ── */}
        <section className="space-y-6 pt-6 border-t border-field/15">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 rounded-full border border-field/20 bg-field/10 px-3 py-1 text-3xs font-mono font-bold uppercase tracking-wider text-field mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              GALLERY DISPATCHES • LIVE POSTS
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-charcoal tracking-tight">
              Featured Unit Photo Dispatches
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate">
              Recent photo albums and drill highlights published directly from the Field Command.
            </p>
          </div>

          {/* 1 Single Column Centered Facebook Feed */}
          <div className="mx-auto max-w-2xl space-y-6">
            {galleryDispatches.map((post) => (
              <FacebookPostCard
                key={post.id}
                post={{
                  id: post.id,
                  title: post.title,
                  content: post.content,
                  category: "gallery",
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
      </main>
    </SiteShell>
  );
}
