"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { ShieldAlert, Loader2 } from "lucide-react";

export function AdminLogin() {
  const supabase = createBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist p-4">
      <div className="w-full max-w-md rounded-2xl border border-field/20 bg-white p-8 shadow-xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 h-24 w-24 rounded-full border-4 border-gold/40 bg-white p-1">
            <img src="/logo.png" alt="ROTC Logo" className="h-full w-full object-contain rounded-full" />
          </div>
          <h1 className="text-2xl font-black text-forest-deep">San Enrique ROTC — Command Access</h1>
          <p className="mt-2 text-sm font-bold text-slate flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" /> Authorized administrators only
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-field/20 px-4 py-3 text-sm font-bold text-charcoal outline-none transition-all focus:border-field focus:ring-2 focus:ring-field/15"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-field/20 px-4 py-3 text-sm font-bold text-charcoal outline-none transition-all focus:border-field focus:ring-2 focus:ring-field/15"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-center text-xs font-bold text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-forest-deep px-4 py-3 text-sm font-bold uppercase tracking-wider text-gold shadow-md transition-all hover:bg-forest hover:shadow-lg disabled:opacity-70 active:scale-95"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Admin Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
