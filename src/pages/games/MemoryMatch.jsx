import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const ICONS = ['🌹', '💝', '🎀', '💕', '🎁', '💖', '⭐', '🌺', '💐', '🦋', '🍫', '💎'];

export default function MemoryMatch() {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [gameType, setGameType] = useState('memory');
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setWon(true);
      saveGame();
    }
  }, [matched, cards]);

  const initGame = () => {
    const pairs = [...ICONS, ...ICONS];
    const shuffled = pairs.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setStartTime(Date.now());
  };

  const handleFlip = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    setFlipped([...flipped, index]);

    if (flipped.length === 1) {
      setMoves(moves + 1);
      const first = flipped[0];
      if (cards[first] === cards[index]) {
        setMatched([...matched, first, index]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  const saveGame = async () => {
    const { data: existing } = await supabase
      .from('game_stats')
      .select('*')
      .eq('user_id', user.id)
      .eq('game_type', gameType)
      .single();

    const updates = {
      games_played: (existing?.games_played || 0) + 1,
      wins: (existing?.wins || 0) + 1,
      total_time_played: (existing?.total_time_played || 0) + Math.floor((Date.now() - startTime) / 1000),
      last_played: new Date().toISOString()
    };

    await supabase.from('game_sessions').insert({
      game_type: gameType,
      player1_id: user.id,
      player2_id: user.id,
      status: 'completed',
      game_state: { moves, cards: cards.length }
    });

    if (existing) {
      await supabase.from('game_stats').update(updates).eq('id', existing.id);
    } else {
      await supabase.from('game_stats').insert({ ...updates, user_id: user.id, game_type });
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🎴 Memory Match</h1>
        <p className="text-gray-600">Match all the pairs together!</p>
      </div>

      <div className="flex justify-center gap-6 mb-6">
        <div className="bg-pink-100 rounded-xl px-6 py-3 text-center">
          <div className="text-2xl">🎯</div>
          <div className="font-bold">{moves} moves</div>
        </div>
        <div className="bg-purple-100 rounded-xl px-6 py-3 text-center">
          <div className="text-2xl">✅</div>
          <div className="font-bold">{matched.length / 2} / {cards.length / 2} pairs</div>
        </div>
      </div>

      {won && (
        <div className="text-center mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
          <h2 className="text-2xl font-bold text-green-700">🎉 You Win!</h2>
          <p className="text-green-600">Completed in {moves} moves!</p>
          <button onClick={initGame} className="mt-3 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            Play Again
          </button>
        </div>
      )}

      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index);
          return (
            <button
              key={index}
              onClick={() => handleFlip(index)}
              className={`w-16 h-16 md:w-20 md:h-20 rounded-xl text-3xl transition-all duration-300 transform hover:scale-105 ${
                isFlipped
                  ? 'bg-white border-2 border-pink-300 rotate-0'
                  : 'bg-gradient-to-br from-pink-400 to-purple-500 text-white border-2 border-transparent'
              }`}
            >
              {isFlipped ? card : '?'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
