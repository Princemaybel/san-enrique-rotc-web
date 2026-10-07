import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export function createBrowserClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase public environment variables.");
  }
  return createClient(supabaseUrl, supabaseKey);
}

export function createBrowserSupabaseClient() {
  return createBrowserClient();
}

