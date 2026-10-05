'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2, RotateCcw, Trophy, Pencil, Eye } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';
import GameSharePanel from '@/components/GameSharePanel';

const WORDS = [
  "Heart", "Rose", "Couple", "Kiss", "Ring", "Wedding dress", "Chocolate", "Candle", "Love letter",
  "Diamond ring", "Teddy bear", "Balloons", "Sunset", "Beach", "Date night", "Hug", "Fireworks",
  "Butterfly", "Dove", "Music note", "Dance", "Movie night", "Cooking together", "Puppy", "Cat",
  "Bouquet", "Heart-shaped box", "Moon and stars", "Boat", "Castle", "Cupid", "Bridge",
  "Flower crown", "Umbrella", "Coffee cup", "Bicycle", "Moon", "Swan", "Rabbit",
  "Guitar", "Umbrella", "Pizza", "Cake", "Ice cream", "Shoes", "T-shirt", "Sunglasses",
  "Penguin", "Horse", "Treehouse", "Mermaid", "Robot", "Castle", "Cloud",
];

const CATEGORIES: Record<string, string[]> = {
  "Love Symbols": ["Heart", "Rose", "Ring", "Kiss", "Dove", "Cupid", "Butterfly", "Wedding dress"],
  "Romantic Moments": ["Date night", "Sunset", "Beach", "Dance", "Hug", "Movie night", "Cooking together", "Fireworks"],
  "Cute Things": ["Teddy bear", "Puppy", "Cat", "Rabbit", "Penguin", "Swan", "Mermaid", "Balloons"],
  "Objects": ["Chocolate", "Cake", "Pizza", "Ice cream", "Coffee cup", "Guitar", "Bicycle", "Sunglasses"],
  "Places & Fantasy": ["Castle", "Treehouse", "Cloud", "Moon", "Boat", "Bridge", "Mermaid", "Robot"],
};

function getRandomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export default function CouplePictionaryPage() {
  const [phase, setPhase] = useState<'setup' | 'drawing' | 'guessing' | 'result'>('setup');
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [word, setWord] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [round, setRound] = useState(1);
  const [maxRounds] = useState(3);
  const [message, setMessage] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const drawRef = useRef({ x: 0, y: 0 });
  const guessedRef = useRef(false);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  }, []);

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (phase !== 'drawing' || currentPlayer !== 1) return;
    e.preventDefault();
    setDrawing(true);
    const pos = getPos(e);
    drawRef.current = pos;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    e.preventDefault();
    const pos = getPos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    drawRef.current = pos;
  };

  const endDraw = () => { setDrawing(false); };

  const startRound = () => {
    const w = getRandomWord();
    setWord(w);
    setPhase('drawing');
    setTimeLeft(60);
    guessedRef.current = false;
    clearCanvas();
  };

  // Timer
  useEffect(() => {
    if (phase !== 'drawing' && phase !== 'guessing') return;
    if (phase === 'guessing') return; // timer stopped during guessing? Let's keep it going for fairness
    if (timeLeft <= 0) {
      if (phase === 'drawing') {
        // Switch to guessing
        setPhase('guessing');
        setTimeLeft(30);
      } else {
        // Time up, round over
        setPhase('result');
        setMessage(`Time's up! The word was "${word}"`);
      }
      return;
    }
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [phase, timeLeft]);

  const submitGuess = () => {
    const input = document.getElementById('guess-input') as HTMLInputElement;
    const guess = input?.value.trim().toLowerCase();
    if (!guess) return;
    if (guess === word.toLowerCase()) {
      guessedRef.current = true;
      const timeBonus = Math.max(0, timeLeft);
      const pts = 50 + timeBonus;
      if (currentPlayer === 1) {
        setScore1(s => s + pts);
        setMessage(`${player1Name} guessed it! +${pts} pts (incl. ${timeBonus} time bonus)`);
      } else {
        setScore2(s => s + pts);
        setMessage(`${player2Name} guessed it! +${pts} pts (incl. ${timeBonus} time bonus)`);
      }
      // Drawer also gets points
      const drawerPts = 25;
      if (currentPlayer === 1) {
        setScore2(s => s + drawerPts); // player 1 was drawing, player 2 guessed
      } else {
        setScore1(s => s + drawerPts);
      }
      setTimeout(() => setPhase('result'), 500);
    } else {
      input.value = '';
    }
  };

  const nextRound = () => {
    if (round >= maxRounds) {
      setPhase('setup');
      return;
    }
    setRound(r => r + 1);
    setCurrentPlayer(p => (p === 1 ? 2 : 1) as 1 | 2);
    setPhase('setup');
  };

  const resetGame = () => {
    setScore1(0);
    setScore2(0);
    setRound(1);
    setCurrentPlayer(1);
    setPhase('setup');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  // Setup phase
  if (phase === 'setup') {
    return (
      <PremiumBackground>
        <div className="min-h-screen py-8 px-4">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-8">
              <Link href="/games">
                <button className="p-2 hover:bg-white rounded-full transition-colors">
                  <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
              </Link>
              <h1 className="text-2xl md:text-3xl font-display font-black gradient-text-animated flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary-500" />
                Couple Pictionary
              </h1>
              <div className="w-10" />
            </div>

            {/* Scores */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-3 text-center border-2 border-pink-100">
                <p className="text-xs text-gray-500">{player1Name}</p>
                <p className="text-2xl font-bold text-primary-600">{score1} pts</p>
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-3 text-center border-2 border-pink-100">
                <p className="text-xs text-gray-500">{player2Name}</p>
                <p className="text-2xl font-bold text-rose-600">{score2} pts</p>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 mb-4">
              Round {round}/{maxRounds} | {currentPlayer === 1 ? player1Name : player2Name} will draw next
            </div>

            <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 space-y-4">
                <Pencil className="w-12 h-12 text-primary-500 mx-auto" />
                <h2 className="text-xl font-display font-bold text-center text-gray-800">Pass &amp; Play</h2>

                <div className="flex justify-center gap-4">
                  <input
                    value={player1Name}
                    onChange={e => setPlayer1Name(e.target.value)}
                    placeholder="Player 1"
                    className="bg-white border-2 border-pink-200 rounded-xl px-3 py-2 text-center font-medium text-gray-800 outline-none focus:border-primary-400"
                  />
                  <input
                    value={player2Name}
                    onChange={e => setPlayer2Name(e.target.value)}
                    placeholder="Player 2"
                    className="bg-white border-2 border-pink-200 rounded-xl px-3 py-2 text-center font-medium text-gray-800 outline-none focus:border-primary-400"
                  />
                </div>

                <div className="bg-pink-50 rounded-xl p-4 text-sm text-gray-600 space-y-1">
                  <p className="font-semibold text-gray-800">How to Play:</p>
                  <p>1. Player {currentPlayer} gets a word to draw</p>
                  <p>2. Player {currentPlayer} draws it (60 sec)</p>
                  <p>3. Player {currentPlayer === 1 ? 2 : 1} guesses (30 sec)</p>
                  <p>4. Score = correct guesses + time bonus</p>
                </div>

                <Button onClick={startRound} variant="primary" size="lg" className="w-full">
                  {round === 1 ? 'Start Round 1 🎨' : `Start Round ${round} 🎨`}
                </Button>
              </div>
            </TiltCard>

            <div className="flex justify-center gap-3 mt-4">
              <Button onClick={copyLink} variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-1" /> Invite Friend
              </Button>
              {(score1 > 0 || score2 > 0) && (
                <Button onClick={resetGame} variant="ghost" size="sm">
                  <RotateCcw className="w-4 h-4 mr-1" /> Reset Scores
                </Button>
              )}
            </div>
          </div>
        </div>
        <GameSharePanel gameSlug="couplepictionary" />
      </PremiumBackground>
    );
  }

  // Drawing phase (Player 1 draws)
  if (phase === 'drawing' && currentPlayer === 1) {
    return (
      <PremiumBackground>
        <div className="min-h-screen py-8 px-4">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setPhase('setup')} className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-xl font-display font-black gradient-text-animated">🎨 Draw!</h1>
              <div className="text-sm font-bold text-primary-600 bg-primary-100 px-3 py-1 rounded-full">
                {timeLeft}s
              </div>
            </div>

            <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.1)">
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-4">
                <div className="bg-gradient-to-r from-primary-100 to-rose-100 rounded-2xl p-4 mb-4 text-center border border-primary-200">
                  <p className="text-xs text-gray-500 mb-1">Draw this:</p>
                  <p className="text-2xl font-black text-primary-700">{word}</p>
                </div>

                <div className="flex justify-center overflow-hidden rounded-2xl border-2 border-pink-100 bg-white">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={350}
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={endDraw}
                    onMouseLeave={endDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={endDraw}
                    className="cursor-crosshair touch-none"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                </div>

                <div className="flex justify-center gap-3 mt-4">
                  <Button onClick={clearCanvas} variant="outline" size="sm">Clear</Button>
                </div>
              </div>
            </TiltCard>

            <div className="text-center mt-3">
              <p className="text-sm text-gray-500">Pass the device to {player2Name} when ready</p>
            </div>
          </div>
        </div>
      </PremiumBackground>
    );
  }

  // Guessing phase
  if (phase === 'guessing') {
    return (
      <PremiumBackground>
        <div className="min-h-screen py-8 px-4">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setPhase('drawing')} className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1">
                <Eye className="w-5 h-5 text-primary-500" /> Guess!
              </h1>
              <div className="text-sm font-bold text-primary-600 bg-primary-100 px-3 py-1 rounded-full">
                {timeLeft}s
              </div>
            </div>

            <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.1)">
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-4">
                <div className="flex justify-center mb-4 overflow-hidden rounded-2xl border-2 border-pink-100">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={350}
                    style={{ maxWidth: '100%', height: 'auto', pointerEvents: 'none' }}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      id="guess-input"
                      type="text"
                      placeholder="Type your guess..."
                      onKeyDown={e => e.key === 'Enter' && submitGuess()}
                      className="flex-1 bg-white border-2 border-pink-200 rounded-xl px-4 py-2 font-medium text-gray-800 outline-none focus:border-primary-400"
                    />
                    <Button onClick={submitGuess} variant="primary">Guess!</Button>
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    {player2Name} is guessing! {player1Name}&apos;s drawing is shown above.
                  </p>
                </div>
              </div>
            </TiltCard>
          </div>
        </div>
      </PremiumBackground>
    );
  }

  // Result phase
  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-2xl md:text-3xl font-display font-black gradient-text-animated flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary-500" />
              Results
            </h1>
            <div className="w-10" />
          </div>

          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
              <p className="text-xl font-bold text-gray-800">{message}</p>
              <p className="text-sm text-gray-500">The word was: <strong className="text-primary-600">{word}</strong></p>

              <div className="flex justify-center gap-6">
                <div className="bg-primary-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">{player1Name}</p>
                  <p className="text-3xl font-black text-primary-600">{score1}</p>
                </div>
                <div className="bg-rose-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">{player2Name}</p>
                  <p className="text-3xl font-black text-rose-600">{score2}</p>
                </div>
              </div>

              {round >= maxRounds ? (
                <Button onClick={resetGame} variant="primary" size="lg" className="w-full">
                  Play Again 🔄
                </Button>
              ) : (
                <Button onClick={nextRound} variant="primary" size="lg" className="w-full">
                  Next Round ➡️
                </Button>
              )}
            </div>
          </TiltCard>

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
