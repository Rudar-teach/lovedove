'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Trophy, Lock, Flame, Clock, Heart, Crown, Star, Target, Zap, Award } from 'lucide-react';

interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  requirement_type: string;
  requirement_value: number;
  category: string;
  rarity: string;
}

interface UserBadge {
  id: string;
  badge: Badge;
  earned_at: string;
  progress: number;
  is_earned: boolean;
}

export default function BadgesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/auth/login'; return; }
      setUserId(user.id);
      fetchBadges();
    };
    getUser();
  }, [supabase.auth]);

  useEffect(() => {
    fetchBadges();
  }, [filter]);

  const fetchBadges = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let badgesQuery = supabase.from('badges').select('*');
      if (filter !== 'all') {
        badgesQuery = badgesQuery.eq('category', filter);
      }
      const { data: badges } = await badgesQuery.order('requirement_value', { ascending: true });

      const { data: userBadgeData } = await supabase
        .from('user_achievements')
        .select('*, badge:badges(*)')
        .eq('user_id', user.id);

      if (badges) setAllBadges(badges);

      if (userBadgeData) {
        const formatted = userBadgeData.map((ub: any) => ({
          id: ub.id,
          badge: ub.badge,
          earned_at: ub.earned_at,
          progress: ub.progress || 0,
          is_earned: !!ub.earned_at,
        }));
        setUserBadges(formatted);
      }
    } catch (err) {
      console.error('Error fetching badges:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeProgress = (badge: Badge): { earned: boolean; progress: number } => {
    const userBadge = userBadges.find(ub => ub.badge.slug === badge.slug);
    if (userBadge) return { earned: userBadge.is_earned, progress: userBadge.progress || badge.requirement_value };

    // Calculate progress based on requirement type
    // This would normally query actual user stats
    return { earned: false, progress: Math.floor(Math.random() * badge.requirement_value * 0.5) };
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      common: 'border-gray-300 bg-gray-50',
      rare: 'border-blue-300 bg-blue-50',
      epic: 'border-purple-300 bg-purple-50',
      legendary: 'border-amber-300 bg-amber-50 shadow-lg shadow-amber-100',
    };
    return colors[rarity] || 'border-gray-200 bg-white';
  };

  const getRarityBadge = (rarity: string) => {
    const colors: Record<string, string> = {
      common: 'bg-gray-200 text-gray-600',
      rare: 'bg-blue-200 text-blue-700',
      epic: 'bg-purple-200 text-purple-700',
      legendary: 'bg-amber-200 text-amber-700',
    };
    return colors[rarity] || 'bg-gray-200 text-gray-600';
  };

  const categories = ['all', 'time', 'games', 'social', 'special'];

  const categoryLabels: Record<string, string> = {
    all: 'All Badges',
    time: 'Time Played',
    games: 'Game Achievements',
    social: 'Social',
    special: 'Special',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="animate-spin w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  const earnedCount = userBadges.filter(ub => ub.is_earned).length;
  const totalCount = allBadges.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-pink-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Love Dove
          </Link>
          <span className="text-sm text-gray-500 bg-pink-100 px-3 py-1 rounded-full">
            {earnedCount}/{totalCount} badges earned
          </span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-pink-100">
          <div className="flex items-center gap-4 mb-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Your Badge Collection</h2>
              <p className="text-sm text-gray-500">{earnedCount} out of {totalCount} badges earned</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-pink-500 to-purple-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${totalCount > 0 ? (earnedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
          {earnedCount === totalCount && totalCount > 0 && (
            <p className="text-center text-sm text-pink-600 font-medium mt-2">🏆 All badges collected! You're amazing!</p>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === cat
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-pink-50 border border-gray-200'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allBadges.map(badge => {
            const progress = getBadgeProgress(badge);
            const percentage = Math.min((progress.progress / badge.requirement_value) * 100, 100);

            return (
              <div
                key={badge.id}
                className={`relative rounded-2xl p-5 border-2 transition-all ${
                  progress.earned
                    ? `${getRarityColor(badge.rarity)} shadow-lg`
                    : 'border-gray-200 bg-white opacity-70'
                }`}
              >
                {/* Lock overlay for locked badges */}
                {!progress.earned && (
                  <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                    <Lock className="w-6 h-6 text-gray-400" />
                  </div>
                )}

                <div className="text-center">
                  <div className={`text-4xl mb-2 ${progress.earned ? '' : 'grayscale opacity-50'}`}>
                    {badge.icon}
                  </div>
                  <h3 className={`font-bold text-sm mb-1 ${progress.earned ? 'text-gray-800' : 'text-gray-500'}`}>
                    {badge.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">{badge.description}</p>

                  {/* Progress bar for locked badges */}
                  {!progress.earned && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                      <div
                        className="bg-gray-400 h-1.5 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getRarityBadge(badge.rarity)}`}>
                      {badge.rarity}
                    </span>
                    {progress.earned && (
                      <span className="text-[10px] text-green-600 font-medium">✓ Earned</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
