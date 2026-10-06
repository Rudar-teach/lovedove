'use client';
import { useState } from 'react';

import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

export default function HeartquizPage() {

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number|null>(null);
  const [phase, setPhase] = useState<'start'|'playing'|'result'>('start');
  const qs = [{"q":"Which organ pumps blood?","opts":["Brain","Heart","Lungs","Liver"],"a":1},{"q":"Heart attack symptom?","opts":["Headache","Chest pain","Sore throat","Cough"],"a":1},{"q":"Symbol of love?","opts":["Square","Triangle","Heart","Circle"],"a":2},{"q":"Average heartbeats per minute?","opts":["30","100","200","500"],"a":1},{"q":"Heart-healthy food?","opts":["Pizza","Salmon","Burger","Fries"],"a":1},{"q":"Heart emoji?","opts":["💙","❤️","💚","💛"],"a":1},{"q":"Heart chamber count?","opts":["2","3","4","5"],"a":2},{"q":"BPM stands for?","opts":["Beats Per Minute","Big Pink Man","Bacon Pizza","Banana Pudding"],"a":0},{"q":"Best heart check?","opts":["X-ray","ECG","MRI","CT scan"],"a":1},{"q":"Cardio means?","opts":["Card game","Heart exercise","Card type","Cardboard"],"a":1},{"q":"Color of love?","opts":["Blue","Red","Green","Yellow"],"a":1},{"q":"Healthy heart oil?","opts":["Butter","Olive oil","Lard","Margarine"],"a":1}];
  const start = () => { setIdx(0); setScore(0); setSelected(null); setPhase('playing'); };
  const answer = (i: number) => { if (selected !== null) return; setSelected(i); if (i === qs[idx].a) setScore(s => s + 10); setTimeout(() => { if (idx + 1 >= qs.length) setPhase('result'); else { setIdx(i2 => i2 + 1); setSelected(null); } }, 1000); };
  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700"/></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary-500"/> Heart Quiz</h1>
            <div className="w-16"/>
          </div>
          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">💝</div>
                <h2 className="text-2xl font-display font-bold text-gray-800">Heart Quiz</h2>
                <p className="text-gray-600">12 heart knowledge questions</p>
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
