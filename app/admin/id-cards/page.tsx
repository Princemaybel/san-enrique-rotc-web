import { Printer } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { createAdminSupabaseClient, getAdminSupabaseConfigError } from "@/lib/supabase/admin";
import { generateIdCard } from "./actions";

export const dynamic = "force-dynamic";

export default async function IdCardsPage() {
  const configError = getAdminSupabaseConfigError();
  if (configError) {
    return (
      <SiteShell>
        <main className="mx-auto max-w-7xl px-4 py-12">
          <p className="text-sm font-black uppercase tracking-[0.22em] text-brass">ID Card Management</p>
          <h1 className="mt-3 text-4xl font-black text-field">Connect Supabase</h1>
          <p className="mt-4 rounded-lg border border-field/10 bg-white p-5 font-semibold text-field/75">{configError}</p>
        </main>
      </SiteShell>
    );
  }

  const supabase = createAdminSupabaseClient();
  const [{ data: cadets }, { data: cards }] = await Promise.all([
    supabase.from("profiles").select("id,first_name,last_name,student_id,course,section,status").eq("role", "cadet").eq("status", "approved").order("last_name"),
    supabase.from("id_cards").select("cadet_id,qr_code,status,printed_at")
  ]);

  const cardMap = new Map((cards ?? []).map((card) => [card.cadet_id, card]));

  return (
    <SiteShell>
      <main className="mx-auto max-w-7xl px-4 py-12">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-brass">ID Card Management</p>
        <h1 className="mt-3 text-4xl font-black text-field">Generate & Print Cadet IDs</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(cadets ?? []).map((cadet) => {
            const card = cardMap.get(cadet.id);
            return (
              <article key={cadet.id} className="rounded-lg border border-field/10 bg-white p-5 shadow-sm">
                <p className="text-sm font-black uppercase text-brass">SAN ENRIQUE ROTC</p>
                <h2 className="mt-3 text-2xl font-black text-field">{cadet.first_name} {cadet.last_name}</h2>
                <p className="mt-1 text-sm text-field/70">{cadet.student_id} / {cadet.course} / {cadet.section}</p>
                <div className="mt-5 rounded-md border border-dashed border-field/30 p-4 text-center font-mono text-xs">
                  {card?.qr_code ?? "No QR generated"}
                </div>
                <form action={generateIdCard} className="mt-4 flex gap-2">
                  <input type="hidden" name="cadetId" value={cadet.id} />
                  <input type="hidden" name="schoolId" value={cadet.student_id} />
                  <button type="submit" className="rounded-md bg-field px-4 py-2 text-sm font-bold text-white">
                    Generate QR
                  </button>
                  <button type="button" className="inline-flex items-center gap-1 rounded-md border border-field/20 px-4 py-2 text-sm font-bold text-field">
                    <Printer className="h-4 w-4" /> Print
                  </button>
                </form>
              </article>
            );
          })}
        </div>
      </main>
    </SiteShell>
  );
}
