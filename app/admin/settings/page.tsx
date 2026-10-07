import { PortalCard, PortalShell } from "@/components/portal-shell";

export default function AdminSettingsPage() {
  return (
    <PortalShell type="admin" title="Settings" subtitle="Branding, contact details, registration settings, and APK URL.">
      <PortalCard title="System Settings" body="Editable configuration belongs in `site_settings`, including unit name, contact details, office hours, social links, requirements, and Android APK URL." />
    </PortalShell>
  );
}
