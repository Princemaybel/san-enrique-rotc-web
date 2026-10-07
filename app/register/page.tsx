import { ShieldCheck } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { RegisterForm } from "@/components/register-form";
import { PageHero } from "@/components/ui";

export default function RegisterPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Online Enlistment"
        title="Cadet Application & Registration"
        body="Submit your personal and academic credentials to register with the San Enrique ROTC Unit. Accounts are authenticated with Supabase and reviewed by unit administrators."
      >
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-white/80">
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
            <ShieldCheck className="h-4 w-4 text-brass" /> Official Verification Required
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
            • Free Application
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1">
            • Instant Supabase Auth Creation
          </span>
        </div>
      </PageHero>
      <main className="mx-auto max-w-5xl px-4 py-12">
        <RegisterForm />
      </main>
    </SiteShell>
  );
}
