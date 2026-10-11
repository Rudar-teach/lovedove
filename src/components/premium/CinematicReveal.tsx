'use client';

import { useEffect, useRef, useCallback } from 'react';

interface CinematicRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  once?: boolean;
}

export default function CinematicReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 1.2,
  threshold = 0.15,
  className = '',
  once = true,
}: CinematicRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const getInitialTransform = useCallback(() => {
    switch (direction) {
      case 'up': return 'translateY(60px)';
      case 'down': return 'translateY(-60px)';
      case 'left': return 'translateX(60px)';
      case 'right': return 'translateX(-60px)';
      case 'scale': return 'scale(0.9)';
      case 'fade': return 'translateY(0px)';
      default: return 'translateY(60px)';
    }
  }, [direction]);

  useEffect(() => {
    const el = ref.current;
    if (!el || (once && hasAnimated.current)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              el.style.transition = `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1), transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1)`;
              el.style.opacity = '1';
              el.style.transform = 'translateY(0) translateX(0) scale(1)';
              hasAnimated.current = true;
              if (once) observer.unobserve(el);
            }, delay * 1000);
          } else if (!once) {
            el.style.transition = 'none';
            el.style.opacity = '0';
            el.style.transform = getInitialTransform();
          }
        });
      },
      { threshold }
    );

    el.style.opacity = '0';
    el.style.transform = getInitialTransform();

    observer.observe(el);
    return () => observer.disconnect();
  }, [direction, delay, duration, threshold, once, getInitialTransform]);

  return (
    <div ref={ref} className={className} style={{ willChange: 'opacity, transform' }}>
      {children}
    </div>
  );
}
