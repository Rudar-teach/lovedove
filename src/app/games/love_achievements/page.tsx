'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles, RotateCcw, Music, Play, Plus } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const DEFAULT_SONGS: Record<string, { name: string; artist: string; emoji: string }[]> = {
  romance: [
    { name: 'All of Me', artist: 'John Legend', emoji: '🎹' },
    { name: 'Perfect', artist: 'Ed Sheeran', emoji: '🎸' },
    { name: 'At Last', artist: 'Etta James', emoji: '🎷' },
  ],
  passion: [
    { name: 'Crazy in Love', artist: 'Beyoncé', emoji: '🔥' },
    { name: 'Love on the Brain', artist: 'Rihanna', emoji: '💜' },
  ],
  vibes: [
    { name: 'Lover', artist: 'Taylor Swift', emoji: '💕' },
    { name: 'Just the Two of Us', artist: 'Bill Withers', emoji: '☀️' },
  ],
  roadtrip: [
    { name: 'Shut Up and Drive', artist: 'Rihanna', emoji: '🚗' },
    { name: 'Life is a Highway', artist: 'Tom Cochrane', emoji: '🛣️' },
  ],
};

type Mood = 'romance' | 'passion' | 'vibes' | 'roadtrip';
type Phase = 'start' | 'add' | 'playlist' | 'playing';

export default function CouplePlaylistPage() {
  const [phase, setPhase] = useState<Phase>('start');
  const [mood, setMood] = useState<Mood>('romance');
  const [songs, setSongs] = useState<Record<string, typeof DEFAULT_SONGS['romance']>>(DEFAULT_SONGS);
  const [songName, setSongName] = useState('');
  const [artist, setArtist] = useState('');
  const [playing, setPlaying] = useState<{ name: string; artist: string; emoji: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<'player1' | 'player2'>('player1');
  const [totalAdded, setTotalAdded] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('couple-playlist');
    if (saved) { try { setSongs(JSON.parse(saved)); } catch {} }
  }, []);

  useEffect(() => {
    localStorage.setItem('couple-playlist', JSON.stringify(songs));
  }, [songs]);

  const addSong = () => {
    if (!songName.trim()) return;
    setSongs(s => ({
      ...s,
      [mood]: [...s[mood], { name: songName, artist: artist || 'Unknown', emoji: '🎵' }]
    }));
    setSongName('');
    setArtist('');
    setTotalAdded(t => t + 1);
    setCurrentUser(currentUser === 'player1' ? 'player2' : 'player1');
  };

  const removeSong = (m: Mood, idx: number) => {
    setSongs(s => ({ ...s, [m]: s[m].filter((_, i) => i !== idx) }));
  };

  const allSongs = Object.values(songs).flat();
  const moodLabels: Record<Mood, string> = { romance: '💕 Romance', passion: '🔥 Passion', vibes: '✨ Good Vibes', roadtrip: '🚗 Road Trip' };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button>
            </Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1">
              <Music className="w-5 h-5 text-rose-500" /> Couple Playlist
            </h1>
            <button onClick={() => { setPhase('start'); setCurrentUser('player1'); }} className="p-2 hover:bg-white rounded-full transition-colors">
              <RotateCcw className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {phase === 'start' && (
              <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">🎧</div>
                    <h2 className="text-2xl font-display font-bold text-gray-800">Couple Playlist</h2>
                    <p className="text-gray-600">Build the perfect soundtrack for your relationship together — add songs that mean something to you both.</p>
                    <div className="bg-pink-50 rounded-2xl p-3 text-sm text-pink-700">
                      <p className="font-bold">Total songs: {allSongs.length}</p>
                      <p className="text-xs">from {Object.keys(songs).length} moods</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button onClick={() => setPhase('playlist')} variant="primary" size="lg" className="w-full">View Playlist 🎵</Button>
                      <Button onClick={() => setPhase('add')} variant="outline" className="w-full">Add Songs ➕</Button>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'playlist' && (
              <motion.div key="playlist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                  {(Object.keys(songs) as Mood[]).map(m => (
                    <button key={m} onClick={() => setMood(m)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${
                        mood === m ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white' : 'bg-white border border-gray-200 text-gray-600'
                      }`}>
                      {moodLabels[m]}
                    </button>
                  ))}
                </div>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {songs[mood].map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-xl rounded-2xl border border-pink-100/60">
                      <button onClick={() => { setPlaying(s); setPhase('playing'); }}
                        className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center hover:bg-pink-200 transition-colors">
                        <Play className="w-4 h-4 text-pink-600" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-800 truncate">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.artist}</p>
                      </div>
                      <span className="text-xl">{s.emoji}</span>
                      <button onClick={() => removeSong(mood, i)} className="text-red-300 hover:text-red-500 text-xs">×</button>
                    </div>
                  ))}
                </div>
                <Button onClick={() => setPhase('start')} variant="outline" className="w-full mt-4">Back</Button>
              </motion.div>
            )}

            {phase === 'add' && (
              <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-3">
                  <span className="text-sm text-gray-600">
                    {currentUser === 'player1' ? '👤 Player 1' : '💖 Player 2'} — Add a song!
                  </span>
                </div>
                <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.08)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 space-y-3">
                    <div className="flex gap-2">
                      {(Object.keys(songs) as Mood[]).map(m => (
                        <button key={m} onClick={() => setMood(m)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold ${
                            mood === m ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                          {moodLabels[m].split(' ')[1]}
                        </button>
                      ))}
                    </div>
                    <input value={songName} onChange={e => setSongName(e.target.value)} placeholder="Song name"
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-sm" />
                    <input value={artist} onChange={e => setArtist(e.target.value)} placeholder="Artist"
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-sm" />
                    <Button onClick={addSong} variant="primary" className="w-full">
                      <Plus className="w-4 h-4 mr-2" /> Add Song
                    </Button>
                  </div>
                </TiltCard>
                <Button onClick={() => setPhase('playlist')} variant="outline" className="w-full mt-4">View Playlist</Button>
              </motion.div>
            )}

            {phase === 'playing' && playing && (
              <motion.div key="playing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <TiltCard intensity={6} glowColor="rgba(236, 72, 153, 0.2)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-6xl">
                      {playing.emoji}
                    </motion.div>
                    <h3 className="text-xl font-bold text-gray-800">{playing.name}</h3>
                    <p className="text-gray-500">{playing.artist}</p>
                    <div className="flex items-center justify-center gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <motion.div key={i} animate={{ height: [8, 20, 8] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                          className="w-1 bg-rose-500 rounded-full" />
                      ))}
                    </div>
                    <Button onClick={() => setPhase('playlist')} variant="outline">Stop ⏹️</Button>
                  </div>
                </TiltCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PremiumBackground>
  );
}
