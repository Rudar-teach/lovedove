'use client';

/**
 * Love Dove — global call engine (WebRTC + Supabase Realtime broadcast).
 *
 * Mounted once in the root layout. It:
 *   • keeps a persistent per-user signaling channel (`ld-callto-<me>`)
 *     so incoming calls/rings arrive the moment the other side dials,
 *   • reacts to `useCallStore.startCall()` intents from anywhere in the UI,
 *   • runs the full WebRTC handshake (offer → answer → ICE) and renders
 *     the WhatsApp/Insta-style call UI: ringing card with Accept/Decline,
 *     in-call controls (mute / camera / end), live timer, video + PiP.
 *
 * Free: media flows peer-to-peer (STUN only); only tiny signaling JSON
 * crosses Supabase Realtime.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2, WifiOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCallStore } from '@/stores/useCallStore';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  CallMode, CallPeer, RTC_CONFIG,
  getLocalStream, makeRingtone, callTimer, logCallMessage,
} from '@/lib/calls';
import toast from 'react-hot-toast';

type Phase = 'idle' | 'outgoing' | 'incoming' | 'connected';

interface OfferPayload {
  from: string;
  fromPeer: CallPeer;
  mode: CallMode;
  sdp: RTCSessionDescriptionInit;
}

export default function CallCenter() {
  const me = useAuthStore((s) => s.user);
  const intent = useCallStore((s) => s.peer);
  const intentMode = useCallStore((s) => s.mode);
  const intentSeq = useCallStore((s) => s.seq);
  const clearIntent = useCallStore((s) => s.clearIntent);

  const [phase, setPhase] = useState<Phase>('idle');
  const [peer, setPeer] = useState<CallPeer | null>(null);
  const [mode, setMode] = useState<CallMode>('video');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [tick, setTick] = useState(0);

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const ringRef = useRef<ReturnType<typeof makeRingtone> | null>(null);
  const peerChannelsRef = useRef<Map<string, any>>(new Map());
  const candidateQueueRef = useRef<RTCIceCandidateInit[]>([]);
  const remoteDescSetRef = useRef(false);
  const ringTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingOfferRef = useRef<OfferPayload | null>(null);
  const answeringRef = useRef(false);

  // Live refs for handlers attached to realtime channels (they'd otherwise
  // capture stale state from the mount-time closure).
  const phaseRef = useRef<Phase>('idle');
  const peerRef = useRef<CallPeer | null>(null);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { peerRef.current = peer; }, [peer]);

  // ── helpers ─────────────────────────────────────────────────────────
  const startRinging = useCallback(() => {
    ringRef.current?.stop();
    ringRef.current = makeRingtone();
    ringRef.current.start();
  }, []);

  const stopRinging = useCallback(() => {
    ringRef.current?.stop();
    ringRef.current = null;
  }, []);

  const ensurePeerChannel = useCallback(async (peerId: string) => {
    let ch = peerChannelsRef.current.get(peerId);
    if (!ch) {
      ch = supabase.channel(`ld-callto-${peerId}`);
      await ch.subscribe();
      peerChannelsRef.current.set(peerId, ch);
    }
    return ch;
  }, []);

  const sendSignal = useCallback(async (peerId: string, event: string, payload: unknown) => {
    try {
      const ch = await ensurePeerChannel(peerId);
      ch.send({ type: 'broadcast', event, payload });
    } catch { /* transient signaling failure — the call just degrades */ }
  }, [ensurePeerChannel]);

  const teardown = useCallback((notifyPeer: string | null) => {
    if (notifyPeer) void sendSignal(notifyPeer, 'hangup', {});
    if (pcRef.current) {
      try { pcRef.current.close(); } catch { /* already closed */ }
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (remoteStream) remoteStream.getTracks().forEach((t) => t.stop());
    for (const [id, ch] of peerChannelsRef.current) {
      void supabase.removeChannel(ch);
      peerChannelsRef.current.delete(id);
    }
    candidateQueueRef.current = [];
    remoteDescSetRef.current = false;
    pendingOfferRef.current = null;
    answeringRef.current = false;
    if (ringTimeoutRef.current) { clearTimeout(ringTimeoutRef.current); ringTimeoutRef.current = null; }
    stopRinging();
    setRemoteStream(null);
    setLocalStream(null);
    setMuted(false);
    setCameraOn(false);
    setStartedAt(null);
    setPeer(null);
    setPhase('idle');
    clearIntent();
  }, [remoteStream, sendSignal, stopRinging, clearIntent]);

  const flushCandidates = useCallback(() => {
    const pc = pcRef.current;
    if (!pc || !remoteDescSetRef.current) return;
    const q = candidateQueueRef.current;
    candidateQueueRef.current = [];
    for (const c of q) pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
  }, []);

  // ── WebRTC setup for one side of the call ───────────────────────────
  const wireOutboundTracks = useCallback((stream: MediaStream, sendTo: string) => {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    pcRef.current = pc;
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    pc.onicecandidate = (e) => {
      if (e.candidate) void sendSignal(sendTo, 'ice', { candidate: e.candidate.toJSON() });
    };
    pc.ontrack = (e) => {
      setRemoteStream(e.streams[0]);
      setPhase('connected');
      setStartedAt(Date.now());
      stopRinging();
    };
  }, [sendSignal, stopRinging]);

  const wireAnsweringSide = useCallback(async (offer: OfferPayload, stream: MediaStream, sendTo: string) => {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    pcRef.current = pc;
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    pc.onicecandidate = (e) => {
      if (e.candidate) void sendSignal(sendTo, 'ice', { candidate: e.candidate.toJSON() });
    };
    pc.ontrack = (e) => {
      setRemoteStream(e.streams[0]);
      setPhase('connected');
      setStartedAt(Date.now());
      stopRinging();
    };
    await pc.setRemoteDescription(offer.sdp);
    remoteDescSetRef.current = true;
    flushCandidates();
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    void sendSignal(sendTo, 'answer', { sdp: answer });
  }, [flushCandidates, sendSignal, stopRinging]);

  // ── start an outgoing call (reacts to the global intent) ────────────
  useEffect(() => {
    if (!intent || !me || intentSeq === 0) return;
    if (phaseRef.current !== 'idle') {
      toast('End the current call first 📞');
      clearIntent();
      return;
    }
    const p = intent;
    const m = intentMode;
    const go = async () => {
      try {
        let stream: MediaStream;
        try {
          stream = await getLocalStream(m === 'video');
        } catch {
          if (m === 'video') {
            stream = await getLocalStream(false); // camera denied → voice fallback
          } else {
            toast.error('Mic permission is needed for calls — enable it and retry');
            clearIntent();
            return;
          }
        }
        localStreamRef.current = stream;
        setLocalStream(stream);
        setMuted(false);
        setCameraOn(m === 'video');
        setPeer(p);
        setMode(m);
        setPhase('outgoing');
        wireOutboundTracks(stream, p.id);
        const pc = pcRef.current!;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        startRinging();
        await sendSignal(p.id, 'offer', {
          from: me.id,
          fromPeer: p,
          mode: m,
          sdp: offer,
        } satisfies OfferPayload);
        // No answer in 60s → stop ringing, tell them we tried.
        ringTimeoutRef.current = setTimeout(() => {
          if (phaseRef.current === 'outgoing') {
            teardown(p.id);
            void logCallMessage(me.id, p.id, 'missed');
            toast(`Call to ${p.name} timed out — they'll see your missed-call note 💌`);
          }
        }, 60_000);
      } catch {
        teardown(null);
      }
    };
    void go();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intentSeq]);

  // ── accept / reject the ringing call ────────────────────────────────
  const accept = useCallback(async () => {
    const offer = pendingOfferRef.current;
    if (!offer || answeringRef.current || !me) return;
    answeringRef.current = true;
    stopRinging();
    if (ringTimeoutRef.current) { clearTimeout(ringTimeoutRef.current); ringTimeoutRef.current = null; }
    const wantVideo = offer.mode === 'video';
    let stream: MediaStream | null = null;
    try {
      stream = await getLocalStream(wantVideo);
    } catch {
      stream = await getLocalStream(false).catch(() => null);
      if (!stream) {
        answeringRef.current = false;
        void sendSignal(offer.from, 'busy', {});
        toast.error('No mic/camera access — could not answer');
        pendingOfferRef.current = null;
        setPhase('idle');
        setPeer(null);
        return;
      }
    }
    localStreamRef.current = stream;
    setLocalStream(stream);
    setMuted(false);
    setCameraOn(wantVideo && stream.getVideoTracks().length > 0);
    setPeer(offer.fromPeer);
    setMode(offer.mode);
    setPhase('connected');
    await wireAnsweringSide(offer, stream, offer.from);
    pendingOfferRef.current = null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  const reject = useCallback(() => {
    const offer = pendingOfferRef.current;
    if (offer) void sendSignal(offer.from, 'busy', {});
    pendingOfferRef.current = null;
    answeringRef.current = false;
    teardown(null);
    if (offer && me) {
      // A note lands in the CALLER's message feed: "you called, they didn't answer".
      void logCallMessage(me.id, offer.from, 'missed');
    }
  }, [teardown, sendSignal, me]);

  const hangup = useCallback(() => {
    teardown(peerRef.current?.id ?? null);
  }, [teardown]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !next; });
      return next;
    });
  }, []);

  const toggleCamera = useCallback(() => {
    setCameraOn((prev) => {
      const next = !prev;
      localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = next; });
      return next;
    });
  }, []);

  // ── incoming-signal handlers (on my own channel) ────────────────────
  const onOffer = useCallback(({ payload }: { payload: OfferPayload }) => {
    if (!payload?.fromPeer || !payload.sdp) return;
    if (phaseRef.current !== 'idle') {
      void sendSignal(payload.from, 'busy', {}); // already in a call
      return;
    }
    pendingOfferRef.current = payload;
    setPeer(payload.fromPeer);
    setMode(payload.mode);
    setPhase('incoming');
    startRinging();
    // 45s of ringing with no answer → auto-decline (they'll be notified).
    ringTimeoutRef.current = setTimeout(() => {
      if (phaseRef.current === 'incoming') reject();
    }, 45_000);
  }, [sendSignal, startRinging, reject]);

  const onAnswer = useCallback(({ payload }: { payload: { sdp: RTCSessionDescriptionInit } }) => {
    if (!payload?.sdp || !pcRef.current) return;
    pcRef.current.setRemoteDescription(payload.sdp).then(() => {
      remoteDescSetRef.current = true;
      flushCandidates();
    }).catch(() => {});
  }, [flushCandidates]);

  const onIce = useCallback(({ payload }: { payload: { candidate: RTCIceCandidateInit } }) => {
    if (!payload?.candidate) return;
    if (remoteDescSetRef.current && pcRef.current) {
      pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(() => {});
    } else {
      candidateQueueRef.current.push(payload.candidate);
    }
  }, []);

  const onHangup = useCallback(() => {
    if (phaseRef.current === 'incoming') {
      // Caller canceled while I'm ringing — they write the note on their side.
      pendingOfferRef.current = null;
      teardown(null);
      return;
    }
    teardown(null);
    toast('Call ended');
  }, [teardown]);

  const onBusy = useCallback(() => {
    if (phaseRef.current === 'outgoing') {
      // The other side already left a "missed call" note in my feed.
      teardown(null);
      toast(`${peerRef.current?.name ?? 'They'} is in another call right now — try again in a bit`);
    }
  }, [teardown]);

  // Keep the live handler set in refs so the realtime subscription (made
  // once per user) always dispatches to the latest closures.
  const handlersRef = useRef({ onOffer, onAnswer, onIce, onHangup, onBusy });
  useEffect(() => { handlersRef.current = { onOffer, onAnswer, onIce, onHangup, onBusy }; });

  useEffect(() => {
    if (!me) return;
    const ch = supabase.channel(`ld-callto-${me.id}`);
    ch.on('broadcast', { event: 'offer' }, (p) => handlersRef.current.onOffer(p as unknown as { payload: OfferPayload }));
    ch.on('broadcast', { event: 'answer' }, (p) => handlersRef.current.onAnswer(p as unknown as { payload: { sdp: RTCSessionDescriptionInit } }));
    ch.on('broadcast', { event: 'ice' }, (p) => handlersRef.current.onIce(p as unknown as { payload: { candidate: RTCIceCandidateInit } }));
    ch.on('broadcast', { event: 'hangup' }, () => handlersRef.current.onHangup());
    ch.on('broadcast', { event: 'busy' }, () => handlersRef.current.onBusy());
    void ch.subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [me?.id]);

  // Video element wiring + timer re-render.
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);
  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
  }, [localStream]);
  useEffect(() => {
    if (phase === 'connected' || phase === 'outgoing') {
      const t = setInterval(() => setTick((n) => n + 1), 1000);
      return () => clearInterval(t);
    }
  }, [phase]);
  void tick;

  // Clean up if the user is signed out mid-call.
  useEffect(() => {
    if (!me && pcRef.current) teardown(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  const inCall = phase !== 'idle';
  const isVideo = mode === 'video';

  return (
    <AnimatePresence>
      {inCall && peer && (
        <motion.div
          key="callbar"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[110] w-[calc(100%-1.5rem)] max-w-md"
        >
          <div className="rounded-3xl bg-gray-900/95 backdrop-blur-xl text-white shadow-2xl shadow-black/40 p-4 overflow-hidden">
            {/* Video stage */}
            {isVideo && (phase === 'connected' || phase === 'outgoing') && (
              <div className="relative rounded-2xl overflow-hidden bg-gray-800 aspect-video mb-3">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  muted={false}
                  className="w-full h-full object-cover bg-gray-800"
                />
                {phase === 'outgoing' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <div className="text-2xl">📞</div>
                    <p className="text-xs font-bold text-white/80">Video will appear when they answer</p>
                  </div>
                )}
                {/* Local PiP */}
                {localStream && (
                  <div className="absolute top-2 right-2 w-24 aspect-video rounded-lg overflow-hidden bg-gray-700 shadow-lg border border-white/10">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover -scale-x-100"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Header row */}
            <div className="flex items-center gap-3 mb-3">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-black text-lg">
                  {peer.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={peer.avatar_url} alt="" decoding="async" width={48} height={48} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    peer.name.charAt(0).toUpperCase()
                  )}
                </div>
                {phase === 'connected' && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-gray-900" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">
                  {peer.name} <span className="text-white/40 font-mono text-xs">@{peer.username}</span>
                </p>
                <p className="text-xs text-white/60 flex items-center gap-1.5">
                  {phase === 'incoming' && <span className="animate-pulse">📞 incoming {isVideo ? 'video' : 'voice'} call…</span>}
                  {phase === 'outgoing' && <span className="animate-pulse">📞 {peer.is_online ? 'ringing…' : 'waiting for them to open the site…'}</span>}
                  {phase === 'connected' && <><span className="text-green-400">●</span> {isVideo ? 'video' : 'voice'} · {callTimer(startedAt)}</>}
                </p>
              </div>
              {phase !== 'connected' && (
                <Loader2 className="w-4 h-4 text-white/50 animate-spin shrink-0" />
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              {phase === 'incoming' ? (
                <>
                  <button
                    onClick={reject}
                    aria-label="Decline call"
                    className="w-13 h-13 p-4 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 active:scale-95 transition"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => void accept()}
                    aria-label={isVideo ? 'Answer video call' : 'Answer voice call'}
                    className="p-4 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg shadow-green-500/30 active:scale-95 transition"
                  >
                    {isVideo ? <Video className="w-6 h-6" /> : <PhoneOff className="w-6 h-6 rotate-0" style={{ transform: 'none' }} />}
                  </button>
                </>
              ) : (
                <>
                  {phase === 'outgoing' ? (
                    <button
                      onClick={hangup}
                      aria-label="Cancel call"
                      className="p-4 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 active:scale-95 transition"
                    >
                      <PhoneOff className="w-6 h-6" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={toggleMute}
                        aria-label={muted ? 'Unmute' : 'Mute'}
                        className={`p-4 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition ${
                          muted ? 'bg-red-500' : 'bg-white/15 hover:bg-white/25'
                        }`}
                      >
                        {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>
                      {isVideo && (
                        <button
                          onClick={toggleCamera}
                          aria-label={cameraOn ? 'Turn camera off' : 'Turn camera on'}
                          className={`p-4 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition ${
                            cameraOn ? 'bg-white/15 hover:bg-white/25' : 'bg-red-500'
                          }`}
                        >
                          {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                        </button>
                      )}
                      <button
                        onClick={hangup}
                        aria-label="End call"
                        className="px-6 py-4 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 active:scale-95 transition"
                      >
                        <PhoneOff className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>

            {phase === 'outgoing' && !peer.is_online && (
              <p className="text-center text-[10px] text-white/40 mt-2.5 flex items-center justify-center gap-1">
                <WifiOff className="w-3 h-3" /> offline — they&apos;ll see your missed-call note when they open the site
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
