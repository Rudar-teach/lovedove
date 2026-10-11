'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  strength?: number;
  href?: string;
}

export default function MagneticButton({
  children,
  onClick,
  className = '',
  strength = 0.3,
  href,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('translate(0px, 0px)');

  const handleMouse = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      setTransform(`translate(${x * strength}px, ${y * strength}px)`);
    },
    [strength]
  );

  const reset = useCallback(() => {
    setTransform('translate(0px, 0px)');
  }, []);

  const content = (
    <div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      onClick={onClick}
      className={className}
      style={{
        transform,
        transition: transform === 'translate(0px, 0px)'
          ? 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          : 'none',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );

  if (href) {
    return (
      <a href={href} className="inline-block no-underline">
        {content}
      </a>
    );
  }

  return content;
}
