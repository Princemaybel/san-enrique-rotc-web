import { createHash } from "node:crypto";
import QRCode from "qrcode";
import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, getAdminSupabaseConfigError } from "@/lib/supabase/admin";
import { generatePublicQrId, generateSecureQrPayload } from "@/lib/qr-security";

function response(status: number, code: string, message: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: status < 400, code, message, ...extra }, { status });
}

export async function POST(req: NextRequest) {
  const configError = getAdminSupabaseConfigError();
  if (configError) return response(500, "CONFIG_ERROR", configError);

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return response(401, "UNAUTHORIZED", "Login is required to generate your QR code.");

  const supabase = createAdminSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) return response(401, "UNAUTHORIZED", "Invalid or expired login session.");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,user_id,student_id,role,first_name,last_name")
    .eq("user_id", authData.user.id)
    .single();

  if (profileError || !profile) return response(404, "PROFILE_NOT_FOUND", "Your cadet profile was not found.");
  if (profile.role !== "cadet") return response(403, "FORBIDDEN", "Only cadets can generate a personal cadet QR code.");

  const { data: existingQr } = await supabase
    .from("qr_codes")
    .select("id,public_qr_id,created_at,status")
    .eq("cadet_id", profile.id)
    .eq("status", "active")
    .maybeSingle();

  let publicQrId = existingQr?.public_qr_id;
  let createdAt = existingQr?.created_at;

  if (!publicQrId) {
    publicQrId = generatePublicQrId(profile.student_id);
    const { tokenHash } = generateSecureQrPayload(profile.student_id, publicQrId);

    const { data: createdQr, error: qrError } = await supabase
      .from("qr_codes")
      .insert({
        user_id: authData.user.id,
        cadet_id: profile.id,
        public_qr_id: publicQrId,
        token_hash: tokenHash || createHash("sha256").update(publicQrId).digest("hex"),
        status: "active",
      })
      .select("id,public_qr_id,created_at")
      .single();

    if (qrError || !createdQr) {
      return response(500, "QR_CREATE_FAILED", qrError?.message ?? "Unable to create personal QR code.");
    }

    publicQrId = createdQr.public_qr_id;
    createdAt = createdQr.created_at;
  }

  await supabase.from("cadets").upsert(
    {
      profile_id: profile.id,
      cadet_number: profile.student_id,
      unit: "SAN ENRIQUE ROTC",
    },
    { onConflict: "profile_id" },
  );

  await supabase.from("id_cards").upsert(
    {
      cadet_id: profile.id,
      school_id: profile.student_id,
      qr_code: publicQrId,
      status: "active",
    },
    { onConflict: "cadet_id" },
  );

  const qrPayload = JSON.stringify({ org: "SAN_ENRIQUE_ROTC", v: 1, qid: publicQrId });
  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 320,
    color: {
      dark: "#0B2A1D",
      light: "#FFFFFF",
    },
  });

  return response(200, "QR_READY", "Personal QR code is ready.", {
    qr: {
      publicQrId,
      createdAt,
      qrDataUrl,
    },
  });
}
