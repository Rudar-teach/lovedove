// GameArt - SVG thumbnail generator for games
// Each game gets a visually rich, colorful thumbnail card
import React from 'react';

export interface GameArtProps {
  title: string;
  subtitle?: string;
  emoji: string;
  gradient: string; // tailwind gradient classes
  pattern?: 'dots' | 'stripes' | 'waves' | 'none';
}

export default function GameArt({ title, subtitle, emoji, gradient, pattern = 'dots' }: GameArtProps) {
  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} relative overflow-hidden rounded-xl`}>
      {/* pattern layer */}
      {pattern === 'dots' && (
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-white"
              style={{
                left: `${(i * 13) % 100}%`,
                top: `${(i * 7) % 100}%`,
                opacity: 0.3 + (i % 5) * 0.1,
              }}
            />
          ))}
        </div>
      )}
      {pattern === 'stripes' && (
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, white 0, white 2px, transparent 2px, transparent 12px)',
          }}
        />
      )}
      {pattern === 'waves' && (
        <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
          <path
            d="M0,60 Q25,30 50,60 T100,60 L100,120 L0,120 Z"
            fill="white"
          />
        </svg>
      )}

      {/* radial glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/20" />

      {/* corner shine */}
      <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-white/10 rounded-br-full blur-xl" />

      {/* main emoji */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-4xl sm:text-5xl drop-shadow-lg select-none">{emoji}</div>
      </div>

      {/* title */}
      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/60 to-transparent">
        {subtitle && (
          <div className="text-[9px] sm:text-[10px] text-white/70 font-bold uppercase tracking-wider mb-0.5 truncate">
            {subtitle}
          </div>
        )}
        <div className="text-sm sm:text-base font-black text-white leading-tight truncate">
          {title}
        </div>
      </div>
    </div>
  );
}
