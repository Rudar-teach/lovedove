'use client';

// Drop-in "Play with friend" for any game page.
//
// Usage (one line, that's all a game page needs):
//   <PlayWithFriend gameName="Memory Match" gameSlug="memory" />
//
// Renders the amber button (Bollywood style) and slides in the FriendPanel.
// Picking a friend stores the choice in sessionStorage (ld_friend_pick)
// so the page can switch into pass-and-play, and surfaces the rules.
// The ?friend=1 query param auto-opens the panel, so a catalog deep-link
// can carry the "with a friend" intent into the game page.

import { useEffect, useState } from 'react';
import { Clapperboard } from 'lucide-react';
import FriendPanel, { Friend } from './FriendPanel';

const PICK_KEY = 'ld_friend_pick';

export function saveFriendPick(friend: Friend) {
  try { sessionStorage.setItem(PICK_KEY, JSON.stringify({ id: friend.id, name: friend.name })); } catch {}
}

export function clearFriendPick() {
  try { sessionStorage.removeItem(PICK_KEY); } catch {}
}

export default function PlayWithFriend({
  gameName,
  gameSlug,
  onPlayFriend,
}: {
  gameName: string;
  gameSlug: string;
  onPlayFriend?: (friend: Friend) => void;
}) {
  const [open, setOpen] = useState(false);

  // ?friend=1 deep-link: auto-open the panel when the page loads with it.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('friend');
    if (q === '1' || q === 'true') setOpen(true);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
      >
        <Clapperboard className="w-4 h-4" />
        Play with friend
      </button>

      <FriendPanel
        gameName={gameName}
        gameSlug={gameSlug}
        open={open}
        onClose={() => setOpen(false)}
        onPlayFriend={(f) => {
          saveFriendPick(f);
          onPlayFriend?.(f);
          alert(
            `You chose ${f.name} for ${gameName}!\n\n` +
            'Pass-and-play: Player 1 goes first, then Player 2. ' +
            'For quiz games, both answers reveal only after both have finished.'
          );
          setOpen(false);
        }}
      />
    </>
  );
}
