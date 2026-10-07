import { PortalCard, PortalShell } from "@/components/portal-shell";

export default function CadetEventsPage() {
  return (
    <PortalShell type="cadet" title="Events" subtitle="Upcoming events, trainings, and activity details.">
      <PortalCard title="Upcoming Activities" body="Cadets see published events and trainings from the shared Supabase backend." />
    </PortalShell>
  );
}
