"use client";

import { useEffect, useState } from "react";
import { Download, Printer, ShieldCheck, Copy, Check, AlertCircle, RefreshCw } from "lucide-react";
import { PortalCard, PortalShell } from "@/components/portal-shell";
import { createBrowserClient } from "@/lib/supabase/client";

export default function CadetMyQrPage() {
  const [profile, setProfile] = useState<any>(null);
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [publicQrId, setPublicQrId] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const supabase = createBrowserClient();

    async function loadCadetQr() {
      setLoading(true);
      setError("");
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          setError("Please sign in to view your personal QR code.");
          return;
        }

        const { data: p, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userData.user.id)
          .single();

        if (profileError || !p) {
          setError(profileError?.message ?? "Your cadet profile was not found.");
          return;
        }

        setProfile(p);

        const { data: qr } = await supabase
          .from("qr_codes")
          .select("public_qr_id, status, created_at")
          .eq("cadet_id", p.id)
          .maybeSingle();

        let qid = qr?.public_qr_id;
        let issuedAt = qr?.created_at;
        let repairedQrDataUrl = "";

        if (!qid || qr?.status !== "active") {
          const { data: sessionData } = await supabase.auth.getSession();
          const accessToken = sessionData.session?.access_token;
          if (!accessToken) {
            setError("Your login session expired. Please sign in again to generate your QR code.");
            return;
          }

          const repairResponse = await fetch("/api/cadet/ensure-qr", {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          const repairText = await repairResponse.text();
          const repairJson = repairText ? JSON.parse(repairText) : {};
          if (!repairResponse.ok || !repairJson.qr?.publicQrId) {
            setError(repairJson.message ?? "Unable to generate your QR code. Ask an admin to check the QR database migration.");
            return;
          }

          qid = repairJson.qr.publicQrId;
          issuedAt = repairJson.qr.createdAt;
          repairedQrDataUrl = repairJson.qr.qrDataUrl ?? "";
        }

        setPublicQrId(qid);
        setCreatedAt(issuedAt ? new Date(issuedAt).toLocaleDateString() : new Date().toLocaleDateString());

        if (repairedQrDataUrl) {
          setQrCodeData(repairedQrDataUrl);
          return;
        }

        const QRCode = (await import("qrcode")).default;
        const payload = JSON.stringify({
          org: "SAN_ENRIQUE_ROTC",
          v: 1,
          qid,
        });
        const url = await QRCode.toDataURL(payload, {
          width: 320,
          margin: 2,
          errorCorrectionLevel: "H",
          color: {
            dark: "#0B2A1D",
            light: "#FFFFFF",
          },
        });
        setQrCodeData(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load your QR code.");
      } finally {
        setLoading(false);
      }
    }

    loadCadetQr();
  }, []);

  const handleDownloadQr = () => {
    if (!qrCodeData) return;
    const a = document.createElement("a");
    a.href = qrCodeData;
    a.download = `SE_ROTC_QR_${profile?.student_id || "CADET"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyId = () => {
    if (!publicQrId) return;
    navigator.clipboard.writeText(publicQrId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PortalShell
      type="cadet"
      title="My Attendance QR Code"
      subtitle="Your official personal ROTC QR credential. Present this exclusively to the authorized Admin during assembly roll-calls."
      currentPath="/cadet/my-qr"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        {/* Left: Scannable QR Code Card */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-sm rounded-2xl border-2 border-brass/40 bg-white p-6 shadow-xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-2xs font-bold text-emerald-800 uppercase">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Official Active QR Pass
            </div>

            {/* High-Resolution QR Code Container */}
            <div className="my-5 flex flex-col items-center justify-center rounded-xl bg-mist/60 p-4 border border-field/15 shadow-inner">
              {loading ? (
                <div className="h-56 w-56 flex items-center justify-center text-slate">
                  <RefreshCw className="h-6 w-6 animate-spin text-field" />
                </div>
              ) : qrCodeData ? (
                <img
                  src={qrCodeData}
                  alt="My Official Attendance QR"
                  className="h-56 w-56 object-contain rounded-lg shadow-sm"
                />
              ) : (
                <div className="h-56 w-56 flex flex-col items-center justify-center gap-3 bg-mist p-4 text-center text-slate">
                  <AlertCircle className="h-10 w-10 text-red-500" />
                  <p className="text-xs font-semibold text-red-700">
                    {error || "No active QR code is available yet."}
                  </p>
                </div>
              )}
              {publicQrId ? (
                <span className="mt-3 font-mono text-xs font-bold text-charcoal tracking-wide">
                  {publicQrId}
                </span>
              ) : null}
            </div>

            {/* Cadet Summary */}
            <h3 className="text-lg font-extrabold text-charcoal uppercase">
              {profile ? `${profile.first_name} ${profile.last_name}` : "Cadet Trainee"}
            </h3>
            <p className="text-xs text-slate font-mono">
              Student ID: {profile?.student_id || "Not available"}
            </p>
            <p className="text-2xs text-slate mt-1">
              {createdAt ? <>Issued: {createdAt} • Status: <strong className="text-emerald-700">ACTIVE</strong></> : "No active QR issued yet"}
            </p>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              <button
                onClick={handleDownloadQr}
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md bg-field px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-forest active:scale-[0.98] transition-all"
              >
                <Download className="h-3.5 w-3.5 text-brass" />
                Download PNG
              </button>
              <button
                onClick={() => window.print()}
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md border border-field/20 bg-white px-3 py-2 text-xs font-bold text-charcoal shadow-sm hover:bg-mist transition-all"
              >
                <Printer className="h-3.5 w-3.5 text-field" />
                Print QR
              </button>
              <button
                onClick={handleCopyId}
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md border border-field/20 bg-white px-3 py-2 text-xs font-bold text-charcoal shadow-sm hover:bg-mist transition-all"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy Token"}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Operational Directives & Security Policy */}
        <div className="space-y-4">
          <PortalCard
            title="Attendance Protocol & Instructions"
            body="Follow these official unit guidelines during Saturday drill formations and ceremonial assemblies:"
          >
            <div className="space-y-3 text-xs text-slate mt-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-field mt-0.5" />
                <span>
                  <strong>Admin-Only Verification:</strong> Cadets present their personal QR code directly on their phone screen or as a printed badge. Only the designated Company Admin possesses the authorized QR scanner.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-field mt-0.5" />
                <span>
                  <strong>Anti-Proxy Protection:</strong> Each QR contains high-entropy cryptographic signatures tied strictly to your registered profile. Duplicate check-ins are blocked by database constraints.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 shrink-0 text-field mt-0.5" />
                <span>
                  <strong>Immediate Feedback:</strong> When an Admin scans your code, you will receive an in-app notification confirming your check-in time and status.
                </span>
              </div>
            </div>
          </PortalCard>

          <PortalCard
            title="Report QR Damage or Request Re-issuance"
            body="If your QR code is compromised, corrupted, or not scanning properly during formation:"
          >
            <p className="text-xs text-slate mt-2">
              Inform your Platoon Leader or visit the ROTC Command Post for identity verification. Administrators can regenerate a fresh cryptographic key directly from the Admin Cadets console.
            </p>
          </PortalCard>
        </div>
      </div>
    </PortalShell>
  );
}
