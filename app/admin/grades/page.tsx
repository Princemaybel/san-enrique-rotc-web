"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal-shell";
import { createBrowserClient } from "@/lib/supabase/client";
import { Award, Download, Plus, Trash2, X } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────── */
type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  student_id: string;
  section: string | null;
  course: string | null;
};

type Grade = {
  id: string;
  cadet_id: string;
  training_title: string;
  category: string;
  score: number | null;
  max_score: number;
  remarks: string | null;
  graded_at: string;
  profiles: { first_name: string; last_name: string; student_id: string; section: string | null } | null;
};

const CATEGORIES = ["Drill", "Academics", "Physical", "Leadership", "Other"];

const emptyForm = {
  cadet_id: "",
  training_title: "",
  category: "Drill",
  score: "",
  max_score: "100",
  remarks: "",
  graded_at: new Date().toISOString().slice(0, 10),
};

/* ─── Helpers ─────────────────────────────────────────────────────── */
function pct(score: number | null, max: number) {
  if (score === null || max === 0) return null;
  return Math.round((score / max) * 100);
}

function gradeLetter(p: number | null) {
  if (p === null) return "—";
  if (p >= 90) return "A";
  if (p >= 80) return "B";
  if (p >= 70) return "C";
  if (p >= 60) return "D";
  return "F";
}

function gradeColor(p: number | null) {
  if (p === null) return "text-slate";
  if (p >= 80) return "text-emerald-700";
  if (p >= 60) return "text-amber-700";
  return "text-red-700";
}

function exportCsv(grades: Grade[]) {
  const headers = ["Cadet Name", "Student ID", "Section", "Training", "Category", "Score", "Max", "Percentage", "Grade", "Remarks", "Date"];
  const rows = grades.map((g) => {
    const p = pct(g.score, g.max_score);
    return [
      `${g.profiles?.first_name ?? ""} ${g.profiles?.last_name ?? ""}`.trim(),
      g.profiles?.student_id ?? "",
      g.profiles?.section ?? "",
      g.training_title,
      g.category,
      g.score ?? "",
      g.max_score,
      p !== null ? `${p}%` : "",
      gradeLetter(p),
      g.remarks ?? "",
      g.graded_at,
    ];
  });
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `SE_ROTC_Grades_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}

/* ─── Page ────────────────────────────────────────────────────────── */
export default function AdminGradesPage() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [cadets, setCadets] = useState<Profile[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"ok" | "err">("ok");
  const [filterCadet, setFilterCadet] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  function showMsg(text: string, type: "ok" | "err" = "ok") {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 4000);
  }

  async function loadData() {
    setLoading(true);
    const [{ data: cadetData }, { data: gradeData }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id,first_name,last_name,student_id,section,course")
        .eq("role", "cadet")
        .order("last_name"),
      supabase
        .from("cadet_grades")
        .select("id,cadet_id,training_title,category,score,max_score,remarks,graded_at,profiles(first_name,last_name,student_id,section)")
        .order("graded_at", { ascending: false }),
    ]);
    setCadets((cadetData ?? []) as Profile[]);
    setGrades((gradeData ?? []) as unknown as Grade[]);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.cadet_id || !form.training_title.trim()) {
      showMsg("Select a cadet and enter training title.", "err");
      return;
    }
    const scoreNum = form.score !== "" ? parseFloat(form.score) : null;
    const maxNum = parseFloat(form.max_score) || 100;
    if (scoreNum !== null && (scoreNum < 0 || scoreNum > maxNum)) {
      showMsg(`Score must be between 0 and ${maxNum}.`, "err");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("cadet_grades").insert({
      cadet_id: form.cadet_id,
      training_title: form.training_title.trim(),
      category: form.category,
      score: scoreNum,
      max_score: maxNum,
      remarks: form.remarks.trim() || null,
      graded_at: form.graded_at,
    });
    if (error) showMsg(error.message, "err");
    else {
      showMsg("Grade saved successfully!");
      setForm({ ...emptyForm, cadet_id: form.cadet_id }); // keep selected cadet
      await loadData();
    }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this grade entry?")) return;
    const { error } = await supabase.from("cadet_grades").delete().eq("id", id);
    if (error) showMsg(error.message, "err");
    else await loadData();
  }

  const filteredGrades = grades.filter((g) => {
    const name = `${g.profiles?.first_name ?? ""} ${g.profiles?.last_name ?? ""}`.toLowerCase();
    const matchCadet = !filterCadet || name.includes(filterCadet.toLowerCase()) || (g.profiles?.student_id ?? "").includes(filterCadet);
    const matchCat = filterCategory === "All" || g.category === filterCategory;
    return matchCadet && matchCat;
  });

  return (
    <PortalShell type="admin" title="Grades & Performance" subtitle="Record and track cadet training scores per session." currentPath="/admin/grades">
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">

        {/* ── Grade Entry Form ── */}
        <form onSubmit={save} className="rounded-xl border border-field/10 bg-white p-5 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brass">Grade Entry</p>
          <h2 className="mb-5 text-xl font-black text-charcoal">Add Score</h2>

          <label className="grid gap-1.5 text-sm font-semibold text-charcoal">
            Cadet *
            <select
              value={form.cadet_id}
              onChange={(e) => setForm({ ...form, cadet_id: e.target.value })}
              className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field"
            >
              <option value="">— Select cadet —</option>
              {cadets.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.last_name}, {c.first_name} ({c.student_id})
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 grid gap-1.5 text-sm font-semibold text-charcoal">
            Training Title *
            <input
              value={form.training_title}
              onChange={(e) => setForm({ ...form, training_title: e.target.value })}
              placeholder="e.g. Aug 30 Drill Formation"
              className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field"
            />
          </label>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-sm font-semibold text-charcoal">
              Category
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-charcoal">
              Date
              <input
                type="date"
                value={form.graded_at}
                onChange={(e) => setForm({ ...form, graded_at: e.target.value })}
                className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field"
              />
            </label>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="grid gap-1.5 text-sm font-semibold text-charcoal">
              Score
              <input
                type="number"
                min={0}
                step={0.5}
                value={form.score}
                onChange={(e) => setForm({ ...form, score: e.target.value })}
                placeholder="e.g. 87"
                className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field"
              />
            </label>
            <label className="grid gap-1.5 text-sm font-semibold text-charcoal">
              Max Score
              <input
                type="number"
                min={1}
                value={form.max_score}
                onChange={(e) => setForm({ ...form, max_score: e.target.value })}
                className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field"
              />
            </label>
          </div>

          <label className="mt-4 grid gap-1.5 text-sm font-semibold text-charcoal">
            Remarks (optional)
            <textarea
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              rows={2}
              placeholder="Instructor notes…"
              className="rounded-md border border-field/20 px-3 py-2 text-sm outline-none focus:border-field"
            />
          </label>

          {message && (
            <p className={`mt-4 rounded-md px-3 py-2 text-sm font-semibold ${messageType === "err" ? "bg-red-50 text-red-700" : "bg-gold/10 text-charcoal"}`}>
              {message}
            </p>
          )}

          <button disabled={saving} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-field px-4 py-3 text-sm font-bold text-white hover:bg-forest disabled:opacity-60">
            <Plus className="h-4 w-4" /> {saving ? "Saving…" : "Save Grade"}
          </button>
        </form>

        {/* ── Grades Table ── */}
        <section className="rounded-xl border border-field/10 bg-white shadow-card">
          {/* Table header + filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-field/10 p-5">
            <div>
              <h2 className="text-xl font-black text-charcoal">All Grades</h2>
              <p className="text-xs text-slate">{filteredGrades.length} records</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                value={filterCadet}
                onChange={(e) => setFilterCadet(e.target.value)}
                placeholder="Filter by cadet…"
                className="rounded-lg border border-field/20 px-3 py-1.5 text-sm outline-none focus:border-field"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-lg border border-field/20 px-3 py-1.5 text-sm outline-none focus:border-field"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button
                onClick={() => exportCsv(filteredGrades)}
                className="inline-flex items-center gap-2 rounded-lg bg-field px-3 py-1.5 text-xs font-bold text-white hover:bg-forest"
              >
                <Download className="h-3.5 w-3.5" /> Export CSV
              </button>
            </div>
          </div>

          {loading ? (
            <p className="p-6 text-sm text-slate">Loading grades…</p>
          ) : filteredGrades.length === 0 ? (
            <div className="flex flex-col items-center py-14">
              <Award className="mb-3 h-12 w-12 text-field/20" />
              <p className="font-bold text-charcoal">No grades recorded yet.</p>
              <p className="text-sm text-slate">Use the form to add the first grade entry.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-field/10 bg-mist/50 text-xs font-bold uppercase tracking-wider text-slate">
                  <tr>
                    <th className="px-4 py-3 text-left">Cadet</th>
                    <th className="px-4 py-3 text-left">Training</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Score</th>
                    <th className="px-4 py-3 text-left">%</th>
                    <th className="px-4 py-3 text-left">Grade</th>
                    <th className="px-4 py-3 text-left">Remarks</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-field/5">
                  {filteredGrades.map((g) => {
                    const p = pct(g.score, g.max_score);
                    return (
                      <tr key={g.id} className="hover:bg-mist/30">
                        <td className="px-4 py-3">
                          <p className="font-bold text-charcoal">{g.profiles?.first_name} {g.profiles?.last_name}</p>
                          <p className="text-xs text-slate">{g.profiles?.student_id} · {g.profiles?.section}</p>
                        </td>
                        <td className="px-4 py-3 text-charcoal">{g.training_title}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-mist px-2 py-0.5 text-xs font-bold text-slate">{g.category}</span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-charcoal">
                          {g.score ?? "—"}/{g.max_score}
                        </td>
                        <td className={`px-4 py-3 font-bold ${gradeColor(p)}`}>{p !== null ? `${p}%` : "—"}</td>
                        <td className={`px-4 py-3 text-xl font-black ${gradeColor(p)}`}>{gradeLetter(p)}</td>
                        <td className="px-4 py-3 text-xs text-slate">{g.remarks ?? "—"}</td>
                        <td className="px-4 py-3 text-xs text-slate">{g.graded_at}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => remove(g.id)} className="rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </PortalShell>
  );
}

