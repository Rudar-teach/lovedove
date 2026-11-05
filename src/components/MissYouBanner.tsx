'use client';

// Global "Someone missed you 💕" reveal.
//
// On app load (signed in, on any page except /miss-meter itself) it checks
// the couple state: if the partner is online right now OR there are unread
// Love Wall notes, a small dismissible banner offers the /miss-meter page.
// Shown at most once per session.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getCoupleState } from '@/lib/couple';

export default function MissYouBanner() {
  const [show, setShow] = useState(false);
  const [reason, setReason] = useState<'partner-online' | 'notes' | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    const sessionKey = 'ld_missbanner_seen';
    if (sessionStorage.getItem(sessionKey)) return;
    if (pathname && pathname.startsWith('/miss-meter')) return;

    let alive = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!alive || !session?.user) return;
      const s = await getCoupleState(session.user.id);
      if (!alive) return;
      if (!s.partner) return;
      if (s.bothOnlineNow || s.unreadCount > 0) {
        setReason(s.unreadCount > 0 ? 'notes' : 'partner-online');
        setPartnerName(s.partner.full_name || s.partner.username || 'Someone');
        setShow(true);
      }
    })();
    return () => { alive = false; };
  }, [pathname]);

  const dismiss = () => {
    sessionStorage.setItem('ld_missbanner_seen', '1');
    setShow(false);
  };

  if (!show) return null;

  const title =
    reason === 'notes'
      ? `${partnerName} missed you 💕`
      : `${partnerName} is online right now 💞`;

  return (
    <div className="fixed top-20 sm:top-24 left-4 right-4 sm:left-auto sm:right-6 z-[65] max-w-sm">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-pink-900/10 border border-pink-200 p-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white">
            <Heart className="w-5 h-5" fill="white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-gray-900">{title}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {reason === 'notes'
                ? 'They left you missed-you notes. Open your Love Wall to see them.'
                : 'A rare both-online moment — go say hi before it passes.'}
            </p>
            <div className="flex gap-2 mt-2.5">
              <Link
                href="/miss-meter"
                onClick={dismiss}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-lg shadow"
              >
                Open Miss Meter
              </Link>
              <button onClick={dismiss} className="px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-gray-600">
                Later
              </button>
            </div>
          </div>
          <button onClick={dismiss} aria-label="Dismiss" className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
