"use client";

import { FormEvent, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${location.origin}/reset-password` });
      setMessage(error ? "Unable to send reset link." : "Password reset link sent if the email exists.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Reset is unavailable.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-lg border border-field/10 bg-white p-6 shadow-sm">
      <label className="grid gap-2 text-sm font-black text-field">
        Email
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" className="rounded-md border border-field/20 px-3 py-3 font-normal" required />
      </label>
      <button disabled={loading} className="rounded-md bg-field px-5 py-3 font-black text-white disabled:opacity-60">{loading ? "Sending..." : "Send Reset Link"}</button>
      {message ? <p className="rounded-md bg-mist p-3 text-sm font-bold text-field">{message}</p> : null}
    </form>
  );
}

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password.length < 6 || password !== confirm) {
      setMessage("Use matching passwords with at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.updateUser({ password });
      setMessage(error ? "Unable to update password." : "Password updated. You can login now.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Password update is unavailable.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-lg border border-field/10 bg-white p-6 shadow-sm">
      <label className="grid gap-2 text-sm font-black text-field">
        New Password
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" className="rounded-md border border-field/20 px-3 py-3 font-normal" required />
      </label>
      <label className="grid gap-2 text-sm font-black text-field">
        Confirm Password
        <input value={confirm} onChange={(event) => setConfirm(event.target.value)} type="password" className="rounded-md border border-field/20 px-3 py-3 font-normal" required />
      </label>
      <button disabled={loading} className="rounded-md bg-field px-5 py-3 font-black text-white disabled:opacity-60">{loading ? "Updating..." : "Update Password"}</button>
      {message ? <p className="rounded-md bg-mist p-3 text-sm font-bold text-field">{message}</p> : null}
    </form>
  );
}
