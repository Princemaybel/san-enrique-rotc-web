"use server";

import { createAdminSupabaseClient, getAdminSupabaseConfigError } from "@/lib/supabase/admin";

export type StatusState = {
  ok: boolean;
  message: string;
  result?: {
    fullName: string;
    status: string;
    submittedAt: string;
    notes?: string | null;
  };
};

export async function checkApplicationStatus(_state: StatusState, formData: FormData): Promise<StatusState> {
  const configError = getAdminSupabaseConfigError();
  if (configError) return { ok: false, message: configError };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const studentId = String(formData.get("studentId") ?? "").trim();
  if (!email || !studentId) return { ok: false, message: "Enter both email and student ID." };

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("applications")
    .select("full_name,status,created_at,admin_notes")
    .eq("email", email)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { ok: false, message: "Unable to check status right now." };
  if (!data) return { ok: false, message: "No application was found for that email and student ID." };

  return {
    ok: true,
    message: "Application found.",
    result: {
      fullName: data.full_name,
      status: data.status,
      submittedAt: data.created_at,
      notes: data.admin_notes
    }
  };
}
