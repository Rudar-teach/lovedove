'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2, Palette, Eraser, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import GameSharePanel from '@/components/GameSharePanel';

const PROMPTS = [
  "Draw your partner's face", "Draw a romantic dinner", "Draw a sunset kiss",
  "Draw your dream date", "Draw a love letter", "Draw a candlelit bath",
  "Draw a bouquet of roses", "Draw a wedding ring", "Draw holding hands",
  "Draw a picnic in the park", "Draw a cozy movie night", "Draw breakfast in bed",
  "Draw a surprise gift", "Draw dancing under stars", "Draw a beach sunset",
  "Draw a cozy fireplace", "Draw a flower crown", "Draw a love poem",
  "Draw a heart-shaped pizza", "Draw a bubble bath for two", "Draw a bike ride",
  "Draw a stargazing date", "Draw a cooking together moment", "Draw a slow dance",
  "Draw a flower garden", "Draw a cozy blanket fort", "Draw a coffee date",
  "Draw a handwritten note", "Draw a puppy gift", "Draw a rainy day hug",
  "Draw a hot air balloon ride", "Draw a snowman couple", "Draw a building a sandcastle",
  "Draw a sharing headphones", "Draw a paint each other", "Draw a rose petals trail",
  "Draw a couple silhouette", "Draw a fairy lights bedroom", "Draw a matching outfits",
  "Draw a skydiving together", "Draw a adopt a pet", "Draw a vintage car ride",
  "Draw a reading together", "Draw a Sunday morning", "Draw a building a pillow fort",
];

const COLORS = ['#ec4899', '#f43f5e', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#1f2937', '#ffffff'];

const CANVAS_W = 600;
const CANVAS_H = 380;

export default function DrawingChallengePage() {
  const [prompt, setPrompt] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [phase, setPhase] = useState<'prompt' | 'drawing' | 'done'>('prompt');
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [toast, setToast] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const newPrompt = useCallback(() => {
    setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  }, []);

  const startDrawing = () => {
    setPhase('drawing');
    setTimeLeft(60);
    newPrompt();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctxRef.current = ctx;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }, []);

  useEffect(() => {
    if (phase !== 'drawing' || timeLeft <= 0) {
      if (timeLeft <= 0 && phase === 'drawing') {
        setPhase('done');
      }
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    if ('touches' in e) {
      const t = e as unknown as React.TouchEvent<HTMLCanvasElement>;
      return { x: (t.touches[0].clientX - rect.left) * scaleX, y: (t.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getPos(e);
    ctxRef.current!.beginPath();
    ctxRef.current!.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    ctxRef.current!.lineWidth = brushSize;
    ctxRef.current!.strokeStyle = color;
    ctxRef.current!.lineTo(x, y);
    ctxRef.current!.stroke();
  };

  const endDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    if (!ctxRef.current) return;
    ctxRef.current.fillStyle = '#fff';
    ctxRef.current.fillRect(0, 0, CANVAS_W, CANVAS_H);
  };

  const inviteFriend = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-500" />
              Drawing Challenge
            </h1>
            <button onClick={inviteFriend} className="p-2 hover:bg-white rounded-full transition-colors">
              <Share2 className="w-5 h-5 text-primary-500" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {phase === 'prompt' && (
              <motion.div key="prompt" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center">
                    <p className="text-gray-500 mb-2">Your drawing challenge:</p>
                    <p className="text-3xl font-display font-bold text-primary-600 mb-6">🎨 {prompt || 'Tap Start!'}</p>
                    <div className="flex justify-center gap-3">
                      <Button onClick={startDrawing} variant="primary" size="lg">
                        Start Drawing! 🖌️
                      </Button>
                      <Button onClick={newPrompt} variant="outline">Shuffle Prompt</Button>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {(phase === 'drawing' || phase === 'done') && (
              <motion.div key="drawing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {/* Timer */}
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className={`text-2xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-primary-600'}`}>
                    ⏱️ {timeLeft}s
                  </div>
                  <div className="text-sm text-gray-500 bg-white/70 px-4 py-1 rounded-full">
                    🎨 {prompt}
                  </div>
                </div>

                {/* Timer bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary-500 to-rose-500 rounded-full"
                    animate={{ width: `${(timeLeft / 60) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <TiltCard intensity={3} glowColor="rgba(236, 72, 153, 0.08)">
                  <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-4">
                    <canvas
                      ref={canvasRef}
                      width={CANVAS_W}
                      height={CANVAS_H}
                      className="w-full rounded-2xl border-2 border-gray-200 cursor-crosshair touch-none"
                      onMouseDown={startDraw}
                      onMouseMove={draw}
                      onMouseUp={endDraw}
                      onMouseLeave={endDraw}
                      onTouchStart={startDraw}
                      onTouchMove={draw}
                      onTouchEnd={endDraw}
                    />

                    {/* Tools */}
                    <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                      {/* Colors */}
                      <div className="flex gap-1.5">
                        {COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? 'scale-125 border-gray-800' : 'border-gray-300 hover:scale-110'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>

                      {/* Brush size */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Size:</span>
                        {[2, 4, 8, 14].map(s => (
                          <button key={s} onClick={() => setBrushSize(s)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 ${brushSize === s ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
                            <div className="rounded-full bg-gray-700" style={{ width: Math.min(s, 12), height: Math.min(s, 12) }} />
                          </button>
                        ))}
                      </div>

                      <button onClick={clearCanvas} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eraser className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </TiltCard>

                {/* Done State */}
                <AnimatePresence>
                  {phase === 'done' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-6">
                      <p className="text-2xl font-bold text-primary-600 mb-2">🎉 Time&apos;s Up!</p>
                      <p className="text-gray-600 mb-4">Share your drawing with your partner!</p>
                      <div className="flex justify-center gap-3">
                        <Button onClick={inviteFriend} variant="primary">
                          <Share2 className="w-4 h-4 mr-2" /> Share Drawing
                        </Button>
                        <Button onClick={() => { setPhase('prompt'); setTimeLeft(60); newPrompt(); }} variant="outline">
                          <RotateCcw className="w-4 h-4 mr-2" /> New Challenge
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mt-6">
            <Link href="/games">
              <Button variant="ghost" size="sm">← Back to Games</Button>
            </Link>
          </div>

          <AnimatePresence>
            {toast && (
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-50">
                Link copied! Share with your partner 💕
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
            <GameSharePanel gameSlug="drawingchallenge" />
      </PremiumBackground>
  );
}
