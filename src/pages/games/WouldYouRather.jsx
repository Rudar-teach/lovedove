import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const QUESTIONS = [
  "Would you rather live on a beach forever?",
  "Would you rather have unlimited pizza?",
  "Would you rather travel the world?",
  "Would you rather never sleep again?",
  "Would you rather be able to fly?",
  "Would you rather have super strength?",
  "Would you rather eat only sweet food?",
  "Would you rather talk to animals?",
  "Would you rather relive your favorite day?",
  "Would you rather be invisible?",
  "Would you rather have a million dollars?",
  "Would you rather be famous forever?",
  "Would you rather live without music?",
  "Would you rather be always hot or always cold?",
  "Would you rather have your dream job?",
];

export default function WouldYouRather() {
  const { user } = useAuth();
  const [currentQ, setCurrentQ] = useState(0);
  const [p1Choice, setP1Choice] = useState('');
  const [showP2, setShowP2] = useState(false);
  const [p2Choice, setP2Choice] = useState('');
  const [agreements, setAgreements] = useState(0);
  const [finished, setFinished] = useState(false);
  const [gameType, setGameType] = useState('wouldyourather');
  const [startTime, setStartTime] = useState(Date.now());

  const q = QUESTIONS[currentQ];
  const optionA = `Option A`;
  const optionB = `Option B`;

  const submitP1 = () => {
    if (!p1Choice) return;
    setShowP2(true);
  };

  const submitP2 = () => {
    if (!p2Choice) return;
    if (p1Choice === p2Choice) setAgreements(agreements + 1);
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
      setP1Choice(''); setP2Choice(''); setShowP2(false);
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
      game_state: { agreements }
    });

    if (existing) {
      await supabase.from('game_stats').update(updates).eq('id', existing.id);
    } else {
      await supabase.from('game_stats').insert({ ...updates, user_id: user.id, game_type });
    }
  };

  if (finished) {
    const pct = Math.round((agreements / QUESTIONS.length) * 100);
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">🤔 Results</h1>
        <div className="text-6xl mb-4">{pct >= 70 ? '💕' : pct >= 40 ? '😊' : '🤪'}</div>
        <p className="text-2xl font-bold text-pink-600 mb-2">{agreements}/{QUESTIONS.length} agreements!</p>
        <p className="text-gray-600 mb-6">
          {pct >= 70 ? "You think alike! Perfect match! 💕" :
           pct >= 40 ? "Some differences keep things interesting! 😊" :
           "Opposites attract! 🌟"}
        </p>
        <button onClick={() => {
          setCurrentQ(0); setP1Choice(''); setP2Choice('');
          setShowP2(false); setFinished(false); setAgreements(0); setStartTime(Date.now());
        }} className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">🤔 Would You Rather</h1>
        <p className="text-gray-600">Choose between two options!</p>
        <div className="mt-4 flex justify-center gap-2">
          {QUESTIONS.map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${i <= currentQ ? 'bg-pink-500' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-8">
        <div className="text-center mb-6">
          <span className="text-sm text-gray-500">Question {currentQ + 1}/{QUESTIONS.length}</span>
          <h2 className="text-xl font-bold text-gray-800 mt-2">Would you rather...</h2>
        </div>

        {!showP2 ? (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <span className="text-lg font-medium text-pink-600">Player 1: Make your choice</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setP1Choice('A')} className={`p-6 rounded-xl border-2 text-lg font-medium transition-all ${p1Choice === 'A' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'}`}>
                ✨ {optionA}
              </button>
              <button onClick={() => setP1Choice('B')} className={`p-6 rounded-xl border-2 text-lg font-medium transition-all ${p1Choice === 'B' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-300'}`}>
                🌟 {optionB}
              </button>
            </div>
            <button onClick={submitP1} disabled={!p1Choice} className="w-full py-3 bg-pink-500 text-white rounded-xl font-medium hover:bg-pink-600 disabled:opacity-50">
              Pass to Player 2 →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <span className="text-lg font-medium text-purple-600">Player 2: Now you choose!</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setP2Choice('A')} className={`p-6 rounded-xl border-2 text-lg font-medium transition-all ${p2Choice === 'A' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                ✨ {optionA}
              </button>
              <button onClick={() => setP2Choice('B')} className={`p-6 rounded-xl border-2 text-lg font-medium transition-all ${p2Choice === 'B' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}>
                🌟 {optionB}
              </button>
            </div>
            <button onClick={submitP2} disabled={!p2Choice} className="w-full py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 disabled:opacity-50">
              See Result
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
