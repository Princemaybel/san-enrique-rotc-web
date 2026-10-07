"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit3, ImagePlus, Megaphone, Plus, Save, Trash2, X } from "lucide-react";
import { PortalShell } from "@/components/portal-shell";
import { createBrowserClient } from "@/lib/supabase/client";

type Announcement = {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: "normal" | "important" | "urgent";
  is_published: boolean;
  image_url: string | null;
  created_at: string;
};

const emptyForm = {
  title: "",
  content: "",
  category: "General",
  priority: "normal" as Announcement["priority"],
  image_url: "",
  is_published: true,
};

export default function AdminAnnouncementsPage() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [items, setItems] = useState<Announcement[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("id,title,content,category,priority,is_published,image_url,created_at")
      .order("created_at", { ascending: false });

    if (error) setMessage(error.message);
    else setItems((data ?? []) as Announcement[]);
    setLoading(false);
  }

  useEffect(() => {
    loadItems();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function edit(item: Announcement) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      content: item.content,
      category: item.category,
      priority: item.priority,
      image_url: item.image_url ?? "",
      is_published: item.is_published,
    });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setMessage("Title and content are required.");
      return;
    }

    setSaving(true);
    setMessage("");
    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category.trim() || "General",
      priority: form.priority,
      image_url: form.image_url.trim() || null,
      is_published: form.is_published,
      updated_at: new Date().toISOString(),
    };

    const result = editingId
      ? await supabase.from("announcements").update(payload).eq("id", editingId)
      : await supabase.from("announcements").insert(payload);

    if (result.error) setMessage(result.error.message);
    else {
      setMessage(editingId ? "Announcement updated." : "Announcement posted.");

      // If new published announcement, broadcast notification to all approved cadets
      if (!editingId && form.is_published) {
        try {
          const { data: approvedCadets } = await supabase
            .from("profiles")
            .select("id, push_token")
            .eq("role", "cadet")
            .eq("status", "approved");

          if (approvedCadets && approvedCadets.length > 0) {
            const notifRows = approvedCadets.map((c) => ({
              profile_id: c.id,
              title: `📢 ${form.title.trim()}`,
              body: form.content.trim().slice(0, 140),
              notification_type: "announcement",
              is_read: false,
            }));
            await supabase.from("notifications").insert(notifRows);

            // Send remote push if push tokens available
            const tokens = approvedCadets.map((c) => c.push_token).filter(Boolean);
            if (tokens.length > 0) {
              const pushMessages = tokens.map((token) => ({
                to: token,
                sound: "default",
                title: `📢 ROTC: ${form.title.trim()}`,
                body: form.content.trim().slice(0, 140),
                data: { category: form.category, priority: form.priority },
              }));
              fetch("https://exp.host/--/api/v2/push/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(pushMessages),
              }).catch(() => {});
            }
          }
        } catch {
          // Non-blocking notification dispatch
        }
      }

      resetForm();
      await loadItems();
    }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this announcement?")) return;
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) setMessage(error.message);
    else await loadItems();
  }

  async function togglePublish(item: Announcement) {
    const { error } = await supabase
      .from("announcements")
      .update({ is_published: !item.is_published, updated_at: new Date().toISOString() })
      .eq("id", item.id);
    if (error) setMessage(error.message);
    else await loadItems();
  }

  async function uploadImage(file: File) {
    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be 5MB or smaller.");
      return;
    }

    setUploading(true);
    setMessage("");
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase();
    const path = `announcements/${Date.now()}-${baseName}.${extension}`;
    const { error } = await supabase.storage.from("announcements").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

    if (error) {
      setMessage(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("announcements").getPublicUrl(path);
    setForm((current) => ({ ...current, image_url: data.publicUrl }));
    setMessage("Image uploaded and attached.");
    setUploading(false);
  }

  return (
    <PortalShell type="admin" title="Announcements" subtitle="Post, edit, publish, and remove official ROTC notices." currentPath="/admin/announcements">
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <form onSubmit={save} className="rounded-xl border border-field/10 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brass">Content Desk</p>
              <h2 className="text-xl font-black text-charcoal">{editingId ? "Edit Announcement" : "New Announcement"}</h2>
            </div>
            {editingId ? (
              <button type="button" onClick={resetForm} className="rounded-md border border-field/20 p-2 text-slate hover:bg-mist" aria-label="Cancel edit">
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <label className="grid gap-1.5 text-sm font-semibold text-charcoal">
            Title
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field focus:ring-2 focus:ring-field/15" />
          </label>
          <label className="mt-4 grid gap-1.5 text-sm font-semibold text-charcoal">
            Content
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={7} className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field focus:ring-2 focus:ring-field/15" />
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold text-charcoal">
              Category
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field" />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-charcoal">
              Priority
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Announcement["priority"] })} className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field">
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
          </div>

          {/* Upload button only — no raw URL input */}
          <label className="mt-3 grid cursor-pointer gap-2 rounded-lg border border-dashed border-field/25 bg-mist/60 p-4 text-sm font-semibold text-charcoal transition-colors hover:bg-gold/10">
            <span className="inline-flex items-center gap-2">
              <ImagePlus className="h-4 w-4 text-brass" />
              {uploading ? "Uploading image..." : "Upload announcement image"}
            </span>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadImage(file);
                e.currentTarget.value = "";
              }}
              className="sr-only"
            />
            <span className="text-xs font-normal text-slate">JPG, PNG, or WebP up to 5MB. The uploaded image is saved to Supabase Storage.</span>
          </label>
          {form.image_url ? (
            <div className="mt-3 overflow-hidden rounded-lg border border-field/10 bg-mist">
              <img src={form.image_url} alt="Announcement preview" className="h-40 w-full object-cover" />
            </div>
          ) : null}
          <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-charcoal">
            <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
            Publish publicly
          </label>

          {message ? <p className="mt-4 rounded-md bg-gold/10 px-3 py-2 text-sm font-semibold text-charcoal">{message}</p> : null}

          <button disabled={saving} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-field px-4 py-3 text-sm font-bold text-white hover:bg-forest disabled:opacity-60">
            {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {saving ? "Saving..." : editingId ? "Save Changes" : "Post Announcement"}
          </button>
        </form>

        <section className="rounded-xl border border-field/10 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-charcoal">Published Board</h2>
            <Megaphone className="h-5 w-5 text-brass" />
          </div>
          {loading ? <p className="text-sm text-slate">Loading announcements...</p> : null}
          <div className="grid gap-3">
            {items.map((item) => (
              <article key={item.id} className="rounded-lg border border-field/10 p-4">
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="mb-3 h-32 w-full rounded-md object-cover" />
                ) : null}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-brass">{item.category} • {item.priority}</p>
                    <h3 className="mt-1 text-lg font-black text-charcoal">{item.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate">{item.content}</p>
                  </div>
                  <span className={`rounded px-2 py-1 text-xs font-bold ${item.is_published ? "bg-emerald-100 text-emerald-800" : "bg-slate/10 text-slate"}`}>
                    {item.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => edit(item)} className="inline-flex items-center gap-1 rounded-md border border-field/20 px-3 py-2 text-xs font-bold text-charcoal hover:bg-mist"><Edit3 className="h-3.5 w-3.5" /> Edit</button>
                  <button onClick={() => togglePublish(item)} className="rounded-md border border-field/20 px-3 py-2 text-xs font-bold text-charcoal hover:bg-mist">{item.is_published ? "Unpublish" : "Publish"}</button>
                  <button onClick={() => remove(item.id)} className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                </div>
              </article>
            ))}
            {!loading && !items.length ? <p className="rounded-lg border border-dashed border-field/20 p-6 text-center text-sm text-slate">No announcements yet.</p> : null}
          </div>
        </section>
      </div>
    </PortalShell>
  );
}
