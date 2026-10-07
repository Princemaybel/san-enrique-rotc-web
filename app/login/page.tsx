import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/login-form";
import { SiteShell } from "@/components/site-shell";

export default function LoginPage() {
  return (
    <SiteShell>
      <main className="mx-auto grid min-h-[calc(100vh-72px)] max-w-5xl items-center gap-8 px-4 py-14 lg:grid-cols-[1fr_1fr]">
        {/* Left — branding panel */}
        <div className="field-hero rounded-xl p-8 text-white lg:min-h-[480px] lg:flex lg:flex-col lg:justify-center">
          <div className="flex h-20 w-20 items-center justify-center md:h-24 md:w-24">
            <img src="/logo.png" alt="San Enrique ROTC" className="h-full w-full object-contain drop-shadow-lg" />
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-brass">
            Secure Access
          </p>
          <h1 className="mt-3 text-3xl font-bold leading-snug md:text-4xl">
            San Enrique ROTC
          </h1>
          <p className="mt-4 text-base leading-7 text-white/70">
            Administrators enter the management system. Approved cadets access the cadet
            web portal and services.
          </p>
          <ul className="mt-8 grid gap-3">
            {[
              "Cadet registration and profile management",
              "Admin dashboard and approval system",
              "Digital ID and QR attendance",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-white/75">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brass" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — form */}
        <div className="rounded-xl border border-field/10 bg-white p-7 shadow-card-hover">
          <h2 className="text-xl font-bold text-charcoal">Welcome back</h2>
          <p className="mt-1 text-sm text-slate">
            Sign in to your account to continue.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </main>
    </SiteShell>
  );
}
