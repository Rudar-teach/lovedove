'use client';

import Link from 'next/link';
import { Heart, Wifi, WifiOff } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { usePartnerPresence } from '@/lib/usePartnerPresence';

/**
 * "Partner online now" pill for the nav bar.
 *
 * Shows only when the user has a resolved partner. Live green dot when the
 * partner's heartbeat is fresh (their tab is open somewhere), grey otherwise
 * with "last seen X". Clicking opens /our-story.
 */
export default function PartnerPill() {
  const user = useAuthStore((s) => s.user);
  const { partner, isOnline, lastSeen } = usePartnerPresence(user?.id ?? null);

  if (!user || !partner) return null;

  const seenLabel = lastSeen ? humanizeAgo(lastSeen) : null;

  return (
    <Link
      href="/our-story"
      className={`group relative flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
        isOnline
          ? 'bg-green-50 border-green-200 text-green-700 hover:shadow-md hover:shadow-green-100'
          : 'bg-white/70 border-pink-100 text-gray-500 hover:shadow-md hover:shadow-pink-100'
      }`}
      title={`Our story with @${partner.username}`}
    >
      <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow">
        {partner.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={partner.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <span className="text-sm font-black">{(partner.full_name || partner.username).charAt(0).toUpperCase()}</span>
        )}
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
            isOnline ? 'bg-green-400' : 'bg-gray-300'
          }`}
        />
      </span>
      <span className="hidden sm:flex flex-col items-start leading-tight">
        <span className="flex items-center gap-1">
          {isOnline ? <Wifi className="w-3 h-3 text-green-500" /> : <WifiOff className="w-3 h-3" />}
          @{partner.username}
        </span>
        <span className="text-[10px] font-medium opacity-70">
          {isOnline ? 'online now' : seenLabel ? `seen ${seenLabel}` : 'offline'}
        </span>
      </span>
      <Heart className="w-3 h-3 text-pink-500 sm:hidden" fill="currentColor" />
    </Link>
  );
}

function humanizeAgo(iso: string): string {
  const mins = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
