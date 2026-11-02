import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import ClientProvider from '@/components/ClientProvider';
import Navbar from '@/components/Navbar';
import LuxuryCursor from '@/components/premium/LuxuryCursor';
import Chatbot from '@/components/Chatbot';
import { AuthProvider } from '@/providers/AuthProvider';
import { PlayInviteProvider } from '@/components/PlayInviteProvider';
import "./globals.css";

// Self-hosted fonts (next/font downloads at build time, serves locally,
// limits weights to what is actually used, and inlines font-display).
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Love Dove - Where Hearts Connect & Play",
  description: "Play 101 couple games, add friends, earn badges, track your playtime, and celebrate your love story together.",
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
            </PlayInviteProvider>
          </AuthProvider>
        </ClientProvider>
      </body>
    </html>
  );
}
