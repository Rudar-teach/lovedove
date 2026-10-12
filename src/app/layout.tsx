import type { Metadata } from "next";
import ClientProvider from '@/components/ClientProvider';
import Navbar from '@/components/Navbar';
import LuxuryCursor from '@/components/premium/LuxuryCursor';
import Chatbot from '@/components/Chatbot';
import "./globals.css";

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
    <html lang="en">
      <body className="min-h-screen antialiased">
        <ClientProvider>
          <LuxuryCursor />
          <Navbar />
          <main className="relative z-10">
            {children}
          </main>
          <Chatbot />
        </ClientProvider>
      </body>
    </html>
  );
}
