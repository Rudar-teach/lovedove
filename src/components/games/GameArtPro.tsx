// GameArtPro — premium, distinct SVG thumbnail art for every game.
// Each game gets a hand-illustrated scene (background + subject + accent)
// so no two cards look alike. 100% SVG: crisp, instant, zero image files.
import React from 'react';

export interface GameArtProProps {
  title: string;
  subtitle?: string;
  emoji: string;
  gradient: string;
  slug?: string;
}

// Scene palettes + subject illustrations, keyed by slug.
// Each scene: unique bg, unique subject, unique accent.
type Scene = {
  bg: string;      // 2-stop css gradient for the card background
  subject: () => React.ReactNode;
  accent: string;  // accent color used for the badge
  shape: React.ReactNode; // subtle bg shape
};

const scenes: Record<string, Scene> = {
  // ── bollywood-quiz : film strip with clapper ─────────────────
  'bollywood-quiz': {
    bg: 'linear-gradient(135deg,#7c2d12,#b45309)',
    accent: '#fde68a',
    shape: (
      <g opacity="0.12">
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={i * 14} y="6" width="8" height="6" rx="1" fill="#fff" />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={i * 14} y="90" width="8" height="6" rx="1" fill="#fff" />
        ))}
      </g>
    ),
    subject: () => (
      <g>
        <rect x="20" y="32" width="60" height="36" rx="4" fill="#fde68a" opacity="0.9" />
        <rect x="20" y="32" width="60" height="8" fill="#78350f" />
        <line x1="20" y1="40" x2="80" y2="34" stroke="#78350f" strokeWidth="3" />
        <circle cx="45" cy="52" r="9" fill="#b45309" />
        <text x="45" y="56" textAnchor="middle" fontSize="10" fontWeight="900" fill="#fde68a">🎬</text>
      </g>
    ),
  },
  // ── slumdog-quiz : TV quiz show stage ────────────────────────
  'slumdog-quiz': {
    bg: 'linear-gradient(135deg,#78350f,#f59e0b)',
    accent: '#fef3c7',
    shape: (
      <g opacity="0.1">
        <circle cx="30" cy="30" r="18" fill="#fff" />
        <circle cx="80" cy="70" r="22" fill="#fff" />
      </g>
    ),
    subject: () => (
      <g>
        <rect x="24" y="28" width="52" height="34" rx="4" fill="#fef3c7" />
        <rect x="28" y="32" width="44" height="26" rx="2" fill="#1e293b" />
        <text x="50" y="50" textAnchor="middle" fontSize="14" fontWeight="900" fill="#fbbf24">₹</text>
        <rect x="40" y="66" width="20" height="8" rx="2" fill="#78350f" />
      </g>
    ),
  },
  // ── 3-idiots-riddles : graduation cap ────────────────────────
  '3-idiots-riddles': {
    bg: 'linear-gradient(135deg,#1e3a8a,#3b82f6)',
    accent: '#dbeafe',
    shape: (
      <g opacity="0.08">
        <text x="10" y="40" fontSize="28" fill="#fff">∑</text>
        <text x="70" y="70" fontSize="24" fill="#fff">π</text>
      </g>
    ),
    subject: () => (
      <g>
        <path d="M50 26 L84 40 L50 54 L16 40 Z" fill="#fbbf24" />
        <rect x="48" y="40" width="4" height="20" fill="#f59e0b" />
        <circle cx="50" cy="62" r="4" fill="#fbbf24" />
        <path d="M50 54 L50 74" stroke="#fbbf24" strokeWidth="2" />
      </g>
    ),
  },
  // ── villain-memory : mask / villain ──────────────────────────
  'villain-memory': {
    bg: 'linear-gradient(135deg,#111827,#7f1d1d)',
    accent: '#fecaca',
    shape: (
      <g opacity="0.1">
        <path d="M0 96 L40 56 L80 96 Z" fill="#fff" />
        <path d="M60 96 L100 40 L140 96 Z" fill="#fff" />
      </g>
    ),
    subject: () => (
      <g>
        <path d="M50 24 C72 24 84 40 84 58 C84 78 68 88 50 88 C32 88 16 78 16 58 C16 40 28 24 50 24 Z"
          fill="#1f2937" stroke="#fca5a5" strokeWidth="2" />
        <circle cx="38" cy="52" r="6" fill="#fca5a5" />
        <circle cx="62" cy="52" r="6" fill="#fca5a5" />
        <path d="M38 68 Q50 76 62 68" stroke="#fca5a5" strokeWidth="3" fill="none" />
      </g>
    ),
  },
  // ── hero-story : train / DDLJ ─────────────────────────────────
  'hero-story': {
    bg: 'linear-gradient(135deg,#9f1239,#fb7185)',
    accent: '#ffe4e6',
    shape: (
      <g opacity="0.12">
        <line x1="0" y1="70" x2="100" y2="70" stroke="#fff" strokeWidth="2" />
        <line x1="0" y1="76" x2="100" y2="76" stroke="#fff" strokeWidth="2" />
      </g>
    ),
    subject: () => (
      <g>
        <rect x="18" y="34" width="64" height="34" rx="6" fill="#ffe4e6" />
        <rect x="24" y="40" width="12" height="10" rx="2" fill="#9f1239" />
        <rect x="42" y="40" width="12" height="10" rx="2" fill="#9f1239" />
        <rect x="60" y="40" width="12" height="10" rx="2" fill="#9f1239" />
        <circle cx="30" cy="70" r="6" fill="#334155" />
        <circle cx="70" cy="70" r="6" fill="#334155" />
        <path d="M82 44 L96 38 L96 52 Z" fill="#ffe4e6" />
      </g>
    ),
  },
  // ── ghazal-rhythm : moon + sitar strings ──────────────────────
  'ghazal-rhythm': {
    bg: 'linear-gradient(135deg,#312e81,#7c3aed)',
    accent: '#e9d5ff',
    shape: (
      <g opacity="0.1">
        {[0,1,2,3,4].map(i => (
          <line key={i} x1={20 + i*12} y1="20" x2={20 + i*12} y2="80" stroke="#fff" strokeWidth="0.5" />
        ))}
      </g>
    ),
    subject: () => (
      <g>
        <circle cx="50" cy="44" r="18" fill="#f5f3ff" opacity="0.9" />
        <circle cx="56" cy="40" r="16" fill="#312e81" />
        <path d="M30 70 L70 70" stroke="#e9d5ff" strokeWidth="2" />
        <path d="M35 74 L65 74" stroke="#e9d5ff" strokeWidth="1.5" opacity="0.6" />
      </g>
    ),
  },
  // ── baraat-would : dhol / wedding ─────────────────────────────
  'baraat-would': {
    bg: 'linear-gradient(135deg,#dc2626,#f59e0b)',
    accent: '#fef3c7',
    shape: (
      <g opacity="0.1">
        <circle cx="25" cy="25" r="3" fill="#fff" />
        <circle cx="75" cy="30" r="4" fill="#fff" />
        <circle cx="40" cy="80" r="3" fill="#fff" />
      </g>
    ),
    subject: () => (
      <g>
        <ellipse cx="50" cy="52" rx="26" ry="20" fill="#fde68a" />
        <ellipse cx="50" cy="52" rx="26" ry="20" fill="none" stroke="#dc2626" strokeWidth="3" />
        <line x1="24" y1="32" x2="76" y2="72" stroke="#fde68a" strokeWidth="4" />
        <line x1="24" y1="72" x2="76" y2="32" stroke="#fde68a" strokeWidth="4" />
      </g>
    ),
  },
  // ── couples-choices : two hearts ──────────────────────────────
  'couples-choices': {
    bg: 'linear-gradient(135deg,#be123c,#fb7185)',
    accent: '#ffe4e6',
    shape: (
      <g opacity="0.08">
        <circle cx="30" cy="30" r="20" fill="#fff" />
        <circle cx="70" cy="70" r="24" fill="#fff" />
      </g>
    ),
    subject: () => (
      <g>
        <path d="M42 38 C36 30 24 32 22 42 C20 52 32 60 42 68 C52 60 64 52 62 42 C60 32 48 30 42 38 Z"
          fill="#ffe4e6" />
        <path d="M58 42 C52 34 40 36 38 46 C36 56 48 64 58 72 C68 64 80 56 78 46 C76 36 64 34 58 42 Z"
          fill="#f43f5e" opacity="0.8" />
      </g>
    ),
  },
  // ── sholay-quiz : desert dacoit ───────────────────────────────
  'sholay-quiz': {
    bg: 'linear-gradient(135deg,#78350f,#f59e0b)',
    accent: '#fde68a',
    shape: (
      <g opacity="0.12">
        <path d="M0 78 Q25 60 50 78 T100 78 L100 100 L0 100 Z" fill="#fde68a" />
        <circle cx="80" cy="24" r="10" fill="#fde68a" />
      </g>
    ),
    subject: () => (
      <g>
        <rect x="36" y="34" width="28" height="34" rx="6" fill="#fde68a" />
        <circle cx="50" cy="42" r="8" fill="#78350f" />
        <path d="M42 34 Q50 26 58 34" stroke="#78350f" strokeWidth="4" fill="none" />
        <line x1="70" y1="40" x2="84" y2="34" stroke="#78350f" strokeWidth="4" />
      </g>
    ),
  },
  // ── bhaag-simran : boy carrying girl on shoulder, running from dad ─
  'bhaag-simran': {
    bg: 'linear-gradient(135deg,#9a3412,#ea580c)',
    accent: '#ffedd5',
    shape: (
      <g opacity="0.15">
        <path d="M0 70 Q20 55 40 70 T80 70 L100 70 L100 100 L0 100 Z" fill="#ffedd5" />
        <circle cx="85" cy="20" r="8" fill="#ffedd5" />
      </g>
    ),
    subject: () => (
      <g>
        {/* road */}
        <rect x="10" y="66" width="80" height="24" rx="4" fill="#7c2d12" opacity="0.6" />
        <line x1="10" y1="78" x2="90" y2="78" stroke="#ffedd5" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
        {/* boy running (carrying Simran on shoulder) */}
        <g>
          <circle cx="50" cy="34" r="7" fill="#ffedd5" />
          <path d="M50 41 L50 58" stroke="#ffedd5" strokeWidth="5" strokeLinecap="round" />
          <path d="M50 45 L38 52" stroke="#ffedd5" strokeWidth="4" strokeLinecap="round" />
          <path d="M50 45 L62 50" stroke="#ffedd5" strokeWidth="4" strokeLinecap="round" />
          <path d="M50 58 L42 72" stroke="#ffedd5" strokeWidth="4" strokeLinecap="round" />
          <path d="M50 58 L58 72" stroke="#ffedd5" strokeWidth="4" strokeLinecap="round" />
          {/* Simran on his shoulder */}
          <circle cx="50" cy="24" r="5" fill="#fbbf24" />
          <path d="M46 28 L54 28" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
        </g>
        {/* dad's shadow chasing behind */}
        <g opacity="0.5">
          <circle cx="18" cy="46" r="6" fill="#000" />
          <path d="M18 52 L18 64" stroke="#000" strokeWidth="4" strokeLinecap="round" />
          <path d="M18 55 L26 62" stroke="#000" strokeWidth="3" strokeLinecap="round" />
          <path d="M18 55 L10 62" stroke="#000" strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>
    ),
  },
};

// Slugs that have a dedicated hand-illustrated scene in GameArtPro.
// The rest fall back to the general GameArt so nothing is blank.
export const PRO_ART_SLUGS = new Set(Object.keys(scenes));

const fallback: Scene = {
  bg: 'linear-gradient(135deg,#9d174d,#f472b6)',
  accent: '#fce7f3',
  shape: (
    <g opacity="0.1">
      <circle cx="30" cy="30" r="18" fill="#fff" />
      <circle cx="70" cy="70" r="22" fill="#fff" />
    </g>
  ),
  subject: () => (
    <g>
      <circle cx="50" cy="52" r="24" fill="#fff" opacity="0.25" />
      <text x="50" y="60" textAnchor="middle" fontSize="30" fill="#fff">✦</text>
    </g>
  ),
};

export default function GameArtPro({ title, subtitle, emoji, gradient, slug }: GameArtProProps) {
  const scene = (slug && scenes[slug]) || fallback;

  return (
    <div
      className="w-full h-full relative overflow-hidden rounded-xl"
      style={{ background: scene.bg }}
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {scene.shape}
        {scene.subject()}
      </svg>

      {/* vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

      {/* emoji chip top-right */}
      <div
        className="absolute top-2 right-2 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-lg border"
        style={{ background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)' }}
      >
        {emoji}
      </div>

      {/* title + subtitle */}
      <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3 bg-gradient-to-t from-black/60 to-transparent">
        {subtitle && (
          <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: scene.accent }}>
            {subtitle}
          </div>
        )}
        <div className="text-sm sm:text-base font-black text-white leading-tight drop-shadow-lg">
          {title}
        </div>
      </div>
    </div>
  );
}
