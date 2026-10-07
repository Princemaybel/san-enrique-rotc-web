"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Eye, EyeOff, FileText, Plus, Trash2, Upload, X } from "lucide-react";
import { PortalShell } from "@/components/portal-shell";
import { createBrowserClient } from "@/lib/supabase/client";

type Module = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_url: string;
  file_name: string | null;
  is_published: boolean;
  created_at: string;
};

const emptyForm = {
  title: "",
  description: "",
  category: "General",
  is_published: true,
};

const CATEGORIES = [
  "General",
  "Doctrine",
  "Conduct",
  "Syllabus",
  "Mobile App",
  "Safety",
  "Leadership",
  "Field Training",
];

export default function AdminModulesPage() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [items, setItems] = useState<Module[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"ok" | "err">("ok");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");

  async function loadItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from("modules")
      .select("id,title,description,category,file_url,file_name,is_published,created_at")
      .order("created_at", { ascending: false });

    if (error) showMsg(error.message, "err");
    else setItems((data ?? []) as Module[]);
    setLoading(false);
  }

  useEffect(() => {
    loadItems();
  }, []);

  function showMsg(text: string, type: "ok" | "err" = "ok") {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  }

  function resetForm() {
    setForm(emptyForm);
    setPendingFile(null);
    setUploadedUrl("");
    setUploadedFileName("");
  }

  async function handleFileSelect(file: File) {
    if (file.size > 50 * 1024 * 1024) {
      showMsg("File must be 50 MB or smaller.", "err");
      return;
    }
    setPendingFile(file);
    setUploadedFileName(file.name);
    if (!form.title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setForm((f) => ({ ...f, title: nameWithoutExt }));
    }
  }

  async function uploadFile(): Promise<string | null> {
    if (!pendingFile) return uploadedUrl || null;
    setUploading(true);
    const safeName = pendingFile.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
    const path = `modules/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from("modules").upload(path, pendingFile, {
      cacheControl: "3600",
      upsert: false,
      contentType: pendingFile.type || "application/octet-stream",
    });
    if (error) {
      showMsg("Upload failed: " + error.message, "err");
      setUploading(false);
      return null;
    }
    const { data } = supabase.storage.from("modules").getPublicUrl(path);
    setUploadedUrl(data.publicUrl);
    setPendingFile(null);
    setUploading(false);
    return data.publicUrl;
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      showMsg("Title is required.", "err");
      return;
    }
    if (!pendingFile && !uploadedUrl) {
      showMsg("Please select a file to upload.", "err");
      return;
    }

    setSaving(true);
    const fileUrl = await uploadFile();
    if (!fileUrl) {
      setSaving(false);
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category.trim() || "General",
      file_url: fileUrl,
      file_name: uploadedFileName || null,
      is_published: form.is_published,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("modules").insert(payload);
    if (error) showMsg(error.message, "err");
    else {
      showMsg("Module uploaded and saved successfully!", "ok");
      resetForm();
      await loadItems();
    }
    setSaving(false);
  }

  async function remove(item: Module) {
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    // Delete from storage
    const urlParts = item.file_url.split("/modules/");
    if (urlParts.length > 1) {
      await supabase.storage.from("modules").remove([`modules/${urlParts[1]}`]);
    }
    const { error } = await supabase.from("modules").delete().eq("id", item.id);
    if (error) showMsg(error.message, "err");
    else {
      showMsg("Module deleted.", "ok");
      await loadItems();
    }
  }

  async function togglePublish(item: Module) {
    const { error } = await supabase
      .from("modules")
      .update({ is_published: !item.is_published, updated_at: new Date().toISOString() })
      .eq("id", item.id);
    if (error) showMsg(error.message, "err");
    else await loadItems();
  }

  return (
    <PortalShell type="admin" title="PDF Modules" subtitle="Upload, manage, and publish training PDFs visible to cadets in the mobile app." currentPath="/admin/modules">
      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        {/* ── Upload Form ── */}
        <form onSubmit={save} className="rounded-xl border border-field/10 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brass">Module Upload</p>
              <h2 className="text-xl font-black text-charcoal">Add New PDF</h2>
            </div>
            {(pendingFile || uploadedUrl) && (
              <button type="button" onClick={resetForm} className="rounded-md border border-field/20 p-2 text-slate hover:bg-mist" aria-label="Clear form">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* PDF Drop zone */}
          <label className="grid cursor-pointer gap-2 rounded-lg border-2 border-dashed border-field/25 bg-mist/60 p-5 text-center text-sm font-semibold text-charcoal transition-colors hover:bg-gold/10 hover:border-brass/40">
            <Upload className="mx-auto h-8 w-8 text-brass" />
            {pendingFile ? (
              <span className="text-field font-bold">{pendingFile.name}</span>
            ) : uploadedUrl ? (
              <span className="text-emerald-700 font-bold">✓ {uploadedFileName}</span>
            ) : (
              <span>Click to choose a file</span>
            )}
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              disabled={uploading || saving}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
                e.currentTarget.value = "";
              }}
              className="sr-only"
            />
            <span className="text-xs font-normal text-slate">PDF, Word, Excel, PowerPoint, CSV • Max 50 MB • Stored in Supabase</span>
          </label>

          <label className="mt-4 grid gap-1.5 text-sm font-semibold text-charcoal">
            Title *
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. ROTC Cadet Training Manual"
              className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field focus:ring-2 focus:ring-field/15"
            />
          </label>

          <label className="mt-4 grid gap-1.5 text-sm font-semibold text-charcoal">
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Short description of module contents…"
              className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field focus:ring-2 focus:ring-field/15"
            />
          </label>

          <label className="mt-4 grid gap-1.5 text-sm font-semibold text-charcoal">
            Category
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-charcoal">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
            />
            Publish to cadets immediately
          </label>

          {message ? (
            <p className={`mt-4 rounded-md px-3 py-2 text-sm font-semibold ${messageType === "err" ? "bg-red-50 text-red-700" : "bg-gold/10 text-charcoal"}`}>
              {message}
            </p>
          ) : null}

          <button
            disabled={saving || uploading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-field px-4 py-3 text-sm font-bold text-white hover:bg-forest disabled:opacity-60"
          >
            {saving || uploading ? (
              <><Upload className="h-4 w-4 animate-bounce" />{uploading ? "Uploading…" : "Saving…"}</>
            ) : (
              <><Plus className="h-4 w-4" />Upload Module</>
            )}
          </button>
        </form>

        {/* ── Module List ── */}
        <section className="rounded-xl border border-field/10 bg-white p-5 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-charcoal">All Modules</h2>
              <p className="text-xs text-slate">{items.length} module{items.length !== 1 ? "s" : ""} total</p>
            </div>
            <BookOpen className="h-5 w-5 text-brass" />
          </div>

          {loading ? (
            <p className="text-sm text-slate">Loading modules…</p>
          ) : (
            <div className="grid gap-3">
              {items.map((item) => (
                <article key={item.id} className="rounded-lg border border-field/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/15">
                        <FileText className="h-5 w-5 text-brass" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-brass">{item.category}</p>
                        <h3 className="mt-0.5 text-base font-black text-charcoal leading-tight">{item.title}</h3>
                        {item.description && (
                          <p className="mt-1 text-sm text-slate line-clamp-2">{item.description}</p>
                        )}
                        {item.file_name && (
                          <p className="mt-1 text-xs text-slate/60">{item.file_name}</p>
                        )}
                      </div>
                    </div>
                    <span className={`shrink-0 rounded px-2 py-1 text-xs font-bold ${item.is_published ? "bg-emerald-100 text-emerald-800" : "bg-slate/10 text-slate"}`}>
                      {item.is_published ? "Published" : "Hidden"}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-field/20 px-3 py-2 text-xs font-bold text-charcoal hover:bg-mist"
                    >
                      <FileText className="h-3.5 w-3.5" /> Preview PDF
                    </a>
                    <button
                      onClick={() => togglePublish(item)}
                      className="inline-flex items-center gap-1 rounded-md border border-field/20 px-3 py-2 text-xs font-bold text-charcoal hover:bg-mist"
                    >
                      {item.is_published ? <><EyeOff className="h-3.5 w-3.5" /> Unpublish</> : <><Eye className="h-3.5 w-3.5" /> Publish</>}
                    </button>
                    <button
                      onClick={() => remove(item)}
                      className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </article>
              ))}
              {!items.length && (
                <div className="rounded-lg border border-dashed border-field/20 p-8 text-center">
                  <FileText className="mx-auto mb-3 h-10 w-10 text-field/30" />
                  <p className="text-sm font-semibold text-slate">No modules uploaded yet.</p>
                  <p className="mt-1 text-xs text-slate/60">Upload a PDF using the form on the left.</p>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </PortalShell>
  );
}

