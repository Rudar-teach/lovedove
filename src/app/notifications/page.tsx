'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Heart, Sparkles, Bell, Mail, Users, Gamepad2,
  Trophy, Trash2, CheckCheck, HeartOff, X, Check
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { Notification } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import PremiumBackground from '@/components/PremiumBackground';
import toast from 'react-hot-toast';

const NOTIFICATION_CONFIG: Record<string, {
  emoji: string;
  title: string;
  color: string;
  bgColor: string;
}> = {
  proposal_received: {
    emoji: '💌',
    title: 'New Proposal',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
  },
  proposal_accepted: {
    emoji: '💕',
    title: 'Proposal Accepted',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  proposal_declined: {
    emoji: '💔',
    title: 'Proposal Declined',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
  friend_request: {
    emoji: '👋',
    title: 'Friend Request',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  game_invite: {
    emoji: '🎮',
    title: 'Game Invite',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
};

export default function NotificationsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    loadNotifications();
  }, [isAuthenticated, filter]);

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter === 'unread') {
        query = query.eq('read', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      setNotifications(data || []);
    } catch (e) {
      console.error('Error loading notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) {
      console.error('Error marking notification as read:', error);
      return;
    }

    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);

    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', unreadIds);

    if (error) {
      console.error('Error marking all as read:', error);
      return;
    }

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting notification:', error);
      return;
    }

    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const deleteAllRead = async () => {
    if (!user) return;
    const readIds = notifications.filter(n => n.read).map(n => n.id);

    if (readIds.length === 0) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .in('id', readIds);

    if (error) {
      console.error('Error deleting read notifications:', error);
      return;
    }

    setNotifications(prev => prev.filter(n => !n.read));
    toast.success('Cleared all read notifications');
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!isAuthenticated || !user) return null;

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        {/* Navbar */}
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => router.back()}
                    className="p-2 rounded-xl hover:bg-white/60 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-rose-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                      <Heart className="w-4 h-4 text-white heart-beat" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <div className="hidden md:flex items-center gap-1">
                  <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors">Dashboard</Link>
                  <Link href="/games" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors">Games</Link>
                  <Link href="/friends" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors">Friends</Link>
                  <Link href="/proposals" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors">Proposals</Link>
                  <Link href="/notifications" className="px-4 py-2 text-sm font-semibold text-primary-600 bg-primary-50 rounded-xl">Notifications</Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Bell className="w-7 h-7 text-primary-500" />
                <h1 className="text-3xl font-display font-black text-gray-900">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <span className="bg-gradient-to-r from-primary-500 to-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {unreadCount}
                  </span>
                )}
              </div>
              <p className="text-gray-600 font-light">
                {notifications.length === 0
                  ? 'No notifications yet'
                  : `${notifications.length} notification${notifications.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-semibold px-4 py-2 rounded-xl hover:bg-primary-50 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
            </div>
          </motion.div>

          {/* Filter tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-center gap-2 mb-6"
          >
            <button
              onClick={() => setFilter('all')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-primary-500 to-rose-500 text-white shadow-lg shadow-primary-500/20'
                  : 'bg-white/70 text-gray-600 hover:bg-white border border-pink-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 ${
                filter === 'unread'
                  ? 'bg-gradient-to-r from-primary-500 to-rose-500 text-white shadow-lg shadow-primary-500/20'
                  : 'bg-white/70 text-gray-600 hover:bg-white border border-pink-100'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === 'unread' ? 'bg-white/25' : 'bg-primary-100 text-primary-700'}`}>
                  {unreadCount}
                </span>
              )}
            </button>
            {notifications.some(n => n.read) && (
              <button
                onClick={deleteAllRead}
                className="ml-auto flex items-center gap-1 text-sm text-red-500 hover:text-red-600 font-medium px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear read
              </button>
            )}
          </motion.div>

          {/* Notifications list */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bell className="w-10 h-10 text-primary-300" />
                </div>
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">
                  {filter === 'unread' ? 'All caught up!' : 'No notifications'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {filter === 'unread'
                    ? 'You have no unread notifications'
                    : 'When you get notifications, they will appear here'}
                </p>
                <Link href="/proposals">
                  <Button>Send a Proposal</Button>
                </Link>
              </motion.div>
            ) : (
              <AnimatePresence>
                {notifications.map((notification, index) => {
                  const config = NOTIFICATION_CONFIG[notification.type] || {
                    emoji: '🔔',
                    title: 'Notification',
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50',
                  };

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 15, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -100, scale: 0.9 }}
                      transition={{ delay: index * 0.03 }}
                      className={`group relative rounded-[1.5rem] border transition-all duration-300 overflow-hidden ${
                        notification.read
                          ? 'bg-white/50 border-pink-100/60'
                          : 'bg-white/80 backdrop-blur-xl border-primary-200 shadow-lg shadow-primary-500/5'
                      }`}
                    >
                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-rose-500" />
                      )}

                      <div
                        className={`flex items-start gap-4 p-5 cursor-pointer ${
                          notification.link ? 'hover:bg-white/50' : ''
                        }`}
                        onClick={() => notification.link && handleNotificationClick(notification)}
                      >
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-2xl ${config.bgColor} flex items-center justify-center text-2xl flex-shrink-0 shadow-sm`}>
                          {config.emoji}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-bold text-sm ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 animate-pulse" />
                            )}
                          </div>
                          <p className={`text-sm leading-relaxed ${notification.read ? 'text-gray-500' : 'text-gray-600'}`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2 font-medium">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          {!notification.read && (
                            <button
                              onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                              className="p-2 rounded-xl hover:bg-primary-50 text-primary-500 transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                            className="p-2 rounded-xl hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </motion.div>
        </div>
      </div>
    </PremiumBackground>
  );
}