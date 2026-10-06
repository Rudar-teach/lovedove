'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Sparkles, RotateCcw, Music, Play, Plus } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const SUGGESTED: Record<string, { name: string; artist: string; emoji: string }[]> = {
  romantic: [
    { name: 'All of Me', artist: 'John Legend', emoji: '🎹' },
    { name: 'Perfect', artist: 'Ed Sheeran', emoji: '🎸' },
    { name: 'At Last', artist: 'Etta James', emoji: '🎷' },
    { name: 'A Thousand Years', artist: 'Christina Perri', emoji: '💒' },
  ],
  dance: [
    { name: 'Shut Up and Dance', artist: 'Walk the Moon', emoji: '🕺' },
    { name: 'Uptempo Funk', artist: 'Bruno Mars', emoji: '🎤' },
  ],
  cozy: [
    { name: 'Lover', artist: 'Taylor Swift', emoji: '💕' },
    { name: 'Just the Two of Us', artist: 'Bill Withers', emoji: '☀️' },
  ],
  adventure: [
    { name: 'Life is a Highway', artist: 'Tom Cochrane', emoji: '🛣️' },
    { name: 'On Top of the World', artist: 'Imagine Dragons', emoji: '🏔️' },
  ],
  passion: [
    { name: 'Crazy in Love', artist: 'Beyoncé', emoji: '🔥' },
    { name: 'Love on the Brain', artist: 'Rihanna', emoji: '💜' },
  ],
};

type Mood = 'romantic' | 'dance' | 'cozy' | 'adventure' | 'passion';
type Phase = 'start' | 'add' | 'playlist' | 'playing';

export default function CouplePlaylistPage() {
  const [phase, setPhase] = useState<Phase>('start');
  const [mood, setMood] = useState<Mood>('romantic');
  const [playlist, setPlaylist] = useState<Record<string, { name: string; artist: string; emoji: string; addedBy: 'p1' | 'p2' }[]>>(
    { romantic: [], dance: [], cozy: [], adventure: [], passion: [] }
  );
  const [songName, setSongName] = useState('');
  const [artist, setArtist] = useState('');
  const [turn, setTurn] = useState<'p1' | 'p2'>('p1');
  const [nowPlaying, setNowPlaying] = useState<{ name: string; artist: string; emoji: string } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('couple-playlist-v2');
    if (saved) { try { setPlaylist(JSON.parse(saved)); } catch {} }
  }, []);

  useEffect(() => {
    if (Object.values(playlist).some(p => p.length > 0)) {
      localStorage.setItem('couple-playlist-v2', JSON.stringify(playlist));
    }
  }, [playlist]);

  const addSong = () => {
    if (!songName.trim()) return;
    setPlaylist(p => ({ ...p, [mood]: [...p[mood], { name: songName, artist: artist || 'Unknown', emoji: '🎵', addedBy: turn }] }));
    setSongName('');
    setArtist('');
    setTurn(t => t === 'p1' ? 'p2' : 'p1');
  };

  const addSuggested = (s: typeof SUGGESTED['romantic'][0]) => {
    setPlaylist(p => ({ ...p, [mood]: [...p[mood], { ...s, addedBy: turn }] }));
    setTurn(t => t === 'p1' ? 'p2' : 'p1');
  };

  const remove = (m: Mood, i: number) => setPlaylist(p => ({ ...p, [m]: p[m].filter((_, idx) => idx !== i) }));

  const allSongs = Object.values(playlist).flat();
  const total = allSongs.length;
  const moodLabels: Record<Mood, { label: string; emoji: string; color: string }> = {
    romantic: { label: 'Romantic', emoji: '💕', color: 'from-pink-400 to-rose-500' },
    dance: { label: 'Dance Party', emoji: '💃', color: 'from-purple-400 to-pink-500' },
    cozy: { label: 'Cozy Night', emoji: '🕯️', color: 'from-orange-400 to-red-500' },
    adventure: { label: 'Adventure', emoji: '🌄', color: 'from-green-400 to-teal-500' },
    passion: { label: 'Passionate', emoji: '🔥', color: 'from-red-500 to-purple-600' },
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button>
            </Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1">
              <Music className="w-5 h-5 text-rose-500" /> Our Playlist
            </h1>
            <button onClick={() => setPhase('start')} className="p-2 hover:bg-white rounded-full transition-colors">
              <RotateCcw className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {phase === 'start' && (
              <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <div className="text-6xl">🎵</div>
                    <h2 className="text-2xl font-display font-bold text-gray-800">Couple's Playlist</h2>
                    <p className="text-gray-600">Build the perfect soundtrack together — add songs for every mood and moment.</p>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="bg-pink-50 rounded-xl p-2">
                        <p className="text-xl font-black text-rose-500">{total}</p>
                        <p className="text-[10px] text-gray-600">Songs</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-2">
                        <p className="text-xl font-black text-blue-500">{allSongs.filter(s => s.addedBy === 'p1').length}</p>
                        <p className="text-[10px] text-gray-600">By P1</p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-2">
                        <p className="text-xl font-black text-purple-500">{allSongs.filter(s => s.addedBy === 'p2').length}</p>
                        <p className="text-[10px] text-gray-600">By P2</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button onClick={() => setPhase('add')} variant="primary" className="w-full">Add Songs ➕</Button>
                      <Button onClick={() => setPhase('playlist')} variant="outline" className="w-full">View All 🎧</Button>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {phase === 'add' && (
              <motion.div key="add" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-3">
                  <span className="text-sm text-gray-600">
                    {turn === 'p1' ? '👤 Player 1' : '💖 Player 2'} — your turn!
                  </span>
                </div>
                <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.05)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 space-y-3">
                    <div className="flex gap-1 overflow-x-auto">
                      {(Object.keys(playlist) as Mood[]).map(m => {
                        const ml = moodLabels[m];
                        return (
                          <button key={m} onClick={() => setMood(m)}
                            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold ${
                              mood === m ? `bg-gradient-to-r ${ml.color} text-white` : 'bg-gray-100 text-gray-600'
                            }`}>
                            {ml.emoji} {ml.label}
                          </button>
                        );
                      })}
                    </div>
                    <input value={songName} onChange={e => setSongName(e.target.value)} placeholder="Song name..."
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-sm" />
                    <input value={artist} onChange={e => setArtist(e.target.value)} placeholder="Artist (optional)..."
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-pink-400 outline-none text-sm" />
                    <Button onClick={addSong} variant="primary" className="w-full">
                      <Plus className="w-4 h-4 mr-2" /> Add Song
                    </Button>
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Quick picks for {moodLabels[mood].label}:</p>
                      <div className="grid grid-cols-2 gap-1">
                        {SUGGESTED[mood].map((s, i) => (
                          <button key={i} onClick={() => addSuggested(s)}
                            className="text-left text-xs p-2 rounded-lg hover:bg-pink-50 text-gray-600 transition-colors">
                            <span className="font-bold">{s.name}</span>
                            <p className="text-[10px] text-gray-400">{s.artist}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </TiltCard>
                <Button onClick={() => setPhase('playlist')} variant="outline" className="w-full mt-4">View Playlist</Button>
              </motion.div>
            )}

            {phase === 'playlist' && (
              <motion.div key="playlist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                  {(Object.keys(playlist) as Mood[]).map(m => {
                    const ml = moodLabels[m];
                    return playlist[m].length > 0 && (
                      <div key={m}>
                        <h3 className={`text-sm font-bold bg-gradient-to-r ${ml.color} text-white inline-block px-3 py-1 rounded-full mb-2`}>
                          {ml.emoji} {ml.label}
                        </h3>
                        <div className="space-y-1.5">
                          {playlist[m].map((s, i) => (
                            <div key={i} className="flex items-center gap-2 p-2.5 bg-white/70 backdrop-blur-xl rounded-xl border border-pink-100/60">
                              <button onClick={() => { setNowPlaying(s); setPhase('playing'); }}
                                className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center hover:bg-pink-200">
                                <Play className="w-3 h-3 text-pink-600" />
                              </button>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                                <p className="text-[10px] text-gray-500">{s.artist} • {s.addedBy === 'p1' ? '👤' : '💖'}</p>
                              </div>
                              <span>{s.emoji}</span>
                              <button onClick={() => remove(m, i)} className="text-red-300 text-xs">×</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button onClick={() => setPhase('start')} variant="primary" className="w-full mt-4">Back</Button>
              </motion.div>
            )}

            {phase === 'playing' && nowPlaying && (
              <motion.div key="playing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <TiltCard intensity={6} glowColor="rgba(236, 72, 153, 0.2)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-6xl">
                      {nowPlaying.emoji}
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-800">{nowPlaying.name}</h3>
                    <p className="text-gray-500">{nowPlaying.artist}</p>
                    <div className="flex items-center justify-center gap-1.5 h-8">
                      {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <motion.div key={i} animate={{ height: ['20%', '100%', '20%'] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.08 }}
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
