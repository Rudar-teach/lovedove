'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Copy, Check, Share2, Users, X } from 'lucide-react';
import { generateGameCode, getGameShareLink } from '@/lib/gameShare';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';

interface GameSharePanelProps {
  gameSlug: string;
}

export default function GameSharePanel({ gameSlug }: GameSharePanelProps) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [friendJoined, setFriendJoined] = useState(false);
  const [polling, setPolling] = useState(false);
  const user = useAuthStore(s => s.user);

  const createShareSession = async () => {
    if (!user) return;
    const code = generateGameCode();
    const link = getGameShareLink(gameSlug, code);
    try {
      await supabase.from('game_sessions').insert({
        game_type: gameSlug,
        session_code: code,
        player1_id: user.id,
        status: 'waiting',
        current_turn: user.id,
        game_state: {},
      });
      setSessionCode(code);
      setShow(true);
      navigator.clipboard.writeText(link).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      startPolling(code);
    } catch {
      // fallback: just show link without DB
      setSessionCode(code);
      setShow(true);
      navigator.clipboard.writeText(link).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const startPolling = (code: string) => {
    setPolling(true);
    const interval = setInterval(async () => {
      try {
        const { data } = await supabase.from('game_sessions').select('player2_id, status').eq('session_code', code).single();
        if (data?.player2_id) {
          setFriendJoined(true);
          setPolling(false);
          clearInterval(interval);
        }
      } catch { /* ignore */ }
    }, 2000);
    setTimeout(() => { clearInterval(interval); setPolling(false); }, 120000);
  };

  const shareText = sessionCode ? `${window.location.origin}/games/${gameSlug}?session=${sessionCode}` : '';

  return (
    <>
      <div className="text-center mt-4">
        {!show ? (
          <button onClick={createShareSession}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary-500 to-rose-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            <Share2 className="w-4 h-4" /> Share with Friend & Play Together
          </button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex flex-col items-center gap-3 bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-xl border border-pink-100 max-w-sm mx-auto">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-bold text-gray-700">Invite Friend</span>
              <button onClick={() => setShow(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>
            <div className="bg-pink-50 rounded-xl p-3 border border-pink-200 w-full">
              <p className="text-xs text-gray-500 mb-1">Share this link:</p>
              <div className="flex items-center gap-2">
                <code className="text-xs text-primary-700 flex-1 break-all">{shareText}</code>
                <button onClick={() => { navigator.clipboard.writeText(shareText); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="p-1.5 rounded-lg bg-white border border-pink-200 hover:border-primary-400">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                </button>
              </div>
            </div>
            {!friendJoined ? (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                </span>
                Waiting for friend to join...
              </p>
            ) : (
              <p className="text-sm font-bold text-green-600">Friend joined! 🎉 Now play together!</p>
            )}
          </motion.div>
        )}
      </div>
    </>
  );
}
