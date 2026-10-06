'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

export default function LoveletterPage(){
  const [phase, setPhase] = useState<'start'|'playing'|'result'>('start');
  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700"/></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary-500"/> Loveletter</h1>
            <div className="w-16"/>
          </div>
          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
              <div className="text-6xl mb-4">✨</div>
              <h2 className="text-2xl font-display font-bold text-gray-800">Loveletter</h2>
              <p className="text-gray-600">Coming soon! This game is being prepared with extra love.</p>
              <Button onClick={() => window.history.back()} variant="primary" className="w-full">Go Back</Button>
            </div>
          </TiltCard>
        </div>
      </div>
    </PremiumBackground>
  );
}
