'use client';

import { useState, useRef, useEffect } from 'react';

interface LuxuryModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function LuxuryModal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
}: LuxuryModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      requestAnimationFrame(() => setIsAnimating(true));
    } else if (shouldRender) {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!shouldRender) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        style={{
          opacity: isAnimating ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* Modal */}
      <div
        ref={contentRef}
        className={`relative w-full ${sizes[size]} bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden`}
        style={{
          opacity: isAnimating ? 1 : 0,
          transform: isAnimating
            ? 'scale(1) translateY(0)'
            : 'scale(0.92) translateY(30px)',
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Gradient border top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-pink-400 to-transparent" />

        {title && (
          <div className="flex items-center justify-between p-6 pb-4 border-b border-rose-100/60">
            <h2 className="font-display text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all hover:rotate-90 duration-300"
            >
              <span className="text-gray-500 text-lg">&times;</span>
            </button>
          </div>
        )}

        {!title && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-all hover:rotate-90 duration-300 shadow-md"
          >
            <span className="text-gray-500 text-lg">&times;</span>
          </button>
        )}

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
