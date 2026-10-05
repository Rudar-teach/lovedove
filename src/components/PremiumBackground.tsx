'use client';

import { FlyingDove } from '@/components/3d/FlyingDove';

export default function PremiumBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-gradient-to-br from-primary-200/30 via-rose-200/20 to-transparent rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/4 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-rose-200/25 via-pink-200/15 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-pink-200/20 via-primary-100/15 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
        <div className="absolute top-2/3 right-1/3 w-[400px] h-[400px] bg-gradient-to-br from-rose-100/15 via-primary-100/10 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Flying doves */}
      <FlyingDove delay={0} duration={22} top="8%" scale={0.7} opacity={0.7} />
      <FlyingDove delay={5} duration={28} top="20%" scale={0.5} opacity={0.5} />
      <FlyingDove delay={12} duration={24} top="15%" scale={0.9} opacity={0.6} />
      <FlyingDove delay={18} duration={30} top="35%" scale={0.4} opacity={0.4} />

      {/* Decorative floating elements */}
      <div className="absolute top-16 left-[10%] text-3xl opacity-25 float pointer-events-none select-none">💕</div>
      <div className="absolute top-32 right-[15%] text-2xl opacity-20 float-slow pointer-events-none select-none">✨</div>
      <div className="absolute top-[40%] left-[5%] text-3xl opacity-15 float-delayed pointer-events-none select-none">🌸</div>
      <div className="absolute top-[60%] right-[8%] text-2xl opacity-20 float pointer-events-none select-none">🕊️</div>
      <div className="absolute bottom-20 left-[20%] text-3xl opacity-15 float-slow pointer-events-none select-none">💖</div>
      <div className="absolute bottom-32 right-[12%] text-2xl opacity-20 float-delayed pointer-events-none select-none">🌹</div>
      <div className="absolute top-[45%] right-[25%] text-xl opacity-15 float pointer-events-none select-none">💝</div>
      <div className="absolute top-[25%] left-[30%] text-2xl opacity-10 float-slow pointer-events-none select-none">✨</div>

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
