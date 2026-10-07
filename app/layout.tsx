import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#1F5D3A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "San Enrique ROTC",
    template: "%s — San Enrique ROTC",
  },
  description:
    "Official information, cadet registration, training updates, events, and digital cadet services for San Enrique ROTC Unit.",
  keywords: ["ROTC", "San Enrique", "cadet", "military training", "leadership"],
  openGraph: {
    type: "website",
    locale: "en_PH",
    siteName: "San Enrique ROTC",
    title: "San Enrique ROTC — Discipline. Leadership. Service.",
    description:
      "Official cadet registration, digital ID, attendance, announcements, and events portal.",
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-cream text-charcoal">{children}</body>
    </html>
  );
}
