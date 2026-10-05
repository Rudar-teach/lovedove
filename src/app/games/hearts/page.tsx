'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2 } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const SUITS = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
const SUIT_COLORS: Record<string, string> = { hearts: 'text-red-500', diamonds: 'text-red-500', clubs: 'text-gray-800', spades: 'text-gray-800' };
const RANKS = ['A','K','Q','J','10','9','8','7','6','5','4','3','2'];
const RANK_VALUES: Record<string, number> = { '2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'J':11,'Q':12,'K':13,'A':14 };
const SUIT_ORDER: Record<string, number> = { hearts: 0, diamonds: 1, clubs: 2, spades: 3 };

type Card = { suit: string; rank: string; uid: number };
type Player = 'human' | 'ai1' | 'ai2' | 'ai3';

export default function HeartsPage() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [hands, setHands] = useState<Record<Player, Card[]>>({ human: [], ai1: [], ai2: [], ai3: [] });
  const [trick, setTrick] = useState<{player: Player; card: Card}[]>([]);
  const [phase, setPhase] = useState<'pass' | 'play' | 'roundEnd'>('pass');
  const [currentTrickLead, setCurrentTrickLead] = useState<Player>('human');
  const [scores, setScores] = useState<Record<string, number>>({ human: 0, ai1: 0, ai2: 0, ai3: 0 });
  const [trickNumber, setTrickNumber] = useState(0);
  const [heartsBroken, setHeartsBroken] = useState(false);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [message, setMessage] = useState('Select 3 cards to pass');
  const [toast, setToast] = useState(false);
  const [roundMsg, setRoundMsg] = useState('');
  const uidCounter = useRef(0);

  const createDeck = useCallback((): Card[] => {
    const cards: Card[] = [];
    for (const suit of Object.keys(SUITS)) {
      for (const rank of RANKS) {
        cards.push({ suit, rank, uid: uidCounter.current++ });
      }
    }
    return cards.sort(() => Math.random() - 0.5);
  }, []);

  const startNewGame = useCallback(() => {
    uidCounter.current = 0;
    const newDeck = createDeck();
    const newHands: Record<Player, Card[]> = { human: [], ai1: [], ai2: [], ai3: [] };
    const players: Player[] = ['human', 'ai1', 'ai2', 'ai3'];
    for (let i = 0; i < 52; i++) {
      newHands[players[i % 4]].push(newDeck[i]);
    }
    for (const p of players) {
      newHands[p].sort((a, b) => {
        if (SUIT_ORDER[a.suit] !== SUIT_ORDER[b.suit]) return SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit];
        return RANK_VALUES[b.rank] - RANK_VALUES[a.rank];
      });
    }
    setDeck(newDeck);
    setHands(newHands);
    setTrick([]);
    setPhase('pass');
    setCurrentTrickLead('human');
    setTrickNumber(0);
    setHeartsBroken(false);
    setSelectedCards([]);
    setMessage('Select 3 cards to pass');
  }, [createDeck]);

  useEffect(() => { startNewGame(); }, [startNewGame]);

  const getCardPoints = (card: Card) => {
    if (card.suit === 'hearts') return 1;
    if (card.suit === 'spades' && card.rank === 'Q') return 13;
    return 0;
  };

  const toggleCardSelect = (index: number) => {
    if (phase !== 'pass') return;
    setSelectedCards(prev => {
      if (prev.includes(index)) return prev.filter(i => i !== index);
      if (prev.length >= 3) return prev;
      return [...prev, index];
    });
  };

  const passCards = () => {
    if (selectedCards.length !== 3) return;
    const sorted = [...selectedCards].sort((a, b) => b - a);
    const newHands = { ...hands };
    const humanPass: Card[] = [];
    sorted.forEach(i => { humanPass.push(newHands.human[i]); newHands.human.splice(i, 1); });

    // AI passes
    const aiHands: Card[][] = [newHands.ai1, newHands.ai2, newHands.ai3];
    const allPassed: Card[][] = [];
    for (let i = 0; i < 3; i++) {
      const pass = aiHands[i].slice(0, 3);
      const idxs = [0, 1, 2];
      idxs.reverse().forEach(j => aiHands[i].splice(j, 1));
      allPassed.push(pass);
    }
    // Rotate: ai1 gets ai3's, ai2 gets ai1's, ai3 gets ai2's, human gets ai1's (simplified: just give human random 3 from ai pool)
    newHands.human.push(...allPassed[0]);
    newHands.ai1.push(...humanPass);
    newHands.ai1.push(...allPassed[2]);
    newHands.ai2.push(...allPassed[1]);
    newHands.ai3.push(...allPassed[0].slice(0, 0));

    // Sort all hands
    const players: Player[] = ['human', 'ai1', 'ai2', 'ai3'];
    for (const p of players) {
      newHands[p].sort((a, b) => {
        if (SUIT_ORDER[a.suit] !== SUIT_ORDER[b.suit]) return SUIT_ORDER[a.suit] - SUIT_ORDER[b.suit];
        return RANK_VALUES[b.rank] - RANK_VALUES[a.rank];
      });
    }

    setHands(newHands);
    setSelectedCards([]);
    setPhase('play');
    setMessage('Pass left! Lead with 2 of Clubs');

    // Find who has 2 of Clubs
    for (const p of players) {
      if (newHands[p].some(c => c.suit === 'clubs' && c.rank === '2')) {
        setCurrentTrickLead(p);
        if (p !== 'human') {
          setTimeout(() => aiLead(newHands, p), 500);
        }
      }
    }
  };

  const playCard = (cardIndex: number) => {
    if (phase !== 'play') return;
    const card = hands.human[cardIndex];
    const leadSuit = trick.length > 0 ? trick[0].card.suit : null;

    if (trick.length === 0) {
      if (card.suit === 'hearts' && !heartsBroken) {
        setMessage('Cannot lead hearts yet!');
        return;
      }
    } else if (leadSuit) {
      const hasLeadSuit = hands.human.some(c => c.suit === leadSuit);
      if (hasLeadSuit && card.suit !== leadSuit) {
        setMessage(`Must follow: ${SUITS[leadSuit as keyof typeof SUITS]}`);
        return;
      }
    }

    const newHands = { ...hands, human: [...hands.human] };
    newHands.human.splice(cardIndex, 1);
    const newTrick = [...trick, { player: 'human' as Player, card }];
    setHands(newHands);
    setTrick(newTrick);
    if (card.suit === 'hearts') setHeartsBroken(true);

    if (newTrick.length === 4) {
      setTimeout(() => resolveTrick(newTrick), 1500);
    } else {
      setTimeout(() => aiPlay(newTrick), 1000);
    }
  };

  const aiLead = (currentHands: Record<Player, Card[]>, leader: Player) => {
    const ai = leader;
    const hand = currentHands[ai];
    const card2c = hand.find(c => c.suit === 'clubs' && c.rank === '2');
    const chosen = card2c || hand[0];
    const idx = hand.indexOf(chosen);
    const newHands = { ...currentHands, [ai]: [...hand] };
    newHands[ai].splice(idx, 1);
    const newTrick = [...trick, { player: ai, card: chosen }];
    setHands(newHands);
    setTrick(newTrick);
    if (chosen.suit === 'hearts') setHeartsBroken(true);
    setCurrentTrickLead(ai);

    if (newTrick.length === 4) {
      setTimeout(() => resolveTrick(newTrick), 1500);
    }
  };

  const aiPlay = (currentTrick: {player: Player; card: Card}[]) => {
    const turnOrder: Player[] = ['human', 'ai1', 'ai2', 'ai3'];
    const lastPlayer = currentTrick[currentTrick.length - 1].player;
    const lastIdx = turnOrder.indexOf(lastPlayer);
    const nextIdx = (lastIdx + 1) % 4;
    const nextPlayer = turnOrder[nextIdx];
    if (nextPlayer === 'human' || currentTrick.filter(t => t.player === nextPlayer).length > 0) return;

    const aiHand = hands[nextPlayer];
    const leadSuit = currentTrick.length > 0 ? currentTrick[0].card.suit : null;
    let playable = aiHand;
    if (leadSuit && aiHand.some(c => c.suit === leadSuit)) {
      playable = aiHand.filter(c => c.suit === leadSuit);
    } else if (leadSuit && !heartsBroken && aiHand.some(c => c.suit === 'hearts')) {
      playable = aiHand.filter(c => c.suit !== 'hearts');
    }
    const chosen = playable[Math.floor(Math.random() * playable.length)];
    const cardIdx = aiHand.indexOf(chosen);
    const newHands = { ...hands, [nextPlayer]: [...aiHand] };
    newHands[nextPlayer].splice(cardIdx, 1);
    const newTrick = [...currentTrick, { player: nextPlayer, card: chosen }];
    setHands(newHands);
    setTrick(newTrick);
    if (chosen.suit === 'hearts') setHeartsBroken(true);

    if (newTrick.length === 4) {
      setTimeout(() => resolveTrick(newTrick), 1500);
    }
  };

  const resolveTrick = (currentTrick: {player: Player; card: Card}[]) => {
    const leadSuit = currentTrick[0].card.suit;
    let winner = currentTrick[0].player;
    let highest = RANK_VALUES[currentTrick[0].card.rank];
    for (const play of currentTrick.slice(1)) {
      if (play.card.suit === leadSuit && RANK_VALUES[play.card.rank] > highest) {
        highest = RANK_VALUES[play.card.rank];
        winner = play.player;
      }
    }
    const trickPoints = currentTrick.reduce((sum, p) => sum + getCardPoints(p.card), 0);
    const newScores = { ...scores };
    newScores[winner] = (newScores[winner] || 0) + trickPoints;
    setScores(newScores);
    setTrick([]);
    setTrickNumber(t => t + 1);
    setCurrentTrickLead(winner);
    const winnerName = winner === 'human' ? 'You' : `🤖 ${winner}`;
    setMessage(`${winnerName} take the trick! (+${trickPoints} pts)`);

    if (hands.human.length === 0) {
      setPhase('roundEnd');
      // Check for shot the moon
      let moonPlayer = '';
      for (const [p, s] of Object.entries(newScores)) {
        if (s === 26) { moonPlayer = p; break; }
      }
      if (moonPlayer) {
        const finalScores: Record<string, number> = {};
        for (const k of Object.keys(newScores)) {
          finalScores[k] = k === moonPlayer ? 0 : 26;
        }
        setRoundMsg(moonPlayer === 'human' ? '🌙 SHOT THE MOON! You got all 26 points!' : '🌙 Someone shot the moon!');
        setScores(finalScores as Record<string, number>);
      } else {
        const minScore = Math.min(...Object.values(newScores));
        const winners = Object.entries(newScores).filter(([, v]) => v === minScore).map(([k]) => k);
        setRoundMsg(winners.length === 1 && winners[0] === 'human' ? '🏆 You win the round!' : `Round ended! ${winners.map(w => w === 'human' ? 'You' : w).join(' & ')} win!`);
      }
    }
  };

  useEffect(() => {
    if (phase !== 'play' || trick.length === 0) return;
    const lastPlayer = trick[trick.length - 1].player;
    if (lastPlayer !== 'human' && trick.length < 4) {
      const turnOrder: Player[] = ['human', 'ai1', 'ai2', 'ai3'];
      const lastIdx = turnOrder.indexOf(lastPlayer);
      const nextIdx = (lastIdx + 1) % 4;
      const nextPlayer = turnOrder[nextIdx];
      if (nextPlayer !== 'human') {
        setTimeout(() => aiPlay(trick), 1000);
      }
    }
  }, [trick, phase]);

  const inviteFriend = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const isPlayersTurn = (phase === 'pass' || phase === 'play') &&
    (trick.length === 0 ||
      (trick.length > 0 && trick[trick.length - 1].player !== 'human')) &&
    trick.length < 4;

  const renderCard = (card: Card, index: number) => {
    const selected = selectedCards.includes(index);
    return (
      <motion.div
        key={card.uid}
        whileHover={isPlayersTurn ? { scale: 1.05, y: -4 } : {}}
        whileTap={isPlayersTurn ? { scale: 0.95 } : {}}
        onClick={() => {
          if (!isPlayersTurn) return;
          toggleCardSelect(index);
          if (phase === 'play') playCard(index);
        }}
        className={`relative w-14 h-20 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer select-none
          ${SUIT_COLORS[card.suit as keyof typeof SUIT_COLORS]}
          ${selected ? 'ring-2 ring-primary-400 ring-offset-2 bg-primary-50' : 'bg-white shadow-md hover:shadow-lg'}
        `}
      >
        <span className="text-xs font-bold leading-none">{card.rank}</span>
        <span className="text-2xl leading-none">{SUITS[card.suit as keyof typeof SUITS]}</span>
        <span className="text-xs font-bold leading-none rotate-180">{card.rank}</span>
      </motion.div>
    );
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
              Hearts
            </h1>
            <button onClick={inviteFriend} className="p-2 hover:bg-white rounded-full transition-colors">
              <Share2 className="w-5 h-5 text-primary-500" />
            </button>
          </div>

          {/* Scores */}
          <div className="flex justify-center gap-3 mb-3 flex-wrap">
            {Object.entries(scores).map(([player, score]) => (
              <div key={player} className={`px-3 py-1 rounded-xl text-sm font-bold ${player === 'human' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
                {player === 'human' ? '❤️ You' : `🤖 ${player}`}: {score}
              </div>
            ))}
          </div>

          {/* Message */}
          <AnimatePresence>
            {message && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center text-sm font-semibold text-primary-600 mb-3">
                {message}
              </motion.p>
            )}
          </AnimatePresence>

          <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.08)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
              {/* Current Trick */}
              {trick.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-gray-500 mb-2 text-center">Current Trick</p>
                  <div className="flex justify-center gap-3">
                    {trick.map(({ player, card }) => (
                      <div key={card.uid} className={`text-center ${player === 'human' ? 'opacity-100' : 'opacity-60'}`}>
                        <p className="text-xs text-gray-500 mb-1">{player === 'human' ? 'You' : `🤖 ${player}`}</p>
                        <div className={`w-12 h-16 rounded-lg border-2 ${SUIT_COLORS[card.suit as keyof typeof SUIT_COLORS]} bg-white shadow flex flex-col items-center justify-center`}>
                          <span className="text-xs font-bold">{card.rank}</span>
                          <span className="text-xl">{SUITS[card.suit as keyof typeof SUITS]}</span>
                        </div>
                      </div>
                    ))}
                    {Array.from({ length: 4 - trick.length }).map((_, i) => (
                      <div key={`empty-${i}`} className="w-12 h-16 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50/50" />
                    ))}
                  </div>
                </div>
              )}

              {/* Player Hand */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-2 text-center">
                  Your Hand ({hands.human.length} cards)
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {hands.human.map((card, index) => renderCard(card, index))}
                </div>
              </div>

              {/* AI Hands */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {(['ai1','ai2','ai3'] as Player[]).map(ai => (
                  <div key={ai} className="text-center p-2 bg-white/50 rounded-xl">
                    <p className="text-xs text-gray-500">🤖 {ai}</p>
                    <p className="text-lg font-bold text-gray-700">{hands[ai].length}</p>
                    <div className="flex justify-center gap-0.5">
                      {hands[ai].slice(0, 5).map((_, i) => (
                        <div key={i} className="w-6 h-8 rounded bg-gradient-to-br from-primary-400 to-rose-500 shadow-sm" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              {phase === 'pass' && (
                <div className="text-center">
                  <Button onClick={passCards} variant="primary" disabled={selectedCards.length !== 3}>
                    Pass 3 Cards ({selectedCards.length}/3)
                  </Button>
                </div>
              )}

              {phase === 'play' && !isPlayersTurn && (
                <p className="text-center text-sm text-gray-500">Waiting for other players...</p>
              )}
            </div>
          </TiltCard>

          {/* Round End */}
          <AnimatePresence>
            {phase === 'roundEnd' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mt-4">
                <p className="text-xl font-bold text-primary-600">{roundMsg}</p>
                <Button onClick={startNewGame} variant="primary" className="mt-3">New Round 🔄</Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mt-6">
            <Button onClick={inviteFriend} variant="outline" className="mb-3">
              <Share2 className="w-4 h-4 mr-2" /> Invite Friend
            </Button>
            <br />
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
    </PremiumBackground>
  );
}