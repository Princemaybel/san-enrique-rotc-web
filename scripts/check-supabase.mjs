import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(path) {
  try {
    const body = readFileSync(path, "utf8");
    for (const line of body.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const [key, ...valueParts] = trimmed.split("=");
      if (!process.env[key]) process.env[key] = valueParts.join("=");
    }
  } catch {
    // Optional local env file.
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), "..", ".env"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const requiredTables = [
  "profiles",
  "cadets",
  "qr_codes",
  "applications",
  "application_documents",
  "announcements",
  "events",
  "attendance_sessions",
  "attendance_records",
  "notifications",
  "contact_messages",
  "audit_logs",
  "site_settings"
];

if (!supabaseUrl || !publishableKey) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY before checking Supabase.");
}

const endpoint = supabaseUrl.replace(/\/$/, "");

function selectColumnFor(table) {
  if (table === "qr_codes") return "id,user_id,cadet_id,public_qr_id,token_hash,status,last_used_at";
  if (table === "attendance_sessions") return "id,session_type,status,location,course,year_level,section,platoon,notes";
  if (table === "attendance_records") return "id,user_id,verification_method,is_late,remarks,recorded_by";
  return table === "site_settings" ? "key" : "id";
}

async function tableStatus(table) {
  const selectColumn = selectColumnFor(table);
  const response = await fetch(`${endpoint}/rest/v1/${table}?select=${selectColumn}&limit=1`, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`
    }
  });

  if (response.ok) return { table, state: "ok" };

  const body = await response.json().catch(() => ({}));
  if (body?.code === "PGRST205" || response.status === 404) {
    return { table, state: "missing", message: body.message || "Table not found" };
  }

  if (response.status === 401 || response.status === 403) {
    return { table, state: "exists-protected", message: "Table exists, but RLS blocks anonymous reads" };
  }

  return { table, state: "error", message: body.message || response.statusText };
}

const results = await Promise.all(requiredTables.map(tableStatus));
const missing = results.filter((item) => item.state === "missing");
const errors = results.filter((item) => item.state === "error");

console.log(`Supabase URL: ${endpoint}`);
for (const result of results) {
  const marker = result.state === "ok" ? "OK" : result.state === "exists-protected" ? "RLS" : "MISSING";
  console.log(`${marker.padEnd(7)} ${result.table}${result.message ? ` - ${result.message}` : ""}`);
}

if (missing.length || errors.length) {
  console.log("");
  console.log("Supabase is reachable, but the new SAN ENRIQUE ROTC schema is not fully installed.");
  console.log("Run supabase_schema.sql in the Supabase SQL Editor for a clean new database.");
  console.log("If the base schema already exists, run supabase_backend_migration.sql for QR and attendance backend columns.");
  console.log("If you must keep old data, run supabase_upgrade_existing.sql instead.");
  process.exit(1);
}

console.log("");
console.log("Supabase schema check passed.");
