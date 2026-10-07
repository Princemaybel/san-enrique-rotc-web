import { ForgotPasswordForm } from "@/components/password-reset-forms";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui";

export default function ForgotPasswordPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="Account Recovery" title="Reset your password" body="Enter your account email and Supabase Auth will send a reset link when configured." />
      <main className="mx-auto max-w-xl px-4 py-14"><ForgotPasswordForm /></main>
    </SiteShell>
  );
}
