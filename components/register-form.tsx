"use client";

import { useActionState, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Check, X, ShieldCheck, Printer, Download, QrCode, ArrowRight, Shield, AlertCircle } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { registerCadet, type RegistrationState } from "@/app/register/actions";

const initialState: RegistrationState = { ok: false, message: "" };

const inputClass =
  "w-full rounded-md border border-field/20 bg-white px-3 py-2.5 text-sm text-charcoal placeholder:text-slate/50 focus:border-field focus:outline-none focus:ring-2 focus:ring-field/15 transition-colors";

export function RegisterForm() {
  const [state, formAction] = useActionState(registerCadet, initialState);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [modalDismissed, setModalDismissed] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);

  // Real-time strength checks
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isMatch = password.length > 0 && password === confirmPassword;

  const showModal = state.ok && Boolean(state.cadetData) && !modalDismissed;

  // Trigger celebratory confetti on success
  useEffect(() => {
    if (showModal) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#1F5D3A", "#B88A32", "#123C2A", "#10B981"],
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [showModal]);

  const handlePrintId = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    if (!state.cadetData?.qrDataUrl) return;
    const link = document.createElement("a");
    link.href = state.cadetData.qrDataUrl;
    link.download = `SE_ROTC_QR_${state.cadetData.studentId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <form action={formAction} className="mt-8 grid gap-8" noValidate>
        {/* 1. Personal Information */}
        <fieldset className="rounded-lg border border-field/10 bg-white p-5 shadow-card">
          <legend className="px-2 text-sm font-semibold text-charcoal">Personal Information</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-charcoal">First Name *</span>
              <input name="firstName" type="text" placeholder="Juan" required className={inputClass} />
              {state.fieldErrors?.firstName && <p className="text-xs text-red-600">{state.fieldErrors.firstName}</p>}
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-charcoal">
                Middle Name <span className="ml-1 text-xs text-slate">(optional)</span>
              </span>
              <input name="middleName" type="text" placeholder="Santos" className={inputClass} />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-charcoal">Last Name *</span>
              <input name="lastName" type="text" placeholder="dela Cruz" required className={inputClass} />
              {state.fieldErrors?.lastName && <p className="text-xs text-red-600">{state.fieldErrors.lastName}</p>}
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-charcoal">Date of Birth *</span>
              <input name="dateOfBirth" type="date" required className={inputClass} />
              {state.fieldErrors?.dateOfBirth && <p className="text-xs text-red-600">{state.fieldErrors.dateOfBirth}</p>}
            </label>
          </div>
        </fieldset>

        {/* 2. Academic Information */}
        <fieldset className="rounded-lg border border-field/10 bg-white p-5 shadow-card">
          <legend className="px-2 text-sm font-semibold text-charcoal">Academic & Unit Assignment</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-charcoal">Cadet ID / Student ID *</span>
              <input name="studentId" type="text" placeholder="2024-00001" required className={inputClass} />
              {state.fieldErrors?.studentId && <p className="text-xs text-red-600">{state.fieldErrors.studentId}</p>}
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-charcoal">Course / Program *</span>
              <input name="course" type="text" placeholder="BS Criminology" required className={inputClass} />
              {state.fieldErrors?.course && <p className="text-xs text-red-600">{state.fieldErrors.course}</p>}
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-charcoal">Year Level *</span>
              <select name="yearLevel" required className={inputClass}>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-charcoal">Section *</span>
              <input name="section" type="text" placeholder="Section A" required className={inputClass} />
              {state.fieldErrors?.section && <p className="text-xs text-red-600">{state.fieldErrors.section}</p>}
            </label>
            <label className="grid gap-1.5 sm:col-span-2">
              <span className="text-sm font-medium text-charcoal">Platoon / Company Assignment</span>
              <select name="platoon" className={inputClass}>
                <option value="Alpha Company - 1st Platoon">Alpha Company - 1st Platoon</option>
                <option value="Alpha Company - 2nd Platoon">Alpha Company - 2nd Platoon</option>
                <option value="Bravo Company - 1st Platoon">Bravo Company - 1st Platoon</option>
                <option value="Bravo Company - 2nd Platoon">Bravo Company - 2nd Platoon</option>
                <option value="Headquarters & Service Battalion">Headquarters & Service Battalion</option>
              </select>
            </label>
          </div>
        </fieldset>

        {/* 3. Contact & Emergency Details */}
        <fieldset className="rounded-lg border border-field/10 bg-white p-5 shadow-card">
          <legend className="px-2 text-sm font-semibold text-charcoal">Contact & Emergency Details</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-charcoal">Email Address *</span>
              <input name="email" type="email" placeholder="you@university.edu" required className={inputClass} />
              {state.fieldErrors?.email && <p className="text-xs text-red-600">{state.fieldErrors.email}</p>}
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-charcoal">Contact Number *</span>
              <input name="phone" type="tel" placeholder="+63 9XX XXX XXXX" required className={inputClass} />
              {state.fieldErrors?.phone && <p className="text-xs text-red-600">{state.fieldErrors.phone}</p>}
            </label>
            <label className="grid gap-1.5 sm:col-span-2">
              <span className="text-sm font-medium text-charcoal">Home Address *</span>
              <input name="address" type="text" placeholder="Barangay, Municipality, Province" required className={inputClass} />
              {state.fieldErrors?.address && <p className="text-xs text-red-600">{state.fieldErrors.address}</p>}
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-charcoal">Emergency Contact Name (optional)</span>
              <input name="emergencyContactName" type="text" placeholder="Guardian Full Name" className={inputClass} />
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-charcoal">Emergency Contact Phone (optional)</span>
              <input name="emergencyContactPhone" type="tel" placeholder="+63 9XX XXX XXXX" className={inputClass} />
            </label>
          </div>
        </fieldset>

        {/* 4. Account Security */}
        <fieldset className="rounded-lg border border-field/10 bg-white p-5 shadow-card">
          <legend className="px-2 text-sm font-semibold text-charcoal">Account Security</legend>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-charcoal">Password *</span>
              <input
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                className={inputClass}
              />
              {state.fieldErrors?.password && <p className="text-xs text-red-600">{state.fieldErrors.password}</p>}
            </label>
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-charcoal">Confirm Password *</span>
              <input
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                required
                className={inputClass}
              />
              {state.fieldErrors?.confirmPassword && <p className="text-xs text-red-600">{state.fieldErrors.confirmPassword}</p>}
            </label>
          </div>

          <div className="mt-4 rounded-lg bg-mist/60 p-3.5">
            <p className="text-xs font-semibold text-charcoal">Password Requirements:</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className={`flex items-center gap-1.5 ${hasLength ? "text-emerald-700 font-medium" : "text-slate"}`}>
                {hasLength ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <X className="h-3.5 w-3.5 text-slate/50" />}
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasUpper ? "text-emerald-700 font-medium" : "text-slate"}`}>
                {hasUpper ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <X className="h-3.5 w-3.5 text-slate/50" />}
                <span>At least 1 uppercase letter</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-700 font-medium" : "text-slate"}`}>
                {hasNumber ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <X className="h-3.5 w-3.5 text-slate/50" />}
                <span>At least 1 number</span>
              </div>
              <div className={`flex items-center gap-1.5 ${isMatch ? "text-emerald-700 font-medium" : "text-slate"}`}>
                {isMatch ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <X className="h-3.5 w-3.5 text-slate/50" />}
                <span>Passwords match</span>
              </div>
            </div>
          </div>
        </fieldset>

        {/* 5. Profile picture & Terms */}
        <fieldset className="rounded-lg border border-field/10 bg-white p-5 shadow-card">
          <legend className="px-2 text-sm font-semibold text-charcoal">Profile Photo & Agreement</legend>
          <div className="mt-4 space-y-4">
            <label className="grid gap-1.5">
              <span className="text-sm font-medium text-charcoal">
                Photo <span className="ml-1 text-xs text-slate">(optional)</span>
              </span>
              <input
                name="profilePicture"
                type="file"
                accept="image/*"
                className="w-full rounded-md border border-field/20 bg-white px-3 py-2.5 text-sm text-charcoal file:mr-4 file:rounded-sm file:border-0 file:bg-mist file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-field hover:file:bg-field/10"
              />
              <p className="text-xs text-slate">Accepted formats: JPG, PNG, WEBP (max 2 MB)</p>
            </label>

            <div className="pt-2 border-t border-field/10">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  name="termsAccepted"
                  type="checkbox"
                  checked={termsChecked}
                  onChange={(e) => setTermsChecked(e.target.checked)}
                  required
                  className="mt-1 h-4 w-4 rounded border-field/20 text-field focus:ring-field"
                />
                <span className="text-xs text-slate">
                  I certify that all information provided is true and correct. I accept the{" "}
                  <Link href="/terms" className="text-field underline font-semibold">Terms of Service</Link> and{" "}
                  <Link href="/privacy" className="text-field underline font-semibold">Privacy Policy</Link> of the San Enrique ROTC Unit.
                </span>
              </label>
              {state.fieldErrors?.terms && <p className="mt-1 text-xs text-red-600">{state.fieldErrors.terms}</p>}
            </div>
          </div>
        </fieldset>

        {/* Global status alert */}
        {state.message && (
          <div
            role="alert"
            className={`rounded-md border p-4 text-sm font-medium flex items-center gap-2.5 ${
              state.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {state.ok ? <Check className="h-5 w-5 shrink-0 text-emerald-600" /> : <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />}
            <span>{state.message}</span>
          </div>
        )}

        <SubmitButton disabled={!hasLength || !isMatch || !termsChecked} />
      </form>

      {/* POPUP: Registration Successful + Generated Digital ID & QR Code */}
      {showModal && state.cadetData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/80 p-4 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-brass/40 bg-white p-6 shadow-2xl animate-fade-up">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-md">
                <Check className="h-8 w-8 stroke-[2.5]" />
              </div>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-charcoal">Registration Successful!</h3>
              <p className="mt-1 text-xs text-slate max-w-sm mx-auto">
                Your account has been created successfully. Your personal QR code has also been generated.
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1 text-2xs font-semibold text-field">
                <ShieldCheck className="h-3.5 w-3.5 text-brass" />
                Present this QR code to the authorized Admin during attendance checking.
              </div>
            </div>

            {/* Generated Military Digital ID Card */}
            <div
              id="cadet-popup-card"
              className="mt-5 overflow-hidden rounded-xl border-2 border-brass/40 bg-gradient-to-br from-forest via-field to-dark p-5 text-white shadow-xl"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded bg-brass text-dark">
                    <Shield className="h-4 w-4" />
                  </span>
                  <div>
                    <h4 className="text-2xs font-black tracking-wider text-brass uppercase">
                      Armed Forces of the Philippines
                    </h4>
                    <p className="text-3xs font-semibold text-white/80">San Enrique ROTC Unit</p>
                  </div>
                </div>
                <span className="rounded bg-amber-400/20 px-2 py-0.5 text-3xs font-bold text-amber-300">
                  {state.cadetData.accountStatus}
                </span>
              </div>

              {/* Card Body */}
              <div className="mt-4 grid grid-cols-[1fr_96px] gap-3 items-center">
                <div>
                  <span className="text-3xs uppercase tracking-widest text-brass font-bold">Cadet Enrollee</span>
                  <h5 className="text-base font-extrabold text-white leading-tight uppercase">
                    {state.cadetData.fullName}
                  </h5>
                  <p className="font-mono text-2xs text-white/70 mt-0.5">ID: {state.cadetData.studentId}</p>

                  <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-3xs">
                    <div>
                      <span className="text-white/50 block">Course / Year</span>
                      <strong className="text-white">{state.cadetData.course} ({state.cadetData.yearLevel})</strong>
                    </div>
                    <div>
                      <span className="text-white/50 block">Unit Section</span>
                      <strong className="text-white">{state.cadetData.section}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-white/50 block">Assigned Platoon</span>
                      <strong className="text-white truncate block">{state.cadetData.platoon}</strong>
                    </div>
                  </div>
                </div>

                {/* High-Resolution Dynamic Personal QR Code */}
                <div className="flex flex-col items-center justify-center rounded-lg bg-white p-1.5 shadow-md">
                  {state.cadetData.qrDataUrl ? (
                    <img
                      src={state.cadetData.qrDataUrl}
                      alt="Cadet Personal Attendance QR"
                      className="h-20 w-20 object-contain"
                    />
                  ) : (
                    <div className="grid h-20 w-20 place-items-center bg-mist text-slate">
                      <QrCode className="h-8 w-8" />
                    </div>
                  )}
                  <span className="font-mono text-3xs font-bold text-dark mt-0.5">
                    SCAN VERIFIED
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-2.5 text-3xs text-white/50">
                <span>Valid: SY 2026-2027</span>
                <span className="font-mono text-brass truncate max-w-[170px]">{state.cadetData.publicQrId}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadQr}
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md border border-field/20 bg-white px-3 py-2 text-xs font-bold text-charcoal shadow-xs hover:bg-mist transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-field" />
                  Download QR
                </button>
                <button
                  onClick={handlePrintId}
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-md border border-field/20 bg-white px-3 py-2 text-xs font-bold text-charcoal shadow-xs hover:bg-mist transition-colors"
                >
                  <Printer className="h-3.5 w-3.5 text-field" />
                  Print ID
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setModalDismissed(true)}
                  type="button"
                  className="rounded-md border border-field/20 px-3.5 py-2 text-xs font-semibold text-slate hover:bg-mist transition-colors"
                >
                  Dismiss
                </button>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-md bg-field px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-forest transition-colors"
                >
                  Go to Login
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-field px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-forest hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
            aria-hidden="true"
          />
          Creating your personal QR code...
        </>
      ) : (
        "Complete Registration & Generate QR"
      )}
    </button>
  );
}
