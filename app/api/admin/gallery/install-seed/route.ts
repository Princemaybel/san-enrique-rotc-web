import { NextResponse } from "next/server";
import { createAdminSupabaseClient, getAdminSupabaseConfigError } from "@/lib/supabase/admin";

const seedItems = [
  ["1st Instruction: Unit Assembly", "Cadet corps initial muster and company formation at the San Enrique training grounds.", "/gallery/1st-instruction/instruction-1.jpg", "1st Instruction"],
  ["Drill Fundamentals & Military Posture", "Instructional drill briefing on military bearing, attention stance, and formation etiquette.", "/gallery/1st-instruction/instruction-2.jpg", "1st Instruction"],
  ["Command Briefing & Staff Muster", "Cadet officers and tactical staff aligning unit objectives and Saturday training directives.", "/gallery/1st-instruction/instruction-3.jpg", "1st Instruction"],
  ["Platoon Formation Inspection", "Uniform inspection, grooming regulations check, and muster verification across all companies.", "/gallery/1st-instruction/instruction-4.jpg", "1st Instruction"],
  ["Tactical Movement & Synchronization", "Basic facing movements and marching rhythm synchronized across platoons.", "/gallery/1st-instruction/instruction-5.jpg", "1st Instruction"],
  ["Ceremony & National Colors", "Honoring the Philippine flag and upholding patriotic duty during morning muster.", "/gallery/1st-instruction/instruction-6.jpg", "1st Instruction"],
  ["Cadet Leadership Orientation", "Corps officers mentoring incoming cadets on accountability, chain of command, and honor.", "/gallery/1st-instruction/instruction-7.jpg", "1st Instruction"],
  ["Company Rank Alignment", "Maintaining interval discipline and crisp platoon alignment under duty officer guidance.", "/gallery/1st-instruction/instruction-8.jpg", "1st Instruction"],
  ["Field Drill Instruction", "Hands-on execution of stationary commands and formation transitions on the parade field.", "/gallery/1st-instruction/instruction-9.jpg", "1st Instruction"],
  ["Command Staff Review", "Department of Military Science & Tactics staff supervising attendance and formation quality.", "/gallery/1st-instruction/instruction-10.jpg", "1st Instruction"],
  ["Company Muster in Review", "Full company formation review demonstrating high discipline and unit esprit de corps.", "/gallery/1st-instruction/instruction-11.jpg", "1st Instruction"],
  ["Camaraderie & Shared Purpose", "Building lasting bonds of brotherhood and sisterhood in civilian national defense preparation.", "/gallery/1st-instruction/instruction-12.jpg", "1st Instruction"],
  ["Muster Dismissal & Debriefing", "Concluding the first instruction day with unit announcements, duty logs, and honor code salute.", "/gallery/1st-instruction/instruction-13.jpg", "1st Instruction"],
  ["MS41-42 Commencement Assembly", "Graduating class of Military Science 41 & 42 assembled in full ceremonial uniform for the formal commencement rites.", "/gallery/ms41-42-graduate/graduate-1.jpg", "MS41-42 Graduate"],
  ["Presentation of Cadet Graduates", "Cadet officers and senior graduates presenting honors before the ROTC command staff, dignitaries, and guests.", "/gallery/ms41-42-graduate/graduate-2.jpg", "MS41-42 Graduate"],
  ["Valedictory Honors & Medals", "Conferment of academic and tactical service ribbons, leadership badges, and military completion certificates.", "/gallery/ms41-42-graduate/graduate-3.jpg", "MS41-42 Graduate"],
  ["Officer Commissioning Pledge", "Graduates taking the solemn oath of allegiance to the Republic and dedication to civilian national defense.", "/gallery/ms41-42-graduate/graduate-4.jpg", "MS41-42 Graduate"],
  ["Command Staff & Faculty Review", "Commandants, tactical staff, and ROTC directors inspecting the proud ranks of the graduating cadet corps.", "/gallery/ms41-42-graduate/graduate-5.jpg", "MS41-42 Graduate"],
  ["Awarding of Diplomas & Special Citations", "Honoring top-performing cadets, honor graduates, and meritorious leadership award recipients.", "/gallery/ms41-42-graduate/graduate-6.jpg", "MS41-42 Graduate"],
  ["Ceremonial Procession & Colors", "The ceremonial color guard and cadet battalion executing precision honors during the graduation procession.", "/gallery/ms41-42-graduate/graduate-7.jpg", "MS41-42 Graduate"],
  ["Cadet Sponsors & Family Accolades", "Cadet sponsors and proud families celebrating the milestone achievement of the graduating cohort.", "/gallery/ms41-42-graduate/graduate-8.jpg", "MS41-42 Graduate"],
  ["Graduating Corps Formation", "Flawless company alignment during the graduation pass-in-review and ceremonial military salute.", "/gallery/ms41-42-graduate/graduate-9.jpg", "MS41-42 Graduate"],
  ["Pass-In-Review Ceremonial March", "The traditional final pass-in-review executed with precision by the MS41-42 graduating class.", "/gallery/ms41-42-graduate/graduate-10.jpg", "MS41-42 Graduate"],
  ["Cadet Officers Milestone", "Advanced course cadets celebrating the successful culmination of two intensive years of leadership training.", "/gallery/ms41-42-graduate/graduate-11.jpg", "MS41-42 Graduate"],
  ["Unit Esprit & Camaraderie", "Lifelong camaraderie forged through discipline, honor, and dedicated service to the nation.", "/gallery/ms41-42-graduate/graduate-12.jpg", "MS41-42 Graduate"],
  ["Tossing of Caps & Jubilation", "Celebratory rites marking the official transition of graduates into the Armed Forces Reserve Force.", "/gallery/ms41-42-graduate/graduate-13.jpg", "MS41-42 Graduate"],
  ["Official MS41-42 Class Portrait", "The official commemorative portrait of the San Enrique ROTC MS41-42 Graduating Class.", "/gallery/ms41-42-graduate/graduate-14.jpg", "MS41-42 Graduate"],
];

export async function POST() {
  const configError = getAdminSupabaseConfigError();
  if (configError) {
    return NextResponse.json({ ok: false, message: configError }, { status: 500 });
  }

  const supabase = createAdminSupabaseClient();
  const rows = seedItems.map(([title, description, image_url, category]) => ({
    title,
    description,
    image_url,
    category,
    is_published: true,
  }));

  const { error } = await supabase.from("gallery_images").upsert(rows, {
    onConflict: "image_url",
    ignoreDuplicates: true,
  });

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error.message.includes("category") || error.message.includes("is_published")
            ? "Run supabase_gallery_publish_seed.sql in Supabase SQL Editor first, then click this button again."
            : error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, inserted: rows.length });
}
