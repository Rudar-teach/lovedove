import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const QUESTIONS = [
  { q: "What's your partner's favorite color?", a: "color" },
  { q: "Where did you first meet?", a: "place" },
  { q: "What's your partner's favorite food?", a: "food" },
  { q: "What's your favorite movie together?", a: "movie" },
  { q: "Who is more likely to be late?", a: "late" },
  { q: "What's your dream vacation?", a: "vacation" },
  { q: "Who cooks better?", a: "cook" },
  { q: "What's the best meal you've had together?", a: "meal" },
];

export default function CoupleQuiz() {
  const { user } = useAuth();
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState({ p1: 0, p2: 0 });
  const [p1Answer, setP1Answer] = useState('');
  const [showP2, setShowP2] = useState(false);
  const [p2Answer, setP2Answer] = useState('');
  const [gameType, setGameType] = useState('quiz');
  const [startTime, setStartTime] = useState(Date.now());
  const [finished, setFinished] = useState(false);

  const q = QUESTIONS[currentQ];

  const submitP1 = () => {
    if (!p1Answer.trim()) return;
    setShowP2(true);
  };

  const submitP2 = () => {
    if (!p2Answer.trim()) return;
    if (p1Answer.toLowerCase() === p2Answer.toLowerCase()) {
      setScore({ ...score, p1: score.p1 + 1, p2: score.p2 + 1 });
    }
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
      setP1Answer('');
      setP2Answer('');
      setShowP2(false);
    } else {
      setFinished(true);
      saveGame();
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
      game_state: { score }
    });

    if (existing) {
      await supabase.from('game_stats').update(updates).eq('id', existing.id);
    } else {
      await supabase.from('game_stats').insert({ ...updates, user_id: user.id, game_type });
    }
  };

  if (finished) {
    const percentage = Math.round((score.p1 / QUESTIONS.length) * 100);
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">💡 Couple Quiz Results</h1>
        <div className="text-6xl mb-4">{percentage >= 70 ? '💕' : percentage >= 40 ? '😊' : '🤔'}</div>
        <p className="text-2xl font-bold text-pink-600 mb-2">{score.p1}/{QUESTIONS.length} matches!</p>
        <p className="text-gray-600 mb-6">
          {percentage >= 70 ? "You know each other perfectly! Amazing! 💕" :
           percentage >= 40 ? "Pretty good! Keep learning about each other 😊" :
           "Keep talking more - love grows with conversation! 💬"}
        </p>
        <button onClick={() => {
          setCurrentQ(0); setScore({p1:0,p2:0}); setP1Answer(''); setShowP2(false); setP2Answer('');
          setFinished(false); setStartTime(Date.now());
        }} className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">💡 Couple Quiz</h1>
        <p className="text-gray-600">How well do you know each other?</p>
        <div className="mt-4 flex justify-center gap-2">
          {QUESTIONS.map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${i <= currentQ ? 'bg-pink-500' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-8">
        <div className="text-center mb-8">
          <span className="text-sm text-gray-500">Question {currentQ + 1}/{QUESTIONS.length}</span>
          <h2 className="text-2xl font-bold text-gray-800 mt-2">{q.q}</h2>
        </div>

        {!showP2 ? (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <span className="text-lg font-medium text-pink-600">Player 1: Type your answer</span>
            </div>
            <input
              value={p1Answer}
              onChange={e => setP1Answer(e.target.value)}
              placeholder="Type your answer..."
              className="w-full px-4 py-3 border-2 border-pink-200 rounded-xl text-lg focus:ring-2 focus:ring-pink-500"
              autoFocus
            />
            <button onClick={submitP1} className="w-full py-3 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600">
              Pass to Player 2 →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <span className="text-lg font-medium text-purple-600">Player 2: Now it's your turn!</span>
              <p className="text-sm text-gray-500 mt-1">Same question: "{q.q}"</p>
            </div>
            <input
              value={p2Answer}
              onChange={e => setP2Answer(e.target.value)}
              placeholder="Type your answer..."
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl text-lg focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            <button onClick={submitP2} className="w-full py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600">
              Submit Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
