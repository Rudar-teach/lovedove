'use client';

import { useEffect, useRef } from 'react';

interface MeshGradientProps {
  colors?: string[];
  speed?: number;
  className?: string;
}

export default function MeshGradient({
  colors = ['#ec4899', '#f43f5e', '#f472b6', '#fda4af', '#f9a8d4'],
  speed = 20,
  className = '',
}: MeshGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      time += 0.003;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      colors.forEach((color, i) => {
        const x = w * (0.3 + 0.4 * Math.sin(time + i * 1.2));
        const y = h * (0.3 + 0.4 * Math.cos(time * 0.8 + i * 0.9));
        const radius = Math.max(150, Math.min(w, h) * (0.3 + 0.15 * Math.sin(time * 0.5 + i)));

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, color + '40');
        gradient.addColorStop(0.5, color + '15');
        gradient.addColorStop(1, color + '00');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [colors]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
    />
  );
}
