"use client";

import { useCallback, useEffect, useState } from "react";
import { PortalShell } from "@/components/portal-shell";
import { Alert, EmptyState } from "@/components/ui";
import {
  Bell,
  CheckCircle,
  ClipboardList,
  Megaphone,
} from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";

/* ─── Types ─────────────────────────────────────────────────────── */
type NotificationType = "attendance" | "announcement" | "application" | "system";

interface Notification {
  id: string;
  user_id: string;
  type: NotificationType | string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
}

/* ─── Helpers ───────────────────────────────────────────────────── */
function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? "s" : ""} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
  const diffMo = Math.floor(diffDay / 30);
  if (diffMo < 12) return `${diffMo} month${diffMo !== 1 ? "s" : ""} ago`;
  return `${Math.floor(diffMo / 12)} year${Math.floor(diffMo / 12) !== 1 ? "s" : ""} ago`;
}

function NotificationIcon({ type }: { type: NotificationType | string }) {
  const base = "h-5 w-5";
  switch (type) {
    case "attendance":
      return <CheckCircle className={`${base} text-emerald-600`} aria-hidden />;
    case "announcement":
      return <Megaphone className={`${base} text-blue-600`} aria-hidden />;
    case "application":
      return <ClipboardList className={`${base} text-brass`} aria-hidden />;
    default:
      return <Bell className={`${base} text-slate`} aria-hidden />;
  }
}

/* ─── Skeleton ───────────────────────────────────────────────────── */
function NotificationSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-field/8">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 px-5 py-4">
          <div className="mt-0.5 h-9 w-9 shrink-0 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/5 rounded bg-gray-200" />
            <div className="h-3 w-4/5 rounded bg-gray-200" />
            <div className="h-3 w-1/4 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Notification Row ───────────────────────────────────────────── */
function NotificationRow({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: string) => Promise<void>;
}) {
  const [marking, setMarking] = useState(false);

  async function handleClick() {
    if (notification.read || marking) return;
    setMarking(true);
    await onMarkRead(notification.id);
    setMarking(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={marking}
      className={`w-full text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-field ${
        !notification.read
          ? "bg-mist/60 hover:bg-mist border-l-2 border-field/30"
          : "bg-white hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start gap-4 px-5 py-4">
        {/* Icon */}
        <span
          className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${
            notification.read ? "bg-gray-100" : "bg-white shadow-sm"
          }`}
        >
          <NotificationIcon type={notification.type} />
        </span>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p
              className={`truncate text-sm ${
                notification.read ? "font-medium text-charcoal/80" : "font-semibold text-charcoal"
              }`}
            >
              {notification.title}
            </p>
            <span className="shrink-0 text-2xs text-slate">
              {relativeTime(notification.created_at)}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate">
            {notification.body}
          </p>
        </div>

        {/* Unread dot */}
        {!notification.read && (
          <span
            className="mt-2 h-2 w-2 shrink-0 rounded-full bg-field"
            aria-label="Unread"
          />
        )}
      </div>
    </button>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function CadetNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [markingAll, setMarkingAll] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  /* ── Fetch ── */
  const fetchNotifications = useCallback(async () => {
    try {
      const supabase = createBrowserClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("You must be signed in to view notifications.");
        return;
      }

      setUserId(user.id);

      const { data: prof } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      const profileId = prof?.id;

      let query = supabase.from("notifications").select("*").order("created_at", { ascending: false });
      if (profileId) {
        query = query.or(`profile_id.eq.${profileId},user_id.eq.${user.id}`);
      } else {
        query = query.eq("user_id", user.id);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw new Error(fetchError.message);

      const mapped: Notification[] = (data ?? []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id || row.profile_id || user.id,
        type: row.notification_type || row.type || "system",
        title: row.title || "Notification",
        body: row.body || "",
        read: Boolean(row.is_read ?? row.read ?? false),
        created_at: row.created_at,
      }));

      setNotifications(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  /* ── Mark one as read ── */
  const handleMarkRead = useCallback(async (id: string) => {
    try {
      const supabase = createBrowserClient();
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true, read: true })
        .eq("id", id);

      if (updateError) throw new Error(updateError.message);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark as read.");
    }
  }, []);

  /* ── Mark all as read ── */
  const handleMarkAllRead = async () => {
    if (!userId || unreadCount === 0) return;
    setMarkingAll(true);
    try {
      const supabase = createBrowserClient();
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true, read: true })
        .eq("user_id", userId);

      if (updateError) throw new Error(updateError.message);

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark all as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  /* ── Render ── */
  return (
    <PortalShell
      type="cadet"
      title="Notifications"
      subtitle="Application, event, attendance, and system notifications."
      currentPath="/cadet/notifications"
    >
      <div className="space-y-4">
        {/* Error */}
        {error && <Alert variant="error">{error}</Alert>}

        {/* Header controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-charcoal">Inbox</h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-field px-2.5 py-0.5 text-xs font-semibold text-white">
                {unreadCount} unread
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              disabled={markingAll}
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 rounded-md border border-field/20 bg-white px-3.5 py-1.5 text-xs font-semibold text-charcoal shadow-sm transition-all hover:bg-mist active:scale-[0.97] disabled:opacity-50"
            >
              <CheckCircle className="h-3.5 w-3.5 text-field" aria-hidden />
              {markingAll ? "Marking…" : "Mark All as Read"}
            </button>
          )}
        </div>

        {/* Notification list */}
        <div className="overflow-hidden rounded-xl border border-field/10 bg-white shadow-card">
          {loading ? (
            <NotificationSkeleton />
          ) : notifications.length === 0 ? (
            <div className="py-4">
              <EmptyState
                icon={<Bell className="h-6 w-6" />}
                title="No Notifications Yet"
                body="You will receive notifications here for attendance, announcements, and application updates."
              />
            </div>
          ) : (
            <div className="divide-y divide-field/8">
              {notifications.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer legend */}
        {!loading && notifications.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 text-2xs text-slate">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
              Attendance
            </span>
            <span className="flex items-center gap-1.5">
              <Megaphone className="h-3.5 w-3.5 text-blue-600" />
              Announcement
            </span>
            <span className="flex items-center gap-1.5">
              <ClipboardList className="h-3.5 w-3.5 text-brass" />
              Application
            </span>
            <span className="flex items-center gap-1.5">
              <Bell className="h-3.5 w-3.5 text-slate" />
              System
            </span>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
