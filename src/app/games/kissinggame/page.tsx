'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const OPTIONS = [
  "Kiss on the forehead 💋", "Hug for 10 seconds 🤗", "Say something sweet 💝",
  "Dance to your favorite song 💃", "Whisper in their ear 🎶", "Rub their shoulders 💆",
  "Trace a heart on their back ✏️", "Hold hands for 1 minute 🖐️", "Feed them a treat 🍫",
  "Write a love note 📝", "Play with their hair 💇", "Give a foot massage 🦶",
  "Sing their favorite song 🎤", "Do their voice imitation 🎭", "Share a drink 👄",
  "Nuzzle their neck 😘", "Make a funny face 😜", "Whisper what you love about them 💕",
  "Stare into their eyes 👀", "Do 5 push-ups 🏋️", "Give a piggyback ride 🐷",
  "Draw on their face 🎨", "Say 3 things you adore ❤️", "Blindfold them 👁️",
  "Give a surprise kiss 😚", "Recite a poem 📖", "Plan a date night 📅",
  "Tell them a secret 🤫", "Cuddle and watch a show 📺", "Wink and say 'nice' 😏",
  "Hug from behind 🫂", "Make a flower crown 🌸", "Whisper a secret wish 🌟",
  "Do a handstand challenge 🤸", "Share your favorite memory 🧠",
  "Sniff their shirt 👕", "Let them pick a song 💿", "Tell an embarrassing story 😳",
  "Make up a song about them 🎵", "Do a romantic pose 📸",
];

export default function KissingGamePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const animRef = useRef(0);

  const spin = useCallback(() => {
    setResult(null);
    setShowResult(false);
    setSpinning(true);
    const start = performance.now();
    const duration = 4000;
    const fromRotation = rotation;
    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const targetRotation = fromRotation + 360 * extraSpins + Math.random() * 360;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setRotation(fromRotation + (targetRotation - fromRotation) * eased);
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setRotation(targetRotation);
        const finalAngle = ((targetRotation % 360) + 360) % 360;
        const segmentAngle = 360 / OPTIONS.length;
        const index = Math.floor(((360 - finalAngle) % 360) / segmentAngle) % OPTIONS.length;
        setResult(OPTIONS[index]);
        setTimeout(() => setShowResult(true), 300);
      }
    };
    animRef.current = requestAnimationFrame(animate);
  }, [rotation]);

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(cx, cy) - 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#fdf2f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer ring
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
    ctx.stroke();

    // Segments
    const segAngle = (Math.PI * 2) / OPTIONS.length;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((rotation * Math.PI) / 180);

    for (let i = 0; i < OPTIONS.length; i++) {
      const a0 = i * segAngle;
      const a1 = a0 + segAngle;

      // Segment fill
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, a0, a1);
      ctx.closePath();

      const hue = (i / OPTIONS.length) * 60 + 340;
      ctx.fillStyle = `hsl(${hue}, 80%, 75%)`;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.rotate(a0 + segAngle / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#7f1d1d';
      ctx.font = 'bold 11px Inter, sans-serif';
      const words = OPTIONS[i].split(' ');
      if (words.length <= 2) {
        ctx.fillText(OPTIONS[i].replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim(), r * 0.6, 4);
      } else {
        ctx.fillText(words.slice(0, 2).join(' ').replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim(), r * 0.55, -3);
        ctx.fillText(words.slice(2).join(' ').replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim(), r * 0.55, 10);
      }
      ctx.restore();
    }

    ctx.restore();

    // Center circle
    const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 25);
    centerGrad.addColorStop(0, '#fce7f3');
    centerGrad.addColorStop(1, '#ec4899');
    ctx.fillStyle = centerGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💕', cx, cy);

    // Pointer
    ctx.fillStyle = '#be185d';
    ctx.beginPath();
    ctx.moveTo(cx + r + 10, cy);
    ctx.lineTo(cx + r - 8, cy - 8);
    ctx.lineTo(cx + r - 8, cy + 8);
    ctx.closePath();
    ctx.fill();
  }, [rotation]);

  useEffect(() => {
    drawWheel();
  }, [rotation, drawWheel]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-2xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              Kissing Game
            </h1>
            <div className="w-10" />
          </div>

          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 flex flex-col items-center">
              <canvas
                ref={canvasRef}
                width={340}
                height={340}
                className="rounded-2xl"
                style={{ maxWidth: '100%', height: 'auto' }}
              />

              <Button
                onClick={spin}
                disabled={spinning}
                variant="primary"
                size="lg"
                className="mt-5 px-10"
              >
                {spinning ? 'Spinning... ✨' : 'Spin the Wheel! 🎡'}
              </Button>
            </div>
          </TiltCard>

          {/* Result */}
          <AnimatePresence>
            {showResult && result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 text-center space-y-3"
              >
                <div className="text-4xl">🎲</div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Your Romantic Activity</p>
                <p className="text-2xl font-display font-bold text-primary-600">{result}</p>
                <p className="text-sm text-gray-500">Time to make some memories! 💕</p>
                <div className="flex justify-center gap-2">
                  <Button onClick={spin} variant="primary" size="sm">
                    Spin Again 🔄
                  </Button>
                  <Button onClick={() => setShowResult(false)} variant="outline" size="sm">
                    Close
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-center gap-3 mt-4">
            <Button onClick={copyLink} variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-1" /> Invite Friend
            </Button>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}
