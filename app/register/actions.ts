"use server";

import { randomUUID } from "node:crypto";
import QRCode from "qrcode";
import { createAdminSupabaseClient, getAdminSupabaseConfigError } from "@/lib/supabase/admin";
import { generatePublicQrId, generateSecureQrPayload } from "@/lib/qr-security";

export type RegistrationState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string>;
  cadetData?: {
    fullName: string;
    studentId: string;
    course: string;
    yearLevel: string;
    section: string;
    platoon: string;
    email: string;
    publicQrId: string;
    qrDataUrl: string;
    accountStatus: string;
  };
};

export async function registerCadet(_state: RegistrationState, formData: FormData): Promise<RegistrationState> {
  try {
    return await registerCadetInternal(formData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration service is temporarily unavailable.";
    return {
      ok: false,
      message: message.includes("fetch")
        ? "Registration could not reach Supabase. Please check the server connection and try again."
        : message,
    };
  }
}

async function registerCadetInternal(formData: FormData): Promise<RegistrationState> {
  const configError = getAdminSupabaseConfigError();
  if (configError) return { ok: false, message: configError };

  const supabase = createAdminSupabaseClient();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const middleName = String(formData.get("middleName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const studentId = String(formData.get("studentId") ?? "").trim();
  const course = String(formData.get("course") ?? "").trim();
  const yearLevel = String(formData.get("yearLevel") ?? "").trim();
  const section = String(formData.get("section") ?? "").trim();
  const platoon = String(formData.get("platoon") ?? "").trim() || "Alpha Platoon";
  const phone = String(formData.get("phone") ?? "").trim();
  const dateOfBirth = String(formData.get("dateOfBirth") ?? "");
  const address = String(formData.get("address") ?? "").trim();
  const emergencyName = String(formData.get("emergencyContactName") ?? "").trim();
  const emergencyPhone = String(formData.get("emergencyContactPhone") ?? "").trim();
  const termsAccepted = formData.get("termsAccepted") === "on" || formData.get("termsAccepted") === "true";

  // Field level validation
  const errors: Record<string, string> = {};
  if (!firstName) errors.firstName = "First name is required.";
  if (!lastName) errors.lastName = "Last name is required.";
  if (!studentId) errors.studentId = "Cadet ID / Student ID is required.";
  if (!course) errors.course = "Course / Program is required.";
  if (!yearLevel) errors.yearLevel = "Year level is required.";
  if (!section) errors.section = "Section is required.";
  if (!email || !email.includes("@")) errors.email = "A valid email address is required.";
  if (password.length < 8) errors.password = "Password must contain at least 8 characters.";
  if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";
  if (!phone) errors.phone = "Contact phone number is required.";
  if (!dateOfBirth) errors.dateOfBirth = "Date of birth is required.";
  if (!address) errors.address = "Address is required.";
  if (!termsAccepted) errors.terms = "You must accept the terms and privacy policy to register.";

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Please correct the highlighted fields before proceeding.", fieldErrors: errors };
  }

  // Check unique email and student_id in profiles
  const { data: existingEmail } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingEmail) {
    return {
      ok: false,
      message: "This email address is already registered in the system.",
      fieldErrors: { email: "Email is already in use." },
    };
  }

  const { data: existingCadetId } = await supabase
    .from("profiles")
    .select("id")
    .eq("student_id", studentId)
    .maybeSingle();

  if (existingCadetId) {
    return {
      ok: false,
      message: "This Cadet ID / Student ID is already registered in the system.",
      fieldErrors: { studentId: "Cadet ID is already registered." },
    };
  }

  // 1. Create Supabase Auth User
  const { data: userData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !userData.user) {
    return { ok: false, message: authError?.message ?? "Unable to create authentication account." };
  }

  // 2. Profile picture upload (if provided)
  const file = formData.get("profilePicture");
  let profilePicture: string | null = null;
  if (file instanceof File && file.size > 0) {
    const extension = file.name.split(".").pop() || "jpg";
    const objectPath = `profiles/${userData.user.id}/${randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("profile-pictures").upload(objectPath, file, {
      upsert: true,
      contentType: file.type || "image/jpeg",
    });
    if (uploadError) {
      await supabase.auth.admin.deleteUser(userData.user.id);
      return { ok: false, message: "Profile picture upload failed. Please try with a valid JPG/PNG." };
    }
    profilePicture = objectPath;
  }

  // 3. Create Profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({
      user_id: userData.user.id,
      first_name: firstName,
      middle_name: middleName || null,
      last_name: lastName,
      student_id: studentId,
      email,
      phone,
      course,
      year_level: yearLevel,
      section,
      date_of_birth: dateOfBirth,
      address,
      profile_picture: profilePicture,
      role: "cadet",
      status: "pending",
      emergency_contact_name: emergencyName || null,
      emergency_contact_phone: emergencyPhone || null,
    })
    .select("id")
    .single();

  if (profileError || !profile) {
    await supabase.auth.admin.deleteUser(userData.user.id);
    return { ok: false, message: profileError?.message ?? "Failed to save profile record." };
  }

  // 4. Create Application Entry
  const { error: applicationError } = await supabase.from("applications").insert({
    profile_id: profile.id,
    user_id: userData.user.id,
    full_name: `${firstName} ${lastName}`,
    email,
    phone,
    student_id: studentId,
    course,
    year_level: yearLevel,
    section,
    address,
    profile_photo_path: profilePicture,
    status: "pending",
  });

  if (applicationError) {
    await supabase.auth.admin.deleteUser(userData.user.id);
    return { ok: false, message: applicationError.message || "Failed to save application record." };
  }

  const { error: cadetError } = await supabase.from("cadets").upsert(
    {
      profile_id: profile.id,
      cadet_number: studentId,
      unit: section || "SAN ENRIQUE ROTC",
    },
    { onConflict: "profile_id" }
  );

  if (cadetError) {
    await supabase.auth.admin.deleteUser(userData.user.id);
    return { ok: false, message: cadetError.message || "Failed to save cadet record." };
  }

  // 5. AUTOMATIC SECURE PERSONAL QR CODE GENERATION
  const publicQrId = generatePublicQrId(studentId);
  const { qrPayload, tokenHash } = generateSecureQrPayload(studentId, publicQrId);

  // Save to qr_codes table. The partial unique index allows one active QR per cadet.
  const { data: existingQr } = await supabase
    .from("qr_codes")
    .select("id, public_qr_id")
    .eq("cadet_id", profile.id)
    .eq("status", "active")
    .maybeSingle();

  const activePublicQrId = existingQr?.public_qr_id ?? publicQrId;
  const activeQrPayload = existingQr
    ? JSON.stringify({ org: "SAN_ENRIQUE_ROTC", v: 1, qid: existingQr.public_qr_id })
    : qrPayload;

  if (existingQr) {
    // Existing active QR keeps registration retry idempotent.
  } else {
    const { error: qrError } = await supabase.from("qr_codes").insert({
      user_id: userData.user.id,
      cadet_id: profile.id,
      public_qr_id: publicQrId,
      token_hash: tokenHash,
      status: "active",
    });

    if (qrError) {
      await supabase.auth.admin.deleteUser(userData.user.id);
      return {
        ok: false,
        message: "Account was created, but QR generation failed. Please contact an administrator to regenerate the QR code.",
      };
    }
  }

  // Also sync to id_cards table for backward compatibility
  await supabase.from("id_cards").upsert(
    {
      cadet_id: profile.id,
      school_id: studentId,
      qr_code: activePublicQrId,
      status: "active",
    },
    { onConflict: "cadet_id" }
  );

  // 6. Generate High-Res Data URL for immediate display in success popup
  let qrDataUrl = "";
  try {
    qrDataUrl = await QRCode.toDataURL(activeQrPayload, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 320,
      color: {
        dark: "#0B2A1D",
        light: "#FFFFFF",
      },
    });
  } catch {
    qrDataUrl = "";
  }

  // 7. Audit Log Entry
  await supabase.from("audit_logs").insert({
    actor_id: profile.id,
    action: "cadet_registered",
    entity_type: "profile",
    entity_id: profile.id,
    details: {
      student_id: studentId,
      email,
      public_qr_id: activePublicQrId,
      timestamp: new Date().toISOString(),
    },
  });

  return {
    ok: true,
    message: "Registration Successful! Your personal QR code has also been generated.",
    cadetData: {
      fullName: `${firstName} ${middleName ? middleName + " " : ""}${lastName}`,
      studentId,
      course,
      yearLevel,
      section,
      platoon,
      email,
      publicQrId: activePublicQrId,
      qrDataUrl,
      accountStatus: "PENDING REVIEW",
    },
  };
}
