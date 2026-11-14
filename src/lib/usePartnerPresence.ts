'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { resolvePartner, type PartnerInfo } from '@/lib/couple';

/**
 * Resolves "your partner" once (cached per user in module memory) and then
 * polls their live `is_online` presence every 15s so the navbar pill can
 * show "X is online now" without hammering the DB.
 *
 * Returns { partner, isOnline, lastSeen }. All null/false until resolved.
 */

export function usePartnerPresence(userId: string | null | undefined) {
  const [partner, setPartner] = useState<PartnerInfo | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);
  const partnerRef = useRef<PartnerInfo | null>(null);

  useEffect(() => {
    partnerRef.current = partner;
  }, [partner]);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;

    // resolvePartner carries its own 60s TTL cache, so bootstrapping and the
    // periodic re-resolve below collapse to one lookup per minute total.
    const bootstrap = async () => {
      const p = await resolvePartner(userId);
      if (!mounted) return;
      setPartner(p);
      if (p) {
        const { data } = await supabase
          .from('profiles')
          .select('is_online, last_seen')
          .eq('id', p.id)
          .maybeSingle();
        if (mounted && data) {
          setIsOnline(Boolean(data.is_online));
          setLastSeen((data.last_seen as string) || null);
        }
      }
    };

    const poll = async () => {
      const p = await resolvePartner(userId);
      if (!p) return;
      const { data } = await supabase
        .from('profiles')
        .select('is_online, last_seen')
        .eq('id', p.id)
        .maybeSingle();
      if (mounted && data) {
        setIsOnline(Boolean(data.is_online));
        setLastSeen((data.last_seen as string) || null);
      }
    };

    void bootstrap();
    const iv = setInterval(() => { void poll(); }, 15_000);

    // Refresh instantly when a presence change lands via realtime.
    const ch = supabase
      .channel(`partner-presence-${userId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          const p = partnerRef.current;
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
