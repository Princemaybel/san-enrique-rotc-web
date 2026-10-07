"use client";

import { Eye, EyeOff, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { AppLaunchModal, useAppLauncher } from "@/components/app-launch-modal";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { modalOpen, openAppOrInstall, closeModal } = useAppLauncher();

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage("");

    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error || !data.user) {
        setMessage(error?.message || "Invalid email or password. Please try again.");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role,status")
        .eq("user_id", data.user.id)
        .single();

      router.push(profile?.role === "admin" ? "/admin" : "/cadet");
    } catch {
      setMessage("Login is currently unavailable. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Mobile App Quick Switcher Banner / Button */}
      <div className="mb-6 rounded-xl border border-gold/30 bg-gradient-to-r from-forest/5 via-field/10 to-forest/5 p-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-field text-gold">
            <Smartphone className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-charcoal truncate">Using a Mobile Phone?</p>
            <p className="text-2xs text-slate truncate">Open in Cadet App for QR check-in</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => openAppOrInstall("login")}
          className="btn-press shrink-0 rounded-lg bg-field px-3 py-1.5 text-2xs font-bold uppercase tracking-wider text-white hover:bg-forest shadow-sm transition-all"
        >
          Open App
        </button>
      </div>

      <form onSubmit={login} className="grid gap-5" noValidate>
        {/* Email */}
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-charcoal">Email address</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            required
            className="w-full rounded-md border border-field/20 bg-white px-3 py-3 text-sm text-charcoal placeholder:text-slate/60 focus:border-field focus:outline-none focus:ring-2 focus:ring-field/15"
          />
        </label>

        {/* Password */}
        <label className="grid gap-1.5">
          <span className="text-sm font-medium text-charcoal">Password</span>
          <span className="flex w-full overflow-hidden rounded-md border border-field/20 bg-white focus-within:border-field focus-within:ring-2 focus-within:ring-field/15">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              required
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-charcoal placeholder:text-slate/60 focus:outline-none"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="grid w-11 place-items-center text-slate/60 hover:text-charcoal transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </span>
        </label>

        {/* Error */}
        {message && (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {message}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="relative flex w-full items-center justify-center gap-2 rounded-md bg-field px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-forest hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <span
                className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                aria-hidden="true"
              />
              Signing in…
            </>
          ) : (
            "Login"
          )}
        </button>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link
            href="/forgot-password"
            className="font-medium text-slate hover:text-charcoal transition-colors"
          >
            Forgot password?
          </Link>
          <Link
            href="/register"
            className="font-medium text-field hover:text-forest transition-colors"
          >
            Register as cadet
          </Link>
        </div>
      </form>

      {/* App Install / Launch Modal */}
      <AppLaunchModal isOpen={modalOpen} onClose={closeModal} reason="login" />
    </>
  );
}
