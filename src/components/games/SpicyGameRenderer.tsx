'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Trophy } from 'lucide-react';
import { SpicyGameDef } from '@/lib/spicyGames';

type GameStep = {
  type: 'question' | 'wouldRather' | 'charades' | 'truth' | 'dare' | 'reaction';
  text: string;
  options?: string[];
  correct?: number;
  hint?: string;
  funFact?: string;
  aWin?: string;
  bWin?: string;
  targetMs?: number;
};

function buildSteps(game: SpicyGameDef): GameStep[] {
  const c = game.content;
  const steps: GameStep[] = [];
  if (c.questions) c.questions.forEach(q => steps.push({ type: 'question', text: q.q, options: q.options, correct: q.correct, hint: q.hint, funFact: q.funFact }));
  if (c.wouldRathers) c.wouldRathers.forEach(w => steps.push({ type: 'wouldRather', text: w.a, options: [w.a, w.b], aWin: w.aWin, bWin: w.bWin }));
  if (c.charades) c.charades.forEach(ch => steps.push({ type: 'charades', text: ch.prompt, options: [ch.answer], hint: ch.hint }));
  if (c.truths) c.truths.forEach(t => steps.push({ type: 'truth', text: t }));
  if (c.dares) c.dares.forEach(d => steps.push({ type: 'dare', text: d }));
  if (c.reactions) c.reactions.forEach(r => steps.push({ type: 'reaction', text: r.prompt, targetMs: r.targetMs }));
  if (c.storySteps) c.storySteps.forEach(s => steps.push({ type: 'truth', text: s.line }));
  if (c.riddles) c.riddles.forEach(r => steps.push({ type: 'charades', text: r.riddle, options: [r.answer], hint: r.hint }));
  return steps;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeBoard(game: SpicyGameDef) {
  if (!game.content.pairs) return [];
  return shuffle(game.content.pairs.flatMap(p => [
    { ...p, id: p.match + '-' + p.front + '-a', face: p.front },
    { ...p, id: p.match + '-' + p.front + '-b', face: p.back },
  ]));
}

export default function SpicyGameRenderer({ game, onBack }: { game: SpicyGameDef; onBack: () => void }) {
  const steps = useMemo(() => buildSteps(game), [game]);
  const isMemory = game.type === 'memory' && !!game.content.pairs?.length;

  // ALL hooks declared up top (rules of hooks — no hooks after early returns).
  const [board, setBoard] = useState(() => makeBoard(game));
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [reactionDone, setReactionDone] = useState(false);
  const [revealCharade, setRevealCharade] = useState(false);

  const step = steps[idx];

  const flipCard = useCallback((id: string) => {
    setFlipped(prev => {
      if (prev.length === 2 || prev.includes(id) || matched.includes(id)) return prev;
      const next = [...prev, id];
      if (next.length === 2) {
        const a = board.find(c => c.id === next[0]);
        const b = board.find(c => c.id === next[1]);
        if (a && b && a.match === b.match) {
          setTimeout(() => {
            setMatched(m => [...m, ...next]);
            setFlipped([]);
            setScore(s => s + 10);
          }, 350);
        } else {
          setTimeout(() => setFlipped([]), 800);
        }
      }
      return next;
    });
  }, [board, matched]);

  const handleSelect = useCallback((optIdx: number) => {
    if (showResult) return;
    setSelected(optIdx);
    setShowResult(true);
    if (step.type === 'question' && step.correct != null && optIdx === step.correct) setScore(s => s + 10);
    if (step.type === 'wouldRather') setScore(s => s + 5);
  }, [showResult, step]);

  const handleReactionTap = useCallback(() => {
    if (reactionDone || !startTime) return;
    const elapsed = Date.now() - startTime;
    const target = step.targetMs ?? 400;
    const diff = Math.abs(elapsed - target);
    if (diff < target * 0.4) setScore(s => s + 10);
    else if (diff < target * 0.8) setScore(s => s + 5);
    setReactionDone(true);
  }, [reactionDone, startTime, step.targetMs]);

  const next = useCallback(() => {
    setShowResult(false);
    setSelected(null);
    setRevealCharade(false);
    setReactionDone(false);
    setStartTime(null);
    setIdx(i => i + 1);
  }, []);

  const restart = useCallback(() => {
    setIdx(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setRevealCharade(false);
    setReactionDone(false);
    setStartTime(null);
  }, []);

  // ——— MEMORY GAMES: card-matching board ———
  if (isMemory) {
    const memoryDone = board.length > 0 && matched.length === board.length;
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-black">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <button onClick={onBack} className="flex items-center gap-1 text-purple-300 hover:text-white transition-colors text-sm"><ChevronLeft className="w-4 h-4" /> Back</button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-purple-300">{matched.length / 2}/{board.length / 2} pairs</span>
              <span className="text-sm text-purple-300">Score: <span className="text-pink-400 font-bold">{score}</span></span>
            </div>
          </div>

          {memoryDone ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-2xl font-black text-white mb-2">All pairs found! 🎉</h3>
              <p className="text-4xl font-black bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-6">{score} points</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setBoard(makeBoard(game));
                    setFlipped([]); setMatched([]); setScore(0);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" /> Play Again
                </button>
                <Link href="/games/spicy" className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all">All Spicy Games</Link>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {board.map((card) => {
                const isUp = flipped.includes(card.id) || matched.includes(card.id);
                const isMatched = matched.includes(card.id);
                return (
                  <button
                    key={card.id}
                    onClick={() => flipCard(card.id)}
                    disabled={isUp}
                    className={`aspect-square rounded-2xl text-3xl flex items-center justify-center transition-all duration-300 ${
                      isUp
                        ? isMatched
                          ? 'bg-green-500/30 border border-green-400/50'
                          : 'bg-pink-500/30 border border-pink-400/60 scale-105'
                        : 'bg-white/10 hover:bg-white/20 border border-purple-500/30 cursor-pointer'
                    }`}
                  >
                    {isUp ? card.face : '❓'}
                  </button>
                );
              })}
            </div>
          )}
          <p className="text-center text-xs text-purple-400 mt-6">Flip two cards — match the {game.content.pairs!.length} spicy pairs 🔥</p>
        </div>
      </div>
    );
  }

  // ——— STEP-BASED GAMES (quiz / truths / dares / reactions / etc.) ———
  const progress = steps.length > 0 ? ((idx) / steps.length) * 100 : 0;

  const isCorrect = () => {
    if (!step) return false;
    if (step.type === 'question' && step.correct != null) return selected === step.correct;
    if (step.type === 'wouldRather') return selected != null;
    return false;
  };

  const renderStep = () => {
    if (!step) {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-2xl font-black text-white mb-2">Game Over!</h3>
          <p className="text-4xl font-black bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-4">{score} points</p>
          <p className="text-purple-300 mb-6">{score >= steps.length * 8 ? '🔥 Perfect couple!' : score >= steps.length * 5 ? '💕 Great together!' : '💪 Keep playing!'}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={restart} className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"><RotateCcw className="w-4 h-4" /> Play Again</button>
            <Link href="/games/spicy" className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all">All Spicy Games</Link>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div key={idx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
        <p className="text-lg text-purple-100 leading-relaxed">{step.text}</p>

        {step.type === 'reaction' && !reactionDone && (
          <button onClick={handleReactionTap} onTouchStart={handleReactionTap}
            className="w-full py-6 rounded-2xl bg-gradient-to-r from-amber-500 to-red-600 text-white font-black text-xl hover:shadow-lg active:scale-95 transition-all">
            ⚡ TAP NOW! ⚡
          </button>
        )}
        {step.type === 'reaction' && reactionDone && <p className="text-sm text-purple-300 text-center">Keep going →</p>}

        {step.type === 'charades' && !revealCharade && step.hint && (
          <p className="text-xs text-purple-300 italic">Hint: {step.hint}</p>
        )}
        {step.type === 'charades' && !revealCharade && (
          <button onClick={() => setRevealCharade(true)} className="text-sm text-pink-400 hover:text-pink-300 underline">Reveal answer</button>
        )}
        {step.type === 'charades' && revealCharade && step.options && (
          <div className="p-4 rounded-xl bg-pink-500/20 border border-pink-400/30">
            <p className="text-white font-bold">Answer: {step.options[0]}</p>
          </div>
        )}

        {step.options && step.type !== 'charades' && step.type !== 'reaction' && (
          <div className="grid gap-2">
            {step.options.map((opt, oi) => {
              let cls = 'bg-white/10 border-purple-500/30 text-white hover:bg-white/20';
              if (showResult) {
                if (oi === step.correct) cls = 'bg-green-500/30 border-green-400 text-green-100';
                else if (oi === selected && oi !== step.correct) cls = 'bg-red-500/30 border-red-400 text-red-100';
                else cls = 'bg-white/5 text-purple-300';
              }
              return (
                <button key={oi} onClick={() => handleSelect(oi)} disabled={showResult}
                  className={`p-4 rounded-xl border text-left transition-all ${cls} ${showResult ? 'cursor-default' : 'cursor-pointer hover:scale-[1.01]'}`}>
                  <span className="font-medium">{opt}</span>
                  {showResult && oi === step.correct && <span className="ml-2 text-green-300">✓</span>}
                  {showResult && oi === selected && oi !== step.correct && <span className="ml-2 text-red-300">✗</span>}
                </button>
              );
            })}
          </div>
        )}

        {step.type === 'truth' && !step.options && !showResult && (
          <div className="flex gap-2">
            <button onClick={() => { setScore(s => s + 5); setShowResult(true); }} className="px-4 py-2 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-all">I answered</button>
            <button onClick={() => setShowResult(true)} className="px-4 py-2 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all">Pass</button>
          </div>
        )}
        {step.type === 'dare' && !step.options && !showResult && (
          <div className="flex gap-2">
            <button onClick={() => { setScore(s => s + 10); setShowResult(true); }} className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">💪 Did it!</button>
            <button onClick={() => setShowResult(true)} className="px-4 py-2 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all">Pass</button>
          </div>
        )}

        {showResult && step.funFact && <p className="text-xs text-purple-300 italic">Fun fact: {step.funFact}</p>}
        {showResult && step.type === 'wouldRather' && selected != null && (
          <p className="text-sm text-pink-300">{selected === 0 ? step.aWin : step.bWin}</p>
        )}

        {showResult && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-purple-300">{isCorrect() ? '+points!' : ''}</span>
            {idx < steps.length - 1 ? (
              <button onClick={next} className="px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-1">Next <ChevronRight className="w-4 h-4" /></button>
            ) : (
              <button onClick={next} className="px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold hover:shadow-lg transition-all">See results</button>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-black">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="flex items-center gap-1 text-purple-300 hover:text-white transition-colors text-sm"><ChevronLeft className="w-4 h-4" /> Back</button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-purple-300">Score: <span className="text-pink-400 font-bold">{score}</span></span>
            <span className="text-sm text-purple-300">{idx + (showResult ? 1 : 0)}/{steps.length}</span>
          </div>
        </div>

        <div className="mb-6 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-pink-500 to-rose-500" animate={{ width: `${Math.min(100, progress + (showResult ? 100 / steps.length : 0))}%` }} transition={{ duration: 0.3 }} />
        </div>

        <div className="bg-white/5 rounded-2xl p-6 border border-purple-500/20 min-h-[300px] flex flex-col">
          <div className="flex-1">
            {step && step.type === 'reaction' && !reactionDone && !startTime && (
              <button onClick={() => setStartTime(Date.now())} className="mb-4 px-4 py-2 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all">Get Ready...</button>
            )}
            {renderStep()}
          </div>
        </div>
      </div>
    </div>
  );
}
