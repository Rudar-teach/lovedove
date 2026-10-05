'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export type PlayerInfo = {
  id: string;
  username: string;
};

type GameSessionState = {
  sessionId: string | null;
  sessionCode: string | null;
  players: PlayerInfo[];
  gameState: Record<string, any>;
  status: 'idle' | 'waiting' | 'active' | 'completed';
  currentTurn: string | null;
};

type GameSessionContextValue = {
  state: GameSessionState;
  createSession: (gameType: string) => Promise<string | null>;
  joinSession: (code: string) => Promise<boolean>;
  leaveSession: () => Promise<void>;
  updateGameState: (state: Record<string, any>) => Promise<void>;
  setCurrentTurn: (playerId: string) => Promise<void>;
  completeSession: (winnerId?: string) => Promise<void>;
};

const GameSessionContext = createContext<GameSessionContextValue>({
  state: {
    sessionId: null,
    sessionCode: null,
    players: [],
    gameState: {},
    status: 'idle',
    currentTurn: null,
  },
  createSession: async () => null,
  joinSession: async () => false,
  leaveSession: async () => {},
  updateGameState: async () => {},
  setCurrentTurn: async () => {},
  completeSession: async () => {},
});

export function useGameSession() {
  return useContext(GameSessionContext);
}

const POLL_INTERVAL = 2000;

export function GameSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameSessionState>({
    sessionId: null,
    sessionCode: null,
    players: [],
    gameState: {},
    status: 'idle',
    currentTurn: null,
  });

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isHostRef = useRef(false);

  const clearPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const subscribeRealtime = useCallback((sessionId: string) => {
    clearPolling();

    try {
      const ch = supabase
        .channel(`game-session-${sessionId}`)
        .on('broadcast', { event: 'game-update' }, () => {
          // Realtime signal — refetch state
          void sessionId;
        })
        .subscribe();

      channelRef.current = ch;
    } catch {
      // Realtime not available — fall back to polling
    }
  }, [clearPolling]);

  const startPolling = useCallback((sessionId: string) => {
    clearPolling();
    pollTimerRef.current = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();
        if (data && !error) {
          setState((prev) => ({
            ...prev,
            gameState: data.game_state || prev.gameState,
            status: (data.status as GameSessionState['status']) || prev.status,
            currentTurn: data.current_turn || prev.currentTurn,
            players: [
              data.player1_id ? { id: data.player1_id, username: '' } : null,
              data.player2_id ? { id: data.player2_id, username: '' } : null,
            ].filter(Boolean) as PlayerInfo[],
          }));
        }
      } catch {
        // ignore poll errors
      }
    }, POLL_INTERVAL);
  }, [clearPolling]);

  const createSession = useCallback(async (gameType: string): Promise<string | null> => {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) return null;

      const code = generateGameCode();
      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          game_type: gameType,
          session_code: code,
          player1_id: authSession.user.id,
          player2_id: null,
          game_state: {},
          status: 'waiting',
          current_turn: authSession.user.id,
        })
        .select('id, session_code')
        .single();

      if (error || !data) {
        console.error('Failed to create session:', error);
        return null;
      }

      isHostRef.current = true;
      setState({
        sessionId: data.id,
        sessionCode: data.session_code,
        players: [{ id: authSession.user.id, username: authSession.user.email || '' }],
        gameState: {},
        status: 'waiting',
        currentTurn: authSession.user.id,
      });

      subscribeRealtime(data.id);
      return data.session_code;
    } catch (err) {
      console.error('createSession error:', err);
      return null;
    }
  }, [subscribeRealtime]);

  const joinSession = useCallback(async (code: string): Promise<boolean> => {
    try {
      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (!authSession) return false;

      const { data: existing } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('session_code', code)
        .eq('status', 'waiting')
        .is('player2_id', null)
        .single();

      if (!existing) return false;

      const { error } = await supabase
        .from('game_sessions')
        .update({ player2_id: authSession.user.id, status: 'active' })
        .eq('id', existing.id);

      if (error) return false;

      isHostRef.current = false;
      setState({
        sessionId: existing.id,
        sessionCode: existing.session_code,
        players: [
          { id: existing.player1_id, username: '' },
          { id: authSession.user.id, username: authSession.user.email || '' },
        ],
        gameState: existing.game_state || {},
        status: 'active',
        currentTurn: existing.player1_id,
      });

      subscribeRealtime(existing.id);
      return true;
    } catch (err) {
      console.error('joinSession error:', err);
      return false;
    }
  }, [subscribeRealtime]);

  const leaveSession = useCallback(async () => {
    clearPolling();
    if (channelRef.current) {
      try {
        await supabase.removeChannel(channelRef.current);
      } catch { /* ignore */ }
      channelRef.current = null;
    }
    setState({
      sessionId: null,
      sessionCode: null,
      players: [],
      gameState: {},
      status: 'idle',
      currentTurn: null,
    });
  }, [clearPolling]);

  const updateGameState = useCallback(async (newState: Record<string, any>) => {
    if (!state.sessionId) return;
    try {
      const { error } = await supabase
        .from('game_sessions')
        .update({ game_state: newState })
        .eq('id', state.sessionId);

      if (error) {
        console.error('updateGameState error:', error);
        return;
      }

      setState((prev) => ({ ...prev, gameState: newState }));

      // Broadcast to other player
      if (channelRef.current) {
        channelRef.current.send({ type: 'broadcast', event: 'game-update', payload: newState }).catch(() => {});
      }
    } catch (err) {
      console.error('updateGameState error:', err);
    }
  }, [state.sessionId]);

  const setCurrentTurn = useCallback(async (playerId: string) => {
    if (!state.sessionId) return;
    try {
      await supabase
        .from('game_sessions')
        .update({ current_turn: playerId })
        .eq('id', state.sessionId);
      setState((prev) => ({ ...prev, currentTurn: playerId }));
    } catch (err) {
      console.error('setCurrentTurn error:', err);
    }
  }, [state.sessionId]);

  const completeSession = useCallback(async (winnerId?: string) => {
    if (!state.sessionId) return;
    try {
      await supabase
        .from('game_sessions')
        .update({
          status: 'completed',
          winner_id: winnerId || null,
          ended_at: new Date().toISOString(),
        })
        .eq('id', state.sessionId);
      setState((prev) => ({ ...prev, status: 'completed' }));
      clearPolling();
    } catch (err) {
      console.error('completeSession error:', err);
    }
  }, [state.sessionId, clearPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearPolling();
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current).catch(() => {});
      }
    };
  }, [clearPolling]);

  const value: GameSessionContextValue = {
    state,
    createSession,
    joinSession,
    leaveSession,
    updateGameState,
    setCurrentTurn,
    completeSession,
  };

  return (
    <GameSessionContext.Provider value={value}>
      {children}
    </GameSessionContext.Provider>
  );
}

// Import the code generator so the provider can use it
import { generateGameCode } from '@/lib/gameShare';
