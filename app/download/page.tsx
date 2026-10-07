import {
  Smartphone,
  Download,
  ShieldCheck,
  QrCode,
  BellRing,
  Cpu,
  CheckCircle2,
} from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { PageHero, SectionHeading } from "@/components/ui";

const features = [
  {
    title: "Dynamic Military QR Pass",
    desc: "Generate your encrypted, tamper-proof cadet attendance QR code for rapid formation gate muster.",
    icon: QrCode,
  },
  {
    title: "Instant Drill & Weather Alerts",
    desc: "Receive real-time push notifications regarding muster call changes, uniform of the day (UOTD), and weather advisories.",
    icon: BellRing,
  },
  {
    title: "Cadet Service & Merit Record",
    desc: "Monitor your accumulated drill attendance percentage, demerit/merit logs, and academic credit standing in real time.",
    icon: ShieldCheck,
  },
  {
    title: "Offline Sync Support",
    desc: "Access your digital military identification card and schedule even in areas with limited mobile data connectivity.",
    icon: Cpu,
  },
];

const installSteps = [
  {
    step: "1",
    title: "Download Android Package (APK)",
    desc: "Tap the download button below to fetch the latest verified SAN ENRIQUE ROTC release APK directly to your mobile device.",
  },
  {
    step: "2",
    title: "Authorize Package Installation",
    desc: "If prompted by Android Security, tap Settings and enable 'Allow from this source' for your browser or file manager.",
  },
  {
    step: "3",
    title: "Install & Launch Application",
    desc: "Tap Install on the package installer prompt, then open the SAN ENRIQUE ROTC application from your app drawer.",
  },
  {
    step: "4",
    title: "Cadet Authentication",
    desc: "Sign in with your verified Cadet Portal credentials to load your military profile and personal attendance QR pass.",
  },
];

export default function DownloadPage() {
  const apkUrl = process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL || "/downloads/san-enrique-rotc.apk";

  return (
    <SiteShell>
      <PageHero
image="/images/home.jpg"
              eyebrow="Mobile Tactical Command"
        title="San Enrique ROTC Mobile Application"
        body="Empower your cadet journey with our dedicated Android application featuring high-speed digital QR muster check-ins, real-time command notices, and instant record tracking."
      />

      <main className="mx-auto max-w-7xl px-4 py-14 space-y-16">
        {/* Main APK Download & Overview Hero */}
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="card-lift rounded-2xl border border-gold/30 bg-gradient-to-br from-forest via-field to-forest p-8 md:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 rounded-full blur-3xl -mr-28 -mt-28 pointer-events-none" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15 text-gold border border-gold/30">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-2xs font-black uppercase tracking-widest text-gold">Official Android Build</span>
                  <h2 className="text-xl md:text-2xl font-black text-white">SAN ENRIQUE ROTC v2.4</h2>
                </div>
              </div>

              <p className="text-xs md:text-sm text-cream/85 leading-relaxed">
                Engineered specifically for San Enrique ROTC cadets, staff, and duty officers. Seamlessly bridges formation muster with digital command records.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href={apkUrl}
                  className="btn-press inline-flex items-center gap-2.5 rounded-xl bg-gold px-6 py-3.5 text-xs font-black uppercase tracking-wider text-charcoal shadow-lg hover:bg-gold/90 transition-all"
                >
                  <Download className="h-4 w-4" />
                  Download Official APK
                </a>
                <span className="text-2xs text-cream/60">Android 8.0 (Oreo) & Higher • Verified Safe</span>
              </div>

              <div className="border-t border-white/15 pt-4 flex flex-wrap gap-4 text-2xs text-cream/75">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-gold" /> Fast Formation Scanning
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-gold" /> Encrypted Credentials
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-gold" /> Zero Bloatware
                </span>
              </div>
            </div>
          </div>

          {/* App Core Capabilities */}
          <div className="space-y-4">
            <SectionHeading
              eyebrow="Key Features"
              title="Built for Military Precision"
              body="Everything you need for Saturday formation drills and academic compliance right in your pocket."
            />

            <div className="grid gap-3.5 sm:grid-cols-2 pt-2">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="card-lift rounded-xl border border-field/10 bg-white p-4 shadow-card"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-field/10 text-field">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="mt-3 text-xs font-black text-charcoal leading-snug">{f.title}</h4>
                    <p className="mt-1 text-2xs leading-relaxed text-slate">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Step-by-Step Sideload Installation Guide */}
        <section className="space-y-6">
          <SectionHeading
            eyebrow="Installation Protocol"
            title="How to Install on Your Android Device"
            body="Follow these 4 simple steps to install the official APK package onto your smartphone."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {installSteps.map((s) => (
              <div
                key={s.step}
                className="card-lift flex flex-col justify-between rounded-xl border border-field/10 bg-white p-6 shadow-card hover:border-field/30"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-field text-gold font-black text-sm">
                    {s.step}
                  </div>
                  <h3 className="mt-4 text-sm font-black text-charcoal">{s.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
