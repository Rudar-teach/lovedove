import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function TicTacToe() {
  const { user } = useAuth();
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0, ties: 0 });
  const [startTime, setStartTime] = useState(Date.now());
  const [gameType, setGameType] = useState('tictactoe');

  useEffect(() => {
    if (winner) {
      saveGameSession();
      updateGameStats();
    }
  }, [winner]);

  const checkWinner = (board) => {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]
    ];
    for (const [a,b,c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    if (board.every(cell => cell)) return 'tie';
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result);
      if (result !== 'tie') {
        setScores(prev => ({ ...prev, [result]: prev[result] + 1 }));
      } else {
        setScores(prev => ({ ...prev, ties: prev.ties + 1 }));
      }
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setStartTime(Date.now());
  };

  const newRound = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setStartTime(Date.now());
  };

  const saveGameSession = async () => {
    await supabase.from('game_sessions').insert({
      game_type: gameType,
      player1_id: user.id,
      player2_id: user.id,
      status: winner === 'tie' ? 'completed' : 'completed',
      game_state: { board, winner, scores },
      started_at: new Date(startTime).toISOString(),
      ended_at: new Date().toISOString()
    });
  };

  const updateGameStats = async () => {
    const timePlayed = Math.floor((Date.now() - startTime) / 1000);
    const { data: existing } = await supabase
      .from('game_stats')
      .select('*')
      .eq('user_id', user.id)
      .eq('game_type', gameType)
      .single();

    const updates = {
      games_played: (existing?.games_played || 0) + 1,
      total_time_played: (existing?.total_time_played || 0) + timePlayed,
      last_played: new Date().toISOString()
    };

    if (winner !== 'tie') {
      updates.wins = (existing?.wins || 0) + 1;
    } else {
      updates.losses = (existing?.losses || 0) + 1;
    }

    if (existing) {
      await supabase.from('game_stats').update(updates).eq('id', existing.id);
    } else {
      await supabase.from('game_stats').insert({ ...updates, user_id: user.id, game_type: gameType });
    }

    // Check badges
    await checkBadges(updates.wins);
  };

  const checkBadges = async (wins) => {
    const { data: badges } = await supabase.from('badges').select('*');
    if (!badges) return;

    const newBadges = [];
    for (const badge of badges) {
      let earned = false;
      if (badge.requirement_type === 'wins' && wins >= badge.requirement_value) earned = true;
      if (badge.requirement_type === 'total_time' && (stats?.total_time || 0) >= badge.requirement_value) earned = true;

      if (earned) {
        const { data: existing } = await supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', user.id)
          .eq('badge_id', badge.id)
          .single();

        if (!existing) {
          await supabase.from('user_badges').insert({ user_id: user.id, badge_id: badge.id });
          newBadges.push(badge);
        }
      }
    }

    if (newBadges.length > 0) {
      alert(`🎉 New Badge Earned: ${newBadges[0].name}!`);
    }
  };

  const renderCell = (index) => {
    const value = board[index];
    const isWinning = winner && winner !== 'tie' && value === winner;

    return (
      <button
        key={index}
        onClick={() => handleClick(index)}
        className={`w-24 h-24 md:w-32 md:h-32 bg-white border-2 border-pink-200 rounded-xl text-4xl font-bold transition-all hover:bg-pink-50 flex items-center justify-center ${
          isWinning ? 'bg-green-100 border-green-400' : ''
        }`}
        disabled={!!value || !!winner}
      >
        {value === 'X' ? <span className="text-pink-500">⭕</span> :
         value === 'O' ? <span className="text-purple-500">❌</span> : ''}
      </button>
    );
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">⭕ Tic-Tac-Toe</h1>
        <p className="text-gray-600">Take turns with your partner!</p>
      </div>

      {/* Score */}
      <div className="flex justify-center gap-6 mb-6">
        <div className="bg-pink-100 rounded-xl px-6 py-3 text-center">
          <div className="text-2xl">⭕</div>
          <div className="font-bold">{scores.X}</div>
        </div>
        <div className="bg-purple-100 rounded-xl px-6 py-3 text-center">
          <div className="text-2xl">❌</div>
          <div className="font-bold">{scores.O}</div>
        </div>
        <div className="bg-gray-100 rounded-xl px-6 py-3 text-center">
          <div className="text-2xl">🤝</div>
          <div className="font-bold">{scores.ties}</div>
        </div>
      </div>

      {/* Board */}
      <div className="flex justify-center mb-6">
        <div className="grid grid-cols-3 gap-2">
          {board.map((_, i) => renderCell(i))}
        </div>
      </div>

      {/* Status */}
      <div className="text-center">
        {winner === 'tie' ? (
          <div className="text-2xl font-bold text-gray-600 mb-4">🤝 It's a Tie!</div>
        ) : winner ? (
          <div className="text-2xl font-bold text-green-600 mb-4">
            {winner === 'X' ? '⭕' : '❌'} Wins! 🎉
          </div>
        ) : (
          <div className="text-xl text-gray-600 mb-4">
            Current turn: <span className="font-bold">{currentPlayer === 'X' ? '⭕' : '❌'}</span>
          </div>
        )}

        <div className="flex gap-2 justify-center">
          {winner && (
            <button onClick={newRound} className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600">
              Play Again
            </button>
          )}
          <button onClick={resetGame} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            Reset Scores
          </button>
        </div>
      </div>
    </div>
  );
}
