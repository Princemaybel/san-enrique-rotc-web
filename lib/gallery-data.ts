export interface GallerySlideItem {
  id: string;
  src: string;
  title: string;
  category: string;
  desc: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  coverImage: string;
  photos: GallerySlideItem[];
}

export const INSTRUCTION_PHOTOS: GallerySlideItem[] = [
  {
    id: "inst-1",
    src: "/gallery/1st-instruction/instruction-1.jpg",
    title: "1st Instruction: Unit Assembly",
    category: "1st Instruction",
    desc: "Cadet corps initial muster and company formation at the San Enrique training grounds.",
  },
  {
    id: "inst-2",
    src: "/gallery/1st-instruction/instruction-2.jpg",
    title: "Drill Fundamentals & Military Posture",
    category: "1st Instruction",
    desc: "Instructional drill briefing on military bearing, attention stance, and formation etiquette.",
  },
  {
    id: "inst-3",
    src: "/gallery/1st-instruction/instruction-3.jpg",
    title: "Command Briefing & Staff Muster",
    category: "1st Instruction",
    desc: "Cadet officers and tactical staff aligning unit objectives and Saturday training directives.",
  },
  {
    id: "inst-4",
    src: "/gallery/1st-instruction/instruction-4.jpg",
    title: "Platoon Formation Inspection",
    category: "1st Instruction",
    desc: "Uniform inspection, grooming regulations check, and muster verification across all companies.",
  },
  {
    id: "inst-5",
    src: "/gallery/1st-instruction/instruction-5.jpg",
    title: "Tactical Movement & Synchronization",
    category: "1st Instruction",
    desc: "Basic facing movements and marching rhythm synchronized across platoons.",
  },
  {
    id: "inst-6",
    src: "/gallery/1st-instruction/instruction-6.jpg",
    title: "Ceremony & National Colors",
    category: "1st Instruction",
    desc: "Honoring the Philippine flag and upholding patriotic duty during morning muster.",
  },
  {
    id: "inst-7",
    src: "/gallery/1st-instruction/instruction-7.jpg",
    title: "Cadet Leadership Orientation",
    category: "1st Instruction",
    desc: "Corps officers mentoring incoming cadets on accountability, chain of command, and honor.",
  },
  {
    id: "inst-8",
    src: "/gallery/1st-instruction/instruction-8.jpg",
    title: "Company Rank Alignment",
    category: "1st Instruction",
    desc: "Maintaining interval discipline and crisp platoon alignment under duty officer guidance.",
  },
  {
    id: "inst-9",
    src: "/gallery/1st-instruction/instruction-9.jpg",
    title: "Field Drill Instruction",
    category: "1st Instruction",
    desc: "Hands-on execution of stationary commands and formation transitions on the parade field.",
  },
  {
    id: "inst-10",
    src: "/gallery/1st-instruction/instruction-10.jpg",
    title: "Command Staff Review",
    category: "1st Instruction",
    desc: "Department of Military Science & Tactics staff supervising attendance and formation quality.",
  },
  {
    id: "inst-11",
    src: "/gallery/1st-instruction/instruction-11.jpg",
    title: "Company Muster in Review",
    category: "1st Instruction",
    desc: "Full company formation review demonstrating high discipline and unit esprit de corps.",
  },
  {
    id: "inst-12",
    src: "/gallery/1st-instruction/instruction-12.jpg",
    title: "Camaraderie & Shared Purpose",
    category: "1st Instruction",
    desc: "Building lasting bonds of brotherhood and sisterhood in civilian national defense preparation.",
  },
  {
    id: "inst-13",
    src: "/gallery/1st-instruction/instruction-13.jpg",
    title: "Muster Dismissal & Debriefing",
    category: "1st Instruction",
    desc: "Concluding the first instruction day with unit announcements, duty logs, and honor code salute.",
  },
];

export const GRADUATE_PHOTOS: GallerySlideItem[] = [
  {
    id: "grad-1",
    src: "/gallery/ms41-42-graduate/graduate-1.jpg",
    title: "MS41-42 Commencement Assembly",
    category: "MS41-42 Graduate",
    desc: "Graduating class of Military Science 41 & 42 assembled in full ceremonial uniform for the formal commencement rites.",
  },
  {
    id: "grad-2",
    src: "/gallery/ms41-42-graduate/graduate-2.jpg",
    title: "Presentation of Cadet Graduates",
    category: "MS41-42 Graduate",
    desc: "Cadet officers and senior graduates presenting honors before the ROTC command staff, dignitaries, and guests.",
  },
  {
    id: "grad-3",
    src: "/gallery/ms41-42-graduate/graduate-3.jpg",
    title: "Valedictory Honors & Medals",
    category: "MS41-42 Graduate",
    desc: "Conferment of academic and tactical service ribbons, leadership badges, and military completion certificates.",
  },
  {
    id: "grad-4",
    src: "/gallery/ms41-42-graduate/graduate-4.jpg",
    title: "Officer Commissioning Pledge",
    category: "MS41-42 Graduate",
    desc: "Graduates taking the solemn oath of allegiance to the Republic and dedication to civilian national defense.",
  },
  {
    id: "grad-5",
    src: "/gallery/ms41-42-graduate/graduate-5.jpg",
    title: "Command Staff & Faculty Review",
    category: "MS41-42 Graduate",
    desc: "Commandants, tactical staff, and ROTC directors inspecting the proud ranks of the graduating cadet corps.",
  },
  {
    id: "grad-6",
    src: "/gallery/ms41-42-graduate/graduate-6.jpg",
    title: "Awarding of Diplomas & Special Citations",
    category: "MS41-42 Graduate",
    desc: "Honoring top-performing cadets, honor graduates, and meritorious leadership award recipients.",
  },
  {
    id: "grad-7",
    src: "/gallery/ms41-42-graduate/graduate-7.jpg",
    title: "Ceremonial Procession & Colors",
    category: "MS41-42 Graduate",
    desc: "The ceremonial color guard and cadet battalion executing precision honors during the graduation procession.",
  },
  {
    id: "grad-8",
    src: "/gallery/ms41-42-graduate/graduate-8.jpg",
    title: "Cadet Sponsors & Family Accolades",
    category: "MS41-42 Graduate",
    desc: "Cadet sponsors and proud families celebrating the milestone achievement of the graduating cohort.",
  },
  {
    id: "grad-9",
    src: "/gallery/ms41-42-graduate/graduate-9.jpg",
    title: "Graduating Corps Formation",
    category: "MS41-42 Graduate",
    desc: "Flawless company alignment during the graduation pass-in-review and ceremonial military salute.",
  },
  {
    id: "grad-10",
    src: "/gallery/ms41-42-graduate/graduate-10.jpg",
    title: "Pass-In-Review Ceremonial March",
    category: "MS41-42 Graduate",
    desc: "The traditional final pass-in-review executed with precision by the MS41-42 graduating class.",
  },
  {
    id: "grad-11",
    src: "/gallery/ms41-42-graduate/graduate-11.jpg",
    title: "Cadet Officers Milestone",
    category: "MS41-42 Graduate",
    desc: "Advanced course cadets celebrating the successful culmination of two intensive years of leadership training.",
  },
  {
    id: "grad-12",
    src: "/gallery/ms41-42-graduate/graduate-12.jpg",
    title: "Unit Esprit & Camaraderie",
    category: "MS41-42 Graduate",
    desc: "Lifelong camaraderie forged through discipline, honor, and dedicated service to the nation.",
  },
  {
    id: "grad-13",
    src: "/gallery/ms41-42-graduate/graduate-13.jpg",
    title: "Tossing of Caps & Jubilation",
    category: "MS41-42 Graduate",
    desc: "Celebratory rites marking the official transition of graduates into the Armed Forces Reserve Force.",
  },
  {
    id: "grad-14",
    src: "/gallery/ms41-42-graduate/graduate-14.jpg",
    title: "Official MS41-42 Class Portrait",
    category: "MS41-42 Graduate",
    desc: "The official commemorative portrait of the San Enrique ROTC MS41-42 Graduating Class.",
  },
];

export const OFFICIAL_ALBUMS: GalleryAlbum[] = [
  {
    id: "album-ms41-42-graduate",
    title: "MS41-42 Graduation Rites & Commencement",
    category: "Graduation Rites",
    date: "AY 2025-2026",
    description: "Official photo archive of the San Enrique ROTC Military Science 41 & 42 Graduation Rites, formal commissioning, awards conferment, pass-in-review, and commencement celebration.",
    coverImage: "/gallery/ms41-42-graduate/graduate-1.jpg",
    photos: GRADUATE_PHOTOS,
  },
  {
    id: "album-1st-instruction",
    title: "1st Instruction: Unit Muster & Tactical Orientation",
    category: "1st Instruction",
    date: "AY 2026-2027",
    description: "Official photo archive covering the 1st Instruction Saturday muster, company inspections, flag ceremony, drill movements, and leadership briefing at the San Enrique grounds.",
    coverImage: "/gallery/1st-instruction/instruction-1.jpg",
    photos: INSTRUCTION_PHOTOS,
  },
];
