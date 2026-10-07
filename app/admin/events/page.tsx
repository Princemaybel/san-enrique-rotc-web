"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Download, Edit3, ImagePlus, Plus, Save, Trash2, Users, X } from "lucide-react";
import { PortalShell } from "@/components/portal-shell";
import { createBrowserClient } from "@/lib/supabase/client";

type EventRow = {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  event_type: "event" | "training";
  requirements: string | null;
  uniform_info: string | null;
  instructions: string | null;
  image_url: string | null;
  is_published: boolean;
};

type RsvpUser = {
  id: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    student_id: string;
    section: string | null;
    course: string | null;
  } | null;
};

const emptyForm = {
  title: "",
  description: "",
  location: "",
  event_date: new Date().toISOString().slice(0, 10),
  start_time: "",
  end_time: "",
  event_type: "event" as EventRow["event_type"],
  requirements: "",
  uniform_info: "",
  instructions: "",
  image_url: "",
  is_published: true,
};

export default function AdminEventsPage() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [items, setItems] = useState<EventRow[]>([]);
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, number>>({});
  const [selectedEventForRsvp, setSelectedEventForRsvp] = useState<EventRow | null>(null);
  const [rsvpList, setRsvpList] = useState<RsvpUser[]>([]);
  const [loadingRsvps, setLoadingRsvps] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadItems() {
    setLoading(true);
    const [{ data: eventsData, error }, { data: rsvpsData }] = await Promise.all([
      supabase
        .from("events")
        .select("id,title,description,location,event_date,start_time,end_time,event_type,requirements,uniform_info,instructions,image_url,is_published")
        .order("event_date", { ascending: false }),
      supabase.from("event_rsvps").select("event_id").eq("status", "attending"),
    ]);

    if (error) setMessage(error.message);
    else setItems((eventsData ?? []) as EventRow[]);

    const counts: Record<string, number> = {};
    (rsvpsData ?? []).forEach((r: { event_id: string }) => {
      counts[r.event_id] = (counts[r.event_id] || 0) + 1;
    });
    setRsvpCounts(counts);
    setLoading(false);
  }

  async function openRsvpModal(item: EventRow) {
    setSelectedEventForRsvp(item);
    setLoadingRsvps(true);
    const { data } = await supabase
      .from("event_rsvps")
      .select("id, created_at, profiles(first_name, last_name, student_id, section, course)")
      .eq("event_id", item.id)
      .eq("status", "attending")
      .order("created_at", { ascending: true });
    setRsvpList((data ?? []) as unknown as RsvpUser[]);
    setLoadingRsvps(false);
  }

  function exportRsvpsCsv() {
    if (!selectedEventForRsvp) return;
    const headers = ["Cadet Name", "Student ID", "Course", "Section", "Confirmed Date"];
    const rows = rsvpList.map((r) => [
      `${r.profiles?.first_name ?? ""} ${r.profiles?.last_name ?? ""}`.trim(),
      r.profiles?.student_id ?? "",
      r.profiles?.course ?? "",
      r.profiles?.section ?? "",
      new Date(r.created_at).toLocaleString(),
    ]);
    const csv = [headers, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Attendees_${selectedEventForRsvp.title.replace(/[^a-zA-Z0-9]/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    loadItems();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function edit(item: EventRow) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      location: item.location,
      event_date: item.event_date,
      start_time: item.start_time ?? "",
      end_time: item.end_time ?? "",
      event_type: item.event_type,
      requirements: item.requirements ?? "",
      uniform_info: item.uniform_info ?? "",
      instructions: item.instructions ?? "",
      image_url: item.image_url ?? "",
      is_published: item.is_published,
    });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
      setMessage("Title, description, and location are required.");
      return;
    }

    setSaving(true);
    setMessage("");
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      event_date: form.event_date,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      event_type: form.event_type,
      requirements: form.requirements.trim() || null,
      uniform_info: form.uniform_info.trim() || null,
      instructions: form.instructions.trim() || null,
      image_url: form.image_url.trim() || null,
      is_published: form.is_published,
      updated_at: new Date().toISOString(),
    };

    const result = editingId
      ? await supabase.from("events").update(payload).eq("id", editingId)
      : await supabase.from("events").insert(payload);

    if (result.error) setMessage(result.error.message);
    else {
      setMessage(editingId ? "Event updated." : "Event posted.");
      resetForm();
      await loadItems();
    }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this event?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) setMessage(error.message);
    else await loadItems();
  }

  async function togglePublish(item: EventRow) {
    const { error } = await supabase
      .from("events")
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
    const path = `events/${Date.now()}-${baseName}.${extension}`;
    const { error } = await supabase.storage.from("events").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

    if (error) {
      setMessage(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("events").getPublicUrl(path);
    setForm((current) => ({ ...current, image_url: data.publicUrl }));
    setMessage("Image uploaded and attached.");
    setUploading(false);
  }

  return (
    <PortalShell type="admin" title="Events" subtitle="Create, edit, publish, and remove events and training schedules." currentPath="/admin/events">
      <div className="grid gap-6 xl:grid-cols-[460px_1fr]">
        <form onSubmit={save} className="rounded-xl border border-field/10 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brass">Operations Calendar</p>
              <h2 className="text-xl font-black text-charcoal">{editingId ? "Edit Event" : "New Event"}</h2>
            </div>
            {editingId ? (
              <button type="button" onClick={resetForm} className="rounded-md border border-field/20 p-2 text-slate hover:bg-mist" aria-label="Cancel edit">
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="grid gap-4">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Event title" className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field" />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} placeholder="Description" className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field" />
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field" />
            <div className="grid gap-3 sm:grid-cols-3">
              <input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field" />
              <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field" />
              <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field" />
            </div>
            <select value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value as EventRow["event_type"] })} className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field">
              <option value="event">Event</option>
              <option value="training">Training</option>
            </select>
            <input value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} placeholder="Requirements" className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field" />
            <input value={form.uniform_info} onChange={(e) => setForm({ ...form, uniform_info: e.target.value })} placeholder="Uniform information" className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field" />
            <input value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Instructions" className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field" />
            {/* Upload button only — no raw URL input */}
            <label className="grid cursor-pointer gap-2 rounded-lg border border-dashed border-field/25 bg-mist/60 p-4 text-sm font-semibold text-charcoal transition-colors hover:bg-gold/10">
              <span className="inline-flex items-center gap-2">
                <ImagePlus className="h-4 w-4 text-brass" />
                {uploading ? "Uploading image..." : "Upload event image"}
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
              <div className="overflow-hidden rounded-lg border border-field/10 bg-mist">
                <img src={form.image_url} alt="Event preview" className="h-40 w-full object-cover" />
              </div>
            ) : null}
            <label className="flex items-center gap-2 text-sm font-semibold text-charcoal">
              <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
              Publish publicly
            </label>
          </div>

          {message ? <p className="mt-4 rounded-md bg-gold/10 px-3 py-2 text-sm font-semibold text-charcoal">{message}</p> : null}

          <button disabled={saving} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-field px-4 py-3 text-sm font-bold text-white hover:bg-forest disabled:opacity-60">
            {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {saving ? "Saving..." : editingId ? "Save Changes" : "Post Event"}
          </button>
        </form>

        <section className="rounded-xl border border-field/10 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black text-charcoal">Schedule Board</h2>
            <CalendarDays className="h-5 w-5 text-brass" />
          </div>
          {loading ? <p className="text-sm text-slate">Loading events...</p> : null}
          <div className="grid gap-3">
            {items.map((item) => (
              <article key={item.id} className="rounded-lg border border-field/10 p-4">
                {item.image_url ? (
                  <img src={item.image_url} alt="" className="mb-3 h-32 w-full rounded-md object-cover" />
                ) : null}
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-brass">{item.event_type} • {new Date(item.event_date).toLocaleDateString()}</p>
                    <h3 className="mt-1 text-lg font-black text-charcoal">{item.title}</h3>
                    <p className="mt-1 text-sm font-semibold text-slate">{item.location}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate">{item.description}</p>
                  </div>
                  <span className={`h-fit rounded px-2 py-1 text-xs font-bold ${item.is_published ? "bg-emerald-100 text-emerald-800" : "bg-slate/10 text-slate"}`}>
                    {item.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => edit(item)} className="inline-flex items-center gap-1 rounded-md border border-field/20 px-3 py-2 text-xs font-bold text-charcoal hover:bg-mist"><Edit3 className="h-3.5 w-3.5" /> Edit</button>
                  <button onClick={() => togglePublish(item)} className="rounded-md border border-field/20 px-3 py-2 text-xs font-bold text-charcoal hover:bg-mist">{item.is_published ? "Unpublish" : "Publish"}</button>
                  <button onClick={() => openRsvpModal(item)} className="inline-flex items-center gap-1.5 rounded-md border border-brass/40 bg-gold/10 px-3 py-2 text-xs font-bold text-charcoal hover:bg-gold/20">
                    <Users className="h-3.5 w-3.5 text-brass" />
                    Attendees ({rsvpCounts[item.id] || 0})
                  </button>
                  <button onClick={() => remove(item.id)} className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                </div>
              </article>
            ))}
            {!loading && !items.length ? <p className="rounded-lg border border-dashed border-field/20 p-6 text-center text-sm text-slate">No events yet.</p> : null}
          </div>
        </section>
      </div>

      {/* ── Attendees Modal ── */}
      {selectedEventForRsvp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl border border-field/15 bg-white p-6 shadow-2xl">
            <button
              onClick={() => setSelectedEventForRsvp(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate hover:bg-mist"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brass">Event RSVP Roster</span>
              <h3 className="text-lg font-black text-charcoal">{selectedEventForRsvp.title}</h3>
              <p className="text-xs text-slate">{new Date(selectedEventForRsvp.event_date).toLocaleDateString()} • {selectedEventForRsvp.location}</p>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold text-charcoal">
                Total Confirmed Cadets: <span className="text-brass">{rsvpList.length}</span>
              </span>
              {rsvpList.length > 0 && (
                <button
                  onClick={exportRsvpsCsv}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-field px-3 py-1.5 text-xs font-bold text-white hover:bg-forest"
                >
                  <Download className="h-3.5 w-3.5" /> Export Attendees (CSV)
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-field/10 rounded-xl border border-field/10">
              {loadingRsvps ? (
                <p className="p-4 text-center text-sm text-slate">Loading attendees…</p>
              ) : rsvpList.length === 0 ? (
                <p className="p-8 text-center text-sm text-slate">No cadets have confirmed attendance yet.</p>
              ) : (
                rsvpList.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-3.5 hover:bg-mist/40">
                    <div>
                      <p className="font-bold text-charcoal">
                        {r.profiles?.first_name} {r.profiles?.last_name}
                      </p>
                      <p className="text-xs text-slate">
                        ID: {r.profiles?.student_id || "—"} • {r.profiles?.section || "No section"}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                      Confirmed
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
