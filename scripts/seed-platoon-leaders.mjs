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
    // Optional local env file
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), "..", ".env"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const PLATOON_LEADERS = [
  {
    student_id: "PL-ALPHA-1",
    email: "platoon1.alpha@rotc.local",
    first_name: "Juan",
    last_name: "Dela Cruz",
    company: "Alpha",
    platoon: "1st Platoon",
    section: "Alpha Company - 1st Platoon",
    course: "Platoon Leader",
    phone: "09171110001",
  },
  {
    student_id: "PL-ALPHA-2",
    email: "platoon2.alpha@rotc.local",
    first_name: "Maria",
    last_name: "Santos",
    company: "Alpha",
    platoon: "2nd Platoon",
    section: "Alpha Company - 2nd Platoon",
    course: "Platoon Leader",
    phone: "09171110002",
  },
  {
    student_id: "PL-BRAVO-1",
    email: "platoon1.bravo@rotc.local",
    first_name: "Mark",
    last_name: "Reyes",
    company: "Bravo",
    platoon: "1st Platoon",
    section: "Bravo Company - 1st Platoon",
    course: "Platoon Leader",
    phone: "09171110003",
  },
  {
    student_id: "PL-BRAVO-2",
    email: "platoon2.bravo@rotc.local",
    first_name: "Angelica",
    last_name: "Ramos",
    company: "Bravo",
    platoon: "2nd Platoon",
    section: "Bravo Company - 2nd Platoon",
    course: "Platoon Leader",
    phone: "09171110004",
  },
  {
    student_id: "PL-CHARLIE-1",
    email: "platoon1.charlie@rotc.local",
    first_name: "Gabriel",
    last_name: "Garcia",
    company: "Charlie",
    platoon: "1st Platoon",
    section: "Charlie Company - 1st Platoon",
    course: "Platoon Leader",
    phone: "09171110005",
  },
  {
    student_id: "PL-CHARLIE-2",
    email: "platoon2.charlie@rotc.local",
    first_name: "Nicole",
    last_name: "Mendoza",
    company: "Charlie",
    platoon: "2nd Platoon",
    section: "Charlie Company - 2nd Platoon",
    course: "Platoon Leader",
    phone: "09171110006",
  },
];

const DEFAULT_PASSWORD = "PlatoonLeader2026!";

async function main() {
  console.log("=== SEEDING 6 PLATOON LEADER ACCOUNTS ===");

  // Check if company column exists on profiles
  const { data: testData, error: colError } = await supabase.from("profiles").select("company").limit(1);
  const hasCompanyCol = !colError;
  console.log(`Checking schema: 'company' column exists: ${hasCompanyCol}`);

  for (const pl of PLATOON_LEADERS) {
    console.log(`\nProcessing: ${pl.first_name} ${pl.last_name} (${pl.email})...`);

    // 1. Create or retrieve Supabase Auth User
    let userId;
    const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
      email: pl.email,
      password: DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: {
        role: "platoon_leader",
        company: pl.company,
        platoon: pl.platoon,
        first_name: pl.first_name,
        last_name: pl.last_name,
      },
    });

    if (createError) {
      if (createError.message.toLowerCase().includes("already")) {
        console.log(`  User already exists in Auth, retrieving ID...`);
        const { data: userList } = await supabase.auth.admin.listUsers();
        userId = userList.users.find((u) => u.email?.toLowerCase() === pl.email.toLowerCase())?.id;
      } else {
        console.error(`  Error creating auth user:`, createError.message);
        continue;
      }
    } else {
      userId = createdUser.user?.id;
    }

    if (!userId) {
      console.error(`  Could not obtain user ID for ${pl.email}`);
      continue;
    }

    // 2. Build profile payload
    const profilePayload = {
      user_id: userId,
      first_name: pl.first_name,
      last_name: pl.last_name,
      student_id: pl.student_id,
      email: pl.email,
      phone: pl.phone,
      course: pl.course,
      year_level: "3rd Year",
      section: pl.section,
      date_of_birth: "2002-06-15",
      address: "San Enrique ROTC HQ",
      role: "cadet", // default to 'cadet' so it doesn't violate check constraint if constraint isn't altered yet
      status: "approved",
    };

    if (hasCompanyCol) {
      profilePayload.company = pl.company;
      profilePayload.platoon = pl.platoon;
    }

    // Try role: 'platoon_leader' first if schema allows, fallback to 'cadet'
    const payloadWithRole = { ...profilePayload, role: "platoon_leader" };
    let { error: profError } = await supabase.from("profiles").upsert(payloadWithRole, { onConflict: "user_id" });

    if (profError && profError.message.includes("violates check constraint")) {
      console.log(`  'platoon_leader' role constraint active; saving with role='cadet' and PL markers...`);
      const { error: fallbackError } = await supabase.from("profiles").upsert(profilePayload, { onConflict: "user_id" });
      if (fallbackError) {
        console.error(`  Failed to upsert profile fallback:`, fallbackError.message);
      } else {
        console.log(`  ✅ Profile saved successfully! (${pl.company} - ${pl.platoon})`);
      }
    } else if (profError) {
      console.error(`  Failed to upsert profile:`, profError.message);
    } else {
      console.log(`  ✅ Profile saved successfully with role 'platoon_leader'! (${pl.company} - ${pl.platoon})`);
    }
  }

  // Also check if any existing cadets need company & platoon assigned to their section
  console.log("\nAssigning company & platoon to existing cadets if needed...");
  const { data: cadets } = await supabase.from("profiles").select("id, student_id, section, course").eq("role", "cadet");
  if (cadets && cadets.length > 0) {
    const companies = ["Alpha", "Bravo", "Charlie"];
    const platoons = ["1st Platoon", "2nd Platoon"];
    for (let i = 0; i < cadets.length; i++) {
      const c = cadets[i];
      if (c.student_id.startsWith("PL-")) continue;
      const comp = companies[i % companies.length];
      const plat = platoons[i % platoons.length];
      if (!c.section || c.section.length <= 2) {
        const newSec = `${comp} - ${plat}`;
        await supabase.from("profiles").update({ section: newSec }).eq("id", c.id);
        console.log(`  Updated cadet ${c.student_id} section to "${newSec}"`);
      }
    }
  }

  console.log("\n=== PLATOON LEADERS CREATION COMPLETE ===");
  console.log(`All accounts created with password: ${DEFAULT_PASSWORD}`);
}

main().catch(console.error);

