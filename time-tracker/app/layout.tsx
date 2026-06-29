import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/layout/bottom-nav";

export const metadata: Metadata = {
  title: "TimeFlow — Suivi du temps",
  description: "Suivez votre temps, atteignez vos objectifs",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TimeFlow",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F5F5F7",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <div className="min-h-screen pb-20 max-w-md mx-auto">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
