/**
 * Game Share Utility
 *
 * Provides helpers for generating shareable game session codes,
 * constructing share links, and extracting session params from the URL.
 */

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no confusing chars (I, O, 0, 1)

export function generateGameCode(): string {
  let code = '';
  const cryptoObj = typeof globalThis !== 'undefined' && (globalThis as any).crypto?.getRandomValues;
  if (cryptoObj) {
    const arr = new Uint32Array(6);
    (globalThis as any).crypto.getRandomValues(arr);
    for (let i = 0; i < 6; i++) {
      code += CHARS[arr[i] % CHARS.length];
    }
  } else {
    for (let i = 0; i < 6; i++) {
      code += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
  }
  return code;
}

export function getGameShareLink(gameSlug: string, sessionCode: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/games/${gameSlug}?session=${sessionCode}`;
}

export function getGameSessionFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('session');
}
