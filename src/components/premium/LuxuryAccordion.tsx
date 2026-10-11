'use client';

import { useState, useEffect, useCallback } from 'react';

interface LuxuryAccordionProps {
  items: { title: string; content: React.ReactNode; icon?: React.ReactNode }[];
  allowMultiple?: boolean;
  className?: string;
}

export default function LuxuryAccordion({
  items,
  allowMultiple = false,
  className = '',
}: LuxuryAccordionProps) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());

  const toggle = useCallback(
    (index: number) => {
      setOpenIndices((prev) => {
        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else {
          if (!allowMultiple) next.clear();
          next.add(index);
        }
        return next;
      });
    },
    [allowMultiple]
  );

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, i) => {
        const isOpen = openIndices.has(i);
        return (
          <div
            key={i}
            className="group rounded-2xl border border-rose-100/60 bg-white/70 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:border-pink-200/80"
          >
            <button
              onClick={() => toggle(i)}
              className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {item.icon && <span className="text-xl">{item.icon}</span>}
                <span className="font-semibold text-gray-900 text-base sm:text-lg">
                  {item.title}
                </span>
              </div>
              <div
                className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center transition-all duration-500 group-hover:bg-pink-100"
                style={{
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-pink-500"
                >
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </button>

            <div
              className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                maxHeight: isOpen ? '500px' : '0px',
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div className="px-5 pb-5 pt-0 text-gray-600 text-sm sm:text-base leading-relaxed">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
