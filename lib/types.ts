export type CadetStatus = "pending" | "under_review" | "approved" | "rejected" | "inactive";
export type ProfileRole = "admin" | "cadet";

export type Profile = {
  id: string;
  user_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  student_id: string;
  email: string;
  phone: string;
  course: string;
  year_level: string;
  section: string;
  date_of_birth: string;
  address: string;
  profile_picture: string | null;
  role: ProfileRole;
  status: CadetStatus;
  created_at: string;
  updated_at: string;
};

export type ApplicationStatus = "pending" | "under_review" | "approved" | "rejected";
export type AttendanceStatus = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";

export type Application = {
  id: string;
  profile_id: string | null;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  student_id: string;
  course: string;
  year_level: string;
  section: string | null;
  status: ApplicationStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: "normal" | "important" | "urgent";
  is_published: boolean;
  image_url: string | null;
  created_at: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  location: string;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  event_type: "event" | "training";
  is_published: boolean;
};

export type AttendanceSession = {
  id: string;
  title: string;
  session_date: string;
  qr_token: string;
  is_open: boolean;
};

export type AttendanceRecord = {
  id: string;
  cadet_id: string;
  session_id: string;
  date: string;
  time_in: string | null;
  time_out: string | null;
  status: AttendanceStatus;
};
