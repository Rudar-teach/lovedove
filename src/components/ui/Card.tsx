import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className = '', onClick, hover = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-3xl shadow-lg shadow-pink-500/5
        border border-pink-100 overflow-hidden
        ${hover ? 'hover:shadow-xl hover:shadow-pink-500/10 hover:-translate-y-1 cursor-pointer transition-all duration-300' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
