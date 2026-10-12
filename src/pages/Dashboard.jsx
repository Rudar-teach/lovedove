import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    totalTime: 0,
    matches: 0,
    friends: 0,
    badges: 0
  });
  const [todayTip, setTodayTip] = useState(null);
  const [birthdaySites, setBirthdaySites] = useState([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    // Game stats
    const { data: gameStats } = await supabase
      .from('game_stats')
      .select('games_played, total_time_played')
      .eq('user_id', user.id);

    // Badges
    const { count: badgeCount } = await supabase
      .from('user_badges')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Friends
    const { count: friendCount } = await supabase
      .from('friends')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    // Birthday sites
    const { data: sites } = await supabase
      .from('birthday_sites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Matches count
    const { count: matchCount } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('is_active', true);

    // Random tip
    const { data: tips } = await supabase
      .from('relationship_tips')
      .select('*');

    if (gameStats) {
      setStats({
        gamesPlayed: gameStats.reduce((sum, g) => sum + g.games_played, 0),
        totalTime: gameStats.reduce((sum, g) => sum + g.total_time_played, 0),
        matches: matchCount || 0,
        friends: friendCount || 0,
        badges: badgeCount || 0
      });
    }

    if (tips && tips.length > 0) {
      setTodayTip(tips[Math.floor(Math.random() * tips.length)]);
    }

    if (sites) {
      setBirthdaySites(sites);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const statCards = [
    { label: 'Games Played', value: stats.gamesPlayed, emoji: '🎮', color: 'from-blue-400 to-blue-600' },
    { label: 'Time Played', value: formatTime(stats.totalTime), emoji: '⏱️', color: 'from-green-400 to-green-600' },
    { label: 'Badges', value: stats.badges, emoji: '🏆', color: 'from-yellow-400 to-yellow-600' },
    { label: 'Friends', value: stats.friends, emoji: '👥', color: 'from-purple-400 to-purple-600' },
    { label: 'Matches', value: stats.matches, emoji: '💕', color: 'from-pink-400 to-pink-600' },
  ];

  const quickActions = [
    { label: 'Play Games', emoji: '🎮', link: '/games', color: 'bg-blue-500' },
    { label: 'Add Friends', emoji: '👥', link: '/friends', color: 'bg-purple-500' },
    { label: 'Create Birthday Site', emoji: '🎂', link: '/birthday', color: 'bg-pink-500' },
    { label: 'My Profile', emoji: '👤', link: '/profile', color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          {profile?.partner_id ? '💕' : '👋'} Welcome, {profile?.full_name || 'Lovebird'}!
        </h1>
        <p className="text-pink-100">
          {profile?.partner_id
            ? "You're connected! Ready to play together?"
            : 'Find your perfect match and start playing together!'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl p-4 shadow-md border border-pink-100 text-center">
            <div className="text-3xl mb-2">{stat.emoji}</div>
            <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">⚡ Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <Link
              key={idx}
              to={action.link}
              className={`${action.color} text-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1`}
            >
              <div className="text-4xl mb-2">{action.emoji}</div>
              <div className="font-medium">{action.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Today's Tip */}
      {todayTip && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-pink-100">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div>
              <h3 className="font-bold text-gray-800 mb-1">Today's Relationship Tip</h3>
              <p className="text-gray-600">{todayTip.tip}</p>
            </div>
          </div>
        </div>
      )}

      {/* Birthday Sites */}
      {birthdaySites.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">🎂 Your Birthday Sites</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {birthdaySites.map(site => (
              <Link key={site.id} to={`/birthday/${site.id}`} className="bg-white rounded-xl p-4 shadow-md border border-pink-100 hover:shadow-lg transition-all">
                <h3 className="font-bold text-gray-800">{site.name}</h3>
                <p className="text-sm text-gray-500 mt-1">Theme: {site.theme}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span>👁️ {site.view_count} views</span>
                  <span>📷 {site.photos?.length || 0} photos</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
