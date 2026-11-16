'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { GameState, PeerSyncPayload } from './types';

type GameSyncResult = {
  localState: GameState | null;
  remoteState: GameState | null;
  sendMove: (index: number) => Promise<void>;
};

const EMPTY_BOARD = Array(9).fill(null);

function createInitialState(): GameState {
  return {
    turn: 'bear',
    board: EMPTY_BOARD,
    winner: null,
    lastMove: null,
  };
}

export function useGameSync(userIdA: string, userIdB: string): GameSyncResult {
  const sorted = [userIdA, userIdB].sort();
  const channelName = `ld-game-sync-${sorted[0]}:${sorted[1]}`;

  const [localState, setLocalState] = useState<GameState>(createInitialState);
  const [remoteState, setRemoteState] = useState<GameState | null>(null);
  const remoteRef = useRef(false);
  const sendingRef = useRef(false);

  useEffect(() => {
    const channel = supabase.channel(channelName);

    channel
      .on('broadcast', { event: 'game-state' }, (payload) => {
        const msg = payload.payload as PeerSyncPayload;
        if (msg.type !== 'game-state') return;
        if (sendingRef.current) return;
        remoteRef.current = true;
        setRemoteState(msg.state);
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;

        const initial: PeerSyncPayload = {
          type: 'game-state',
          state: localState,
          timestamp: Date.now(),
        };

        try {
          await channel.send({ type: 'broadcast', event: 'game-state', payload: initial });
        } catch {
          // ignore initial broadcast errors
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
    // Only re-bind when channel identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName]);

  const sendMove = async (index: number): Promise<void> => {
    setLocalState((prev) => {
      if (!prev || prev.winner) return prev;
      if (prev.board[index]) return prev;

      const next = [...prev.board] as GameState['board'];
      next[index] = prev.turn;

      const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ] as const;

      let winner: GameState['winner'] = null;
      for (const line of lines) {
        const [a, b, c] = line;
        if (next[a] && next[a] === next[b] && next[a] === next[c]) {
          winner = next[a];
          break;
        }
      }
      if (!winner && next.every((cell) => cell !== null)) {
        winner = 'draw';
      }

      const updated: GameState = {
        turn: prev.turn === 'bear' ? 'panda' : 'bear',
        board: next,
        winner,
        lastMove: index,
      };

      const payload: PeerSyncPayload = {
        type: 'game-state',
        state: updated,
        timestamp: Date.now(),
      };

      sendingRef.current = true;
      const ch = supabase.channel(channelName);
      ch.subscribe(() => {
        ch.send({ type: 'broadcast', event: 'game-state', payload }).finally(() => {
          sendingRef.current = false;
        });
      });

      return updated;
    });
  };

  return { localState, remoteState, sendMove };
}
