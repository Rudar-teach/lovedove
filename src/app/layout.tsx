import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import ClientProvider from '@/components/ClientProvider';
import Navbar from '@/components/Navbar';
import LuxuryCursor from '@/components/premium/LuxuryCursor';
import Chatbot from '@/components/Chatbot';
import { AuthProvider } from '@/providers/AuthProvider';
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
  description: "Create beautiful birthday websites, play 101 couple games, add friends, earn badges, and celebrate your love story together.",
  keywords: ["love", "couple games", "birthday", "games", "friends", "badges", "love dove", "couples"],
  authors: [{ name: "Rudar Salaria" }],
  openGraph: {
    title: "Love Dove - Where Hearts Connect & Play",
    description: "Create birthday websites and play couple games together",
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
            <LuxuryCursor />
            <Navbar />
            <main className="relative z-10">
              {children}
            </main>
            <Chatbot />
          </AuthProvider>
        </ClientProvider>
      </body>
    </html>
  );
}
