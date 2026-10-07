"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, EyeOff, Images, ImagePlus, Plus, Save, Trash2, X } from "lucide-react";
import { PortalShell } from "@/components/portal-shell";
import { createBrowserClient } from "@/lib/supabase/client";

type GalleryImage = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: string;
  is_published: boolean;
  created_at: string;
};

type GalleryAlbum = {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  category: string;
  is_published: boolean;
  created_at: string;
  gallery_images?: GalleryImage[];
};

const emptyForm = {
  title: "",
  description: "",
  category: "Unit Activity",
  is_published: true,
};

const categories = [
  "Unit Activity",
  "1st Instruction",
  "MS41-42 Graduate",
  "Training",
  "Ceremonies",
  "Community Service",
  "School Activities",
];

export default function AdminGalleryPage() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [migrationNeeded, setMigrationNeeded] = useState(false);

  async function loadAlbums() {
    setLoading(true);
    const query = await supabase
      .from("gallery_albums")
      .select(
        "id,title,description,cover_image_url,category,is_published,created_at,gallery_images(id,title,description,image_url,category,is_published,created_at)"
      )
      .order("created_at", { ascending: false });

    if (query.error?.message.includes("category") || query.error?.message.includes("is_published")) {
      setMigrationNeeded(true);
      setMessage("Run supabase_gallery_publish_seed.sql in Supabase SQL Editor to enable grouped gallery albums.");
      setAlbums([]);
    } else if (query.error) {
      setMessage(query.error.message);
    } else {
      setMigrationNeeded(false);
      setAlbums((query.data ?? []) as GalleryAlbum[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadAlbums();
  }, []);

  useEffect(() => {
    return () => previewUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [previewUrls]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setFiles([]);
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
  }

  function edit(album: GalleryAlbum) {
    setEditingId(album.id);
    setForm({
      title: album.title,
      description: album.description ?? "",
      category: album.category ?? "Unit Activity",
      is_published: album.is_published,
    });
    setFiles([]);
    setPreviewUrls([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectFiles(fileList: FileList | null) {
    const nextFiles = Array.from(fileList ?? []);
    if (!nextFiles.length) return;

    const invalid = nextFiles.find((file) => !file.type.startsWith("image/"));
    if (invalid) {
      setMessage("Please select image files only.");
      return;
    }

    const tooLarge = nextFiles.find((file) => file.size > 8 * 1024 * 1024);
    if (tooLarge) {
      setMessage("Each gallery image must be 8MB or smaller.");
      return;
    }

    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setFiles(nextFiles);
    setPreviewUrls(nextFiles.map((file) => URL.createObjectURL(file)));
    setMessage(`${nextFiles.length} image${nextFiles.length === 1 ? "" : "s"} selected for this gallery group.`);
  }

  async function uploadImages(albumId: string) {
    const uploadedUrls: string[] = [];

    for (const [index, file] of files.entries()) {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase();
      const path = `gallery/${albumId}/${Date.now()}-${index}-${baseName}.${extension}`;
      const { error } = await supabase.storage.from("gallery").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

      if (error) throw new Error(error.message);

      const { data } = supabase.storage.from("gallery").getPublicUrl(path);
      uploadedUrls.push(data.publicUrl);
    }

    if (uploadedUrls.length) {
      const rows = uploadedUrls.map((imageUrl) => ({
        album_id: albumId,
        title: form.title.trim(),
        description: form.description.trim() || null,
        image_url: imageUrl,
        category: form.category,
        is_published: form.is_published,
      }));
      const { error } = await supabase.from("gallery_images").insert(rows);
      if (error) throw new Error(error.message);
    }

    return uploadedUrls;
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setMessage("Gallery group title is required.");
      return;
    }
    if (!editingId && !files.length) {
      setMessage("Select at least one image for the new gallery group.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        is_published: form.is_published,
        updated_at: new Date().toISOString(),
      };

      let albumId = editingId;
      const currentCover = albums.find((album) => album.id === editingId)?.cover_image_url ?? null;

      if (editingId) {
        const { error } = await supabase.from("gallery_albums").update(payload).eq("id", editingId);
        if (error) throw new Error(error.message);
        await supabase
          .from("gallery_images")
          .update({
            title: payload.title,
            description: payload.description,
            category: payload.category,
            is_published: payload.is_published,
          })
          .eq("album_id", editingId);
      } else {
        const { data, error } = await supabase
          .from("gallery_albums")
          .insert({ ...payload, cover_image_url: null })
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        albumId = data.id;
      }

      if (!albumId) throw new Error("Gallery album was not created.");

      const uploadedUrls = await uploadImages(albumId);
      const nextCover = currentCover || uploadedUrls[0] || null;

      if (nextCover) {
        const { error } = await supabase
          .from("gallery_albums")
          .update({ cover_image_url: nextCover, updated_at: new Date().toISOString() })
          .eq("id", albumId);
        if (error) throw new Error(error.message);
      }

      setMessage(editingId ? "Gallery group updated." : "Gallery group posted.");
      resetForm();
      await loadAlbums();
    } catch (error: any) {
      setMessage(error?.message || "Could not save gallery group.");
    }

    setSaving(false);
  }

  async function remove(album: GalleryAlbum) {
    if (!confirm(`Delete "${album.title}" and all images in this group?`)) return;
    const { error } = await supabase.from("gallery_albums").delete().eq("id", album.id);
    if (error) setMessage(error.message);
    else {
      setMessage("Gallery group deleted.");
      await loadAlbums();
    }
  }

  async function togglePublish(album: GalleryAlbum) {
    const next = !album.is_published;
    const albumUpdate = await supabase
      .from("gallery_albums")
      .update({ is_published: next, updated_at: new Date().toISOString() })
      .eq("id", album.id);
    if (albumUpdate.error) {
      setMessage(albumUpdate.error.message);
      return;
    }

    const imageUpdate = await supabase.from("gallery_images").update({ is_published: next }).eq("album_id", album.id);
    if (imageUpdate.error) setMessage(imageUpdate.error.message);
    else {
      setMessage(next ? "Gallery group published." : "Gallery group unpublished.");
      await loadAlbums();
    }
  }

  return (
    <PortalShell
      type="admin"
      title="Gallery"
      subtitle="Create gallery groups with one title, one caption, and multiple images."
      currentPath="/admin/gallery"
    >
      <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
        <form onSubmit={save} className="rounded-xl border border-field/10 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brass">Visual Archive</p>
              <h2 className="text-xl font-black text-charcoal">{editingId ? "Edit Gallery Group" : "New Gallery Group"}</h2>
            </div>
            {editingId ? (
              <button type="button" onClick={resetForm} className="rounded-md border border-field/20 p-2 text-slate hover:bg-mist" aria-label="Cancel edit">
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <label className="grid gap-1.5 text-sm font-semibold text-charcoal">
            Group Title
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field focus:ring-2 focus:ring-field/15"
              placeholder="Example: MS41-42 Graduation Rites"
            />
          </label>

          <label className="mt-4 grid gap-1.5 text-sm font-semibold text-charcoal">
            Group Caption
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              rows={4}
              className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field focus:ring-2 focus:ring-field/15"
              placeholder="One caption/description for all images in this group."
            />
          </label>

          <label className="mt-4 grid gap-1.5 text-sm font-semibold text-charcoal">
            Gallery Category
            <select
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 grid cursor-pointer gap-2 rounded-lg border border-dashed border-field/25 bg-mist/60 p-4 text-sm font-semibold text-charcoal transition-colors hover:bg-gold/10">
            <span className="inline-flex items-center gap-2">
              <ImagePlus className="h-4 w-4 text-brass" />
              {files.length ? `${files.length} images selected` : editingId ? "Add more images to this group" : "Select multiple gallery images"}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={saving}
              onChange={(event) => {
                selectFiles(event.target.files);
                event.currentTarget.value = "";
              }}
              className="sr-only"
            />
            <span className="text-xs font-normal text-slate">Select many JPG, PNG, or WebP images at once. Each file must be 8MB or smaller.</span>
          </label>

          {previewUrls.length ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {previewUrls.slice(0, 9).map((url, index) => (
                <img key={url} src={url} alt={`Selected gallery image ${index + 1}`} className="aspect-square rounded-md border border-field/10 object-cover" />
              ))}
              {previewUrls.length > 9 ? (
                <div className="grid aspect-square place-items-center rounded-md border border-field/10 bg-mist text-xs font-bold text-slate">
                  +{previewUrls.length - 9}
                </div>
              ) : null}
            </div>
          ) : null}

          <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-charcoal">
            <input type="checkbox" checked={form.is_published} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} />
            Publish this group publicly
          </label>

          {message ? <p className="mt-4 rounded-md bg-gold/10 px-3 py-2 text-sm font-semibold text-charcoal">{message}</p> : null}
          {migrationNeeded ? (
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
              Open Supabase SQL Editor and run <span className="font-black">supabase_gallery_publish_seed.sql</span>, then refresh this page.
            </p>
          ) : null}

          <button disabled={saving || migrationNeeded} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-field px-4 py-3 text-sm font-bold text-white hover:bg-forest disabled:opacity-60">
            {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {saving ? "Saving..." : editingId ? "Save Gallery Group" : "Post Gallery Group"}
          </button>
        </form>

        <section className="rounded-xl border border-field/10 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-charcoal">Gallery Groups</h2>
            <Images className="h-5 w-5 text-brass" />
          </div>

          {loading ? <p className="text-sm text-slate">Loading gallery groups...</p> : null}

          <div className="grid gap-4 lg:grid-cols-2">
            {albums.map((album) => {
              const images = album.gallery_images ?? [];
              const cover = album.cover_image_url || images[0]?.image_url || "/images/gallery.jpg";
              return (
                <article key={album.id} className="overflow-hidden rounded-lg border border-field/10">
                  <div className="relative aspect-[16/10] bg-mist">
                    <img src={cover} alt={album.title} className="h-full w-full object-cover" />
                    <span className={`absolute right-2 top-2 rounded px-2 py-0.5 text-xs font-bold ${album.is_published ? "bg-emerald-600 text-white" : "bg-slate/80 text-white"}`}>
                      {album.is_published ? "Published" : "Draft"}
                    </span>
                    <span className="absolute bottom-2 left-2 rounded bg-charcoal/80 px-2 py-1 text-xs font-bold text-white">
                      {images.length} image{images.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-black text-charcoal">{album.title}</h3>
                    <span className="mt-1 inline-flex rounded bg-gold/10 px-2 py-0.5 text-xs font-bold text-brass">
                      {album.category || "Unit Activity"}
                    </span>
                    <p className="mt-2 line-clamp-2 text-sm text-slate">{album.description || "No caption provided."}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => edit(album)}
                        className="inline-flex items-center gap-1 rounded-md border border-field/20 px-3 py-2 text-xs font-bold text-charcoal hover:bg-mist"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePublish(album)}
                        className={`inline-flex items-center gap-1 rounded-md border px-3 py-2 text-xs font-bold transition-colors ${
                          album.is_published
                            ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {album.is_published ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" /> Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5" /> Publish
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(album)}
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            {!loading && !albums.length ? (
              <p className="rounded-lg border border-dashed border-field/20 p-6 text-center text-sm text-slate lg:col-span-2">
                No gallery groups yet.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </PortalShell>
  );
}
