'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Play, RotateCcw, Music, Plus } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

const DEFAULT_SONGS = [
  { id: 1, title: "Perfect", artist: "Ed Sheeran", reason: "Our wedding song" },
  { id: 2, title: "All of Me", artist: "John Legend", reason: "For when you feel loved" },
  { id: 3, title: "Thinking Out Loud", artist: "Ed Sheeran", reason: "Dancing slow" },
  { id: 4, title: "At Last", artist: "Etta James", reason: "Classic romance" },
  { id: 5, title: "A Thousand Years", artist: "Christina Perri", reason: "Forever together" },
  { id: 6, title: "Latch", artist: "Sam Smith", reason: "Romantic vibes" },
];

export default function CouplePlaylist() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [playlist, setPlaylist] = useState<typeof DEFAULT_SONGS>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newReason, setNewReason] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const startGame = () => {
    setGameState('playing');
    setPlaylist(DEFAULT_SONGS.map(s => ({ ...s })));
  };

  const addSong = () => {
    if (!newTitle.trim() || !newArtist.trim()) return;
    setPlaylist(prev => [...prev, {
      id: Date.now(),
      title: newTitle.trim(),
      artist: newArtist.trim(),
      reason: newReason.trim() || 'Our song'
    }]);
    setNewTitle('');
    setNewArtist('');
    setNewReason('');
    setShowAdd(false);
  };

  const removeSong = (id: number) => {
    setPlaylist(prev => prev.filter(s => s.id !== id));
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <Link href="/games" className="hidden md:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-purple-600 px-4 py-2 rounded-xl hover:bg-white/60 transition-colors">
                  <ArrowLeft className="w-4 h-4 rotate-180" /> All Games
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-6">🎧</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">Couple Playlist</h1>
              <p className="text-gray-600 mb-8 text-lg">Build your shared love playlist!</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-purple-100/60 p-6 mb-8 max-w-md mx-auto text-left">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Heart className="w-5 h-5 text-purple-500" /> How it works:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>🎵 Start with romantic classics</li>
                  <li>➕ Add your own favorite songs</li>
                  <li>💕 Write why each song matters</li>
                  <li>🎧 Build your couple's anthem list!</li>
                </ul>
              </div>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all">
                <Play className="w-5 h-5 inline mr-2" /> Start
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-display font-black text-gray-900">Our Playlist</h2>
                <span className="text-sm font-medium text-purple-600 font-bold">{playlist.length} songs</span>
              </div>

              <div className="space-y-3 mb-6">
                {playlist.map((song, i) => (
                  <motion.div key={song.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-purple-100/60 p-4 flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900">{song.title}</p>
                      <p className="text-sm text-gray-500">{song.artist}</p>
                      <p className="text-xs text-purple-600 mt-1 italic">"{song.reason}"</p>
                    </div>
                    <button onClick={() => removeSong(song.id)} className="text-gray-400 hover:text-red-500 text-sm flex-shrink-0">
                      Remove
                    </button>
                  </motion.div>
                ))}
              </div>

              {!showAdd ? (
                <button onClick={() => setShowAdd(true)}
                  className="w-full py-4 border-2 border-dashed border-purple-300 rounded-2xl text-purple-600 font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" /> Add a Song
                </button>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-purple-100/60 p-6">
                  <h3 className="font-bold text-gray-900 mb-3">Add a Song</h3>
                  <div className="space-y-3">
                    <input type="text" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                      placeholder="Song title..." className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white outline-none focus:border-purple-500" />
                    <input type="text" value={newArtist} onChange={e => setNewArtist(e.target.value)}
                      placeholder="Artist..." className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white outline-none focus:border-purple-500" />
                    <input type="text" value={newReason} onChange={e => setNewReason(e.target.value)}
                      placeholder="Why this song matters..." className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white outline-none focus:border-purple-500" />
                    <div className="flex gap-2">
                      <button onClick={addSong} disabled={!newTitle.trim() || !newArtist.trim()}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold rounded-xl disabled:opacity-50">
                        Add to Playlist
                      </button>
                      <button onClick={() => setShowAdd(false)}
                        className="px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-600">
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
