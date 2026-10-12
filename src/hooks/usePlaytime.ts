import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const ACTIVE_INTERVAL = 30000; // 30 seconds heartbeat

export function usePlaytime(gameType: string) {
  const [isActive, setIsActive] = useState(false);
  const [secondsPlayed, setSecondsPlayed] = useState(0);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const userIdRef = useRef<string | null>(null);
  const gameTypeRef = useRef(gameType);

  useEffect(() => {
    gameTypeRef.current = gameType;
  }, [gameType]);

  const getUserId = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  }, []);

  const updateStats = useCallback(async (userId: string, additionalSeconds: number) => {
    try {
      // Get current stats
      const { data: existing } = await supabase
        .from('game_stats')
        .select('*')
        .eq('user_id', userId)
        .eq('game_type', gameTypeRef.current)
        .single();

      if (existing) {
        await supabase.from('game_stats').update({
          total_time_played: existing.total_time_played + additionalSeconds,
          games_played: existing.games_played,
          last_played: new Date().toISOString(),
        }).eq('id', existing.id);
      } else {
        await supabase.from('game_stats').insert({
          user_id: userId,
          game_type: gameTypeRef.current,
          games_played: 0,
          total_time_played: additionalSeconds,
          wins: 0,
          losses: 0,
          last_played: new Date().toISOString(),
        });
      }

      // Update badge progress
      const totalSeconds = secondsPlayed + additionalSeconds;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);

      if (hours > 0 || minutes > 0) {
        // Check for time-based badges
        const { data: badges } = await supabase.from('badges').select('*').or(
          `requirement_type.eq.playtime_hours,requirement_type.eq.playtime_minutes`
        );

        for (const badge of badges || []) {
          const earned = hours >= badge.requirement_value && badge.requirement_type === 'playtime_hours'
            || minutes >= badge.requirement_value && badge.requirement_type === 'playtime_minutes';

          if (earned) {
            const { data: alreadyEarned } = await supabase
              .from('user_badges')
              .select('id')
              .eq('user_id', userId)
              .eq('badge_id', badge.id)
              .single();

            if (!alreadyEarned) {
              await supabase.from('user_badges').insert({
                user_id: userId,
                badge_id: badge.id,
              });
            }
          }
        }
      }
    } catch (e) {
      console.error('Error updating playtime:', e);
    }
  }, [secondsPlayed]);

  const startTracking = useCallback(async () => {
    const userId = await getUserId();
    if (!userId) return;
    userIdRef.current = userId;
    startTimeRef.current = Date.now();
    setIsActive(true);
    setSecondsPlayed(0);

    intervalRef.current = setInterval(() => {
      setSecondsPlayed(prev => {
        const newSeconds = prev + ACTIVE_INTERVAL / 1000;
        if (userIdRef.current) {
          updateStats(userIdRef.current, ACTIVE_INTERVAL / 1000);
        }
        return newSeconds;
      });
    }, ACTIVE_INTERVAL);
  }, [getUserId, updateStats]);

  const stopTracking = useCallback(async () => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (userIdRef.current && startTimeRef.current) {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (duration > 0) {
        await updateStats(userIdRef.current, duration);
      }
    }
    startTimeRef.current = 0;
  }, [updateStats]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return {
    isActive,
    secondsPlayed,
    formattedTime: formatTime(secondsPlayed),
    totalTime: secondsPlayed,
    startTracking,
    stopTracking,
  };
}
