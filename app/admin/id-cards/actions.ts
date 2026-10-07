"use server";

import { randomUUID } from "node:crypto";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function generateIdCard(formData: FormData) {
  const cadetId = String(formData.get("cadetId") ?? "");
  const schoolId = String(formData.get("schoolId") ?? "");
  if (!cadetId || !schoolId) throw new Error("Cadet ID and school ID are required.");

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("id_cards").upsert({
    cadet_id: cadetId,
    school_id: schoolId,
    qr_code: `SE-ROTC-${randomUUID()}`,
    status: "active"
  }, { onConflict: "cadet_id" });

  if (error) throw new Error(error.message);
}
