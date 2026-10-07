"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal-shell";
import { StatusBadge, Alert } from "@/components/ui";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  User,
  Shield,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  Hash,
  Calendar,
  Edit3,
  Save,
  X,
  Loader2,
} from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  student_id: string | null;
  email: string | null;
  course: string | null;
  year_level: string | null;
  section: string | null;
  platoon: string | null;
  company: string | null;
  phone: string | null;
  role: string;
  created_at: string;
}

interface Application {
  id: string;
  status: string;
  created_at: string;
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="h-4 w-28 animate-pulse rounded bg-slate/15" />
      <div className="h-4 w-48 animate-pulse rounded bg-slate/10" />
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-field/8 py-3.5 last:border-0">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-mist text-field">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-2xs font-semibold uppercase tracking-wider text-slate">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-charcoal">
          {value || <span className="font-normal italic text-slate/60">Not provided</span>}
        </p>
      </div>
    </div>
  );
}

export default function CadetProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable fields
  const [phone, setPhone] = useState("");
  const [editFirst, setEditFirst] = useState("");
  const [editLast, setEditLast] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const supabase = createBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError("Not authenticated."); return; }

        const [{ data: prof, error: profErr }, { data: app }] = await Promise.all([
          supabase.from("profiles").select("*").eq("user_id", user.id).single(),
          supabase.from("applications").select("id,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        ]);

        if (profErr) throw profErr;
        setProfile(prof);
        setApplication(app);
        setPhone(prof?.phone ?? "");
        setEditFirst(prof?.first_name ?? "");
        setEditLast(prof?.last_name ?? "");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const supabase = createBrowserClient();
      const updates: Partial<Profile> = {
        phone,
        first_name: editFirst,
        last_name: editLast,
        full_name: `${editFirst} ${editLast}`.trim(),
      };
      const { error: upErr } = await supabase.from("profiles").update(updates).eq("id", profile.id);
      if (upErr) throw upErr;
      setProfile((prev) => prev ? { ...prev, ...updates } : prev);
      setSaveSuccess(true);
      setEditing(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile
    ? profile.full_name || `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Cadet"
    : "Cadet";

  return (
    <PortalShell
      type="cadet"
      title="My Profile"
      subtitle="Personal, academic, and unit assignment information."
      currentPath="/cadet/profile"
    >
      {error && (
        <Alert variant="error">
          <strong>Error:</strong> {error}
        </Alert>
      )}
      {saveSuccess && (
        <Alert variant="success">Profile updated successfully.</Alert>
      )}

      <div className="mt-4 grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Profile Card */}
        <div className="flex flex-col items-center rounded-xl border border-field/10 bg-white p-6 shadow-card">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-field text-white shadow-md">
            <User className="h-10 w-10" />
          </div>
          <h2 className="mt-4 text-center text-lg font-bold text-charcoal">
            {loading ? <span className="block h-5 w-32 animate-pulse rounded bg-slate/15" /> : displayName}
          </h2>
          {profile && (
            <span className="mt-1 font-mono text-xs font-semibold text-slate">
              {profile.student_id ?? "No Student ID"}
            </span>
          )}
          <div className="mt-3">
            {loading ? (
              <span className="block h-6 w-20 animate-pulse rounded-full bg-slate/15" />
            ) : application ? (
              <StatusBadge status={application.status} />
            ) : (
              <StatusBadge status="pending" />
            )}
          </div>

          <div className="mt-4 w-full border-t border-field/10 pt-4 text-center">
            <p className="text-2xs text-slate">
              {profile?.course && profile?.year_level
                ? `${profile.course} — Year ${profile.year_level}`
                : "Course not set"}
            </p>
            <p className="mt-1 text-2xs font-semibold text-field">
              {profile?.company ? `${profile.company} Company` : ""}
              {profile?.platoon ? ` · ${profile.platoon} Platoon` : ""}
            </p>
          </div>

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-field/20 bg-white px-4 py-2 text-xs font-bold text-charcoal transition-all hover:bg-mist"
            >
              <Edit3 className="h-3.5 w-3.5 text-field" />
              Edit Profile
            </button>
          ) : (
            <div className="mt-5 flex w-full gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-field px-4 py-2 text-xs font-bold text-white hover:bg-forest disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save
              </button>
              <button
                onClick={() => { setEditing(false); setPhone(profile?.phone ?? ""); }}
                className="inline-flex items-center justify-center rounded-md border border-field/20 px-3 py-2 text-xs font-semibold text-charcoal hover:bg-mist"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Info Sections */}
        <div className="grid gap-5">
          {/* Personal */}
          <div className="rounded-xl border border-field/10 bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center gap-2 border-b border-field/10 pb-3">
              <User className="h-4 w-4 text-brass" />
              <h3 className="text-sm font-bold text-charcoal">Personal Information</h3>
            </div>
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : editing ? (
              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs font-semibold text-charcoal">First Name</span>
                  <input
                    value={editFirst}
                    onChange={(e) => setEditFirst(e.target.value)}
                    className="mt-1 w-full rounded-md border border-field/20 px-3 py-2 text-sm text-charcoal focus:border-field focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-charcoal">Last Name</span>
                  <input
                    value={editLast}
                    onChange={(e) => setEditLast(e.target.value)}
                    className="mt-1 w-full rounded-md border border-field/20 px-3 py-2 text-sm text-charcoal focus:border-field focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-charcoal">Phone Number</span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+63 9XX XXX XXXX"
                    className="mt-1 w-full rounded-md border border-field/20 px-3 py-2 text-sm text-charcoal focus:border-field focus:outline-none"
                  />
                </label>
              </div>
            ) : (
              <>
                <InfoRow icon={<User className="h-4 w-4" />} label="Full Name" value={displayName} />
                <InfoRow icon={<Mail className="h-4 w-4" />} label="Email Address" value={profile?.email} />
                <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone Number" value={profile?.phone} />
              </>
            )}
          </div>

          {/* Academic */}
          <div className="rounded-xl border border-field/10 bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center gap-2 border-b border-field/10 pb-3">
              <BookOpen className="h-4 w-4 text-brass" />
              <h3 className="text-sm font-bold text-charcoal">Academic Information</h3>
            </div>
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : (
              <>
                <InfoRow icon={<Hash className="h-4 w-4" />} label="Student ID" value={profile?.student_id} />
                <InfoRow icon={<BookOpen className="h-4 w-4" />} label="Course / Program" value={profile?.course} />
                <InfoRow icon={<Calendar className="h-4 w-4" />} label="Year Level" value={profile?.year_level ? `Year ${profile.year_level}` : null} />
                <InfoRow icon={<MapPin className="h-4 w-4" />} label="Section" value={profile?.section} />
              </>
            )}
          </div>

          {/* Military Unit */}
          <div className="rounded-xl border border-field/10 bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center gap-2 border-b border-field/10 pb-3">
              <Shield className="h-4 w-4 text-brass" />
              <h3 className="text-sm font-bold text-charcoal">Unit Assignment</h3>
            </div>
            {loading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : (
              <>
                <InfoRow icon={<Shield className="h-4 w-4" />} label="Company" value={profile?.company} />
                <InfoRow icon={<MapPin className="h-4 w-4" />} label="Platoon" value={profile?.platoon} />
                <InfoRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Enrolled Since"
                  value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }) : null}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
