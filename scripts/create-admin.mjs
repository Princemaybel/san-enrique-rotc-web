import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.startsWith("server-only") || serviceRoleKey.startsWith("replace-with")) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and a real SUPABASE_SERVICE_ROLE_KEY in web/.env.local first.");
}

if (!adminEmail || !adminEmail.includes("@") || !adminPassword || adminPassword.length < 8) {
  throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in web/.env.local. Password must be at least 8 characters.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
  email: adminEmail.trim().toLowerCase(),
  password: adminPassword,
  email_confirm: true
});

if (createError && !createError.message.toLowerCase().includes("already")) {
  throw createError;
}

let userId = createdUser.user?.id;

if (!userId) {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) throw error;
  userId = data.users.find((user) => user.email?.toLowerCase() === adminEmail.trim().toLowerCase())?.id;
}

if (!userId) throw new Error("Admin user could not be found or created.");

const { error: profileError } = await supabase.from("profiles").upsert({
  user_id: userId,
  first_name: "System",
  middle_name: null,
  last_name: "Administrator",
  student_id: "ADMIN-001",
  email: adminEmail.trim().toLowerCase(),
  phone: "Not configured",
  course: "Administration",
  year_level: "N/A",
  section: "SAN ENRIQUE ROTC",
  date_of_birth: "2000-01-01",
  address: "Not configured",
  role: "admin",
  status: "approved"
}, { onConflict: "user_id" });

if (profileError) throw profileError;

console.log(`Admin account ready: ${adminEmail.trim().toLowerCase()}`);
