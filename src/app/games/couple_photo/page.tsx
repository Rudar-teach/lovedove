'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Camera } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const CHALLENGES = [
  { title: "Cute Selfie", desc: "Take a silly selfie together!", emoji: '🤳' },
  { title: "Puppy Eyes", desc: "Make puppy eyes at each other for 30 seconds", emoji: '🐶' },
  { title: "Dance Break", desc: "Do a 30-second dance to your song", emoji: '💃' },
  { title: "Food Face", desc: "Make funny faces while eating", emoji: '😋' },
  { title: "Recreate First Pic", desc: "Recreate your first photo together", emoji: '📸' },
  { title: "Funny Faces", desc: "Make the silliest faces possible", emoji: '😜' },
  { title: "Dress Up", desc: "Swap clothes and take a photo", emoji: '👔👗' },
  { title: "Pillow Fight", desc: "Have a 10-second pillow fight", emoji: '🛏️' },
  { title: "Build a Fort", desc: "Build a blanket fort together", emoji: '🏕️' },
  { title: "Food Art", desc: "Create art with your food", emoji: '🎨' },
  { title: "Shadow Selfie", desc: "Take a silhouette photo together", emoji: '🌅' },
  { title: "Meme Face", desc: "Recreate a famous meme face", emoji: '😂' },
];

export default function CouplePhoto() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [challenges, setChallenges] = useState<typeof CHALLENGES>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [photos, setPhotos] = useState<{title: string; desc: string; emoji: string}[]>([]);

  const startGame = () => {
    const shuffled = [...CHALLENGES].sort(() => Math.random() - 0.5);
    setChallenges(shuffled);
    setCurrentIdx(0);
    setPhotos([]);
    setGameState('playing');
  };

  const completeChallenge = () => {
    const c = challenges[currentIdx];
    setPhotos(prev => [...prev, { title: c.title, desc: c.desc, emoji: c.emoji }]);
    if (currentIdx < challenges.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      setGameState('finished');
    }
  };

  const skipChallenge = () => {
    if (currentIdx < challenges.length - 1) {
      setCurrentIdx(i => i + 1);
    } else {
      setGameState('finished');
    }
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50"><div className="glass-strong border-b border-white/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6"><div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg"><Heart className="w-4 h-4 text-white" fill="white" /></div>
                <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
              </Link>
            </div>
            <Link href="/games" className="hidden md:flex items-center gap-2 text-sm text-gray-600 px-4 py-2 rounded-xl hover:bg-white/60"><ArrowLeft className="w-4 h-4 rotate-180" /> All Games</Link>
          </div></div>
        </div></nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">📸</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Couple Photo Challenge</h1>
              <p className="text-gray-600 mb-8 text-lg">Capture fun moments with these photo challenges!</p>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all"><Camera className="w-5 h-5 inline mr-2" /> Start Challenge</button>
            </motion.div>
          )}
          {gameState === 'playing' && challenges[currentIdx] && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-4">
                <span className="text-sm font-medium text-gray-600">Challenge {currentIdx + 1} / {challenges.length}</span>
              </div>
              <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${((currentIdx + 1) / challenges.length) * 100}%` }} />
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-[2rem] shadow-2xl p-12 mb-6 text-center text-white">
                <div className="text-7xl mb-4">{challenges[currentIdx].emoji}</div>
                <h2 className="text-2xl font-black mb-2">{challenges[currentIdx].title}</h2>
                <p className="text-lg text-white/80">{challenges[currentIdx].desc}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={skipChallenge} className="flex-1 px-4 py-4 bg-white/50 rounded-2xl font-bold text-gray-600 hover:bg-white/70 transition-colors">Skip</button>
                <button onClick={completeChallenge} className="flex-1 px-4 py-4 bg-white/70 rounded-2xl font-bold text-gray-700 hover:bg-white transition-colors"><Camera className="w-4 h-4 inline mr-1" /> Done!</button>
              </div>
            </motion.div>
          )}
          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">📸</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">Photo Star!</h2>
              <p className="text-gray-600 mb-8">You completed {photos.length} photo challenges!</p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {photos.map((p, i) => (
                  <div key={i} className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 text-center border border-purple-100/60">
                    <div className="text-3xl mb-2">{p.emoji}</div>
                    <p className="text-sm font-bold text-gray-900">{p.title}</p>
                    <p className="text-xs text-gray-500">{p.desc}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 justify-center">
                <button onClick={startGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold"><RotateCcw className="w-5 h-5 inline mr-2" /> Again</button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl text-white font-bold">More Games</Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
