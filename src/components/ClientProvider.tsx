'use client';
import { Toaster } from 'react-hot-toast';

export default function ClientProvider() {
  return (
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
  );
}
