import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient, getAdminSupabaseConfigError } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const configError = getAdminSupabaseConfigError();
    if (configError) {
      return NextResponse.json({ ok: false, error: configError }, { status: 500 });
    }

    const body = await req.json();
    const { cadetId, cadetIds, status } = body;

    const validStatuses = ["approved", "rejected", "pending", "under_review", "inactive"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ ok: false, error: `Invalid status: ${status}` }, { status: 400 });
    }

    // Support single cadetId or array of cadetIds
    const targetIds: string[] = [];
    if (Array.isArray(cadetIds) && cadetIds.length > 0) {
      targetIds.push(...cadetIds);
    } else if (cadetId) {
      targetIds.push(cadetId);
    }

    if (targetIds.length === 0) {
      return NextResponse.json({ ok: false, error: "No cadetId or cadetIds provided." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    // 1. Verify that the requester is an admin if authorization header is provided
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (bearerToken) {
      const { data: authData } = await supabase.auth.getUser(bearerToken);
      if (authData?.user) {
        const { data: callerProfile } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("user_id", authData.user.id)
          .maybeSingle();

        if (callerProfile && callerProfile.role !== "admin") {
          return NextResponse.json({ ok: false, error: "Only administrators can update cadet status." }, { status: 403 });
        }
      }
    }

    // 2. Update profiles table using Service Role (bypasses RLS)
    const { data: updatedProfiles, error: profileErr } = await supabase
      .from("profiles")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .in("id", targetIds)
      .select("id, first_name, last_name, student_id, status");

    if (profileErr) {
      return NextResponse.json({ ok: false, error: profileErr.message }, { status: 500 });
    }

    // 3. Update applications table
    await supabase
      .from("applications")
      .update({
        status: status === "inactive" ? "rejected" : status,
        updated_at: new Date().toISOString(),
      })
      .in("profile_id", targetIds);

    // 4. Send notifications to cadets
    const notifTitle =
      status === "approved"
        ? "Cadet Registration Approved"
        : status === "rejected"
        ? "Cadet Application Status"
        : "Cadet Status Updated";

    const notifBody =
      status === "approved"
        ? "Congratulations! Your ROTC cadet registration has been approved. Your personal QR code is now active for formation attendance."
        : status === "rejected"
        ? "Your cadet registration has been rejected. Please contact your unit commanding officer for details."
        : `Your cadet account status has been updated to ${status.toUpperCase()}.`;

    const notifs = targetIds.map((id) => ({
      profile_id: id,
      title: notifTitle,
      body: notifBody,
      notification_type: status === "approved" ? "approval" : "general",
      is_read: false,
    }));

    try {
      await supabase.from("notifications").insert(notifs);
    } catch (e) {
      console.warn("Notification insert skipped:", e);
    }

    // 5. Insert audit log
    try {
      await supabase.from("audit_logs").insert(
        targetIds.map((id) => ({
          action: `cadet_${status}`,
          entity_type: "profiles",
          entity_id: id,
          details: { status },
        }))
      );
    } catch (e) {
      console.warn("Audit log insert skipped:", e);
    }

    return NextResponse.json({
      ok: true,
      message: `Successfully marked ${targetIds.length} cadet(s) as ${status.toUpperCase()}.`,
      count: updatedProfiles?.length ?? 0,
      cadets: updatedProfiles ?? [],
    });
  } catch (error: any) {
    console.error("API cadet status update error:", error);
    return NextResponse.json({ ok: false, error: error?.message || "Internal server error." }, { status: 500 });
  }
}

