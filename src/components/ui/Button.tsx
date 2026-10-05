'use client';

import { useState } from 'react';
import { Loader2, Heart } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'love';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className = '',
  icon,
  disabled,
  ...props
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group';

  const variants: Record<string, string> = {
    primary: `bg-gradient-to-r from-pink-500 via-primary-500 to-rose-500 text-white shadow-lg shadow-primary-500/40 hover:shadow-xl hover:shadow-primary-500/50 hover:from-pink-600 hover:to-rose-600 focus:ring-primary-500`,
    secondary: 'bg-white/80 backdrop-blur-sm text-gray-800 border-2 border-pink-200 hover:border-pink-400 hover:bg-pink-50/80 shadow-sm hover:shadow-md focus:ring-pink-400',
    outline: 'bg-transparent border-2 border-primary-500/60 text-primary-600 hover:bg-primary-500 hover:text-white hover:border-primary-500 focus:ring-primary-500',
    ghost: 'bg-transparent text-gray-600 hover:bg-pink-50 hover:text-primary-600 focus:ring-pink-400',
    love: 'bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 text-white shadow-xl shadow-rose-500/40 hover:shadow-2xl hover:shadow-rose-500/50 hover:scale-105 hover:from-rose-600 hover:to-red-600 focus:ring-rose-500',
  };

  const sizesMap: Record<string, string> = {
    sm: 'text-sm px-5 py-2.5 gap-2',
    md: 'text-base px-7 py-3.5 gap-2.5',
    lg: 'text-lg px-9 py-4 gap-3',
    xl: 'text-xl px-12 py-5 gap-3.5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizesMap[size]} ${className}`}
      disabled={disabled || isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {/* Shimmer effect on hover */}
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />

      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin relative z-10" />
      ) : icon ? (
        <span className="relative z-10">{icon}</span>
      ) : variant === 'love' ? (
        <Heart className={`w-5 h-5 relative z-10 transition-transform duration-300 ${isHovered ? 'scale-125' : ''}`} fill="white" />
      ) : null}

      <span className="relative z-10">{children}</span>
    </button>
  );
}
