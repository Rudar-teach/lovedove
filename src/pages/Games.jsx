import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Games() {
  const [games, setGames] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    loadGames();
    getUserId();
  }, []);

  const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id);
  };

  const loadGames = async () => {
    const { data } = await supabase
      .from('games_catalog')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (data) setGames(data);
  };

  const gameEmojis = {
    'tictactoe': '⭕',
    'memory': '🎴',
    'quiz': '💡',
    'wouldyourather': '🤔',
    'wordchain': '🔤'
  };

  const difficultyColors = {
    'easy': 'text-green-600 bg-green-50',
    'medium': 'text-yellow-600 bg-yellow-50',
    'hard': 'text-red-600 bg-red-50'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">🎮 Games</h1>
        <p className="text-gray-600 mt-1">Play together with your partner!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map(game => (
          <Link
            key={game.id}
            to={game.route_path}
            className="bg-white rounded-2xl p-6 shadow-md border border-pink-100 hover:shadow-xl transition-all transform hover:-translate-y-1 group"
          >
            <div className="text-center">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
                {gameEmojis[game.slug] || '🎮'}
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{game.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{game.description}</p>
              <div className="flex justify-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[game.difficulty]}`}>
                  {game.difficulty}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-pink-50 text-pink-600">
                  {game.min_players}-{game.max_players} players
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
