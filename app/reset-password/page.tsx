import { ResetPasswordForm } from "@/components/password-reset-forms";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui";

export default function ResetPasswordPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="Account Recovery" title="Choose a new password" body="Use the secure reset link from your email before updating your password." />
      <main className="mx-auto max-w-xl px-4 py-14"><ResetPasswordForm /></main>
    </SiteShell>
  );
}
