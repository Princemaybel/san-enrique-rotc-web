"use client";

import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Radio,
  Search,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Zap,
  Volume2,
  VolumeX,
} from "lucide-react";
import { PortalCard, PortalShell } from "@/components/portal-shell";
import { createBrowserClient } from "@/lib/supabase/client";

type ScanResult = {
  fullName: string;
  studentId: string;
  course: string;
  yearLevel: string;
  section: string;
  timeIn: string;
  status: string;
  sessionTitle: string;
};

export default function AdminQrScannerPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("Scanner standby. Select session and start camera.");
  const [isProcessing, setIsProcessing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Scan feedback states
  const [lastScanned, setLastScanned] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);

  // Manual fallback state
  const [manualQuery, setManualQuery] = useState("");
  const [manualReason, setManualReason] = useState("QR code damaged");
  const [manualSubmitting, setManualSubmitting] = useState(false);

  const scannerRef = useRef<any>(null);
  const html5QrCodeId = "admin-qr-reader-container";

  // Play beep sound on scan
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880; // A5 note
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch {
      // Audio context unsupported
    }
  };

  // Load sessions from Supabase
  useEffect(() => {
    const supabase = createBrowserClient();
    async function fetchSessions() {
      const { data } = await supabase
        .from("attendance_sessions")
        .select("id, title, session_date, is_open, status")
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        setSessions(data);
        const activeOne = data.find((s: any) => s.is_open) || data[0];
        setSelectedSessionId(activeOne.id);
      }
    }
    fetchSessions();
  }, []);

  // Process scanned code
  const handleScanSuccess = async (decodedText: string) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setStatusMessage("Verifying cadet credentials in Supabase...");
    setScanError(null);

    try {
      const supabase = createBrowserClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        setScanError("Admin session expired. Please log in again.");
        setStatusMessage("Unauthorized.");
        setIsProcessing(false);
        return;
      }

      const res = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          qrPayload: decodedText,
          sessionId: selectedSessionId,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setScanError(json.error || "Attendance scan failed.");
        setStatusMessage("Scan rejected.");
      } else {
        playBeep();
        const cadet: ScanResult = json.cadet;
        setLastScanned(cadet);
        setRecentScans((prev) => [cadet, ...prev.slice(0, 9)]);
        setStatusMessage(`Attendance Recorded: ${cadet.fullName} marked PRESENT`);
      }
    } catch (err: any) {
      setScanError("Network communication failure. Verify server connection.");
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 1500);
    }
  };

  // Start HTML5 camera scanner
  const startCamera = async () => {
    setCameraError(null);
    setScanError(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(html5QrCodeId);
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        },
        (decodedText: string) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // Ignore transient frame decode failures
        }
      );

      setScannerActive(true);
      setStatusMessage("Camera ready. Align cadet personal QR code within viewfinder.");
    } catch (err: any) {
      setCameraError(err?.message || "Failed to initialize camera. Ensure permission is granted in browser.");
      setScannerActive(false);
    }
  };

  // Stop camera scanner
  const stopCamera = async () => {
    if (scannerRef.current && scannerActive) {
      try {
        await scannerRef.current.stop();
        setScannerActive(false);
        setStatusMessage("Scanner paused.");
      } catch (err) {
        // cleanup
      }
    }
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerActive) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [scannerActive]);

  // Manual fallback attendance submission
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;
    setManualSubmitting(true);
    setScanError(null);

    try {
      const supabase = createBrowserClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        setScanError("Admin session expired. Please log in again.");
        setManualSubmitting(false);
        return;
      }

      const res = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          manualStudentId: manualQuery.trim(),
          manualReason,
          sessionId: selectedSessionId,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setScanError(json.error || "Manual attendance recording failed.");
      } else {
        playBeep();
        const cadet: ScanResult = json.cadet;
        setLastScanned(cadet);
        setRecentScans((prev) => [cadet, ...prev.slice(0, 9)]);
        setManualQuery("");
        setStatusMessage(`Manual verification recorded: ${cadet.fullName} marked PRESENT`);
      }
    } catch (err: any) {
      setScanError("Failed to submit manual record. Verify network connection.");
    } finally {
      setManualSubmitting(false);
    }
  };

  return (
    <PortalShell
      type="admin"
      title="Official Admin QR Attendance Scanner"
      subtitle="Strictly restricted to authorized ROTC Administrators. Scan cadet personal QR codes to verify and mark drill attendance."
      currentPath="/admin/qr-scanner"
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Left: Camera Viewfinder & Scanner Controls */}
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-brass/40 bg-charcoal p-6 text-white shadow-xl">
            {/* Session selection toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Radio className={`h-4 w-4 ${scannerActive ? "animate-pulse text-emerald-400" : "text-slate"}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-brass">Target Drill Session:</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="rounded-md border border-white/15 bg-white/10 p-1.5 text-xs text-white hover:bg-white/20 transition-colors"
                  title="Toggle Audio Feedback"
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4 text-brass" /> : <VolumeX className="h-4 w-4 text-slate" />}
                </button>
                <select
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="rounded-md border border-white/20 bg-dark px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-brass"
                >
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} ({s.session_date}) {s.is_open ? "— [ACTIVE]" : "— [CLOSED]"}
                    </option>
                  ))}
                  {sessions.length === 0 && <option value="">No Active Sessions Found</option>}
                </select>
              </div>
            </div>

            {/* Viewfinder Frame */}
            <div className="relative my-6 flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-xl bg-dark/90 border border-white/10">
              <div id={html5QrCodeId} className="w-full max-w-sm overflow-hidden rounded-lg" />

              {/* Viewfinder overlay when scanning */}
              {scannerActive && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="relative h-64 w-64 rounded-xl border-2 border-brass/70 shadow-2xl">
                    <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-brass to-transparent animate-radar-sweep opacity-90 shadow-[0_0_12px_#B88A32]" />
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-3xs font-black tracking-widest text-brass uppercase">
                      Position Cadet QR Inside
                    </span>
                  </div>
                </div>
              )}

              {/* Standby screen when camera stopped */}
              {!scannerActive && (
                <div className="p-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-field/40 text-brass">
                    <Camera className="h-7 w-7" />
                  </div>
                  <h3 className="mt-3 text-base font-bold text-white">Camera Standby</h3>
                  <p className="mt-1 text-xs text-white/60 max-w-xs mx-auto">
                    Click &quot;Start Admin Scanner&quot; to initialize your camera and begin verifying cadet credentials.
                  </p>
                </div>
              )}
            </div>

            {/* Scanner Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <div className="flex items-center gap-2 text-xs">
                {isProcessing ? (
                  <span className="inline-flex items-center gap-1.5 text-amber-300 font-semibold">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Verifying Cadet...
                  </span>
                ) : (
                  <span className="text-white/80 font-medium">{statusMessage}</span>
                )}
              </div>

              <div className="flex gap-2">
                {!scannerActive ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="inline-flex items-center gap-2 rounded-md bg-field px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-forest active:scale-[0.98] transition-all"
                  >
                    <Zap className="h-3.5 w-3.5 text-brass" />
                    Start Admin Scanner
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="inline-flex items-center gap-2 rounded-md bg-red-800 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-[0.98] transition-all"
                  >
                    Stop Scanner
                  </button>
                )}
              </div>
            </div>

            {/* Camera error notification */}
            {cameraError && (
              <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 flex items-center gap-2">
                <XCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>

          {/* Manual Attendance Fallback Panel */}
          <div className="rounded-xl border border-field/15 bg-white p-5 shadow-card">
            <div className="flex items-center gap-2 border-b border-field/10 pb-3">
              <Search className="h-4 w-4 text-field" />
              <h3 className="text-sm font-bold text-charcoal">Manual Attendance Fallback</h3>
            </div>
            <p className="mt-1 text-xs text-slate">
              If a cadet&apos;s phone is out of battery, screen broken, or QR damaged, enter their Cadet ID manually:
            </p>
            <form onSubmit={handleManualSubmit} className="mt-3 grid gap-3 sm:grid-cols-[1fr_160px_auto]">
              <input
                type="text"
                placeholder="Enter Cadet ID (e.g. 2024-0001) or Email"
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                className="rounded-md border border-field/20 px-3 py-2 text-xs text-charcoal focus:border-field focus:outline-none focus:ring-1 focus:ring-field"
              />
              <select
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
                className="rounded-md border border-field/20 px-3 py-2 text-xs text-charcoal focus:border-field focus:outline-none"
              >
                <option value="QR code damaged">QR code damaged</option>
                <option value="Camera problem">Camera problem</option>
                <option value="Phone unavailable">Phone unavailable</option>
                <option value="Network issue">Network issue</option>
                <option value="Authorized manual verification">Authorized verification</option>
              </select>
              <button
                type="submit"
                disabled={manualSubmitting || !manualQuery.trim()}
                className="inline-flex items-center justify-center rounded-md bg-field px-4 py-2 text-xs font-bold text-white hover:bg-forest disabled:opacity-50"
              >
                {manualSubmitting ? "Recording..." : "Record Manual"}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Verification Status & Recent Scan Activity Feed */}
        <div className="space-y-6">
          {/* Active / Most Recent Scanned Cadet Card */}
          <div className="rounded-xl border border-field/20 bg-white p-5 shadow-card">
            <h3 className="text-xs font-black uppercase tracking-wider text-brass">Last Scanned Cadet</h3>

            {lastScanned ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 animate-fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded bg-emerald-700 px-2 py-0.5 text-3xs font-black text-white uppercase">
                      {lastScanned.status}
                    </span>
                    <h4 className="mt-1.5 text-base font-extrabold text-charcoal">{lastScanned.fullName}</h4>
                    <p className="font-mono text-xs text-slate">ID: {lastScanned.studentId}</p>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-emerald-200/60 pt-3 text-xs">
                  <div>
                    <span className="text-slate block text-3xs">Course / Year</span>
                    <strong className="text-charcoal">{lastScanned.course} - {lastScanned.yearLevel}</strong>
                  </div>
                  <div>
                    <span className="text-slate block text-3xs">Section</span>
                    <strong className="text-charcoal">{lastScanned.section}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate block text-3xs">Recorded Time</span>
                    <strong className="text-emerald-800 font-mono">{lastScanned.timeIn}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-field/20 p-6 text-center text-xs text-slate">
                No cadets scanned in this current active session.
              </div>
            )}

            {/* Error or Duplicate Scan Alert */}
            {scanError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 flex items-start gap-2.5 animate-shake">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <div>
                  <strong className="font-bold block">Scan Notice:</strong>
                  <span>{scanError}</span>
                </div>
              </div>
            )}
          </div>

          {/* Live Session Feed / Recent Scans List */}
          <div className="rounded-xl border border-field/20 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between border-b border-field/10 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-charcoal">Session Scan Ledger</h3>
              <span className="rounded-full bg-field/10 px-2 py-0.5 text-3xs font-bold text-field">
                {recentScans.length} Scanned
              </span>
            </div>

            <div className="mt-3 space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {recentScans.map((item, idx) => (
                <div
                  key={`${item.studentId}-${idx}`}
                  className="flex items-center justify-between rounded-lg border border-field/10 bg-mist/40 p-2.5 text-xs"
                >
                  <div>
                    <p className="font-bold text-charcoal">{item.fullName}</p>
                    <p className="text-3xs text-slate font-mono">{item.studentId} • {item.section}</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-3xs font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      {item.timeIn}
                    </span>
                  </div>
                </div>
              ))}

              {recentScans.length === 0 && (
                <p className="py-4 text-center text-xs text-slate">Ready for incoming check-ins.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
