'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { resolvePartner, type PartnerInfo } from '@/lib/couple';

/**
 * Resolves "your partner" once (cached per user in module memory) and then
 * polls their live `is_online` presence every 15s so the navbar pill can
 * show "X is online now" without hammering the DB.
 *
 * Returns { partner, isOnline, lastSeen }. All null/false until resolved.
 */

// Module-level cache so every component using the hook shares one lookup.
const partnerCache = new Map<string, PartnerInfo | null>();
const lastFetch = new Map<string, number>();

export function usePartnerPresence(userId: string | null | undefined) {
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;

    const poll = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('is_online, last_seen')
        .eq('id', (partnerCache.get(userId) as PartnerInfo)?.id ?? 'x')
        .maybeSingle();
      if (!mounted) return;
      // We only know partner.id once resolved; guard against the placeholder.
      const known = partnerCache.get(userId);
      if (known && data) {
        setIsOnline(Boolean(data.is_online));
        setLastSeen((data.last_seen as string) || null);
      }
    };

    const bootstrap = async () => {
      let p = partnerCache.get(userId) ?? null;
      // Re-resolve at most every 60s to pick up a newly-accepted partner.
      const now = Date.now();
      if (p === undefined || now - (lastFetch.get(userId) || 0) > 60_000) {
        p = await resolvePartner(userId);
        partnerCache.set(userId, p);
        lastFetch.set(userId, now);
      }
      if (!mounted) return;
      setPartner(p);
      if (p) await poll();
    };

    void bootstrap();
    const iv = setInterval(() => {
      if (partnerCache.get(userId)) void poll();
    }, 15_000);

    // Refresh instantly when a presence change lands via realtime.
    const ch = supabase
      .channel(`partner-presence-${userId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          const p = partnerCache.get(userId);
          if (p && (payload.new as any)?.id === p.id) {
            setIsOnline(Boolean((payload.new as any).is_online));
            setLastSeen(((payload.new as any).last_seen as string) || null);
          }
        })
      .subscribe();

    return () => {
      mounted = false;
      clearInterval(iv);
      void supabase.removeChannel(ch);
    };
  }, [userId]);

  return { partner, isOnline, lastSeen };
}
