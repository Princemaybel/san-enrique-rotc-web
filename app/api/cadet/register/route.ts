import { createHash, randomUUID } from "node:crypto";
import QRCode from "qrcode";
import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, getAdminSupabaseConfigError } from "@/lib/supabase/admin";
import { generatePublicQrId, generateSecureQrPayload } from "@/lib/qr-security";

function jsonResponse(status: number, ok: boolean, message: string, data: Record<string, unknown> = {}) {
  return NextResponse.json({ ok, message, ...data }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const configError = getAdminSupabaseConfigError();
    if (configError) return jsonResponse(500, false, configError);

    const body = await req.json();
    const {
      email,
      password,
      firstName,
      middleName,
      lastName,
      studentId,
      phone,
      course,
      yearLevel,
      section,
      company,
      platoon,
      dateOfBirth,
      address,
      emergencyContactName,
      emergencyContactPhone,
      profilePhotoBase64,
      profilePhotoMime,
    } = body;

    if (!email || !password || !firstName || !lastName || !studentId) {
      return jsonResponse(400, false, "Missing required registration fields.");
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanStudentId = String(studentId).trim();
    const supabase = createAdminSupabaseClient();

    // 1. Check if email or student ID already exists in profiles
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, email, student_id")
      .or(`email.eq.${cleanEmail},student_id.eq.${cleanStudentId}`)
      .maybeSingle();

    if (existingProfile) {
      const matchField = existingProfile.email === cleanEmail ? "Email address" : "Student ID";
      return jsonResponse(409, false, `${matchField} is already registered. Please log in.`);
    }

    // 2. Create Supabase Auth User with auto-confirmed email (bypasses email rate limit completely!)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password: String(password),
      email_confirm: true,
    });

    if (authError || !authData?.user) {
      return jsonResponse(400, false, authError?.message || "Failed to create authentication user.");
    }

    const userId = authData.user.id;
    let uploadedPhotoPath: string | null = null;

    // 3. Upload photo if provided
    if (profilePhotoBase64) {
      try {
        const buffer = Buffer.from(profilePhotoBase64, "base64");
        const ext = profilePhotoMime?.includes("png") ? "png" : "jpg";
        const objectPath = `profiles/${userId}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage.from("profile-pictures").upload(objectPath, buffer, {
          upsert: true,
          contentType: profilePhotoMime || "image/jpeg",
        });

        if (!uploadError) {
          uploadedPhotoPath = objectPath;
        }
      } catch (photoErr) {
        console.warn("Photo upload skipped:", photoErr);
      }
    }

    // 4. Insert Profile (service role bypasses RLS)
    const { data: profileRow, error: profileError } = await supabase
      .from("profiles")
      .insert({
        user_id: userId,
        first_name: String(firstName).trim(),
        middle_name: middleName ? String(middleName).trim() : null,
        last_name: String(lastName).trim(),
        student_id: cleanStudentId,
        email: cleanEmail,
        phone: String(phone || "").trim(),
        course: String(course || "").trim(),
        year_level: String(yearLevel || "").trim(),
        section: String(section || "").trim(),
        company: company ? String(company).trim() : null,
        platoon: platoon ? String(platoon).trim() : null,
        date_of_birth: String(dateOfBirth || "2000-01-01").trim(),
        address: String(address || "").trim(),
        profile_picture: uploadedPhotoPath,
        role: "cadet",
        status: "pending",
        emergency_contact_name: emergencyContactName ? String(emergencyContactName).trim() : null,
        emergency_contact_phone: emergencyContactPhone ? String(emergencyContactPhone).trim() : null,
      })
      .select("id")
      .single();

    if (profileError || !profileRow) {
      // Rollback user on profile failure
      await supabase.auth.admin.deleteUser(userId);
      return jsonResponse(500, false, profileError?.message || "Failed to save cadet profile.");
    }

    const profileId = profileRow.id;

    // 5. Insert Application
    await supabase.from("applications").insert({
      profile_id: profileId,
      user_id: userId,
      full_name: `${firstName} ${lastName}`.trim(),
      email: cleanEmail,
      phone: String(phone || "").trim(),
      student_id: cleanStudentId,
      course: String(course || "").trim(),
      year_level: String(yearLevel || "").trim(),
      section: String(section || "").trim(),
      company: company ? String(company).trim() : null,
      platoon: platoon ? String(platoon).trim() : null,
      address: String(address || "").trim(),
      profile_photo_path: uploadedPhotoPath,
      status: "pending",
    });

    // 6. Upsert Cadets record
    await supabase.from("cadets").upsert(
      {
        profile_id: profileId,
        cadet_number: cleanStudentId,
        unit: section ? String(section).trim() : "SAN ENRIQUE ROTC",
      },
      { onConflict: "profile_id" }
    );

    // 7. Create QR Code
    const publicQrId = generatePublicQrId(cleanStudentId);
    const { tokenHash } = generateSecureQrPayload(cleanStudentId, publicQrId);

    await supabase.from("qr_codes").insert({
      user_id: userId,
      cadet_id: profileId,
      public_qr_id: publicQrId,
      token_hash: tokenHash || createHash("sha256").update(publicQrId).digest("hex"),
      status: "active",
    });

    // 8. Create ID Card
    await supabase.from("id_cards").upsert(
      {
        cadet_id: profileId,
        school_id: cleanStudentId,
        qr_code: publicQrId,
        status: "active",
      },
      { onConflict: "cadet_id" }
    );

    return jsonResponse(201, true, "Cadet registration submitted successfully.", {
      userId,
      profileId,
      studentId: cleanStudentId,
    });
  } catch (error: any) {
    console.error("API cadet register error:", error);
    return jsonResponse(500, false, error?.message || "Internal registration error.");
  }
}

