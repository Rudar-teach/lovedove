'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cookie, X } from 'lucide-react';

// Consent key. We only ever load strictly-necessary cookies (Supabase auth
// session). Marketing/advertising trackers are not loaded at all; this banner
// records the user's choice so we can honor it if we ever add optional
// analytics, and so we can tell visitors nothing third-party is tracking them.
const CONSENT_KEY = 'lovedove_cookie_consent';

type Consent = 'accepted' | 'rejected';

export default function CookieBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const stored = document.cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith(CONSENT_KEY + '='));
    const hasChoice = Boolean(stored) || Boolean(localStorage.getItem(CONSENT_KEY));
    if (!hasChoice && !dismissed) setShow(true);
  }, [dismissed]);

  const decide = (value: Consent) => {
    const now = new Date();
    const expires = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${CONSENT_KEY}=${value}; path=/; expires=${expires}; SameSite=Lax`;
    localStorage.setItem(CONSENT_KEY, value);
    setDismissed(true);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:w-[440px] sm:max-w-[calc(100vw-2rem)] z-[60]">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-pink-900/10 border border-pink-100 p-4 sm:p-5 text-gray-800">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-gray-900">Cookies &amp; privacy</p>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              We use strictly necessary cookies to keep you signed in. We do <strong>not</strong> load
              advertising or third-party trackers. Choose below; you can change this anytime from your browser.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={() => decide('accepted')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-semibold shadow hover:opacity-90 transition"
              >
                Accept all
              </button>
              <button
                onClick={() => decide('rejected')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition"
              >
                Necessary only
              </button>
              <Link
                href="/privacy"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-pink-600 hover:bg-pink-50 transition"
              >
                Learn more
              </Link>
              <button
                onClick={() => { setDismissed(true); setShow(false); }}
                aria-label="Dismiss"
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
