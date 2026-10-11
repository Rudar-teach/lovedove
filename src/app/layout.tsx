import type { Metadata } from "next";
import ClientProvider from '@/components/ClientProvider';
import "./globals.css";

export const metadata: Metadata = {
  title: "Love Dove - Where Hearts Connect & Play",
  description: "Create beautiful birthday websites, play 36+ couple games, add friends, earn badges, and celebrate your love story together.",
  keywords: ["love", "couple games", "birthday", "games", "friends", "badges"],
  authors: [{ name: "Love Dove Team" }],
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
      <body className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 antialiased">
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}
