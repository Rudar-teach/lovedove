// GameArt - rich SVG thumbnail generator for games
// Each game gets a distinctive illustrated card: layered shapes,
// decorative patterns, glow, and a badge — no image files, no API.
import React from 'react';

export interface GameArtProps {
  title: string;
  subtitle?: string;
  emoji: string;
  gradient: string; // tailwind gradient classes
  pattern?: 'dots' | 'stripes' | 'waves' | 'none' | 'auto';
}

// Deterministic pseudo-random from a string seed, so each game gets
// a stable, unique composition.
function seedRand(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822519);
    h = Math.imul(h ^ (h >>> 13), 3266489917);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

export default function GameArt({ title, subtitle, emoji, gradient, pattern = 'auto' }: GameArtProps) {
  const rand = seedRand(title + gradient);

  // Auto-pick a pattern based on the seed if not specified
  const pat = pattern === 'auto' ? (['dots', 'stripes', 'waves', 'dots', 'stripes'] as const)[Math.floor(rand() * 5)] : pattern;

  // Decorative floating shapes
  const shapes = Array.from({ length: 5 }).map((_, i) => ({
    x: rand() * 90 + 5,
    y: rand() * 80 + 5,
    size: 18 + rand() * 34,
    rot: rand() * 360,
    kind: i % 3, // 0 = ring, 1 = cross, 2 = square
    opacity: 0.1 + rand() * 0.15,
  }));

  // Dots
  const dots = Array.from({ length: 14 }).map(() => ({
    x: rand() * 100,
    y: rand() * 100,
    r: 1 + rand() * 3,
  }));

  return (
    <div className={`w-full h-full bg-gradient-to-br ${gradient} relative overflow-hidden rounded-xl`}>
      {/* decorative floating shapes */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {shapes.map((s, i) => (
          <g key={i} transform={`translate(${s.x} ${s.y}) rotate(${s.rot})`} opacity={s.opacity}>
            {s.kind === 0 && <circle cx="0" cy="0" r={s.size / 4} fill="none" stroke="white" strokeWidth="0.6" />}
            {s.kind === 1 && (
              <g stroke="white" strokeWidth="0.6">
                <line x1={-s.size / 4} y1="0" x2={s.size / 4} y2="0" />
                <line x1="0" y1={-s.size / 4} x2="0" y2={s.size / 4} />
              </g>
            )}
            {s.kind === 2 && <rect x={-s.size / 5} y={-s.size / 5} width={s.size / 2.5} height={s.size / 2.5} fill="white" rx="1" />}
          </g>
        ))}
      </svg>

      {/* pattern layer */}
      {pat === 'dots' && (
        <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 100 100" preserveAspectRatio="none">
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="white" opacity={0.3 + (i % 5) * 0.1} />
          ))}
        </svg>
      )}
      {pat === 'stripes' && (
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, white 0, white 2px, transparent 2px, transparent 12px)',
          }}
        />
      )}
      {pat === 'waves' && (
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
          {[0, 1, 2].map(i => (
            <path
              key={i}
              d={`M0,${60 + i * 8} Q25,${40 + i * 8} 50,${60 + i * 8} T100,${60 + i * 8}`}
              fill="none"
              stroke="white"
              strokeWidth="0.8"
              opacity={0.6 - i * 0.15}
            />
          ))}
        </svg>
      )}

      {/* radial glow behind emoji */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20 blur-2xl" />
      </div>

      {/* vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10" />

      {/* corner shine */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-white/15 rounded-br-full blur-xl" />

      {/* main emoji in a badge */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
          <div className="text-3xl sm:text-4xl drop-shadow-lg select-none relative z-10">{emoji}</div>
        </div>
      </div>

      {/* top-right badge */}
      {subtitle && (
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wider border border-white/20">
          {subtitle}
        </div>
      )}

      {/* title */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
        <div className="text-sm sm:text-base font-black text-white leading-tight drop-shadow-md pr-10">
          {title}
        </div>
      </div>
    </div>
  );
}
