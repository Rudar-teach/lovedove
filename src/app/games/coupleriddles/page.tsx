'use client';
import { useState } from 'react';

import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

export default function CoupleriddlesPage() {

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number|null>(null);
  const [phase, setPhase] = useState<'start'|'playing'|'result'>('start');
  const qs = [{"q":"I'm invisible but felt. I'm what people say when they care.","opts":["Love","Wind","Heat","Sound"],"a":0},{"q":"I have a head and tail but no body.","opts":["Snake","Coin","Worm","Pin"],"a":1},{"q":"The more you take, the more you leave behind.","opts":["Air","Footsteps","Memories","Time"],"a":1},{"q":"What has hands but cannot clap?","opts":["Statue","Clock","Robot","Monkey"],"a":1},{"q":"I speak without a mouth.","opts":["Ghost","Echo","Whistle","Song"],"a":1},{"q":"What can you catch but not throw?","opts":["Ball","Cold","Fish","Frisbee"],"a":1},{"q":"What has a heart but no organs?","opts":["Dog","Artichoke","Stone","Tree"],"a":1},{"q":"Word shorter when you add 2 letters?","opts":["Short","Brief","Small","Word"],"a":0},{"q":"Cities but no houses?","opts":["Map","Country","Globe","Atlas"],"a":0},{"q":"Starts with T and has T in it?","opts":["Teapot","T-Shirt","Tissue","Teeth"],"a":0},{"q":"Ring but no finger?","opts":["Phone","Coin","Saturn","Tree"],"a":0},{"q":"Share me and you haven't got me.","opts":["Love","Secret","Money","Time"],"a":1}];
  const start = () => { setIdx(0); setScore(0); setSelected(null); setPhase('playing'); };
  const answer = (i: number) => { if (selected !== null) return; setSelected(i); if (i === qs[idx].a) setScore(s => s + 10); setTimeout(() => { if (idx + 1 >= qs.length) setPhase('result'); else { setIdx(i2 => i2 + 1); setSelected(null); } }, 1000); };
  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700"/></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary-500"/> Couple Riddles</h1>
            <div className="w-16"/>
          </div>
          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">🧩</div>
                <h2 className="text-2xl font-display font-bold text-gray-800">Couple Riddles</h2>
                <p className="text-gray-600">12 love riddles</p>
              </div>
              
      <TiltCard intensity={5} glowColor="rgba(236,72,153,0.1)">
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 space-y-4">
          <div className="w-full bg-white/50 rounded-full h-2 border border-pink-100"><div className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-rose-500" style={{width: (((idx+1)/qs.length)*100)+'%'}}></div></div>
          <p className="text-lg font-semibold text-gray-800 text-center">{qs[idx].q}</p>
          <div className="grid grid-cols-1 gap-3">
            {qs[idx].opts.map((opt, i) => {
              let bg = 'bg-white border-gray-200 text-gray-700 hover:border-primary-300';
              if (selected !== null) { if (i === qs[idx].a) bg = 'bg-green-50 border-green-400 text-green-700'; else if (i === selected) bg = 'bg-red-50 border-red-400 text-red-700'; else bg = 'opacity-50 border-gray-200 text-gray-400'; }
              return <button key={i} onClick={() => answer(i)} disabled={selected !== null} className={"w-full text-left px-4 py-3 rounded-xl border-2 font-medium transition-all " + bg}>{String.fromCharCode(65+i)}. {opt}</button>;
            })}
          </div>
        </div>
      </TiltCard>
            </div>
          </TiltCard>
        </div>
      </div>
    </PremiumBackground>
  );
}
