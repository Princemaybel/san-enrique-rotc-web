"use server";

import { revalidatePath } from "next/cache";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function reviewApplication(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["under_review", "approved", "rejected"].includes(status)) throw new Error("Invalid review action.");

  const supabase = createAdminSupabaseClient();
  const { data: application, error: fetchError } = await supabase.from("applications").select("id,profile_id,student_id,section").eq("id", id).single();
  if (fetchError || !application) throw new Error("Application not found.");

  const { error } = await supabase.from("applications").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error("Unable to update application.");

  if (application.profile_id) {
    if (status === "approved") {
      const { error: profileError } = await supabase.from("profiles").update({ status: "approved" }).eq("id", application.profile_id);
      if (profileError) throw new Error("Application was approved but cadet profile could not be updated.");

      await supabase.from("cadets").upsert({
        profile_id: application.profile_id,
        cadet_number: application.student_id,
        unit: application.section ?? "SAN ENRIQUE ROTC",
        activated_at: new Date().toISOString()
      }, { onConflict: "profile_id" });
    }

    if (status === "rejected") {
      await supabase.from("profiles").update({ status: "rejected" }).eq("id", application.profile_id);
    }
  }

  await supabase.from("audit_logs").insert({
    action: `application_${status}`,
    entity_type: "applications",
    entity_id: id,
    details: { status }
  });

  revalidatePath("/admin/applications");
  revalidatePath("/admin/cadets");
}
