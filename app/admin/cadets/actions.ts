"use server";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function updateCadetStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["approved", "rejected"].includes(status)) {
    throw new Error("Invalid cadet status update.");
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("profiles").update({ status }).eq("id", id).eq("role", "cadet");
  if (error) throw new Error(error.message);
}
