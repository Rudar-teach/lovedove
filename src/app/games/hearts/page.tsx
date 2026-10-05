'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

const SUITS = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
const SUIT_COLORS: Record<string, string> = { hearts: 'text-red-500', diamonds: 'text-red-500', clubs: 'text-gray-800', spades: 'text-gray-800' };
const RANKS = ['A','K','Q','J','10','9','8','7','6','5','4','3','2'];
const RANK_VALUES: Record<string, number> = { '2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'J':11,'Q':12,'K':13,'A':14 };

type Card = { suit: string; rank: string; id: number };
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
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState(false);
  const [roundMsg, setRoundMsg] = useState('');
  const cardIdCounter = useRef(0);

  const createDeck = (): Card[] => {
    const cards: Card[] = [];
    for (const suit of Object.keys(SUITS)) {
      for (const rank of RANKS) {
        cards.push({ suit, rank, id: cardIdCounter.current++ });
      }
    }
    return cards.sort(() => Math.random() - 0.5);
  };

  const startNewGame = () => {
    cardIdCounter.current = 0;
    const newDeck = createDeck();
    const newHands: Record<Player, Card[]> = { human: [], ai1: [], ai2: [], ai3: [] };
    const players: Player[] = ['human', 'ai1', 'ai2', 'ai3'];
    let idx = 0;
    for (let i = 0; i < 52; i++) {
      newHands[players[i % 4]].push(newDeck[i]);
    }
    // Sort hands
    for (const p of players) {
      newHands[p].sort((a, b) => {
        const suitOrder = { hearts: 0, diamonds: 1, clubs: 2, spades: 3 };
        if (suitOrder[a.suit] !== suitOrder[b.suit]) return suitOrder[a.suit] - suitOrder[b.suit];
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
  };

  useEffect(() => { startNewGame(); }, []);

  const getCardValue = (card: Card) => {
    if (card.suit === 'hearts') return 1;
    if (card.suit === 'spades' && card.rank === 'Q') return 13;
    return 0;
  };

  const canLeadHearts = () => heartsBroken || (trickNumber === 0 && hands.human.some(c => c.suit === 'clubs' && c.rank === '2'));

  const isLeadSuit = (card: Card, leadSuit: string) => card.suit === leadSuit;

  const passCards = () => {
    if (selectedCards.length !== 3) return;
    const toPass = selectedCards.map(i => hands.human[i]);
    const newHands = { ...hands };
    const idxs = selectedCards.sort((a, b) => b - a);
    idxs.forEach(i => { newHands.human.splice(i, 1); });
    // AI passes
    const aiPlayers: Player[] = ['ai1', 'ai2', 'ai3'];
    for (const ai of aiPlayers) {
      const aiPass = newHands[ai].slice(0, 3);
      const aiIdxs = [0, 1, 2];
      aiIdxs.reverse().forEach(i => { newHands[ai].splice(i, 1); });
      newHands[ai].push(...toPass);
      newHands[human!].push(...aiPass); // just redistribute for simplicity
    }
    // Simple redistribution: human gets AI1's, AI1 gets AI2's, etc
    const aiToHuman = newHands.ai1.splice(0, 3);
    const humanToAi2 = newHands.human.splice(0, 3);
    const ai2ToAi3 = newHands.ai2.splice(0, 3);
    const ai3ToAi1 = newHands.ai3.splice(0, 3);
    newHands.ai1.push(...ai3ToAi1);
    newHands.ai2.push(...humanToAi2);
    newHands.ai3.push(...ai2ToAi3);
    newHands.human.push(...aiToHuman);

    setHands(newHands);
    setSelectedCards([]);
    setPhase('play');
    setMessage('Pass left! Play the 2 of Clubs first');
    // Find who has 2 of clubs
    for (const p of ['human','ai1','ai2','ai3'] as Player[]) {
      if (newHands[p].some(c => c.suit === 'clubs' && c.rank === '2')) {
        setCurrentTrickLead(p);
      }
    }
  };

  const toggleCardSelect = (index: number) => {
    if (phase !== 'pass') return;
    setSelectedCards(prev => {
      if (prev.includes(index)) return prev.filter(i => i !== index);
      if (prev.length >= 3) return prev;
      return [...prev, index];
    });
  };

  const playCard = (cardIndex: number) => {
    if (phase !== 'play') return;
    const card = hands.human[cardIndex];
    const leadSuit = trick.length > 0 ? trick[0].card.suit : null;

    if (trick.length === 0) {
      if (card.suit === 'hearts' && !canLeadHearts()) {
        setMessage('Cannot lead hearts yet!');
        return;
      }
    } else {
      const hasLeadSuit = hands.human.some(c => c.suit === leadSuit);
      if (hasLeadSuit && card.suit !== leadSuit) {
        setMessage(`Must follow suit: ${SUITS[leadSuit as string]}`);
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
    const trickPoints = currentTrick.reduce((sum, p) => sum + getCardValue(p.card), 0);
    const newScores = { ...scores };
    newScores[winner] = (newScores[winner] || 0) + trickPoints;
    setScores(newScores);
    setTrick([]);
    setTrickNumber(t => t + 1);
    setCurrentTrickLead(winner);
    setMessage(`${winner === 'human' ? 'You' : winner} take the trick! (+${trickPoints} pts)`);

    if (Object.values(newHands.human || {}).length === 0) {
      setPhase('roundEnd');
      const finalScores: Record<string, number> = {};
      for (const [k, v] of Object.entries(newScores)) {
        if (v === 26) finalScores[k] = 0;
        else finalScores[k] = v;
      }
      const minScore = Math.min(...Object.values(finalScores));
      const winners = Object.entries(finalScores).filter(([,v]) => v === minScore).map(([k]) => k);
      setRoundMsg(winners.length === 1 && winners[0] === 'human' ? '🏆 You win the round!' : `Round ended! ${winners.map(w => w === 'human' ? 'You' : w).join(' & ')} win!`);
    }
  };

  const aiPlay = (currentTrick: {player: Player; card: Card}[]) => {
    const aiPlayers: Player[] = ['ai1', 'ai2', 'ai3'];
    const nextPlayer = aiPlayers.find(p => !currentTrick.some(t => t.player === p) || currentTrick.filter(t => t.player === p).length < 1);
    // Simple: just find which AI is next
    const leadSuit = currentTrick.length > 0 ? currentTrick[0].card.suit : null;
    let aiPlayer: Player | null = null;
    for (const p of aiPlayers) {
      const playsSoFar = currentTrick.filter(t => t.player === p).length;
      if (playsSoFar === 0 && (currentTrick.length === 0 || currentTrick.filter(t => ['ai1','ai2','ai3'].includes(t.player)).length < currentTrick.length)) {
        // check if it's this AI's turn
        if (currentTrick.length === 0) { aiPlayer = p; break; }
        const turnOrder: Player[] = ['human', 'ai1', 'ai2', 'ai3'];
        const lastPlayer = currentTrick[currentTrick.length - 1].player;
        const lastIdx = turnOrder.indexOf(lastPlayer);
        const nextIdx = (lastIdx + 1) % 4;
        if (turnOrder[nextIdx] === p) { aiPlayer = p; break; }
      }
    }
    if (!aiPlayer) return;

    const aiHand = hands[aiPlayer];
    let playable = aiHand;
    if (leadSuit && aiHand.some(c => c.suit === leadSuit)) {
      playable = aiHand.filter(c => c.suit === leadSuit);
    } else if (leadSuit && aiHand.some(c => c.suit === 'hearts') && !heartsBroken) {
      playable = aiHand.filter(c => c.suit !== 'hearts');
    }
    const chosen = playable[Math.floor(Math.random() * playable.length)];
    const cardIdx = aiHand.indexOf(chosen);
    const newHands = { ...hands, [aiPlayer]: [...aiHand] };
    newHands[aiPlayer].splice(cardIdx, 1);
    const newTrick = [...currentTrick, { player: aiPlayer, card: chosen }];
    setHands(newHands);
    setTrick(newTrick);
    if (chosen.suit === 'hearts') setHeartsBroken(true);

    if (newTrick.length === 4) {
      setTimeout(() => resolveTrick(newTrick), 1500);
    }
  };

  useEffect(() => {
    if (phase === 'play' && trick.length > 0) {
      const lastPlayed = trick[trick.length - 1].player;
      if (lastPlayed !== 'human') {
        const turnOrder: Player[] = ['human', 'ai1', 'ai2', 'ai3'];
        const lastIdx = turnOrder.indexOf(lastPlayed);
        const nextIdx = (lastIdx + 1) % 4;
        const nextPlayer = turnOrder[nextIdx];
        if (nextPlayer !== 'human' && trick.length < 4) {
          setTimeout(() => aiPlay(trick), 1000);
        }
      }
    }
  }, [trick, phase]);

  const inviteFriend = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const isPlayersTurn = phase === 'play' && (trick.length === 0 || (trick.length > 0 && trick[trick.length - 1].player !== 'human')) && trick.length < 4;

  const renderCard = (card: Card, index: number, interactive: boolean) => (
    <motion.div
      key={card.id}
      whileHover={interactive ? { scale: 1.05, y: -4 } : {}}
      whileTap={interactive ? { scale: 0.95 } : {}}
      onClick={() => interactive ? (phase === 'pass' ? toggleCardSelect(index) : playCard(index)) : undefined}
      className={`relative w-14 h-20 rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer select-none
        ${SUIT_COLORS[card.suit]}
        ${selectedCards.includes(index) ? 'ring-2 ring-primary-400 ring-offset-2 bg-primary-50' : 'bg-white shadow-md hover:shadow-lg'}
        ${interactive ? '' : 'opacity-80'}
      `}
    >
      <span className="text-xs font-bold leading-none">{card.rank}</span>
      <span className="text-2xl leading-none">{SUITS[card.suit]}</span>
      <span className="text-xs font-bold leading-none rotate-180">{card.rank}</span>
    </motion.div>
  );

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
          <div className="flex justify-center gap-3 mb-4 flex-wrap">
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

          {/* Round End */}
          <AnimatePresence>
            {phase === 'roundEnd' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center mb-4">
                <p className="text-2xl font-bold text-primary-600">{roundMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game Area */}
          <TiltCard intensity={4} glowColor="rgba(236, 72, 153, 0.08)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 md:p-8">
              {/* Current Trick */}
              {trick.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-500 mb-2 text-center">Current Trick</p>
                  <div className="flex justify-center gap-3">
                    {trick.map(({ player, card }) => (
                      <div key={card.id} className={`text-center ${player === 'human' ? 'opacity-100' : 'opacity-60'}`}>
                        <p className="text-xs text-gray-500 mb-1">{player === 'human' ? 'You' : `🤖 ${player}`}</p>
                        <div className={`w-12 h-16 rounded-lg border-2 ${SUIT_COLORS[card.suit]} bg-white shadow flex flex-col items-center justify-center`}>
                          <span className="text-xs font-bold">{card.rank}</span>
                          <span className="text-xl">{SUITS[card.suit]}</span>
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
                  {hands.human.map((card, index) => renderCard(card, index, true))}
                </div>
              </div>

              {/* AI Hands (mini) */}
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

          {/* Invite & Back */}
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
