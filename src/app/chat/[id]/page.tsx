'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Send, Heart, MoreVertical, Shield, Gamepad2, Smile } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Profile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}

interface GameInvite {
  id: string;
  slug: string;
  name: string;
  emoji: string;
}

const quickReactions = ['❤️', '😊', '🔥', '💕', '😘', '🥰', '💋', '🌹'];

const availableGames: GameInvite[] = [
  { id: '1', slug: 'memory-match', name: 'Memory Match', emoji: '💕' },
  { id: '2', slug: 'tic-tac-toe', name: 'Tic Tac Toe', emoji: '❌' },
  { id: '3', slug: '2048', name: '2048 Love', emoji: '🔢' },
  { id: '4', slug: 'snake', name: 'Love Snake', emoji: '🐍' },
  { id: '5', slug: 'would-you-rather', name: 'Would You Rather', emoji: '🤔' },
  { id: '6', slug: 'couple-quiz', name: 'Couple Quiz', emoji: '💡' },
  { id: '7', slug: 'pong', name: 'Love Pong', emoji: '🏓' },
  { id: '8', slug: 'flappy-heart', name: 'Flappy Heart', emoji: '💖' },
  { id: '9', slug: 'hangman', name: 'Love Hangman', emoji: '💬' },
  { id: '10', slug: 'cupids-arrow', name: "Cupid's Arrow", emoji: '🏹' },
  { id: '11', slug: 'hearts', name: 'Hearts', emoji: '❤️' },
  { id: '12', slug: 'couple-pictionary', name: 'Couple Pictionary', emoji: '🎨' },
];

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [sending, setSending] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) { router.push('/auth/login'); return; }
      setUserId(user.id);
      setLoading(false);
      fetchMessages();
    };
    init();

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, supabase.auth, router, supabase]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(id, full_name, username, avatar_url)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (data && !error) {
      setMessages(data as any);
      // Get other user
      const first = data[0] as any;
      if (first) {
        const currentUserId = (await supabase.auth.getUser()).data.user?.id;
        const otherId = first.sender_id === currentUserId
          ? (data.find((m: any) => m.sender_id !== currentUserId) as any)?.sender_id
          : first.sender_id;

        if (otherId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherId)
            .single();
          if (profile) setOtherUser(profile as any);
        }
      }
    }
  };

  const sendMessage = async (content: string, messageType: string = 'text') => {
    if (!content.trim() || !userId) return;
    setSending(true);

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: userId,
        content: content.trim(),
        message_type: messageType,
      });

      if (!error) {
        // Update conversation last message time
        await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId);
      }
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setSending(false);
      setShowEmojis(false);
    }
  };

  const inviteToGame = (game: GameInvite) => {
    sendMessage(`🎮 Invited you to play ${game.emoji} ${game.name}! Click here: /games/${game.slug}`, 'game_invite');
    setShowGames(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="animate-spin w-8 h-8 border-4 border-pink-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-pink-100 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/friends" className="p-2 hover:bg-pink-100 rounded-xl transition-all">
            <ArrowLeft className="w-5 h-5 text-purple-600" />
          </Link>

          {otherUser && (
            <>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold">
                {otherUser.full_name?.[0]?.toUpperCase() || otherUser.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-gray-800">{otherUser.full_name || otherUser.username}</h2>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  Online
                </p>
              </div>
            </>
          )}

          <div className="flex items-center gap-1">
            <button onClick={() => setShowGames(!showGames)}
              className="p-2 text-purple-600 hover:bg-purple-100 rounded-xl transition-all" title="Play games together">
              <Gamepad2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-purple-600 hover:bg-purple-100 rounded-xl transition-all">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Game Invite Dropdown */}
      <AnimatePresence>
        {showGames && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white border-b border-pink-100 shadow-lg max-w-3xl mx-auto w-full">
            <div className="p-4">
              <p className="text-sm font-medium text-gray-600 mb-3">Invite to play a game</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {availableGames.map(game => (
                  <button key={game.id} onClick={() => inviteToGame(game)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-pink-50 transition-all border border-transparent hover:border-pink-200">
                    <span className="text-2xl">{game.emoji}</span>
                    <span className="text-[10px] text-gray-600 text-center leading-tight">{game.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((msg, index) => {
              const isMe = msg.sender_id === userId;
              const showDateSeparator = index === 0 ||
                formatDate(msg.created_at) !== formatDate(messages[index - 1].created_at);

              return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {showDateSeparator && (
                    <div className="w-full text-center my-4">
                      <span className="text-xs text-gray-400 bg-pink-50 px-3 py-1 rounded-full">
                        {formatDate(msg.created_at)}
                      </span>
                    </div>
                  )}

                  {!isMe && otherUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 flex-shrink-0">
                      {otherUser.full_name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}

                  <div className={`max-w-[70%] ${msg.message_type === 'game_invite' ? 'max-w-[90%]' : ''}`}>
                    <div className={`rounded-2xl px-4 py-2.5 ${
                      isMe
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-br-md'
                        : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-pink-100'
                    } ${msg.message_type === 'game_invite' ? 'border-2 border-pink-300' : ''}`}>
                      {msg.message_type === 'game_invite' && (
                        <div className="flex items-center gap-2 mb-1 pb-1 border-b border-current/20">
                          <Gamepad2 className="w-4 h-4" />
                          <span className="text-xs font-semibold">Game Invitation</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMe ? 'text-pink-100' : 'text-gray-400'}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Reactions */}
      <AnimatePresence>
        {showEmojis && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="px-4 pb-2">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-3 border border-pink-100">
              <div className="flex gap-2">
                {quickReactions.map(emoji => (
                  <button key={emoji} onClick={() => sendMessage(emoji)}
                    className="text-2xl hover:scale-125 transition-transform p-1 hover:bg-pink-50 rounded-lg">
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="bg-white/80 backdrop-blur-md border-t border-pink-100 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <button onClick={() => setShowEmojis(!showEmojis)} className="p-2 text-purple-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all">
            <Smile className="w-5 h-5" />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(newMessage); } }}
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <button
            onClick={() => sendMessage(newMessage)}
            disabled={!newMessage.trim() || sending}
            className="p-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-1.5 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3" /> Be kind and respectful 💕
        </p>
      </div>
    </div>
  );
}
