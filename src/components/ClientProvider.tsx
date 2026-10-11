'use client';

import { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';

export default function ClientProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdf2f8, #ffffff, #fdf2f8)' }}>
        {children}
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#831843',
            border: '1px solid #fbcfe8',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(236, 72, 153, 0.15)',
          },
        }}
      />
      {children}
    </>
  );
}
