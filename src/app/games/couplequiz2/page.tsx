'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const Q = [
  {q:"Best date night?", opts:["Movie at home","Fancy restaurant","Walk in park","Cook together"], a:3},
  {q:"First gift you'd buy me?", opts:["Flowers","Jewelry","Book","Surprise me!"], a:3},
  {q:"How do you show love?", opts:["Words of affirmation","Quality time","Physical touch","Acts of service"], a:1},
  {q:"Favorite love movie?", opts:["Titanic","The Notebook","Pride & Prejudice","Casablanca"], a:1},
  {q:"Who says 'I love you' first?", opts:["Me","You","Both at the same time","Hasn't happened yet"], a:1},
  {q:"Couple's travel dream?", opts:["Paris","Maldives","Tokyo","Swiss Alps"], a:0},
  {q:"Morning or evening person?", opts:["Morning person","Evening person","Both!","Neither"], a:1},
  {q:"Best couple activity?", opts:["Gaming","Cooking","Hiking","Reading together"], a:0},
  {q:"Anniversary style?", opts:["Big party","Intimate dinner","Weekend getaway","Movie night"], a:1},
  {q:"Your love language?", opts:["Words","Gifts","Time","Touch"], a:2},
];

export default function CoupleQuiz2Page(){
  const [idx,setIdx]=useState(0); const [score,setScore]=useState(0); const [selected,setSelected]=useState<number|null>(null); const [show,setShow]=useState(false); const [phase,setPhase]=useState<'start'|'playing'|'result'>('start');
  const start=()=>{setIdx(0);setScore(0);setSelected(null);setShow(false);setPhase('playing');};
  const answer=(i:number)=>{if(selected!==null)return;setSelected(i);if(i===Q[idx].a){setScore(s=>s+10);}setShow(true);setTimeout(()=>{if(idx+1>=Q.length)setPhase('result');else{setIdx(i2=>i2+1);setSelected(null);setShow(false);}},1000);};
  return(
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6"><Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700"/></button></Link><h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary-500"/> Couple Quiz 2</h1><div className="text-sm font-bold text-primary-600">{score} pts</div></div>
          {phase==='start'&&(<motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}><TiltCard intensity={5} glowColor="rgba(236,72,153,0.1)"><div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4"><div className="text-6xl mb-4">💕</div><h2 className="text-2xl font-display font-bold text-gray-800">Couple Quiz 2</h2><p className="text-gray-600">10 relationship questions! No wrong answers.</p><Button onClick={start} variant="primary" size="lg" className="w-full">Start Quiz 💕</Button></div></TiltCard></motion.div>)}
          {phase==='playing'&&(<motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} key={idx} className="space-y-4"><div className="w-full bg-white/50 rounded-full h-2 border border-pink-100"><motion.div className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-rose-500" animate={{width:`${(idx/Q.length)*100}%`}}/></div><TiltCard intensity={5} glowColor="rgba(236,72,153,0.1)"><div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 space-y-5"><p className="text-lg font-semibold text-gray-800 leading-relaxed text-center">{Q[idx].q}</p><div className="grid grid-cols-1 gap-3">{Q[idx].opts.map((opt,i)=>{let bg='bg-white border-gray-200 text-gray-700 hover:border-primary-300';if(selected!==null){if(i===Q[idx].a)bg='bg-green-50 border-green-400 text-green-700';else if(i===selected)bg='bg-red-50 border-red-400 text-red-700';else bg='opacity-50 border-gray-200 text-gray-400';}return(<motion.button key={i} whileTap={selected===null?{scale:0.97}:{}} onClick={()=>answer(i)} disabled={selected!==null} className={`w-full text-left px-4 py-3 rounded-xl border-2 font-medium transition-all ${bg}`}><span className="mr-2 text-lg">{String.fromCharCode(65+i)}.</span> {opt}</motion.button>);})}</div></div></TiltCard></motion.div>)}
          {phase==='result'&&(<motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}><TiltCard intensity={5} glowColor="rgba(236,72,153,0.1)"><div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4"><div className="text-6xl">💕</div><h2 className="text-3xl font-display font-bold text-gray-800">{score>=70?'Lovebirds! 🕊️':'Sweet Hearts! 💗'}</h2><p className="text-xl text-gray-700 font-semibold">{score} points</p><Button onClick={start} variant="primary" className="w-full">Play Again 💕</Button></div></TiltCard></motion.div>)}
        </div>
      </div>
    </PremiumBackground>
  );
}
