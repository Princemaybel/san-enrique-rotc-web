"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  ImagePlus,
  Megaphone,
  Plus,
  Save,
  Trash2,
  X,
  Sparkles,
  Camera,
  CheckCircle2,
  Globe,
  Upload,
  LogOut,
} from "lucide-react";
import { PortalShell } from "@/components/portal-shell";
import { FacebookPostCard } from "@/components/facebook-post-card";
import { createBrowserClient } from "@/lib/supabase/client";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { AdminLogin } from "@/components/admin-login";

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

const CATEGORY_PRESETS = [
  { label: "Announcements Page", target: "/announcements + Home", icon: "📢", key: "announcement" },
  { label: "Cadet Benefits Page", target: "/benefits + Home", icon: "⭐", key: "benefits" },
  { label: "Requirements Page", target: "/requirements + Home", icon: "📜", key: "requirements" },
  { label: "Unit Gallery Page", target: "/gallery + Home", icon: "📸", key: "gallery" },
  { label: "About Unit Page", target: "/about + Home", icon: "🎖️", key: "about" },
  { label: "Training Drill", target: "/announcements + Home", icon: "🎯", key: "training" },
];

const emptyForm = {
  title: "",
  content: "",
  category: "announcement",
  priority: "normal" as Announcement["priority"],
  image_url: "",
  is_published: true,
};

export default function AdminAnnouncementsPage() {
  const { isAdmin, isLoading, profile } = useAdminAuth();
  const supabase = useMemo(() => createBrowserClient(), []);
  const [items, setItems] = useState<Announcement[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [adminFilter, setAdminFilter] = useState("all");

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      setMessage("Please provide both a title and description for your post.");
      return;
    }

    setSaving(true);
    setMessage("");
    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category.trim() || "announcement",
      priority: form.priority,
      image_url: form.image_url.trim() || null,
      is_published: form.is_published,
      updated_at: new Date().toISOString(),
    };

    const result = editingId
      ? await supabase.from("announcements").update(payload).eq("id", editingId)
      : await supabase.from("announcements").insert(payload);

    if (result.error) {
      setMessage(result.error.message);
    } else {
      setMessage(editingId ? "✅ Post updated successfully." : "✅ Post published to the live feed!");

      // Broadcast notification to cadets
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
          }
        } catch {}
      }

      resetForm();
      await loadItems();
    }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;
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
      setMessage("Please select a valid image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setMessage("Image must be 8MB or smaller.");
      return;
    }

    setUploading(true);
    setMessage("");

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase();
    const path = `announcements/${Date.now()}-${baseName}.${extension}`;

    try {
      const { error } = await supabase.storage.from("announcements").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

      if (!error) {
        const { data } = supabase.storage.from("announcements").getPublicUrl(path);
        setForm((current) => ({ ...current, image_url: data.publicUrl }));
        setMessage("✅ Photo attached successfully!");
        setUploading(false);
        return;
      }
    } catch {}

    // Fallback: Read as base64 data URL if storage upload has network/permission issue
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setForm((current) => ({ ...current, image_url: dataUrl }));
      setMessage("✅ Photo attached!");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mist">
        <div className="text-field animate-pulse font-bold text-sm uppercase tracking-widest">Verifying Command Access...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminLogin />;
  }

  return (
    <PortalShell
      type="admin"
      title="Official Feed & Dispatches"
      subtitle="Publish Facebook-style posts with photos, descriptions, and categories directly to the public home feed and mobile app."
      currentPath="/admin/announcements"
    >
      <div className="mb-6 flex items-center justify-between rounded-xl bg-forest-deep px-5 py-3 shadow-md border border-field/20">
        <div className="flex items-center gap-3 text-gold">
          <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-gold/40 bg-white">
            <img src="/logo.png" alt="Admin" className="h-full w-full object-contain rounded-full" />
          </div>
          <div>
            <div className="text-3xs font-bold uppercase tracking-widest text-mist/70">Command Authenticated</div>
            <div className="text-sm font-black tracking-wide">{profile?.full_name || "Administrator"}</div>
          </div>
        </div>
        <button 
          onClick={() => supabase.auth.signOut()}
          className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3.5 py-2 text-xs font-bold text-red-400 border border-red-500/20 transition-all hover:bg-red-500/20 hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          Secure Sign Out
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1.4fr] items-start">
        {/* ── Left Column: Facebook-Style Post Composer ── */}
        <div className="rounded-2xl border border-field/20 bg-white p-5 sm:p-6 shadow-card">
          <form onSubmit={save} className="space-y-5">
            {/* Facebook Composer Header */}
            <div className="flex items-center justify-between border-b border-field/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full border-2 border-gold/40 p-0.5 bg-white">
                  <img src="/logo.png" alt="Command Logo" className="h-full w-full object-contain rounded-full" />
                </div>
                <div>
                  <strong className="block text-sm font-bold text-charcoal">
                    {editingId ? "Edit Command Post" : "Create Official Command Post"}
                  </strong>
                  <span className="flex items-center gap-1 text-3xs font-mono text-field font-semibold">
                    <Globe className="h-3 w-3" />
                    Public Feed • Website & Mobile App
                  </span>
                </div>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate/20 p-1.5 text-slate hover:bg-mist transition-colors"
                  title="Cancel editing"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Deployment Destination & Category Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-2xs font-extrabold uppercase tracking-widest text-slate">
                  Select Deployment Target
                </label>
                <span className="text-3xs font-mono font-bold text-field bg-field/10 px-2 py-0.5 rounded">
                  * Also deploys live on Home Feed
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORY_PRESETS.map((cat) => {
                  const active = form.category.toLowerCase() === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setForm({ ...form, category: cat.key })}
                      className={`flex flex-col items-start p-2.5 rounded-xl text-left transition-all ${
                        active
                          ? "bg-field text-white shadow-sm ring-2 ring-field/30 scale-101"
                          : "border border-field/15 bg-mist/60 text-charcoal hover:bg-white hover:border-gold/40"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </div>
                      <span className={`mt-1 text-3xs font-mono truncate w-full ${active ? "text-gold-light font-semibold" : "text-slate"}`}>
                        {cat.target}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title / Headline Input */}
            <div>
              <label className="block text-2xs font-extrabold uppercase tracking-widest text-slate mb-1">
                Post Headline / Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Schedule for General Muster Inspection..."
                className="w-full rounded-xl border border-field/20 px-3.5 py-2.5 text-sm font-bold text-charcoal outline-none focus:border-field focus:ring-2 focus:ring-field/15 transition-all"
              />
            </div>

            {/* Description / Content Textarea (Facebook Style) */}
            <div>
              <label className="block text-2xs font-extrabold uppercase tracking-widest text-slate mb-1">
                Description / Caption
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={5}
                placeholder="Write the full announcement, requirement notice, benefits details, or event description here..."
                className="w-full rounded-xl border border-field/20 p-3.5 text-sm text-charcoal leading-relaxed outline-none focus:border-field focus:ring-2 focus:ring-field/15 transition-all"
              />
            </div>

            {/* Photo Attachment (Facebook Style) */}
            <div>
              <label className="block text-2xs font-extrabold uppercase tracking-widest text-slate mb-1">
                Photo Attachment
              </label>

              {form.image_url ? (
                /* Attached Photo Preview */
                <div className="relative overflow-hidden rounded-xl border-2 border-field/20 bg-forest-deep">
                  <img
                    src={form.image_url}
                    alt="Attached preview"
                    className="h-52 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image_url: "" })}
                    className="absolute top-2.5 right-2.5 rounded-full bg-dark/80 p-1.5 text-white shadow hover:bg-red-600 transition-colors"
                    title="Remove photo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <span className="absolute bottom-2 left-2 rounded-md bg-dark/70 px-2 py-0.5 text-3xs font-mono text-white">
                    Photo Attached
                  </span>
                </div>
              ) : (
                /* Photo Picker Dropzone */
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-field/25 bg-mist/50 p-6 text-center transition-all hover:border-field/50 hover:bg-gold/5">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-field/10 text-field">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <strong className="block text-xs font-bold text-charcoal">
                      {uploading ? "Uploading photo..." : "Add Photo to Post"}
                    </strong>
                    <span className="text-3xs text-slate">Supports JPG, PNG, WebP up to 8MB</span>
                  </div>
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
                </label>
              )}
            </div>

            {/* Notification message */}
            {message && (
              <p className="rounded-lg bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-bold text-emerald-800">
                {message}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-field px-5 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-sm hover:bg-forest transition-all disabled:opacity-60 active:scale-[0.98]"
            >
              {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {saving ? "Publishing..." : editingId ? "Update Post" : "Publish to Official Feed"}
            </button>
          </form>
        </div>

        {/* ── Right Column: Live Feed of Published Posts ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-charcoal tracking-tight flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-field" />
              LIVE POSTED FEED ({items.length})
            </h2>
            <span className="text-2xs font-mono text-slate">SYNCS WITH HOMEPAGE</span>
          </div>

          {/* Admin Category Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 pb-1">
            <button
              type="button"
              onClick={() => setAdminFilter("all")}
              className={`rounded-lg px-2.5 py-1 text-2xs font-bold transition-all ${
                adminFilter === "all"
                  ? "bg-field text-white shadow-xs"
                  : "bg-white border border-field/15 text-charcoal hover:bg-mist"
              }`}
            >
              All ({items.length})
            </button>
            {CATEGORY_PRESETS.map((cat) => {
              const count = items.filter((it) => it.category.toLowerCase() === cat.key).length;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setAdminFilter(cat.key)}
                  className={`rounded-lg px-2.5 py-1 text-2xs font-bold transition-all ${
                    adminFilter === cat.key
                      ? "bg-field text-white shadow-xs"
                      : "bg-white border border-field/15 text-charcoal hover:bg-mist"
                  }`}
                >
                  {cat.icon} {cat.label.replace(" Page", "")} ({count})
                </button>
              );
            })}
          </div>

          {loading ? (
            <p className="text-xs text-slate py-8 text-center">Loading feed dispatches...</p>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-field/20 bg-white p-8 text-center">
              <Megaphone className="mx-auto h-8 w-8 text-slate/40 mb-2" />
              <strong className="block text-sm font-bold text-charcoal">No Dispatches Posted Yet</strong>
              <p className="text-xs text-slate mt-1">Use the post composer on the left to publish your first announcement or update with a photo!</p>
            </div>
          ) : (
            <div className="space-y-5">
              {items
                .filter((item) =>
                  adminFilter === "all" ? true : item.category.toLowerCase() === adminFilter.toLowerCase()
                )
                .map((item) => (
                <div key={item.id} className="relative group">
                  {/* The Facebook Post Card */}
                  <FacebookPostCard
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

                  {/* Admin Post Actions Bar */}
                  <div className="mt-2 flex items-center justify-between px-2">
                    <span className="text-3xs font-mono font-bold text-slate">
                      Status: {item.is_published ? "🟢 LIVE ON WEBSITE" : "⚪ DRAFT"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => edit(item)}
                        className="inline-flex items-center gap-1 rounded-md border border-field/20 bg-white px-2.5 py-1 text-2xs font-bold text-charcoal hover:bg-mist transition-colors"
                      >
                        <Edit3 className="h-3 w-3" /> Edit
                      </button>
                      <button
                        onClick={() => togglePublish(item)}
                        className="inline-flex items-center gap-1 rounded-md border border-field/20 bg-white px-2.5 py-1 text-2xs font-bold text-charcoal hover:bg-mist transition-colors"
                      >
                        {item.is_published ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => remove(item.id)}
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-2xs font-bold text-red-700 hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalShell>
  );
}

