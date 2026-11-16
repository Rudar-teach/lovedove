export type GameState = {
  turn: 'bear' | 'panda';
  board: (null | 'bear' | 'panda')[];
  winner: null | 'bear' | 'panda' | 'draw';
  lastMove: number | null;
};

export type PeerSyncPayload = {
  type: 'game-state';
  state: GameState;
  timestamp: number;
};
