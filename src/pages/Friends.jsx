import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Friends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadFriends();
      loadPending();
    }
  }, [user]);

  const loadFriends = async () => {
    const { data } = await supabase
      .from('friends')
      .select('*, friend:profiles!friends_friend_id_fkey(*), user:profiles!friends_user_id_fkey(*)')
      .eq('user_id', user.id)
      .eq('status', 'accepted');
    if (data) setFriends(data);
  };

  const loadPending = async () => {
    const { data } = await supabase
      .from('friends')
      .select('*, friend:profiles!friends_friend_id_fkey(*)')
      .eq('user_id', user.id)
      .eq('status', 'pending');
    if (data) setPending(data);
  };

  const searchUsers = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
      .neq('id', user.id)
      .limit(10);
    if (data) setSearchResults(data);
    setLoading(false);
  };

  const sendFriendRequest = async (friendId) => {
    await supabase.from('friends').insert({
      user_id: user.id,
      friend_id: friendId,
      status: 'pending'
    });
    setSearchResults(prev => prev.filter(u => u.id !== friendId));
  };

  const acceptRequest = async (friendshipId, friendId) => {
    await supabase.from('friends').update({ status: 'accepted' }).eq('id', friendshipId);

    const { data: profile } = await supabase.from('profiles').select('partner_id').eq('id', user.id).single();
    if (!profile?.partner_id) {
      await supabase.from('profiles').update({ partner_id: friendId }).eq('id', user.id);
    }

    loadFriends();
    loadPending();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Friends</h1>
        <p className="text-gray-600 mt-1">Connect with friends and play games together</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-md border border-pink-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Find Friends</h2>
        <form onSubmit={searchUsers} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, username, or email..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500"
          />
          <button type="submit" disabled={loading} className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {searchResults.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-pink-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {u.avatar_url ? (
                    <img src={u.avatar_url} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                      {u.full_name?.[0] || u.email[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{u.full_name || 'User'}</p>
                    <p className="text-sm text-gray-500">@{u.username || u.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => sendFriendRequest(u.id)}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm hover:bg-pink-600"
                >
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Requests */}
      {pending.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md border border-pink-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Pending Requests</h2>
          <div className="space-y-2">
            {pending.map(f => (
              <div key={f.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {f.friend?.avatar_url ? (
                    <img src={f.friend.avatar_url} className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {f.friend?.full_name?.[0] || '?'}
                    </div>
                  )}
                  <span>{f.friend?.full_name || 'Unknown'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="bg-white rounded-2xl shadow-md border border-pink-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">My Friends ({friends.length})</h2>
        {friends.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No friends yet. Search above to find people!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.map(f => {
              const friend = f.friend || f.user;
              return (
                <div key={f.id} className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
                  {friend?.avatar_url ? (
                    <img src={friend.avatar_url} className="w-12 h-12 rounded-full" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {friend?.full_name?.[0] || friend?.email[0].toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{friend?.full_name || 'User'}</p>
                    <p className="text-sm text-gray-500">Friend</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
