'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Send, Gift as GiftBig } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { getSurprisePool, addToSurprisePool, type SurpriseContribution } from '@/lib/relationship';

/**
 * "Pool a surprise" — a shared co-contribution wall for a birthday site.
 * Anyone visiting the site can add a line to the couple's pooled surprise;
 * the owner reveals it all at once on the day. Anonymous by design, same
 * as the guestbook.
 */
interface SurprisePoolProps {
  siteId: string;
  accentColor: string;
  mutedColor: string;
  /** Hide the list until the birthday has arrived (countdown gate). */
  revealNow: boolean;
}

export default function SurprisePool({ siteId, accentColor, mutedColor, revealNow }: SurprisePoolProps) {
  const [pool, setPool] = useState<SurpriseContribution[]>([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    void getSurprisePool(siteId).then(setPool);
  }, [siteId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    const res = await addToSurprisePool(siteId, name, message);
    setSending(false);
    if (res.ok) {
      setName('');
      setMessage('');
      toast.success('Added to the surprise pool 🎁');
      void getSurprisePool(siteId).then(setPool);
    } else {
      toast.error(res.error || 'Could not add');
    }
  };

  const inputClasses =
    'w-full px-4 py-2.5 rounded-xl bg-white/90 border border-white/80 text-sm outline-none focus:border-pink-300 transition-colors';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 }}
      className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-7 mb-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accentColor}22` }}>
          <GiftBig className="w-5 h-5" style={{ color: accentColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-lg leading-tight" style={{ color: accentColor }}>
            The surprise pool
          </h2>
          <p className="text-xs" style={{ color: mutedColor }}>
            {pool.length === 0
              ? 'Be the first to add a line to the big surprise'
              : `${pool.length} surprise${pool.length === 1 ? '' : 's'} pooled so far`}
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-2.5 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          placeholder="Your name (or leave blank)"
          className={inputClasses}
        />
        <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            required
            placeholder="Add your line to the surprise…"
            className={`${inputClasses} flex-1`}
          />
          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-1.5 flex-shrink-0"
            style={{ background: accentColor }}
          >
            {sending ? '…' : <><Send className="w-3.5 h-3.5" /> Add</>}
          </button>
        </div>
      </form>

      {revealNow ? (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          <AnimatePresence>
            {pool.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 p-3 rounded-2xl bg-white/70"
              >
                <span className="text-lg flex-shrink-0">🎁</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug whitespace-pre-wrap" style={{ color: accentColor }}>
                    {p.message}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: mutedColor }}>
                    — {p.contributor || 'Someone'}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <p className="text-xs text-center py-2" style={{ color: mutedColor }}>
          🔒 {pool.length} surprises pooled — they unlock on the big day
        </p>
      )}
    </motion.div>
  );
}
