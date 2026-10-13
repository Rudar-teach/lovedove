import type { Metadata } from "next";
import ClientProvider from '@/components/ClientProvider';
import Navbar from '@/components/Navbar';
import LuxuryCursor from '@/components/premium/LuxuryCursor';
import Chatbot from '@/components/Chatbot';
import { AuthProvider } from '@/providers/AuthProvider';
import "./globals.css";

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
    <html lang="en">
      <body className="min-h-screen antialiased">
        <ClientProvider>
          <AuthProvider>
            <LuxuryCursor />
            <Navbar />
            <main className="relative z-10 pt-16 sm:pt-20">
              {children}
            </main>
            <Chatbot />
          </AuthProvider>
        </ClientProvider>
      </body>
    </html>
  );
}
