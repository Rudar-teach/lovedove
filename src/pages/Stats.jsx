import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Stats() {
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [badges, setBadges] = useState([]);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    if (user) {
      loadStats();
      loadBadges();
    }
  }, [user]);

  const loadStats = async () => {
    const { data } = await supabase
      .from('game_stats')
      .select('*')
      .eq('user_id', user.id);
    if (data) {
      setStats(data);
      const total = data.reduce((s, g) => s + (g.total_time_played || 0), 0);
      setTotalTime(total);
    }
  };

  const loadBadges = async () => {
    const { data } = await supabase
      .from('user_badges')
      .select('*, badge:badges(*)')
      .eq('user_id', user.id);
    if (data) setBadges(data);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h} hours ${m} minutes`;
    return `${m} minutes`;
  };

  const gameNames = {
    'tictactoe': '⭕ Tic-Tac-Toe',
    'memory': '🎴 Memory Match',
    'quiz': '💡 Couple Quiz',
    'wouldyourather': '🤔 Would You Rather',
    'wordchain': '🔤 Word Chain'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">📊 My Stats & Badges</h1>
        <p className="text-gray-600 mt-1">Track your journey together</p>
      </div>

      {/* Total Time */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-8 text-white shadow-lg text-center">
        <div className="text-6xl mb-2">⏱️</div>
        <h2 className="text-4xl font-bold">Total Time Played</h2>
        <p className="text-5xl font-bold mt-2">{formatTime(totalTime)}</p>
        <p className="text-pink-100 mt-2">Together is the best place to be 💕</p>
      </div>

      {/* Game Breakdown */}
      <div className="bg-white rounded-2xl shadow-md border border-pink-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🎮 Game Stats</h2>
        {stats.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No games played yet. Start playing!</p>
        ) : (
          <div className="space-y-3">
            {stats.map(s => (
              <div key={s.id} className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
                <div>
                  <p className="font-medium">{gameNames[s.game_type] || s.game_type}</p>
                  <p className="text-sm text-gray-500">Last played: {s.last_played ? new Date(s.last_played).toLocaleString() : 'Never'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-pink-600">{s.games_played} games</p>
                  <p className="text-sm text-gray-600">🏆 {s.wins}W / {s.losses}L</p>
                  <p className="text-sm text-gray-600">⏱️ {formatTime(s.total_time_played)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Badges */}
      <div className="bg-white rounded-2xl shadow-md border border-pink-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🏆 Achievements ({badges.length})</h2>
        {badges.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No badges yet. Play games to earn them!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map(b => (
              <div key={b.id} className="text-center p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                <div className="text-5xl mb-2">{b.badge?.icon || '🏆'}</div>
                <p className="font-bold text-sm">{b.badge?.name}</p>
                <p className="text-xs text-gray-500 mt-1">{b.badge?.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
