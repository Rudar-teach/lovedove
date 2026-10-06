import type { Metadata } from "next";
import ClientProvider from '@/components/ClientProvider';
import "./globals.css";

export const metadata: Metadata = {
  title: "Love Dove - Where Hearts Connect 💕",
  description: "Create birthday websites and play couple games with your special someone",
  icons: {
    icon: "🕊️",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientProvider />
        {children}
      </body>
    </html>
  );
}
