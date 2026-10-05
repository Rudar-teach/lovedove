import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  glass?: boolean;
}

export default function Card({ children, className = '', onClick, hover = false, glass = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-3xl overflow-hidden
        ${glass
          ? 'bg-white/70 backdrop-blur-xl border border-white/50 shadow-xl shadow-pink-500/5'
          : 'bg-white border border-pink-100 shadow-lg shadow-pink-500/5'
        }
        ${hover ? 'hover:shadow-2xl hover:shadow-pink-500/10 hover:-translate-y-1 cursor-pointer transition-all duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
