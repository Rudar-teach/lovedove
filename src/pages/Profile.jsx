import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const { profile, updateProfile, user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        username: profile.username || '',
        age: profile.age || '',
        gender: profile.gender || '',
        bio: profile.bio || '',
        theme_color: profile.theme_color || 'pink'
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchActivity();
    }
  }, [user]);

  const fetchStats = async () => {
    const { data } = await supabase
      .from('game_stats')
      .select('games_played, total_time_played, wins, losses')
      .eq('user_id', user.id);

    if (data) {
      setStats({
        totalGames: data.reduce((s, g) => s + g.games_played, 0),
        totalTime: data.reduce((s, g) => s + g.total_time_played, 0),
        wins: data.reduce((s, g) => s + g.wins, 0),
        losses: data.reduce((s, g) => s + g.losses, 0)
      });
    }
  };

  const fetchActivity = async () => {
    const { data } = await supabase
      .from('game_sessions')
      .select('*')
      .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
      .order('started_at', { ascending: false })
      .limit(5);
    if (data) setRecentActivity(data);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      // Try to create bucket if it doesn't exist
      const { error: bucketError } = await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 5242880
      });

      if (!bucketError) {
        await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      }
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    await updateProfile({ avatar_url: publicUrl });
  };

  const handleSave = async () => {
    setSaving(true);
    await updateProfile(form);
    setEditing(false);
    setSaving(false);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-pink-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-pink-400 to-purple-500" />
        <div className="px-6 pb-6">
          <div className="relative -mt-16 mb-4">
            <div className="relative">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover" />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold">
                  {profile.full_name?.[0] || profile.email[0].toUpperCase()}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 bg-pink-500 text-white p-2 rounded-full shadow-lg hover:bg-pink-600"
              >
                📷
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="Full Name" className="w-full px-4 py-2 border rounded-lg" />
              <input value={form.username} onChange={e => setForm({...form, username: e.target.value})} placeholder="Username" className="w-full px-4 py-2 border rounded-lg" />
              <input type="number" value={form.age} onChange={e => setForm({...form, age: e.target.value})} placeholder="Age" className="w-full px-4 py-2 border rounded-lg" />
              <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} placeholder="Bio" className="w-full px-4 py-2 border rounded-lg h-24" />

              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{profile.full_name || 'No Name Set'}</h2>
              <p className="text-gray-500">@{profile.username || 'no-username'}</p>
              <p className="text-gray-600 mt-2">{profile.bio || 'No bio yet...'}</p>
              <div className="flex gap-4 mt-2 text-sm text-gray-500">
                {profile.age && <span>🎂 {profile.age} years</span>}
                {profile.gender && <span>👤 {profile.gender}</span>}
              </div>
              <button onClick={() => setEditing(true)} className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="bg-white rounded-2xl shadow-md border border-pink-100 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Gaming Stats</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600">{stats.totalGames}</div>
              <div className="text-sm text-gray-500">Games</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{formatTime(stats.totalTime)}</div>
              <div className="text-sm text-gray-500">Play Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.wins}</div>
              <div className="text-sm text-gray-500">Wins</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{stats.losses}</div>
              <div className="text-sm text-gray-500">Losses</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md border border-pink-100 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">🎮 Recent Games</h3>
          <div className="space-y-3">
            {recentActivity.map(session => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">{session.game_type}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    {session.status === 'completed' ? (session.winner_id === user.id ? '🏆 Won!' : '😔 Lost') : session.status}
                  </span>
                </div>
                <span className="text-sm text-gray-400">
                  {new Date(session.started_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
