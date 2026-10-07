"use server";

import { createAdminSupabaseClient, getAdminSupabaseConfigError } from "@/lib/supabase/admin";

export type ContactState = {
  ok: boolean;
  message: string;
};

export async function submitContact(_state: ContactState, formData: FormData): Promise<ContactState> {
  const configError = getAdminSupabaseConfigError();
  if (configError) return { ok: false, message: configError };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email.includes("@") || !subject || message.length < 10) {
    return { ok: false, message: "Please complete all fields with a valid email and message." };
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("contact_messages").insert({ name, email, subject, message });
  if (error) return { ok: false, message: "The message could not be saved. Please try again." };

  return { ok: true, message: "Message submitted successfully." };
}
