// BollywoodGame - the one shared component that renders all 40+ bollywood games
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, CheckCircle2, XCircle, RotateCcw, Star, Trophy,
  Lock, Timer, Volume2, VolumeX, Crown, ArrowLeft, Eye, EyeOff,
  Sparkles, Heart, Zap, Music, Search, Target, Clapperboard,
  User, Users, Clock, PartyPopper, Mic, Book, Puzzle
} from 'lucide-react';
import Link from 'next/link';
import { BollywoodGameDef, BollywoodQuestion, BollywoodPair, BollywoodRiddle, BollywoodWould, BollywoodRhythm } from '@/lib/bollywoodGames';

type Phase = 'intro' | 'playing' | 'result' | 'waiting';

export default function BollywoodGame({ game }: { game: BollywoodGameDef }) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(game.type === 'quiz' || game.type === 'riddle' ? (game.content.questions?.length ?? game.content.riddles?.length ?? 0) : 1);
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState<'win' | 'lose' | 'done'>('done');

  // per-type state
  const [qIndex, setQIndex] = useState(0);
  const [qAnswer, setQAnswer] = useState<number | null>(null);
  const [qCorrect, setQCorrect] = useState<boolean | null>(null);
  const [memoryCards, setMemoryCards] = useState<BollywoodPair[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [riddleIndex, setRiddleIndex] = useState(0);
  const [riddleInput, setRiddleInput] = useState('');
  const [riddleResult, setRiddleResult] = useState<boolean | null>(null);
  const [wouldIndex, setWouldIndex] = useState(0);
  const [wouldChoice, setWouldChoice] = useState<'a' | 'b' | null>(null);
  const [rhythmIndex, setRhythmIndex] = useState(0);
  const [rhythmHits, setRhythmHits] = useState<Set<number>>(new Set());
  const [rhythmMisses, setRhythmMisses] = useState<Set<number>>(new Set());
  const [rhythmPlaying, setRhythmPlaying] = useState(false);
  const [charadeIndex, setCharadeIndex] = useState(0);
  const [charadeGuessed, setCharadeGuessed] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [storyChoices, setStoryChoices] = useState<string[]>([]);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [reactionState, setReactionState] = useState<'wait' | 'ready' | 'go' | 'done'>('wait');
  const [reactionAttempts, setReactionAttempts] = useState<number[]>([]);
  const [diffIndex, setDiffIndex] = useState(0);
  const [diffFound, setDiffFound] = useState<Set<number>>(new Set());
  const [wordsFound, setWordsFound] = useState<Set<string>>(new Set());
  const [wordGrid, setWordGrid] = useState<string[][]>([]);

  // reset on game change
  useEffect(() => {
    setPhase('intro');
    setScore(0);
    setQIndex(0);
    setQAnswer(null);
    setQCorrect(null);
    setMemoryCards(buildMemoryCards(game));
    setFlipped([]);
    setMatched(new Set());
    setRiddleIndex(0);
    setRiddleInput('');
    setRiddleResult(null);
    setWouldIndex(0);
    setWouldChoice(null);
    setRhythmIndex(0);
    setRhythmHits(new Set());
    setRhythmMisses(new Set());
    setCharadeIndex(0);
    setCharadeGuessed(false);
    setStoryIndex(0);
    setStoryChoices([]);
    setReactionTime(null);
    setReactionState('wait');
    setReactionAttempts([]);
    setDiffIndex(0);
    setDiffFound(new Set());
    setWordsFound(new Set());
    setWordGrid(buildWordGrid(game.content.words || []));
  }, [game]);

  const startGame = () => {
    setPhase('playing');
    if (game.type === 'rhythm') startRhythm();
    if (game.type === 'reaction') startReaction();
  };

  // ===== QUIZ =====
  const questions = game.content.questions || [];
  const answerQuiz = (i: number) => {
    if (qAnswer !== null) return;
    setQAnswer(i);
    const correct = i === questions[qIndex].correct;
    setQCorrect(correct);
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      if (qIndex < questions.length - 1) {
        setQIndex(i2 => i2 + 1);
        setQAnswer(null);
        setQCorrect(null);
      } else {
        endQuiz();
      }
    }, 1200);
  };
  const endQuiz = () => {
    const finalScore = score;
    setResult(finalScore >= Math.ceil(questions.length * 0.7) ? 'win' : 'lose');
    setPhase('result');
  };

  // ===== MEMORY =====
  const onMemoryClick = (idx: number) => {
    if (flipped.includes(idx) || matched.has(memoryCards[idx].match)) return;
    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      const [a, b] = newFlipped;
      if (memoryCards[a].match === memoryCards[b].match) {
        setMatched(prev => new Set([...prev, memoryCards[a].match]));
        setScore(s => s + 1);
        setTimeout(() => setFlipped([]), 400);
        if (matched.size + 1 >= new Set(memoryCards.map(c => c.match)).size) {
          setTimeout(() => { setResult('win'); setPhase('result'); }, 800);
        }
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  // ===== RIDDLE =====
  const riddles = game.content.riddles || [];
  const checkRiddle = () => {
    const correct = riddleInput.toLowerCase().trim() === riddles[riddleIndex].answer.toLowerCase();
    setRiddleResult(correct);
    if (correct) setScore(s => s + 1);
    setTimeout(() => {
      if (riddleIndex < riddles.length - 1) {
        setRiddleIndex(i => i + 1);
        setRiddleInput('');
        setRiddleResult(null);
      } else {
        setResult(score >= Math.ceil(riddles.length * 0.5) ? 'win' : 'lose');
        setPhase('result');
      }
    }, 1000);
  };

  // ===== WOULD RATHER =====
  const wounds = game.content.wouldRathers || [];
  const pickWould = (choice: 'a' | 'b') => {
    setWouldChoice(choice);
    setScore(s => s + 1);
    setTimeout(() => {
      if (wouldIndex < wounds.length - 1) {
        setWouldIndex(i => i + 1);
        setWouldChoice(null);
      } else {
        setResult('win');
        setPhase('result');
      }
    }, 1500);
  };

  // ===== RHYTHM =====
  const rhythm = game.content.rhythm;
  useEffect(() => {
    if (phase === 'playing' && game.type === 'rhythm') {
      const tempoMs = rhythm?.tempo === 'fast' ? 400 : rhythm?.tempo === 'slow' ? 700 : 550;
      const total = rhythm?.notes.length ?? 4;
      const interval = setInterval(() => {
        setRhythmIndex(i => {
          if (i + 1 < total) return i + 1;
          clearInterval(interval);
          setTimeout(() => {
            const hitRate = rhythmHits.size / total;
            setResult(hitRate >= 0.5 ? 'win' : 'lose');
            setPhase('result');
          }, 600);
          return i;
        });
      }, tempoMs);
      return () => clearInterval(interval);
    }
  }, [phase, game.type]);

  const startRhythm = () => setRhythmPlaying(true);
  const onRhythmTap = () => {
    if (!rhythm?.notes.includes(rhythmIndex)) return;
    setRhythmHits(prev => new Set([...prev, rhythmIndex]));
  };

  // ===== CHARADES =====
  const charades = game.content.charades || [];
  const nextCharade = () => {
    if (charadeIndex < charades.length - 1) {
      setCharadeIndex(i => i + 1);
      setCharadeGuessed(false);
      setScore(s => s + 1);
    } else {
      setResult('win');
      setPhase('result');
    }
  };

  // ===== STORY =====
  const story = game.content.story || [];
  const pickStory = (opt: string) => {
    setStoryChoices(c => [...c, opt]);
    if (storyIndex < story.length - 1) setStoryIndex(i => i + 1);
    else {
      setResult('win');
      setPhase('result');
    }
  };

  // ===== REACTION =====
  const startReaction = () => {
    setReactionState('wait');
    setTimeout(() => {
      setReactionState('ready');
      setTimeout(() => setReactionState('go'), 1000 + Math.random() * 2000);
    }, 500);
  };
  const onReactionTap = () => {
    if (reactionState === 'ready') {
      setReactionState('done');
      return;
    }
    if (reactionState === 'go') {
      const time = 0; // measure real time
      setReactionAttempts(a => [...a, 100]);
      setReactionState('wait');
    }
  };

  // ===== CHASE GAME (Bhaag Simran style: dash, dodge, escape) =====
  const isChase = game.slug === 'bhaag-simran';
  const [chasePhase, setChasePhase] = useState<'idle' | 'dash' | 'caught' | 'won'>('idle');
  const [chaseLane, setChaseLane] = useState(1);
  const [obstacle, setObstacle] = useState<{ lane: number; y: number }>({ lane: 1, y: -100 });
  const [chaseTime, setChaseTime] = useState(0);

  useEffect(() => {
    if (game.type !== 'reaction' || !isChase) return;
    let raf: number;
    let last = performance.now();
    let t = 0;
    let obsY = -100;
    let obsLane = 0;
    let obsSpawned = false;
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      if (chasePhase === 'dash') {
        t += dt;
        obsY += dt * 320;
        if (!obsSpawned && t > 0.5 + Math.random() * 0.6) {
          obsLane = Math.floor(Math.random() * 3);
          obsSpawned = true;
        }
        setObstacle({ lane: obsLane, y: obsY });
        setChaseTime(t);
        // Collision
        if (obsSpawned && obsY > 60 && obsY < 80 && obsLane === chaseLane) {
          setChasePhase('caught');
          setResult('lose');
          setPhase('result');
          return;
        }
        if (t > 4.5) {
          setChasePhase('won');
          setScore(s => s + 1);
          setResult('win');
          setPhase('result');
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    if (chasePhase === 'dash') raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [chasePhase, isChase, game.type]);

  const startChase = () => {
    setChasePhase('dash');
    setObstacle({ lane: 0, y: -100 });
    setChaseTime(0);
    setChaseLane(1);
  };

  const shiftChase = (dir: -1 | 1) => {
    if (chasePhase !== 'dash') return;
    setChaseLane(l => {
      const nl = Math.max(0, Math.min(2, l + dir));
      return nl;
    });
  };

  // Keyboard controls for the chase game (← / → or A / D)
  useEffect(() => {
    if (!isChase) return;
    const onKey = (e: KeyboardEvent) => {
      if (chasePhase !== 'dash') {
        if (e.key === ' ' || e.key === 'Enter') startChase();
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a') shiftChase(-1);
      if (e.key === 'ArrowRight' || e.key === 'd') shiftChase(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isChase, chasePhase]);

  // ===== DIFF =====
  const diffs = game.content.diffPairs || [];
  const toggleDiff = (i: number) => {
    if (diffFound.has(i)) {
      const next = new Set(diffFound);
      next.delete(i);
      setDiffFound(next);
      setScore(s => s - 1);
    } else {
      const next = new Set(diffFound);
      next.add(i);
      setDiffFound(next);
      setScore(s => s + 1);
      if (diffs[diffIndex]?.diffs.every(d => next.has(d))) {
        if (diffIndex < diffs.length - 1) {
          setDiffIndex(i => i + 1);
          setDiffFound(new Set());
        } else {
          setResult('win');
          setPhase('result');
        }
      }
    }
  };

  // ===== WORD SEARCH =====
  function buildWordGrid(words: string[]): string[][] {
    if (!words.length) return [];
    const size = Math.max(10, words.length + 2);
    const grid: string[][] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () =>
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
      )
    );
    // Place words
    words.forEach(word => {
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * (size - word.length));
      for (let i = 0; i < word.length; i++) {
        if (grid[r]?.[c + i] !== undefined) grid[r][c + i] = word[i];
      }
    });
    return grid;
  }
  function buildMemoryCards(g: BollywoodGameDef): BollywoodPair[] {
    const pairs = g.content.pairs || [];
    const cards = [...pairs, ...pairs];
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  }
  function tryFindWord(word: string) {
    if (wordsFound.has(word) || word.length < 3) return;
    const inGrid = wordGrid.some(row =>
      row.join('').toUpperCase().includes(word.toUpperCase())
    );
    if (inGrid) {
      setWordsFound(prev => new Set([...prev, word]));
      setScore(s => s + 1);
    }
  }

  const typeIcons: Record<string, React.ElementType> = {
    quiz: Clapperboard,
    memory: Puzzle,
    rhythm: Music,
    wouldRather: Zap,
    spotTheDiff: Search,
    wordSearch: Target,
    reaction: Timer,
    charades: PartyPopper,
    story: Book,
    riddle: Mic,
  };
  const TypeIcon = typeIcons[game.type] || Clapperboard;

  // ===== RENDER =====
  if (phase === 'intro') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className={`w-full max-w-2xl rounded-3xl bg-gradient-to-br ${game.gradient} p-8 sm:p-12 shadow-2xl text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 text-8xl opacity-10 select-none">{game.emoji}</div>
          <div className="absolute bottom-0 left-0 text-6xl opacity-10 select-none">💖</div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 text-white/70 text-xs font-bold uppercase tracking-wider">
              <TypeIcon className="w-4 h-4" />
              {game.category} · {game.name}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black mb-3 leading-tight">{game.name}</h1>
            <p className="text-white/80 text-lg mb-6">{game.tagline}</p>
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold">{game.description}</span>
            </div>
            <button
              onClick={startGame}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-black rounded-2xl text-lg shadow-xl hover:scale-105 transition-all"
            >
              <Play className="w-5 h-5" />
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    const win = result === 'win';
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center border-2 border-pink-100">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="text-7xl mb-4"
          >
            {win ? '🏆' : '😔'}
          </motion.div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            {win ? 'You won!' : `Game over`}
          </h2>
          <p className="text-gray-500 mb-6">
            Score: <span className="font-black text-pink-600">{score}</span> / {total}
          </p>
          {game.type === 'story' && storyChoices.length > 0 && (
            <div className="text-left bg-pink-50 rounded-2xl p-4 mb-6 text-sm">
              <p className="font-bold text-pink-700 mb-2">Your Story:</p>
              {storyChoices.map((c, i) => (
                <div key={i} className="text-gray-700 mb-1">• {c}</div>
              ))}
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setPhase('intro')}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Play again
            </button>
            <Link
              href="/games"
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              All games
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ===== PLAYING RENDER =====
  return (
    <div className="min-h-[70vh]">
      {/* Score bar */}
      <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-2xl shadow-sm border border-pink-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-2xl">
            {game.emoji}
          </div>
          <div>
            <div className="font-bold text-sm text-gray-800">{game.name}</div>
            <div className="text-xs text-gray-500">{game.tagline}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-black text-pink-600">{score}</div>
            <div className="text-xs text-gray-400">score</div>
          </div>
          <button
            onClick={() => setPhase('intro')}
            className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Game body by type */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${game.slug}-${phase}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderBody()}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  function renderBody() {
    switch (game.type) {
      case 'quiz': return <QuizView q={questions[qIndex]} answer={qAnswer} correct={qCorrect} onAnswer={answerQuiz} qIndex={qIndex} total={questions.length} />;
      case 'memory': return <MemoryView cards={memoryCards} flipped={flipped} matched={matched} onFlip={onMemoryClick} />;
      case 'riddle': return <RiddleView r={riddles[riddleIndex]} input={riddleInput} setInput={setRiddleInput} result={riddleResult} onCheck={checkRiddle} index={riddleIndex} total={riddles.length} />;
      case 'wouldRather': return <WouldView w={wounds[wouldIndex]} choice={wouldChoice} onPick={pickWould} index={wouldIndex} total={wounds.length} />;
      case 'rhythm': return <RhythmView game={game} rhythmIndex={rhythmIndex} onRhythmTap={onRhythmTap} />;
      case 'charades': return <CharadesView c={charades[charadeIndex]} index={charadeIndex} total={charades.length} onDone={nextCharade} />;
      case 'story': return <StoryView s={story[storyIndex]} choices={storyChoices} index={storyIndex} total={story.length} onPick={pickStory} />;
      case 'reaction':
        return isChase ? (
          <ChaseView
            phase={chasePhase}
            lane={chaseLane}
            obstacle={obstacle}
            time={chaseTime}
            onStart={startChase}
            onShift={shiftChase}
          />
        ) : (
          <ReactionView state={reactionState} attempts={reactionAttempts} onRestart={startReaction} onTap={onReactionTap} />
        );
      case 'spotTheDiff': return <DiffView pair={diffs[diffIndex]} found={diffFound} onToggle={toggleDiff} index={diffIndex} total={diffs.length} />;
      case 'wordSearch': return <WordSearchView grid={wordGrid} words={game.content.words || []} found={wordsFound} onTry={tryFindWord} />;
      default: return null;
    }
  }
}

// ================= SUB-VIEWS =================

function QuizView({ q, answer, correct, onAnswer, qIndex, total }: {
  q?: BollywoodQuestion; answer: number | null; correct: boolean | null;
  onAnswer: (i: number) => void; qIndex: number; total: number;
}) {
  if (!q) return null;
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
        <span>Question {qIndex + 1} / {total}</span>
        {q.funFact && <span className="text-xs text-pink-500">💡 {q.funFact}</span>}
      </div>
      <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 border border-pink-100">
        <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-6">{q.q}</h3>
        <div className="grid gap-3">
          {q.options.map((opt, i) => {
            let cls = 'bg-white border-2 border-gray-100 hover:border-pink-300 text-gray-700';
            if (answer !== null) {
              if (i === q.correct) cls = 'bg-green-50 border-2 border-green-400 text-green-800';
              else if (i === answer && i !== q.correct) cls = 'bg-red-50 border-2 border-red-400 text-red-800';
            }
            return (
              <button
                key={i}
                disabled={answer !== null}
                onClick={() => onAnswer(i)}
                className={`w-full text-left p-4 rounded-2xl font-semibold transition-all ${cls} ${answer !== null ? 'cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span>{String.fromCharCode(65 + i)}. {opt}</span>
                  {answer !== null && i === q.correct && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {answer !== null && i === answer && i !== q.correct && <XCircle className="w-5 h-5 text-red-500" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MemoryView({ cards, flipped, matched, onFlip }: {
  cards: BollywoodPair[]; flipped: number[]; matched: Set<string>;
  onFlip: (i: number) => void;
}) {
  return (
    <div>
      <p className="text-center text-gray-500 text-sm mb-4">
        Match each card with its partner. {matched.size} of {new Set(cards.map(c => c.match)).size} pairs matched.
      </p>
      <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-xl mx-auto">
        {cards.map((c, i) => {
          const isFlipped = flipped.includes(i) || matched.has(c.match);
          const isMatched = matched.has(c.match);
          return (
            <button
              key={i}
              onClick={() => onFlip(i)}
              disabled={isMatched}
              className={`aspect-[3/4] rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center p-1 ${
                isMatched ? 'bg-green-100 border-2 border-green-400 text-green-700'
                : isFlipped ? 'bg-white border-2 border-pink-400 text-gray-800'
                : 'bg-gradient-to-br from-pink-400 to-purple-500 text-white'
              }`}
            >
              {isFlipped ? c.front : c.back}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RiddleView({ r, input, setInput, result, onCheck, index, total }: {
  r?: BollywoodRiddle; input: string; setInput: (s: string) => void;
  result: boolean | null; onCheck: () => void; index: number; total: number;
}) {
  if (!r) return null;
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-pink-100">
      <div className="text-xs font-bold uppercase text-pink-500 mb-2">Riddle {index + 1} / {total}</div>
      <h3 className="text-xl font-black text-gray-900 mb-4">{r.riddle}</h3>
      <p className="text-sm text-gray-500 mb-4">💡 Hint: {r.hint}</p>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Your answer..."
        className="w-full p-4 rounded-2xl border-2 border-pink-100 focus:border-pink-400 focus:outline-none text-gray-800 mb-4"
        disabled={result !== null}
      />
      {result !== null && (
        <div className={`p-3 rounded-xl mb-4 text-center font-bold ${result ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {result ? '✅ Correct!' : `❌ Not quite. The answer is: ${r.answer}`}
        </div>
      )}
      <button
        onClick={onCheck}
        disabled={result !== null || !input.trim()}
        className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-2xl disabled:opacity-40"
      >
        Check Answer
      </button>
    </div>
  );
}

function WouldView({ w, choice, onPick, index, total }: {
  w?: BollywoodWould; choice: 'a' | 'b' | null;
  onPick: (c: 'a' | 'b') => void; index: number; total: number;
}) {
  if (!w) return null;
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-xs font-bold uppercase text-pink-500 mb-4 text-center">Question {index + 1} / {total}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(['a', 'b'] as const).map(key => {
          const text = key === 'a' ? w.a : w.b;
          const winText = key === 'a' ? w.aWin : w.bWin;
          const selected = choice === key;
          return (
            <button
              key={key}
              onClick={() => onPick(key)}
              disabled={choice !== null}
              className={`p-6 rounded-3xl text-left transition-all border-2 ${
                selected ? 'border-pink-500 bg-pink-50' : 'border-gray-100 hover:border-pink-300 bg-white'
              } ${choice !== null ? 'opacity-60' : ''}`}
            >
              <div className="text-lg font-black text-gray-900 mb-2">{text}</div>
              {selected && <div className="text-sm text-pink-600 font-bold">→ {winText}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RhythmView({ game, rhythmIndex, onRhythmTap }: {
  game: BollywoodGameDef; rhythmIndex: number; onRhythmTap: () => void;
}) {
  const rhythm = game.content.rhythm!;
  const tempoMs = rhythm.tempo === 'fast' ? 400 : rhythm.tempo === 'slow' ? 700 : 550;
  const totalBeats = Math.max(...rhythm.notes) + 1;
  return (
    <div className="max-w-2xl mx-auto text-center">
      <p className="text-gray-500 text-sm mb-6">
        Tap on the beat! Notes highlighted in pink are the ones you need to hit.
      </p>
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {Array.from({ length: totalBeats }).map((_, i) => {
          const isTarget = rhythm.notes.includes(i);
          const isCurrent = i === rhythmIndex;
          return (
            <div
              key={i}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black transition-all ${
                isCurrent
                  ? 'bg-pink-500 text-white scale-110 shadow-lg'
                  : isTarget ? 'bg-pink-200 text-pink-700' : 'bg-gray-100 text-gray-400'
              }`}
            >
              {isTarget ? '🎵' : '·'}
            </div>
          );
        })}
      </div>
      <button
        onClick={onRhythmTap}
        className="w-full py-6 text-2xl font-black bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-3xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
      >
        TAP!
      </button>
    </div>
  );
}

function CharadesView({ c, index, total, onDone }: {
  c?: import('@/lib/bollywoodGames').BollywoodCharade; index: number; total: number;
  onDone: () => void;
}) {
  if (!c) return null;
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-pink-100">
      <div className="text-xs font-bold uppercase text-pink-500 mb-2">Round {index + 1} / {total}</div>
      <h3 className="text-lg font-black text-gray-900 mb-4">Act this out:</h3>
      <div className="bg-pink-50 rounded-2xl p-5 mb-4 text-gray-700 text-lg">
        {c.prompt}
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Eye className="w-4 h-4" />
        Answer: <span className="font-bold text-gray-700">{c.answer}</span>
        {c.hint && <span className="text-xs">(hint: {c.hint})</span>}
      </div>
      <button
        onClick={onDone}
        className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-2xl"
      >
        Got it! Next round
      </button>
    </div>
  );
}

function StoryView({ s, choices, index, total, onPick }: {
  s?: import('@/lib/bollywoodGames').BollywoodStoryStep; choices: string[];
  index: number; total: number; onPick: (opt: string) => void;
}) {
  if (!s) return null;
  return (
    <div className="max-w-2xl mx-auto">
      {choices.length > 0 && (
        <div className="bg-white rounded-2xl p-4 mb-4 border border-pink-100 text-sm text-gray-600">
          <div className="font-bold text-pink-600 mb-2">Your journey so far:</div>
          {choices.map((c, i) => <div key={i}>• {c}</div>)}
        </div>
      )}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-pink-100">
        <div className="text-xs font-bold uppercase text-pink-500 mb-2">Step {index + 1} / {total}</div>
        <h3 className="text-lg font-black text-gray-900 mb-4">{s.prompt}</h3>
        <div className="space-y-3">
          {s.options.map((opt) => (
            <button
              key={opt}
              onClick={() => onPick(opt)}
              className="w-full text-left p-4 rounded-2xl bg-pink-50 hover:bg-pink-100 border-2 border-pink-100 hover:border-pink-400 transition-all font-semibold text-gray-800"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ===== CHASE VIEW (Bhaag Simran: boy + Simran on shoulder, run from dad) =====
function ChaseView({
  phase,
  lane,
  obstacle,
  time,
  onStart,
  onShift,
}: {
  phase: string;
  lane: number;
  obstacle: { lane: number; y: number };
  time: number;
  onStart: () => void;
  onShift: (dir: -1 | 1) => void;
}) {
  const LANE_LEFT = ['20%', '45%', '70%'];
  const reachedFinish = time > 4.0 && phase !== 'caught';
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 rounded-3xl p-4 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-2 left-2 text-5xl">🏃</div>
          <div className="absolute bottom-2 right-2 text-4xl">💨</div>
        </div>
        <div className="relative flex items-center justify-between mb-3">
          <div>
            <h3 className="text-lg sm:text-xl font-black">Bhaag Simran!</h3>
            <p className="text-xs text-white/70">Tap ←/→ to change lanes. Don&apos;t let the dad&apos;s shadow catch you!</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black">{Math.min(100, Math.round((time / 4.5) * 100))}%</div>
            <div className="text-[10px] text-white/60 uppercase tracking-wider">Distance</div>
          </div>
        </div>

        {/* progress bar */}
        <div className="h-2 bg-white/20 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${Math.min(100, (time / 4.5) * 100)}%` }}
          />
        </div>

        {/* road (3 lanes) */}
        <div className="relative h-64 bg-gradient-to-b from-amber-900/60 to-amber-800/60 rounded-2xl overflow-hidden border-2 border-white/20">
          {/* lane dividers */}
          <div className="absolute inset-0 flex">
            {[0, 1, 2].map((l) => (
              <div key={l} className="flex-1 relative">
                {l < 2 && <div className="absolute left-full top-0 bottom-0 w-1 bg-white/30 border-l-2 border-dashed border-white/40" />}
              </div>
            ))}
          </div>

          {/* obstacle (dad&apos;s shadow) */}
          {phase === 'dash' && obstacle.y > -50 && obstacle.y < 250 && (
            <div
              className="absolute text-5xl transition-none"
              style={{ left: LANE_LEFT[obstacle.lane], top: obstacle.y, transform: 'translateX(-50%)' }}
            >
              👨‍🦰
            </div>
          )}

          {/* player (boy + Simran on shoulder) */}
          {phase === 'dash' && (
            <div
              className="absolute text-5xl transition-all duration-150"
              style={{ left: LANE_LEFT[lane], top: 70, transform: 'translateX(-50%)' }}
            >
              🏃💕
            </div>
          )}

          {/* finish line */}
          {reachedFinish && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white font-black text-sm bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
              🎊 Baraat ho gaya!
            </div>
          )}

          {/* overlay state */}
          {phase !== 'dash' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-2xl text-center p-6">
              <div className="text-5xl mb-3">{phase === 'won' ? '🏆' : phase === 'caught' ? '😱' : '🏃'}</div>
              <div className="text-xl font-black mb-2">
                {phase === 'won'
                  ? 'Shaadi ho gayi! You made it to the baraat!'
                  : phase === 'caught'
                  ? 'Dad caught you! Better luck next time.'
                  : 'Bhaag Simran — Carry her on your shoulder, run from the father!'}
              </div>
              <p className="text-xs text-white/60 mb-4 max-w-xs">
                {phase === 'idle'
                  ? 'Tap start, then use ← / → (or on-screen buttons) to dodge the dad&apos;s shadow. Reach the baraat in 4.5 seconds.'
                  : 'Press start to try again.'}
              </p>
              <button
                onClick={onStart}
                className="px-6 py-3 bg-white text-amber-700 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all"
              >
                {phase === 'idle' ? 'Start Chase' : 'Run Again'}
              </button>
            </div>
          )}
        </div>

        {/* shift buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => onShift(-1)}
            disabled={phase !== 'dash'}
            className="flex-1 py-3 bg-white/20 backdrop-blur-sm rounded-2xl text-white font-black text-lg disabled:opacity-30 hover:bg-white/30 transition-all"
          >
            ◀ Left
          </button>
          <button
            onClick={() => onShift(1)}
            disabled={phase !== 'dash'}
            className="flex-1 py-3 bg-white/20 backdrop-blur-sm rounded-2xl text-white font-black text-lg disabled:opacity-30 hover:bg-white/30 transition-all"
          >
            Right ▶
          </button>
        </div>

        <p className="text-[11px] text-white/50 mt-3 text-center">
          Keyboard: press ← and → to switch lanes while running.
        </p>
      </div>
    </div>
  );
}

function ReactionView({ state, attempts, onRestart, onTap }: {
  state: string; attempts: number[]; onRestart: () => void; onTap: () => void;
}) {
  const best = attempts.length ? Math.min(...attempts) : null;
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div
        onClick={onTap}
        className={`min-h-[300px] rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
          state === 'ready' ? 'bg-yellow-100 border-4 border-yellow-400'
          : state === 'go' ? 'bg-green-100 border-4 border-green-500 animate-pulse'
          : state === 'done' ? 'bg-pink-50' : 'bg-gray-100'
        }`}
      >
        <div className="text-6xl mb-4">{state === 'go' ? '⚡' : state === 'ready' ? '🟡' : '🔵'}</div>
        <div className="text-2xl font-black text-gray-900 mb-2">
          {state === 'wait' ? 'Tap to start' :
           state === 'ready' ? 'Wait for green...' :
           state === 'go' ? 'TAP NOW!' : 'Too early!'}
        </div>
        <div className="text-sm text-gray-500">
          {attempts.length ? `Best: ${best}ms · Attempts: ${attempts.length}` : 'No attempts yet'}
        </div>
      </div>
      <button
        onClick={onRestart}
        className="mt-4 px-6 py-3 bg-white border-2 border-pink-200 text-pink-600 font-bold rounded-2xl hover:border-pink-400 transition-all"
      >
        <RotateCcw className="w-4 h-4 inline mr-2" /> Try again
      </button>
    </div>
  );
}

function DiffView({ pair, found, onToggle, index, total }: {
  pair?: import('@/lib/bollywoodGames').BollywoodDiff; found: Set<number>;
  onToggle: (i: number) => void; index: number; total: number;
}) {
  if (!pair) return null;
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-xs font-bold uppercase text-pink-500 mb-4 text-center">
        Set {index + 1} / {total} · Find {pair.diffs.length} differences
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-pink-100">
          <div className="text-xs font-bold text-gray-400 mb-2">LEFT</div>
          {pair.items[0].split(' ').map((w, i) => (
            <button
              key={i}
              onClick={() => onToggle(i)}
              className={`block w-full p-2 mb-1 rounded-lg text-left text-sm font-semibold transition-all ${
                found.has(i) ? 'bg-green-100 border-2 border-green-400' : 'hover:bg-pink-50'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-pink-100">
          <div className="text-xs font-bold text-gray-400 mb-2">RIGHT</div>
          {pair.items[1].split(' ').map((w, i) => (
            <button
              key={i}
              onClick={() => onToggle(i)}
              className={`block w-full p-2 mb-1 rounded-lg text-left text-sm font-semibold transition-all ${
                found.has(i) ? 'bg-green-100 border-2 border-green-400' : 'hover:bg-pink-50'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function WordSearchView({ grid, words, found, onTry }: {
  grid: string[][]; words: string[]; found: Set<string>; onTry: (w: string) => void;
}) {
  const [input, setInput] = React.useState('');
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-pink-100 mb-4">
        <div className="text-xs font-bold text-gray-500 mb-3">Find these words:</div>
        <div className="flex flex-wrap gap-2">
          {words.map(w => (
            <span
              key={w}
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                found.has(w) ? 'bg-green-100 text-green-700 line-through' : 'bg-pink-100 text-pink-700'
              }`}
            >
              {w}
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-10 gap-0.5 bg-white p-3 rounded-2xl shadow-sm border border-pink-100 mb-4 max-w-md mx-auto">
        {grid.map((row, ri) =>
          row.map((cell, ci) => (
            <div key={`${ri}-${ci}`} className="aspect-square flex items-center justify-center text-[10px] sm:text-xs font-black text-gray-700 bg-pink-50 rounded">
              {cell}
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2 max-w-md mx-auto">
        <input
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          placeholder="Type a word to find..."
          className="flex-1 p-3 rounded-xl border-2 border-pink-100 focus:border-pink-400 focus:outline-none text-sm"
          maxLength={12}
        />
        <button
          onClick={() => { onTry(input); setInput(''); }}
          className="px-5 py-3 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 transition-all"
        >
          Find
        </button>
      </div>
    </div>
  );
}
