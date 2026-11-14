/**
 * Love Dove — P2P voice/video calls (WebRTC, free, no paid service).
 *
 * Signaling rides on Supabase Realtime **broadcast** (in-memory, no DB
 * table): both parties share the channel `ld-call-<a>:<b>` (ids sorted,
 * so both compute the same name) and exchange offer/answer/ICE/hangup.
 *
 * Camera/mic toggling uses `track.enabled` so no renegotiation is ever
 * needed mid-call.
 */

/** Free public STUN servers — enough for most NAT types, zero cost. */
export const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export type CallMode = 'voice' | 'video';
export type CallStatus = 'idle' | 'outgoing' | 'incoming' | 'connected';

export interface CallPeer {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  is_online: boolean;
}

/** Deterministic pair id — the two sides always compute the same channel. */
export function callPairKey(me: string, other: string): string {
  return [me, other].sort().join(':');
}

export function callChannelName(me: string, other: string): string {
  return `ld-call-${callPairKey(me, other)}`;
}

export interface CallSignal {
  type: 'offer' | 'answer' | 'ice' | 'hangup' | 'presence';
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  video?: boolean;
}

/**
 * Synthesized ring tone (no audio assets). Loops until stopped.
 * A two-note "ding-dong" bell, ~every 2s.
 */
export function makeRingtone(): { start: () => void; stop: () => void } {
  let ctx: AudioContext | null = null;
  let loop: ReturnType<typeof setInterval> | null = null;
  let stopped = false;

  const chime = (freq: number, offsetMs: number) => {
    if (!ctx) return;
    const t0 = ctx.currentTime + offsetMs / 1000;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.35, t0 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.7);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.75);
  };

  return {
    start() {
      if (loop || stopped) return;
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      const ring = () => { chime(880, 0); chime(659.25, 500); }; // A5 → E5
      ring();
      loop = setInterval(ring, 2200);
    },
    stop() {
      stopped = true;
      if (loop) { clearInterval(loop); loop = null; }
      if (ctx) { void ctx.close().catch(() => {}); ctx = null; }
    },
  };
}

/** Ask for mic (+ camera for video). Rejects on permission denial. */
export async function getLocalStream(video: boolean): Promise<MediaStream> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true },
    video: video ? { width: { ideal: 640 }, height: { ideal: 480 } } : false,
  } as MediaStreamConstraints);
  if (video) {
    // Hide the camera from the remote side but keep the track (so toggling
    // needs no renegotiation).
    stream.getVideoTracks().forEach((t) => { t.enabled = false; t.enabled = true; });
  }
  return stream;
}

/** mm:ss timer from an epoch-ms start. */
export function callTimer(startedAt: number | null): string {
  if (!startedAt) return '0:00';
  const secs = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
  const m = Math.floor(secs / 60);
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Drop a "missed/finished call" note into friend_messages so the other
 * side sees it even if they weren't online for the live call.
 */
export function logCallMessage(
  meId: string,
  peerId: string,
  kind: 'missed' | 'ended'
): Promise<void> {
  const body =
    kind === 'missed'
      ? '📞 You called — open the chat to say hi back!'
      : `🎥 Call ended — tap chat to keep talking.`;
  return import('./supabase').then(({ supabase }) =>
    supabase
      .from('friend_messages')
      .insert({ sender_id: meId, recipient_id: peerId, body })
      .then(() => {})
  );
}
