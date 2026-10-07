import { StatusForm } from "@/components/status-form";
import { SiteShell } from "@/components/site-shell";
import { PageHero } from "@/components/ui";

export default function ApplicationStatusPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="Application Status" title="Track your registration review" body="Applicants can check whether their registration is pending, under review, approved, or rejected." />
      <main className="mx-auto max-w-xl px-4 py-14"><StatusForm /></main>
    </SiteShell>
  );
}
