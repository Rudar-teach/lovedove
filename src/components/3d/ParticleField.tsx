'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  emoji: string;
  opacity: number;
  type: 'heart' | 'dove' | 'sparkle' | 'petal';
  color?: string;
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const emojis = ['💕', '💖', '💗', '💓', '💝', '💘', '❤️', '🕊️', '✨', '🌸', '🌹'];
    const colors = ['#ec4899', '#f43f5e', '#f472b6', '#fb7185', '#fda4af', '#f9a8d4'];

    const initParticles = () => {
      const count = Math.min(45, Math.floor(window.innerWidth / 30));
      particlesRef.current = Array.from({ length: count }, () => {
        const types: Particle['type'][] = ['heart', 'heart', 'heart', 'dove', 'sparkle', 'petal', 'petal'];
        const type = types[Math.floor(Math.random() * types.length)];
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -0.3 - Math.random() * 0.7,
          size: type === 'sparkle' ? 6 + Math.random() * 8 : 18 + Math.random() * 22,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 1.2,
          emoji: type === 'sparkle' ? '✨' : type === 'petal' ? '🌸' : type === 'dove' ? '🕊️' : emojis[Math.floor(Math.random() * 6)],
          opacity: 0.3 + Math.random() * 0.4,
          type,
          color: colors[Math.floor(Math.random() * colors.length)],
        };
      });
    };
    initParticles();

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        // Mouse repulsion
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const force = (120 - dist) / 120;
          p.vx += (dx / dist) * force * 0.3;
          p.vy += (dy / dist) * force * 0.3;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.vx *= 0.99;
        p.vy *= 0.99;

        if (p.type === 'sparkle') {
          p.vy += (Math.random() - 0.5) * 0.05;
        }

        // Wrap
        if (p.y < -50) { p.y = canvas.height + 50; p.x = Math.random() * canvas.width; }
        if (p.y > canvas.height + 50) { p.y = -50; p.x = Math.random() * canvas.width; }
        if (p.x < -50) p.x = canvas.width + 50;
        if (p.x > canvas.width + 50) p.x = -50;

        // Draw with shadow glow
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.font = `${p.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (p.type === 'sparkle') {
          ctx.shadowColor = p.color || '#fff';
          ctx.shadowBlur = 20;
        } else if (p.type === 'dove') {
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 15;
        } else {
          ctx.shadowColor = p.color || '#ec4899';
          ctx.shadowBlur = 12;
        }

        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden
    />
  );
}
