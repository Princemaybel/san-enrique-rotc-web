import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, getAdminSupabaseConfigError } from "@/lib/supabase/admin";
import { parseAndValidateQrPayload } from "@/lib/qr-security";

function json(status: number, code: string, message: string, extra: Record<string, unknown> = {}) {
  return NextResponse.json({ ok: false, code, message, error: message, ...extra }, { status });
}

export async function POST(req: NextRequest) {
  const configError = getAdminSupabaseConfigError();
  if (configError) {
    return NextResponse.json({ error: configError }, { status: 500 });
  }

  const supabase = createAdminSupabaseClient();

  try {
    const body = await req.json();
    const { qrPayload, sessionId, manualStudentId, manualReason, status = "PRESENT" } = body;

    // 1. Verify Admin Actor Authorization
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!bearerToken) {
      return json(401, "UNAUTHORIZED", "Attendance scanning requires an authenticated admin session.");
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(bearerToken);
    if (authError || !authData.user) {
      return json(401, "UNAUTHORIZED", "Invalid or expired admin session.");
    }

    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("id, role, status")
      .eq("user_id", authData.user.id)
      .single();

    if (!adminProfile || adminProfile.role !== "admin" || adminProfile.status !== "approved") {
      return json(403, "UNAUTHORIZED", "Attendance scanning is restricted to approved administrators.");
    }

    // 2. Verify Active Attendance Session
    let activeSessionQuery = supabase
      .from("attendance_sessions")
      .select("id, title, session_date, is_open, status, opens_at, closes_at")
      .eq("is_open", true)
      .in("status", ["active", "scheduled", "draft"]);

    if (sessionId) {
      activeSessionQuery = activeSessionQuery.eq("id", sessionId);
    }

    const { data: session, error: sessionErr } = await activeSessionQuery.order("created_at", { ascending: false }).limit(1).maybeSingle();

    if (sessionErr || !session) {
      return json(400, "NO_ACTIVE_SESSION", "No active attendance session found. Please create or activate a session first.");
    }

    // 3. Resolve Cadet either via Scanned QR or Manual Fallback
    let cadetProfile: any = null;
    let verificationMethod = "qr_scan";

    if (manualStudentId) {
      // Manual admin fallback entry
      verificationMethod = "manual";
      if (!manualReason || String(manualReason).trim().length < 4) {
        return json(400, "VALIDATION_ERROR", "Manual attendance requires a reason.");
      }
      const { data: found } = await supabase
        .from("profiles")
        .select("id, user_id, first_name, last_name, student_id, course, year_level, section, status, profile_picture")
        .or(`student_id.eq.${manualStudentId},email.eq.${manualStudentId}`)
        .maybeSingle();

      cadetProfile = found;
    } else if (qrPayload) {
      // Decode and validate QR token
      const parsed = parseAndValidateQrPayload(qrPayload);
      if (!parsed.valid || !parsed.publicQrId) {
        return json(400, "INVALID_QR", parsed.error || "Invalid QR Code. This QR code format is not recognized.");
      }

      // Check against qr_codes table
      const { data: qrRecord } = await supabase
        .from("qr_codes")
        .select("id, cadet_id, user_id, status, public_qr_id")
        .eq("public_qr_id", parsed.publicQrId)
        .maybeSingle();

      let targetCadetId = qrRecord?.cadet_id;

      if (!qrRecord) {
        // Fallback check against id_cards table
        const { data: idCard } = await supabase
          .from("id_cards")
          .select("cadet_id, status, qr_code")
          .eq("qr_code", parsed.publicQrId)
          .maybeSingle();

        if (idCard) {
          targetCadetId = idCard.cadet_id;
        } else {
          // Check if public_qr_id contains cadet student ID
          const match = parsed.publicQrId.match(/SE-ROTC-([a-zA-Z0-9]+)-/);
          if (match && match[1]) {
            const { data: p } = await supabase
              .from("profiles")
              .select("id")
              .ilike("student_id", `%${match[1]}%`)
              .maybeSingle();
            if (p) targetCadetId = p.id;
          }
        }
      } else if (qrRecord.status !== "active") {
        return json(400, "QR_REVOKED", `This QR code is ${qrRecord.status}. Please request a regenerated code.`);
      }

      if (!targetCadetId) {
        return json(404, "INVALID_QR", "Invalid QR Code. This QR code is not registered in the system.");
      }

      // Fetch cadet profile
      const { data: cadet } = await supabase
        .from("profiles")
        .select("id, user_id, first_name, last_name, student_id, course, year_level, section, status, profile_picture")
        .eq("id", targetCadetId)
        .single();

      cadetProfile = cadet;
    }

    if (!cadetProfile) {
      return json(404, "CADET_INACTIVE", "Cadet record not found. Please verify the cadet ID.");
    }

    // 4. Verify Cadet Account Status
    if (cadetProfile.status !== "approved") {
      return json(403, "CADET_INACTIVE", "This cadet is not approved for attendance recording.");
    }

    // 5. Check for Duplicate Attendance Scan
    const { data: existingAttendance } = await supabase
      .from("attendance_records")
      .select("id, time_in, status")
      .eq("cadet_id", cadetProfile.id)
      .eq("session_id", session.id)
      .maybeSingle();

    if (existingAttendance) {
      return json(409, "ALREADY_RECORDED", `Attendance already recorded as ${existingAttendance.status} at ${existingAttendance.time_in}.`, {
        cadet: {
          fullName: `${cadetProfile.first_name} ${cadetProfile.last_name}`,
          studentId: cadetProfile.student_id,
          course: cadetProfile.course,
          yearLevel: cadetProfile.year_level,
          section: cadetProfile.section,
          alreadyScannedAt: existingAttendance.time_in,
        },
      });
    }

    // 6. Record Attendance
    const now = new Date();
    const timeIn = now.toTimeString().slice(0, 8);
    const dateToday = now.toISOString().slice(0, 10);

    const normalizedStatus = ["PRESENT", "LATE", "ABSENT", "EXCUSED"].includes(String(status).toUpperCase())
      ? String(status).toUpperCase()
      : "PRESENT";

    const { data: record, error: recordErr } = await supabase
      .from("attendance_records")
      .insert({
        cadet_id: cadetProfile.id,
        session_id: session.id,
        user_id: cadetProfile.user_id,
        date: dateToday,
        time_in: timeIn,
        status: normalizedStatus,
        verification_method: verificationMethod,
        source: verificationMethod === "manual" ? "manual" : "qr",
        is_late: normalizedStatus === "LATE",
        recorded_by: adminProfile.id,
        remarks: manualReason ? `Manual override: ${manualReason}` : "Admin camera QR scan verified",
      })
      .select("id, status, time_in")
      .single();

    if (recordErr) {
      return json(500, "SERVER_ERROR", "Failed to persist attendance record in database.", { details: recordErr.message });
    }

    if (qrPayload) {
      const parsed = parseAndValidateQrPayload(qrPayload);
      if (parsed.publicQrId) {
        await supabase.from("qr_codes").update({ last_used_at: now.toISOString() }).eq("public_qr_id", parsed.publicQrId);
      }
    }

    // 7. Push In-App Cadet Notification
    await supabase.from("notifications").insert({
      profile_id: cadetProfile.id,
      title: "Formation Attendance Verified",
      body: `Your attendance for "${session.title}" was recorded at ${timeIn} as PRESENT.`,
      notification_type: "attendance",
      is_read: false,
    });

    // 8. Log Audit Trail
    await supabase.from("audit_logs").insert({
      action: "admin_qr_attendance_scan",
      entity_type: "attendance_record",
      entity_id: record.id,
      actor_id: adminProfile.id,
      details: {
        cadet_id: cadetProfile.id,
        student_id: cadetProfile.student_id,
        session_id: session.id,
        verification_method: verificationMethod,
        time_in: timeIn,
      },
    });

    return NextResponse.json({
      ok: true,
      code: "ATTENDANCE_RECORDED",
      message: "Attendance Recorded Successfully",
      cadet: {
        id: cadetProfile.id,
        fullName: `${cadetProfile.first_name} ${cadetProfile.last_name}`,
        studentId: cadetProfile.student_id,
        course: cadetProfile.course,
        yearLevel: cadetProfile.year_level,
        section: cadetProfile.section,
        timeIn: record.time_in,
        status: record.status,
        sessionTitle: session.title,
        verificationMethod,
      },
    });
  } catch (err: any) {
    return json(500, "SERVER_ERROR", err?.message || "Internal server error occurred during scan verification.");
  }
}
