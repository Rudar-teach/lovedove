'use client';
import { useState } from 'react';

import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

export default function Couplememory2Page() {

  const [cards, setCards] = useState<{id:number;icon:string;flipped:boolean;matched:boolean}[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const pairs = ["💕","💖","💗","💓","💘","💝","❤️","🌹","💍","🎁","✨","🫶"];
  const shuffle = () => {
    const all = [...pairs, ...pairs].sort(() => Math.random() - 0.5);
    setCards(all.map((icon, i) => ({id:i, icon, flipped:false, matched:false})));
    setMoves(0); setMatches(0);
  };
  const click = (i: number) => {
    if (cards[i].flipped || cards[i].matched || cards.filter(c => c.flipped).length === 2) return;
    const newCards = cards.map((card, idx) => idx === i ? {...card, flipped:true} : card);
    setCards(newCards);
    const fc = newCards.filter(c => c.flipped && !c.matched);
    if (fc.length === 2) {
      setTimeout(() => {
        if (fc[0].icon === fc[1].icon) {
          setCards(c => c.map(card => fc.some(f => f.id === card.id) ? {...card, matched:true} : card));
          setMatches(m => m + 1);
        } else {
          setCards(c => c.map(card => fc.some(f => f.id === card.id) ? {...card, flipped:false} : card));
        }
      }, 600);
    }
  };
  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700"/></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary-500"/> Memory Cards</h1>
            <div className="w-16"/>
          </div>
          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">🎴</div>
                <h2 className="text-2xl font-display font-bold text-gray-800">Memory Cards</h2>
                <p className="text-gray-600">Match 12 pairs of love symbols</p>
              </div>
              
      <div className="flex justify-center gap-4 mb-4">
        <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100"><p className="text-xs text-gray-500">Moves</p><p className="text-xl font-bold text-gray-800">{moves}</p></div>
        <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100"><p className="text-xs text-gray-500">Matches</p><p className="text-xl font-bold text-primary-600">{matches}/12</p></div>
      </div>
      <TiltCard intensity={5} glowColor="rgba(236,72,153,0.1)">
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-4">
          <div className="grid grid-cols-4 gap-2">
            {cards.map((card, i) => (<button key={card.id} onClick={() => click(i)} className={"aspect-square rounded-xl text-3xl flex items-center justify-center transition-all " + (card.flipped || card.matched ? 'bg-white shadow-md border-2 border-primary-200' : 'bg-gradient-to-br from-primary-400 to-rose-500 shadow-lg')}>{card.flipped || card.matched ? card.icon : '💕'}</button>))}
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
