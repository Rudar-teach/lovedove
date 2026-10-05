import type { Metadata } from "next";
import { Toaster } from 'react-hot-toast';
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
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#831843',
              border: '1px solid #fbcfe8',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(236, 72, 153, 0.1)',
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}