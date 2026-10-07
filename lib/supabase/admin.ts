import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getAdminSupabaseConfigError() {
  if (!supabaseUrl || !serviceRoleKey) {
    return "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in web/.env.local.";
  }

  if (serviceRoleKey === "server-only-service-role-key" || serviceRoleKey.startsWith("replace-with")) {
    return "Replace the placeholder SUPABASE_SERVICE_ROLE_KEY in web/.env.local with your real Supabase service role key.";
  }

  return null;
}

export function createAdminSupabaseClient() {
  const configError = getAdminSupabaseConfigError();
  if (configError) throw new Error(configError);

  return createClient(supabaseUrl!, serviceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
