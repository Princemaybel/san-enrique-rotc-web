export const cadetManuals = [
  {
    slug: "rotc-training-manual",
    title: "ROTC Cadet Training Manual",
    category: "Doctrine & Field Manual",
    size: "PDF",
    version: "Rev 2026",
    desc: "Core cadet orientation, basic drill expectations, training conduct, and field preparation notes.",
  },
  {
    slug: "customs-courtesies",
    title: "Military Customs, Courtesies & Traditions",
    category: "Conduct & Ethics",
    size: "PDF",
    version: "Cadet Guide",
    desc: "Reference for saluting, reporting, chain of command, military courtesy, and conduct during formation.",
  },
  {
    slug: "attendance-qr-guide",
    title: "QR Attendance & Digital ID Guide",
    category: "Cadet Services",
    size: "PDF",
    version: "Mobile App Guide",
    desc: "How to use the mobile app, display your personal QR code, and verify attendance records.",
  },
  {
    slug: "unit-syllabus-drill-guide",
    title: "San Enrique ROTC Unit Syllabus & Drill Guide",
    category: "Syllabus & Formations",
    size: "PDF",
    version: "AY 2026-2027",
    desc: "Training roadmap, formation reminders, uniform standards, and weekly drill preparation guide.",
  },
] as const;

export type CadetManualSlug = (typeof cadetManuals)[number]["slug"];
