'use client';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'pink' | 'rose' | 'none';
  intensity?: 'light' | 'medium' | 'strong';
  onClick?: () => void;
}

export default function GlassCard({
  children,
  className = '',
  hover = true,
  glow = 'none',
  intensity = 'medium',
  onClick,
}: GlassCardProps) {
  const glassClasses = {
    light: 'bg-white/50 backdrop-blur-md border-white/60',
    medium: 'bg-white/70 backdrop-blur-xl border-white/80',
    strong: 'bg-white/85 backdrop-blur-2xl border-white/90',
  };

  const glowClasses = {
    pink: 'hover:shadow-[0_0_40px_rgba(236,72,153,0.15),0_0_80px_rgba(236,72,153,0.05)]',
    rose: 'hover:shadow-[0_0_40px_rgba(244,63,94,0.15),0_0_80px_rgba(244,63,94,0.05)]',
    none: '',
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-2xl border overflow-hidden
        ${glassClasses[intensity]}
        ${hover ? `transition-all duration-500 hover:-translate-y-1 ${glowClasses[glow]}` : ''}
        ${className}
      `}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 via-transparent to-rose-50/30 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
