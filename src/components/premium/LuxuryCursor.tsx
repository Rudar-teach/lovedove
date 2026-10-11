'use client';

import { useEffect, useState } from 'react';

export default function LuxuryCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(true);
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setHidden(false);
    };
    const down = () => setClicking(true);
    const up = () => setClicking(false);
    const leave = () => setHidden(true);
    const enter = () => setHidden(false);

    window.addEventListener('mousemove', move);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    document.addEventListener('mouseleave', leave);
    document.addEventListener('mouseenter', enter);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
      document.removeEventListener('mouseleave', leave);
      document.removeEventListener('mouseenter', enter);
    };
  }, []);

  return (
    <>
      {/* Main cursor dot */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          transform: `translate(${pos.x - 6}px, ${pos.y - 6}px)`,
          opacity: hidden ? 0 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        <div
          className="w-3 h-3 rounded-full bg-white"
          style={{
            transform: clicking ? 'scale(0.6)' : 'scale(1)',
            transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </div>

      {/* Trailing ring */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          transform: `translate(${pos.x - 20}px, ${pos.y - 20}px)`,
          opacity: hidden ? 0 : 0.4,
          transition: 'opacity 0.5s ease',
        }}
      >
        <div
          className="w-10 h-10 rounded-full border border-white/60"
          style={{
            transform: clicking ? 'scale(0.8)' : 'scale(1)',
            transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />
      </div>
    </>
  );
}
