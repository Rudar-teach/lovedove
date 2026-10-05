'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Trophy, Clock, Gamepad2, Heart, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

const GAME_NAMES: Record<string, { name: string; icon: string }> = {
  tictactoe: { name: 'Tic-Tac-Toe', icon: '⭕❌' },
  memory: { name: 'Memory Match', icon: '🎴' },
  quiz: { name: 'Couple Quiz', icon: '💡' },
  wouldyourather: { name: 'Would You Rather', icon: '🤔' },
  wordchain: { name: 'Word Chain', icon: '🔤' },
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuthStore();
  const [stats, setStats] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [anniversary, setAnniversary] = useState('');

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login');
    else if (user) {
      setBio(user.bio || '');
      setAnniversary(user.anniversary_date || '');
      loadStats();
    }
  }, [isAuthenticated, user]);

  const loadStats = async () => {
    if (!user) return;
    const { data: gameStats } = await supabase.from('game_stats').select('*').eq('user_id', user.id).order('total_time_played', { ascending: false });
    if (gameStats) setStats(gameStats);

    const { data: ubadges } = await supabase.from('user_badges').select('*, badges(*)').eq('user_id', user.id);
    if (ubadges) setBadges(ubadges);
  };

  const saveProfile = async () => {
    const { error } = await supabase.from('profiles').update({ bio, anniversary_date: anniversary || null, updated_at: new Date().toISOString() }).eq('id', user!.id);
    if (!error) {
      toast.success('Profile updated! 💕');
      setUser({ ...user!, bio, anniversary_date: anniversary || null });
      setEditing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  if (!isAuthenticated || !user) return null;

  const totalTime = stats.reduce((sum, s) => sum + s.total_time_played, 0);
  const totalGames = stats.reduce((sum, s) => sum + s.games_played, 0);
  const totalWins = stats.reduce((sum, s) => sum + s.wins, 0);
  const hours = Math.floor(totalTime / 3600);
  const minutes = Math.floor((totalTime % 3600) / 60);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
          <h1 className="text-2xl font-display font-bold gradient-text">My Profile</h1>
          <button onClick={handleLogout} className="p-2 hover:bg-white rounded-full transition-colors text-red-500" title="Logout">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary-400 via-rose-400 to-pink-500 relative">
            <div className="absolute -bottom-12 left-8 w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-rose-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-xl">
              {user.full_name?.[0]?.toUpperCase()}
            </div>
          </div>
          <div className="pt-16 px-8 pb-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-3xl font-display font-bold text-gray-900">{user.full_name}</h2>
                <p className="text-gray-500">@{user.username}</p>
                <p className="text-sm text-gray-500 mt-1">📧 {user.email}</p>
              </div>
              <button onClick={() => setEditing(!editing)} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full transition-colors">
                <Edit className="w-4 h-4" /> {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editing ? (
              <div className="space-y-3 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Tell us about yourself and your love story..." className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-primary-500 outline-none resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Anniversary Date</label>
                  <Input type="date" value={anniversary} onChange={(e) => setAnniversary(e.target.value)} />
                </div>
                <Button onClick={saveProfile} className="w-full">Save Changes</Button>
              </div>
            ) : (
              <div className="space-y-3 mt-4">
                {user.bio && <p className="text-gray-700">{user.bio}</p>}
                {user.anniversary_date && (
                  <p className="text-gray-600 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-primary-500" />
                    Together since {new Date(user.anniversary_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card><div className="p-5 text-center"><Gamepad2 className="w-8 h-8 text-primary-500 mx-auto mb-2" /><p className="text-3xl font-bold">{totalGames}</p><p className="text-sm text-gray-500">Games</p></div></Card>
          <Card><div className="p-5 text-center"><Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" /><p className="text-3xl font-bold">{totalWins}</p><p className="text-sm text-gray-500">Wins</p></div></Card>
          <Card><div className="p-5 text-center"><Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" /><p className="text-3xl font-bold">{hours}h</p><p className="text-sm text-gray-500">Played</p></div></Card>
          <Card><div className="p-5 text-center"><Heart className="w-8 h-8 text-rose-500 mx-auto mb-2" /><p className="text-3xl font-bold">{badges.length}</p><p className="text-sm text-gray-500">Badges</p></div></Card>
        </div>

        {/* Games Breakdown */}
        <Card className="mb-6">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Gamepad2 className="w-5 h-5 text-primary-500" /> Games Breakdown</h3>
            {stats.length > 0 ? (
              <div className="space-y-3">
                {stats.map(s => {
                  const hrs = Math.floor(s.total_time_played / 3600);
                  const mins = Math.floor((s.total_time_played % 3600) / 60);
                  return (
                    <div key={s.id} className="flex items-center justify-between p-4 bg-pink-50/50 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{GAME_NAMES[s.game_type]?.icon || '🎮'}</span>
                        <div>
                          <p className="font-semibold text-gray-900">{GAME_NAMES[s.game_type]?.name || s.game_type}</p>
                          <p className="text-xs text-gray-500">Last played {new Date(s.last_played).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{s.games_played} games</p>
                        <p className="text-xs text-gray-500">{hrs}h {mins}m played</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-center text-gray-500 py-8">No games played yet. Start playing! 🎮</p>}
          </div>
        </Card>

        {/* Badges */}
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> My Badges</h3>
            {badges.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map(b => (
                  <div key={b.id} className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                    <div className="text-5xl mb-2">{b.badges?.icon}</div>
                    <p className="font-bold text-gray-900 text-sm">{b.badges?.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{b.badges?.description}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-center text-gray-500 py-8">No badges yet. Play 10 hours to earn one! 🏆</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}