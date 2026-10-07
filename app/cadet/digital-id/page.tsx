"use client";

import { useEffect, useRef, useState } from "react";
import { QrCode, Shield, CheckCircle, Printer, Download, RefreshCw, Eye, AlertCircle } from "lucide-react";
import { PortalCard, PortalShell } from "@/components/portal-shell";
import { createBrowserClient } from "@/lib/supabase/client";

export default function CadetDigitalIdPage() {
  const [profile, setProfile] = useState<any>(null);
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [publicQrId, setPublicQrId] = useState<string>("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createBrowserClient();

    async function loadProfileAndQr() {
      setLoading(true);
      setError("");
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user) {
          setError("Please sign in to view your digital ID.");
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
          .select("public_qr_id,status")
          .eq("cadet_id", p.id)
          .eq("status", "active")
          .maybeSingle();

        let qid = qr?.public_qr_id;
        let repairedQrDataUrl = "";

        if (!qid) {
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
          repairedQrDataUrl = repairJson.qr.qrDataUrl ?? "";
        }

        setPublicQrId(qid);

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
          width: 280,
          margin: 1,
          errorCorrectionLevel: "H",
          color: {
            dark: "#0B2A1D",
            light: "#FFFFFF",
          },
        });
        setQrCodeData(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load your digital ID QR code.");
      } finally {
        setLoading(false);
      }
    }

    loadProfileAndQr();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCard = () => {
    if (!qrCodeData) return;
    const a = document.createElement("a");
    a.href = qrCodeData;
    a.download = `SE_ROTC_ID_QR_${profile?.student_id || "CARD"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <PortalShell
      type="cadet"
      title="Official Digital Military Cadet ID"
      subtitle="Official identification credential issued by San Enrique ROTC Unit. Click to flip between Front and Back."
      currentPath="/cadet/digital-id"
    >
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Physical ID Preview with Flip Card Functionality */}
        <div className="flex flex-col items-center justify-center">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer transition-transform duration-500 hover:scale-[1.01] w-full max-w-md"
            title="Click to flip card"
          >
            {!isFlipped ? (
              /* FRONT OF THE ID CARD */
              <div
                ref={cardRef}
                id="cadet-card-print"
                className="w-full overflow-hidden rounded-2xl border-2 border-brass/40 bg-gradient-to-br from-forest via-field to-dark p-6 text-white shadow-2xl relative"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/15 pb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded bg-brass text-dark shadow-md">
                      <Shield className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="text-xs font-black tracking-wider text-brass uppercase">
                        Armed Forces of the Philippines
                      </h2>
                      <p className="text-2xs font-semibold text-white/80">San Enrique ROTC Unit</p>
                    </div>
                  </div>
                  <span className="rounded bg-emerald-500/20 px-2.5 py-0.5 text-2xs font-bold text-emerald-300">
                    {profile?.status ? profile.status.toUpperCase() : "ACTIVE"}
                  </span>
                </div>

                {/* Body */}
                <div className="mt-5 grid grid-cols-[1fr_105px] gap-4 items-center">
                  <div>
                    <span className="text-2xs uppercase tracking-widest text-brass font-bold">Cadet Trainee</span>
                    <h3 className="text-lg font-extrabold text-white uppercase">
                      {profile ? `${profile.first_name} ${profile.last_name}` : "CADET TRAINEE"}
                    </h3>
                    <p className="font-mono text-xs text-white/70">ID: {profile?.student_id || "2024-XXXX"}</p>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-2xs">
                      <div>
                        <span className="text-white/50 block">Course / Year</span>
                        <strong className="text-white">{profile?.course || "Academic"} - {profile?.year_level || "1st Year"}</strong>
                      </div>
                      <div>
                        <span className="text-white/50 block">Assigned Unit</span>
                        <strong className="text-white">{profile?.section || "Alpha Platoon"}</strong>
                      </div>
                    </div>
                  </div>

                  {/* High-Resolution QR Code */}
                  <div className="flex flex-col items-center justify-center rounded-xl bg-white p-2 shadow-inner">
                    {loading ? (
                      <div className="h-20 w-20 flex items-center justify-center">
                        <RefreshCw className="h-5 w-5 animate-spin text-dark" />
                      </div>
                    ) : qrCodeData ? (
                      <img src={qrCodeData} alt="Cadet QR" className="h-20 w-20 object-contain" />
                    ) : (
                      <div className="grid h-20 w-20 place-items-center bg-mist text-center text-slate">
                        {error ? (
                          <AlertCircle className="h-8 w-8 text-red-500" aria-label={error} />
                        ) : (
                          <QrCode className="h-8 w-8" />
                        )}
                      </div>
                    )}
                    <span className="mt-1 font-mono text-3xs font-bold text-dark tracking-tighter">
                      SCAN VERIFIED
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-3 text-2xs text-white/50">
                  <span>Valid: SY 2026-2027</span>
                  <span className="font-mono text-brass truncate max-w-[170px]">{publicQrId}</span>
                </div>

                <div className="absolute bottom-2 right-4 text-3xs text-white/30 flex items-center gap-1">
                  <Eye className="h-2.5 w-2.5" /> Click to flip to back
                </div>
              </div>
            ) : (
              /* BACK OF THE ID CARD */
              <div
                className="w-full overflow-hidden rounded-2xl border-2 border-brass/40 bg-gradient-to-br from-charcoal via-dark to-forest p-6 text-white shadow-2xl relative"
              >
                <div className="border-b border-white/15 pb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brass">
                    Emergency Information & Directives
                  </h4>
                  <p className="text-3xs text-white/60">Property of San Enrique ROTC Unit</p>
                </div>

                <div className="mt-4 space-y-3 text-2xs text-white/80">
                  <div>
                    <span className="text-white/40 block">Emergency Contact Name</span>
                    <strong className="text-white">{profile?.emergency_contact_name || "Department Guardian / Adviser"}</strong>
                  </div>
                  <div>
                    <span className="text-white/40 block">Emergency Contact Phone</span>
                    <strong className="text-white">{profile?.emergency_contact_phone || "+63 (034) ROTC-HOTLINE"}</strong>
                  </div>
                  <div>
                    <span className="text-white/40 block">Command Post Contact</span>
                    <p className="text-white/70">rotc@sanenrique.edu.ph • Camp Operations</p>
                  </div>
                  <div className="rounded bg-white/5 p-2 border border-white/10 text-3xs text-white/70 leading-relaxed">
                    This identification card is issued to authorized cadets. Any alteration or unauthorized possession will be penalized under military and university regulations.
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-3 text-2xs text-white/50">
                  <span>Sign: COMMANDANT</span>
                  <span className="font-mono text-brass">AUTH: SEALED</span>
                </div>

                <div className="absolute bottom-2 right-4 text-3xs text-white/30 flex items-center gap-1">
                  <Eye className="h-2.5 w-2.5" /> Click to flip to front
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-field px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-forest active:scale-[0.98]"
            >
              <Printer className="h-4 w-4" />
              Print / Save as PDF
            </button>
            <button
              onClick={handleDownloadCard}
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-field/20 bg-white px-4 py-2.5 text-xs font-bold text-charcoal shadow-sm transition-all hover:bg-mist active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              Download QR Image
            </button>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              type="button"
              className="inline-flex items-center gap-2 rounded-md border border-brass/40 bg-white px-4 py-2.5 text-xs font-bold text-brass shadow-sm transition-all hover:bg-mist active:scale-[0.98]"
            >
              <RefreshCw className="h-4 w-4" />
              Flip Card ({isFlipped ? "Back" : "Front"})
            </button>
          </div>
        </div>

        {/* Informational Guidance */}
        <div className="space-y-4">
          <PortalCard
            title="Digital Card Validation & Usage"
            body="Your cadet ID is synchronized with your authenticated profile and live attendance records."
          >
            <div className="space-y-3 text-xs text-slate mt-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-field" />
                <span>Presentable anytime via the Cadet Android Mobile App or web portal during campus drill days.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-field" />
                <span>Officers scan the dynamic QR pattern with the Admin scanner to record formation presence.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-field" />
                <span>Click &quot;Print / Save as PDF&quot; to export an official high-resolution wallet-sized credential.</span>
              </div>
            </div>
          </PortalCard>
        </div>
      </div>
    </PortalShell>
  );
}
