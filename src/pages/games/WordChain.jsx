import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const WORDS = ['love', 'heart', 'kiss', 'hug', 'date', 'dance', 'song', 'dream', 'star', 'moon', 'sun', 'flower', 'rose', 'cute', 'sweet', 'smile', 'forever', 'together', 'beautiful', 'happy', 'romance', 'couple', 'partner', 'soul'];

export default function WordChain() {
  const { user } = useAuth();
  const [chain, setChain] = useState(['love']);
  const [input, setInput] = useState('');
  const [turn, setTurn] = useState(1);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });
  const [message, setMessage] = useState('');
  const [gameType, setGameType] = useState('wordchain');
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = () => {
    const word = input.toLowerCase().trim();
    if (!word) return;

    const lastWord = chain[chain.length - 1];
    if (word[0] !== lastWord[lastWord.length - 1]) {
      setMessage(`Word must start with "${lastWord[lastWord.length - 1].toUpperCase()}"!`);
      return;
    }

    if (chain.includes(word)) {
      setMessage('That word was already used!');
      return;
    }

    setChain([...chain, word]);
    setInput('');
    setMessage('');

    if (turn % 2 === 1) {
      setScores({ ...scores, p2: scores.p2 + 1 });
    } else {
      setScores({ ...scores, p1: scores.p1 + 1 });
    }

    if (chain.length >= 10) {
      endGame();
    } else {
      setTurn(turn + 1);
    }
  };

  const endGame = async () => {
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
      game_state: { chain: chain.length }
    });

    if (existing) {
      await supabase.from('game_stats').update(updates).eq('id', existing.id);
    } else {
      await supabase.from('game_stats').insert({ ...updates, user_id: user.id, game_type });
    }
  };

  const resetGame = () => {
    setChain(['love']);
    setInput('');
    setTurn(1);
    setScores({ p1: 0, p2: 0 });
    setMessage('');
    setStartTime(Date.now());
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🔤 Word Chain</h1>
        <p className="text-gray-600">Take turns saying words that start with the last letter!</p>
      </div>

      <div className="flex justify-center gap-6 mb-6">
        <div className="bg-pink-100 rounded-xl px-6 py-3 text-center">
          <div className="text-sm text-pink-600">Player 1</div>
          <div className="text-2xl font-bold">{scores.p1}</div>
        </div>
        <div className="bg-purple-100 rounded-xl px-6 py-3 text-center">
          <div className="text-sm text-purple-600">Player 2</div>
          <div className="text-2xl font-bold">{scores.p2}</div>
        </div>
        <div className="bg-gray-100 rounded-xl px-6 py-3 text-center">
          <div className="text-sm text-gray-600">Turn</div>
          <div className="text-2xl font-bold">{Math.ceil(turn / 2)}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-6">
        <div className="text-center mb-4">
          <span className="text-lg font-medium text-pink-600">
            Player {turn % 2 === 1 ? '1' : '2'}'s Turn
          </span>
        </div>

        {/* Word chain */}
        <div className="bg-pink-50 rounded-xl p-4 mb-6 min-h-[120px] max-h-[200px] overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {chain.map((word, i) => (
              <span key={i} className={`px-3 py-1 rounded-full text-sm ${
                i === chain.length - 1
                  ? 'bg-pink-500 text-white font-bold'
                  : 'bg-white text-gray-700'
              }`}>
                {word}
              </span>
            ))}
          </div>
        </div>

        {message && (
          <div className="text-center text-red-600 mb-4">{message}</div>
        )}

        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Word starting with "${chain[chain.length - 1][chain[chain.length - 1].length - 1].toUpperCase()}"...`}
            className="flex-1 px-4 py-2 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-500"
            onKeyPress={e => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
          <button onClick={handleSubmit} className="px-6 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600">
            Submit
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={resetGame} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
            Reset Game
          </button>
          <button onClick={() => {
            const words = WORDS.filter(w => w.startsWith(chain[chain.length - 1][chain[chain.length - 1].length - 1]) && !chain.includes(w));
            if (words.length > 0) {
              const hint = words[Math.floor(Math.random() * words.length)];
              alert(`Hint: Try "{hint}"`);
            }
          }} className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm">
            💡 Get Hint
          </button>
        </div>
      </div>
    </div>
  );
}
