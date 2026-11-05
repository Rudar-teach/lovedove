import type { Metadata } from "next";
import localFont from "next/font/local";
import ClientProvider from '@/components/ClientProvider';
import Navbar from '@/components/Navbar';
import LuxuryCursor from '@/components/premium/LuxuryCursor';
import Chatbot from '@/components/Chatbot';
import { AuthProvider } from '@/providers/AuthProvider';
import { PlayInviteProvider } from '@/components/PlayInviteProvider';
import CookieBanner from '@/components/CookieBanner';
import MissYouBanner from '@/components/MissYouBanner';
import GlobalPlayWithFriend from '@/components/games/GlobalPlayWithFriend';
import "./globals.css";

// Self-hosted variable fonts (one woff2 file per family, all weights 100-900).
// next/font/local hashes the files into the build, serves them locally, and
// inlines font-display. No network fetch at build or runtime — faster than
// the next/font/google pipeline and it sidesteps a Turbopack dev-mode bug
// in Next 16.4.x that fails to resolve @vercel/turbopack-next font modules.
const inter = localFont({
  src: "../fonts/inter-var.woff2",
  variable: "--font-inter",
  // Variable font: the browser picks any weight on the axis; Tailwind's
  // font-light/semibold/black classes all map onto the one file.
});
const playfair = localFont({
  src: "../fonts/playfair-var.woff2",
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Love Dove - Where Hearts Connect & Play",
  description: "Play 150 couple games, add friends, earn badges, track your playtime, and celebrate your love story together.",
  keywords: ["love", "couple games", "games", "friends", "badges", "love dove", "couples"],
  authors: [{ name: "Rudar Salaria" }],
  openGraph: {
    title: "Love Dove - Where Hearts Connect & Play",
    description: "Play couple games together and celebrate your love",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen antialiased">
        <ClientProvider>
          <AuthProvider>
            <PlayInviteProvider>
              <LuxuryCursor />
              <Navbar />
              <main className="relative z-10 pt-16 sm:pt-20">
                {children}
              </main>
              <Chatbot />
              <CookieBanner />
              <MissYouBanner />
              <GlobalPlayWithFriend />
            </PlayInviteProvider>
          </AuthProvider>
        </ClientProvider>
      </body>
    </html>
  );
}
