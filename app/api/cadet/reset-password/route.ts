import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, getAdminSupabaseConfigError } from "@/lib/supabase/admin";

function jsonResponse(status: number, ok: boolean, message: string, data: Record<string, unknown> = {}) {
  return NextResponse.json({ ok, message, ...data }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const configError = getAdminSupabaseConfigError();
    if (configError) return jsonResponse(500, false, configError);

    const body = await req.json();
    const { action, identifier, birthDate, phone, newPassword } = body;

    if (!identifier) {
      return jsonResponse(400, false, "Please enter your registered email address or student ID.");
    }

    const cleanIdentifier = String(identifier).trim().toLowerCase();
    const supabase = createAdminSupabaseClient();

    // 1. Locate cadet profile by email or student ID
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, user_id, email, student_id, first_name, last_name, date_of_birth, phone, emergency_contact_phone")
      .or(`email.ilike.${cleanIdentifier},student_id.ilike.${cleanIdentifier}`)
      .maybeSingle();

    if (profileErr || !profile) {
      return jsonResponse(404, false, "No cadet account found with that email or student ID.");
    }

    // ACTION: verify_security_details
    if (action === "verify_identity") {
      const cleanDob = birthDate ? String(birthDate).trim() : "";
      const cleanPhone = phone ? String(phone).trim() : "";

      const dobMatch = cleanDob && profile.date_of_birth && profile.date_of_birth.startsWith(cleanDob);
      const phoneMatch = cleanPhone && (
        (profile.phone && profile.phone.includes(cleanPhone)) ||
        (profile.emergency_contact_phone && profile.emergency_contact_phone.includes(cleanPhone))
      );

      if (!dobMatch && !phoneMatch) {
        return jsonResponse(400, false, "Security details do not match our roster records. Please check your birth date or phone.");
      }

      return jsonResponse(200, true, "Identity verified successfully.", {
        cadetName: `${profile.first_name} ${profile.last_name}`,
        email: profile.email,
        studentId: profile.student_id,
        userId: profile.user_id,
      });
    }

    // ACTION: direct_password_reset
    if (action === "reset_password") {
      if (!newPassword || String(newPassword).length < 8) {
        return jsonResponse(400, false, "New password must be at least 8 characters long.");
      }

      // Update password directly using Supabase Admin Auth
      const { error: updateError } = await supabase.auth.admin.updateUserById(profile.user_id, {
        password: String(newPassword),
      });

      if (updateError) {
        return jsonResponse(500, false, updateError.message || "Failed to update password.");
      }

      return jsonResponse(200, true, "Password reset successfully! You can now log in.", {
        userId: profile.user_id,
        email: profile.email,
      });
    }

    return jsonResponse(400, false, "Invalid action specified.");
  } catch (err: any) {
    return jsonResponse(500, false, err?.message || "Internal server error.");
  }
}

