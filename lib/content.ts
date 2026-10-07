import {
  Award,
  BookOpenCheck,
  Camera,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  IdCard,
  Mail,
  MapPin,
  Megaphone,
  QrCode,
  ShieldCheck,
  Smartphone,
  UsersRound
} from "lucide-react";

export const publicStats = [
  ["05", "Selection stages"],
  ["24/7", "Cadet services"],
  ["100%", "Supabase connected"],
  ["01", "Official command portal"]
];

export const quickInfo = [
  {
    title: "Online Registration",
    body: "Applicants submit their ROTC profile, account details, and profile picture through the website.",
    icon: ClipboardCheck
  },
  {
    title: "Admin Approval",
    body: "Administrators review pending cadets before accounts can use protected mobile features.",
    icon: ShieldCheck
  },
  {
    title: "QR Attendance",
    body: "Approved cadets use the Android app to scan event QR codes and record attendance.",
    icon: QrCode
  },
  {
    title: "Digital ID Cards",
    body: "Approved profiles can receive official QR-backed cadet identification cards.",
    icon: IdCard
  }
];

export const aboutPoints = [
  "Builds civic responsibility, discipline, leadership, and public service readiness.",
  "Organizes cadet records, approvals, announcements, training events, and attendance in one system.",
  "Keeps the public website, admin dashboard, and Android app connected to Supabase only."
];

export const requirements = [
  "Currently enrolled student with valid school identification.",
  "Complete online registration with active email and contact number.",
  "Profile reviewed and approved by an ROTC administrator.",
  "Android app login after account approval for QR attendance and cadet ID access."
];

export const events = [
  {
    title: "Orientation Formation",
    date: "2026-09-19",
    place: "Covered Court",
    body: "Program briefing, unit assignment, and attendance onboarding."
  },
  {
    title: "Basic Drill Training",
    date: "2026-09-26",
    place: "Campus Field",
    body: "Marching fundamentals, command response, and squad movement."
  },
  {
    title: "Leadership Workshop",
    date: "2026-10-03",
    place: "Lecture Hall A",
    body: "Team leadership, communication discipline, and service ethics."
  }
];

export const announcements = [
  {
    title: "Registration review is open",
    label: "Applicants",
    body: "Submit complete profile details and wait for admin approval before using the mobile app."
  },
  {
    title: "Bring school ID to formations",
    label: "Cadets",
    body: "Cadets should bring school identification and arrive before call time for attendance validation."
  },
  {
    title: "Digital ID rollout",
    label: "Approved cadets",
    body: "QR-backed cadet IDs are generated from approved Supabase profiles."
  }
];

export const galleryPreview = [
  { title: "Formation", tone: "bg-field", icon: UsersRound },
  { title: "Instruction", tone: "bg-pine", icon: BookOpenCheck },
  { title: "Recognition", tone: "bg-charcoal", icon: Award }
];

export const recruitmentSteps = [
  { title: "Apply Online", body: "Create your account and submit registration details.", icon: FileCheck2 },
  { title: "Wait for Review", body: "Administrators validate your profile and status.", icon: GraduationCap },
  { title: "Use the App", body: "Log in after approval for QR attendance and ID tools.", icon: Smartphone }
];

export const contactCards = [
  { title: "Office", body: "SAN ENRIQUE ROTC Office", icon: MapPin },
  { title: "Email", body: "rotc@saneenrique.edu", icon: Mail },
  { title: "Updates", body: "Announcements and events are published in the portal.", icon: Megaphone },
  { title: "Gallery", body: "Training activities and ceremonies appear in the gallery.", icon: Camera }
];
