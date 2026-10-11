'use client';

'use client';

interface ShinyTextProps {
  text: string;
  className?: string;
  speed?: number;
  color?: string;
}

export default function ShinyText({
  text,
  className = '',
  speed = 3,
  color = 'from-pink-400 via-rose-300 to-pink-400',
}: ShinyTextProps) {
  return (
    <span
      className={`relative inline-block bg-gradient-to-r ${color} bg-clip-text text-transparent bg-[length:200%_auto] ${className}`}
      style={{
        animation: `shimmer-text ${speed}s linear infinite`,
      }}
    >
      {text}
      <style>{`
        @keyframes shimmer-text {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </span>
  );
}
