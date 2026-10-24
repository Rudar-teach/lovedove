'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Heart, Menu, X, ChevronDown, Gamepad2, Trophy, Users, Mail,
  Sparkles, User, LogOut, Clock, Flame, Settings, ChevronRight,
  Home, Gift, Camera, Search, Film
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

const GAME_TYPE_MAP: Record<string, { name: string; emoji: string }> = {
  memory: { name: 'Memory Match', emoji: '💕' },
  tictactoe: { name: 'Tic Tac Toe', emoji: '❌' },
  rock_paper_scissors: { name: 'Rock Paper Scissors', emoji: '✋' },
  hangman: { name: 'Hangman', emoji: '💬' },
  '2048': { name: '2048', emoji: '🔢' },
  snake: { name: 'Snake', emoji: '🐍' },
  flappy_heart: { name: 'Flappy Heart', emoji: '💖' },
  pong: { name: 'Pong', emoji: '🏓' },
  cupids_arrow: { name: "Cupid's Arrow", emoji: '🏹' },
  heart_catcher: { name: 'Heart Catcher', emoji: '🫶' },
  hearts: { name: 'Hearts', emoji: '❤️' },
  truth_or_dare: { name: 'Truth or Dare', emoji: '🎯' },
  emoji_story: { name: 'Emoji Story', emoji: '📖' },
  couple_quiz: { name: 'Couple Quiz', emoji: '💡' },
  would_you_rather: { name: 'Would You Rather', emoji: '🤔' },
  love_song_quiz: { name: 'Love Song Quiz', emoji: '🎵' },
  trivia_battle: { name: 'Trivia Battle', emoji: '⚔️' },
  speed_date: { name: 'Speed Date', emoji: '⚡' },
  compatibility_test: { name: 'Compatibility Test', emoji: '💘' },
  love_calculator: { name: 'Love Calculator', emoji: '🔢' },
  love_maze: { name: 'Love Maze', emoji: '🧩' },
  love_letters: { name: 'Love Letters', emoji: '💌' },
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, setUser } = useAuthStore();
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadProfileData = async () => {
    if (!user) return;
    setLoadingProfile(true);
    try {
      const { data: stats } = await supabase
        .from('game_stats')
        .select('*')
        .eq('user_id', user.id)
        .order('last_played', { ascending: false })
        .limit(5);
      if (stats) {
        setRecentGames(stats);
        setTotalTime(stats.reduce((sum, s) => sum + (s.total_time_played || 0), 0));
      }
    } catch {
      // silent
    }
    setLoadingProfile(false);
  };

  const handleProfileToggle = () => {
    if (!profileOpen) loadProfileData();
    setProfileOpen(!profileOpen);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('Logged out successfully 💕');
    setProfileOpen(false);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`;
    return 'Just started';
  };

  const navLinks = [
    { href: '/#games', label: 'Games', icon: Gamepad2 },
    { href: '/#features', label: 'Features', icon: Sparkles },
    { href: '/find-partner', label: 'Find Partner', icon: Heart },
    { href: '/games', label: 'All Games', icon: Gamepad2 },
    { href: '/#badges', label: 'Badges', icon: Trophy },
    { href: '/#community', label: 'Community', icon: Users },
    { href: '/contact', label: 'Contact', icon: Mail },
  ];

  const hours = Math.floor(totalTime / 3600);
  const minutes = Math.floor((totalTime % 3600) / 60);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl shadow-lg shadow-pink-100/50 border-b border-pink-100/50'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-200/50 group-hover:shadow-pink-300/70 transition-shadow"
            >
              <Heart className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="white" />
            </motion.div>
            <span className="text-lg sm:text-xl font-display font-black bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent hidden sm:block">
              Love Dove
            </span>
            <span className="text-lg font-display font-black bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent sm:hidden">
              💕
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && link.href.startsWith('/') && pathname?.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`nav-link-hover px-3 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors rounded-lg ${
                    isActive
                      ? 'text-pink-600 bg-pink-50'
                      : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50/50'
                  }`}
                >
                  <link.icon className="w-3.5 h-3.5" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated && user ? (
              <>
                {/* Profile Icon with Dropdown */}
                <div ref={profileRef} className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleProfileToggle}
                    className="flex items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl hover:bg-white/60 backdrop-blur-sm border border-transparent hover:border-pink-200/50 transition-all"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-md shadow-pink-200/50">
                      {user.full_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                      {user.full_name || user.username}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl shadow-pink-100/30 border border-pink-100/60 overflow-hidden z-50"
                      >
                        {/* User Info Header */}
                        <div className="p-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-lg font-bold border-2 border-white/30">
                              {user.full_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm truncate">{user.full_name || user.username}</p>
                              <p className="text-white/70 text-xs truncate">@{user.username}</p>
                            </div>
                          </div>
                          {/* Quick Stats */}
                          <div className="flex gap-3 mt-3">
                            <div className="flex-1 bg-white/15 rounded-lg px-2 py-1.5 text-center backdrop-blur-sm">
                              <p className="text-xs text-white/70">Time</p>
                              <p className="text-sm font-bold">{hours > 0 ? `${hours}h` : `${minutes}m`}</p>
                            </div>
                            <div className="flex-1 bg-white/15 rounded-lg px-2 py-1.5 text-center backdrop-blur-sm">
                              <p className="text-xs text-white/70">Games</p>
                              <p className="text-sm font-bold">{recentGames.length}</p>
                            </div>
                          </div>
                        </div>

                        {/* Recent Games */}
                        <div className="p-3">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">Recently Played</p>
                          <div className="space-y-1 max-h-48 overflow-y-auto">
                            {loadingProfile ? (
                              <div className="py-4 text-center text-gray-400 text-sm">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block">
                                  <Sparkles className="w-5 h-5 text-pink-400" />
                                </motion.div>
                              </div>
                            ) : recentGames.length > 0 ? (
                              recentGames.map((stat, i) => (
                                <motion.div
                                  key={stat.id || i}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-pink-50/80 transition-colors cursor-pointer group"
                                >
                                  <span className="text-xl">{stat.game_icon || '🎮'}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-700 truncate group-hover:text-pink-600 transition-colors">
                                      {stat.game_name || 'Game'}
                                    </p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatTime(stat.total_time_played || 0)}
                                    </p>
                                  </div>
                                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-pink-400 transition-colors" />
                                </motion.div>
                              ))
                            ) : (
                              <p className="text-sm text-gray-400 text-center py-3">No games played yet</p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="p-3 pt-0 space-y-1">
                          <Link
                            href="/dashboard"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50/80 rounded-xl transition-all"
                          >
                            <Home className="w-4 h-4" />
                            Dashboard
                            <Sparkles className="w-3.5 h-3.5 ml-auto text-pink-400" />
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50/80 rounded-xl transition-all"
                          >
                            <User className="w-4 h-4" />
                            Profile
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <LogOut className="w-4 h-4" />
                            Log Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="text-sm font-semibold text-gray-600 hover:text-pink-600 transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="relative px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-pink-200/50 hover:shadow-xl hover:shadow-pink-300/50 transition-all duration-300 overflow-hidden group btn-magnetic"
                >
                  <span className="relative z-10">Get Started</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-pink-50 transition-colors active:bg-pink-100"
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="pb-4 pt-2 space-y-1 bg-white/90 backdrop-blur-xl rounded-2xl mt-2 border border-pink-100/50">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50/50 rounded-xl transition-all active:bg-pink-100"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                ))}

                {/* Mobile User Section */}
                {isAuthenticated && user ? (
                  <div className="pt-3 px-4 space-y-2 border-t border-pink-100/50">
                    <div className="flex items-center gap-3 py-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold">
                        {user.full_name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{user.full_name || user.username}</p>
                        <p className="text-xs text-gray-400">@{user.username}</p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all"
                    >
                      <Home className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                ) : (
                  <div className="pt-3 px-4 space-y-2 border-t border-pink-100/50">
                    <Link
                      href="/auth/login"
                      className="block w-full text-center py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:border-pink-200 hover:text-pink-600 transition-all"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block w-full text-center py-2.5 text-sm font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl shadow-lg shadow-pink-200/50"
                    >
                      Get Started Free
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
