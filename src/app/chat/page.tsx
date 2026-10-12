'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import type { Message, Match } from '@/lib/types';

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!user) return;
    loadMatches();
    updateActive();
  }, [user]);

  useEffect(() => {
    if (selectedMatch) loadMessages(selectedMatch.id);
  }, [selectedMatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/login'); return; }
    setUser(user);
  }

  async function updateActive() {
    if (!user) return;
    await supabase.from('active_users').upsert(
      { user_id: user.id, last_active: new Date().toISOString(), is_online: true },
      { onConflict: 'user_id' }
    );
    const interval = setInterval(async () => {
      await supabase.from('active_users').upsert(
        { user_id: user.id, last_active: new Date().toISOString(), is_online: true },
        { onConflict: 'user_id' }
      );
    }, 30000);
    return () => clearInterval(interval);
  }

  async function loadMatches() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('matches')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .eq('status', 'connected')
      .order('created_at', { ascending: false });

    if (data) {
      setMatches(data);
      const otherIds = data.map(m => m.user1_id === user.id ? m.user2_id : m.user1_id);
      if (otherIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('id', otherIds);
        if (profilesData) {
          const map: Record<string, any> = {};
          profilesData.forEach(p => { map[p.id] = p; });
          setProfiles(map);
        }
      }
    }
  }

  async function loadMessages(matchId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
      // Mark as read
      await supabase.from('messages')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('match_id', matchId)
        .neq('sender_id', user.id);
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedMatch || !user) return;
    const receiverId = selectedMatch.user1_id === user.id ? selectedMatch.user2_id : selectedMatch.user1_id;

    const { data, error } = await supabase.from('messages').insert({
      match_id: selectedMatch.id,
      sender_id: user.id,
      receiver_id: receiverId,
      message_text: newMessage.trim(),
      message_type: 'text',
    }).select().single();

    if (!error && data) {
      setMessages(prev => [...prev, data]);
      setNewMessage('');

      // Send push notification (simulated via notifications table)
      await supabase.from('notifications').insert({
        user_id: receiverId,
        type: 'game_invite',
        title: '💬 New Message',
        message: newMessage.trim().substring(0, 100),
        data: { match_id: selectedMatch.id, sender_id: user.id },
      });
    }
  }

  function getOtherUser(match: Match) {
    if (!user) return null;
    const otherId = match.user1_id === user.id ? match.user2_id : match.user1_id;
    return profiles[otherId] || null;
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function formatDate(date: string) {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-3 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button onClick={() => setSelectedMatch(null)} className="text-2xl mr-2">
              {selectedMatch ? '←' : '💕'}
            </button>
            <h1 className="text-xl font-bold">Love Dove Chat</h1>
          </div>
          <button onClick={() => router.push('/dashboard')} className="text-sm bg-white/20 px-3 py-1 rounded-lg">Dashboard</button>
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full flex overflow-hidden">
        {/* Match List Sidebar */}
        {!selectedMatch && (
          <div className="w-full md:w-80 bg-white border-r overflow-y-auto">
            <div className="p-4 border-b">
              <h2 className="font-bold text-lg">Your Matches ({matches.length})</h2>
              <p className="text-xs text-gray-500">Connected couples</p>
            </div>
            {matches.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <div className="text-4xl mb-3">💕</div>
                <p className="text-sm">No matches yet</p>
                <button onClick={() => router.push('/find-partner')} className="mt-3 text-pink-600 text-sm font-semibold">
                  Find a Partner →
                </button>
              </div>
            ) : (
              matches.map(match => {
                const other = getOtherUser(match);
                return (
                  <div key={match.id} onClick={() => setSelectedMatch(match)}
                    className="p-4 border-b hover:bg-pink-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                        {other?.full_name?.charAt(0)?.toUpperCase() || '💑'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{other?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-green-600">Connected • {match.match_percentage}% match</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Chat Area */}
        {selectedMatch && (
          <div className="flex-1 flex flex-col bg-white md:rounded-none">
            {/* Chat Header */}
            <div className="bg-white border-b px-4 py-3 flex items-center gap-3 shadow-sm">
              <button onClick={() => setSelectedMatch(null)} className="md:hidden text-xl">←</button>
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {getOtherUser(selectedMatch)?.full_name?.charAt(0)?.toUpperCase() || '💑'}
              </div>
              <div>
                <p className="font-semibold text-sm">{getOtherUser(selectedMatch)?.full_name || 'Your Match'}</p>
                <p className="text-xs text-green-600">Online • {selectedMatch.match_percentage}% compatible</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map(msg => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${isMe ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'bg-white text-gray-800 border'} rounded-2xl px-4 py-2 shadow-sm`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.message_text}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-pink-100' : 'text-gray-400'}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message... 💕"
                  className="flex-1 p-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button onClick={sendMessage} disabled={!newMessage.trim()}
                  className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full flex items-center justify-center hover:opacity-80 disabled:opacity-50">
                  ➤
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
