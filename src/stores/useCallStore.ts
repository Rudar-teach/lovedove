import { create } from 'zustand';
import type { CallMode, CallPeer } from '@/lib/calls';

/**
 * Global call intent: any "call button" in the app calls startCall();
 * the CallCenter (mounted once in the layout) reacts and runs the call.
 * `seq` re-triggers even for the same peer/mode combo.
 */
interface CallState {
  peer: CallPeer | null;
  mode: CallMode;
  seq: number;
  startCall: (peer: CallPeer, mode: CallMode) => void;
  clearIntent: () => void;
}

export const useCallStore = create<CallState>((set) => ({
  peer: null,
  mode: 'video',
  seq: 0,
  startCall: (peer, mode) => set((s) => ({ peer, mode, seq: s.seq + 1 })),
  clearIntent: () => set({ peer: null }),
}));
