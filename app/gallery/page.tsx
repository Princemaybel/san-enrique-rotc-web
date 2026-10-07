import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui";
import { GalleryGrid } from "@/components/gallery-grid";
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

  if (supabase) {
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
  }

  const dbAlbumTitles = new Set(dbAlbums.map((album) => album.title.toLowerCase()));
  const builtInAlbumsMissingFromSupabase = OFFICIAL_ALBUMS.filter(
    (album) => !dbAlbumTitles.has(album.title.toLowerCase())
  );
  const albums: GalleryAlbum[] = [...builtInAlbumsMissingFromSupabase, ...dbAlbums];

  return (
    <SiteShell>
      <PageHero
        image="/images/gallery.jpg"
        eyebrow="Cadet Visual Archives"
        title="Formations, Drills & Service in Action"
        body="Explore official photography from the MS41-42 graduation rites, 1st Instruction muster, battalion assemblies, leadership mentorship, and field training."
      />
      <main className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <GalleryGrid initialAlbums={albums} />
      </main>
    </SiteShell>
  );
}
