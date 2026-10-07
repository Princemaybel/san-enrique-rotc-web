import { PortalCard, PortalShell } from "@/components/portal-shell";

export default function CadetSettingsPage() {
  return (
    <PortalShell type="cadet" title="Settings" subtitle="Account and notification preferences.">
      <PortalCard title="Account Settings" body="Cadet settings connect to Supabase Auth and profile preferences when production keys are configured." />
    </PortalShell>
  );
}
