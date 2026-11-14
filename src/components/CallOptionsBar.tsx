'use client';

/**
 * WhatsApp/Insta-style inline call options: a small horizontal bar under a
 * friend/partner card row. Tapping 📞 starts a voice call, tapping 🎥 starts
 * a video call — both flow through the global CallCenter (WebRTC + Supabase
 * Realtime), so the friend gets the ringing call bar on their side.
 *
 * Pass `peer` (from a roster/friend row); the bar renders nothing for the
 * current user's own row.
 */

import { Phone, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCallStore } from '@/stores/useCallStore';
import type { CallPeer } from '@/lib/calls';

export default function CallOptionsBar({
  peer,
  showLabel = false,
}: {
  peer: CallPeer;
  /** When true, show "Call · Video" text next to the icons (mobile rows). */
  showLabel?: boolean;
}) {
  const startCall = useCallStore((s) => s.startCall);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="inline-flex items-center gap-1 rounded-full bg-gray-50 border border-gray-100 p-1 shadow-sm"
      role="group"
      aria-label={`Call options for ${peer.name}`}
    >
      <button
        onClick={() => startCall(peer, 'voice')}
        aria-label={`Voice call ${peer.name}`}
        title={`Voice call ${peer.name}`}
        className="w-8 h-8 rounded-full hover:bg-green-50 active:scale-90 transition flex items-center justify-center text-green-600"
      >
        <Phone className="w-4 h-4" />
      </button>
      <button
        onClick={() => startCall(peer, 'video')}
        aria-label={`Video call ${peer.name}`}
        title={`Video call ${peer.name}`}
        className="w-8 h-8 rounded-full hover:bg-blue-50 active:scale-90 transition flex items-center justify-center text-blue-600"
      >
        <Video className="w-4 h-4" />
      </button>
      {showLabel && (
        <span className="px-2 text-[10px] font-bold text-gray-400">
          Call · Video
        </span>
      )}
    </motion.div>
  );
}
