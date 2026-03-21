import type { Metadata, Viewport } from "next";
import {
  Fraunces,
  Outfit,
  JetBrains_Mono,
  Playfair_Display,
  Inter,
} from "next/font/google";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { PushPromptView } from "@/components/notifications/PushPromptView";
import { PageTransition } from "@/components/PageTransition";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Plantopia",
  description: "Personal plant care with AI-powered health analytics",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Plantopia",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0C0E", // Updated to match our botanical base
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#0A0C0E]">
      <body
        className={`${fraunces.variable} ${outfit.variable} ${jetbrainsMono.variable} ${playfairDisplay.variable} ${inter.variable} font-body antialiased text-text-light selection:bg-glass-emerald/30 overflow-x-hidden`}
      >
        <ServiceWorkerRegister />

        {/* --- GLOBAL ATMOSPHERIC BACKGROUND --- */}
        {/* --- GLOBAL ATMOSPHERIC BACKGROUND --- */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50 bg-bg-dark">
          {/* TOP RIGHT: The "Main Source" (Sage/Emerald) */}
          {/* Increased opacity to 25% and spread to 80% width */}
          <div
            className="absolute -top-[10%] -right-[10%] w-[80%] h-[70%] 
                bg-glass-emerald/25 blur-[140px] rounded-full opacity-80 animate-pulse"
            style={{ animationDuration: "12s" }}
          />

          {/* MIDDLE LEFT: The "Ambient Sunlight" (Amber) */}
          {/* This is what gives the glass that warm 'sun-kissed' edge */}
          <div
            className="absolute top-[20%] -left-[10%] w-[60%] h-[60%] 
                bg-amber-glow/15 blur-[120px] rounded-full opacity-60"
          />

          {/* BOTTOM CENTER: Grounding Forest Glow */}
          {/* This will make your navigation bar (Image 4) look like it's glowing */}
          <div
            className="absolute -bottom-[10%] left-1/2 -translate-x-1/2 w-[100%] h-[40%] 
                bg-forest/30 blur-[150px] rounded-full opacity-50"
          />
        </div>
        {/* --- MAIN CONTENT CONTAINER --- */}
        <main className="relative z-10 min-h-screen">
          <AuthProvider>
            <PageTransition>{children}</PageTransition>
          </AuthProvider>
        </main>

        <PushPromptView />
      </body>
    </html>
  );
}
