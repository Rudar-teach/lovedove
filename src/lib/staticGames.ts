// Love Dove — static game catalog
// Used as an instant fallback so the games page renders immediately
// even before Supabase data is available.

export interface StaticGame {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: 'puzzle' | 'strategy' | 'action' | 'quiz' | 'romantic' | 'multiplayer' | 'creative';
  emoji: string;
  difficulty: 'easy' | 'medium' | 'hard';
  min_players: number;
  max_players: number;
  is_featured: boolean;
  play_count: number;
  route_path: string;
}

export const STATIC_GAMES: StaticGame[] = [
  // ── Featured couple games ──────────────────────────────────────────
  { id: 's-tictactoe', slug: 'tictactoe', name: 'Tic-Tac-Toe', description: 'Classic strategy game. Play with your partner!', category: 'strategy', emoji: '❌', difficulty: 'easy', min_players: 2, max_players: 2, is_featured: true, play_count: 1240, route_path: '/games/tictactoe' },
  { id: 's-memory', slug: 'memory', name: 'Memory Match', description: 'Find the pairs. Test your memory together!', category: 'puzzle', emoji: '🎴', difficulty: 'easy', min_players: 2, max_players: 2, is_featured: true, play_count: 980, route_path: '/games/memory' },
  { id: 's-quiz', slug: 'quiz', name: 'Couple Quiz', description: 'How well do you know your partner?', category: 'quiz', emoji: '💡', difficulty: 'medium', min_players: 2, max_players: 2, is_featured: true, play_count: 1450, route_path: '/games/quiz' },
  { id: 's-wyr', slug: 'wouldyourather', name: 'Would You Rather', description: 'Tough choices for couples.', category: 'quiz', emoji: '🤔', difficulty: 'easy', min_players: 2, max_players: 4, is_featured: true, play_count: 870, route_path: '/games/wouldyourather' },

  // ── Classic ────────────────────────────────────────────────────────
  { id: 's-rps', slug: 'rockpaperscissors', name: 'Rock Paper Scissors', description: 'Classic hand game, quick and fun.', category: 'action', emoji: '✋', difficulty: 'easy', min_players: 2, max_players: 2, is_featured: false, play_count: 620, route_path: '/games/rockpaperscissors' },
  { id: 's-hangman', slug: 'hangman', name: 'Hangman Love', description: 'Guess the love word together.', category: 'puzzle', emoji: '💬', difficulty: 'medium', min_players: 2, max_players: 2, is_featured: false, play_count: 340, route_path: '/games/hangman' },
  { id: 's-numguess', slug: 'numberguess', name: 'Number Guess', description: 'Guess the number before your partner does.', category: 'puzzle', emoji: '🔢', difficulty: 'easy', min_players: 2, max_players: 2, is_featured: false, play_count: 410, route_path: '/games/numberguess' },
  { id: 's-snake', slug: 'snake', name: 'Love Snake', description: 'Classic snake game with a love twist.', category: 'action', emoji: '🐍', difficulty: 'easy', min_players: 1, max_players: 1, is_featured: false, play_count: 520, route_path: '/games/snake' },
  { id: 's-2048', slug: 'game2048', name: '2048 Love', description: 'Merge numbers to reach 2048.', category: 'puzzle', emoji: '🔲', difficulty: 'medium', min_players: 1, max_players: 1, is_featured: false, play_count: 380, route_path: '/games/game2048' },
  { id: 's-memorypalace', slug: 'memorypalace', name: 'Memory Palace', description: 'Match love symbols and build your palace.', category: 'puzzle', emoji: '🏰', difficulty: 'medium', min_players: 2, max_players: 2, is_featured: false, play_count: 260, route_path: '/games/memorypalace' },

  // ── Arcade ─────────────────────────────────────────────────────────
  { id: 's-pong', slug: 'pong', name: 'Pong 2 Player', description: 'Classic pong battle. Challenge your partner!', category: 'action', emoji: '🏓', difficulty: 'easy', min_players: 2, max_players: 2, is_featured: false, play_count: 300, route_path: '/games/pong' },
  { id: 's-flappy', slug: 'flappyheart', name: 'Flappy Heart', description: 'Flappy bird love edition. Tap and fly!', category: 'action', emoji: '💘', difficulty: 'medium', min_players: 1, max_players: 1, is_featured: false, play_count: 450, route_path: '/games/flappyheart' },
  { id: 's-cupid', slug: 'cupidsarrow', name: "Cupid's Arrow", description: 'Shoot the hearts, don\'t miss!', category: 'action', emoji: '🏹', difficulty: 'medium', min_players: 1, max_players: 1, is_featured: false, play_count: 210, route_path: '/games/cupidsarrow' },
  { id: 's-heartcatcher', slug: 'heartcatcher', name: 'Heart Catcher', description: 'Catch falling hearts, avoid the broken ones!', category: 'action', emoji: '🫶', difficulty: 'easy', min_players: 1, max_players: 1, is_featured: false, play_count: 190, route_path: '/games/heartcatcher' },

  // ── Love / Romantic ────────────────────────────────────────────────
  { id: 's-lovecalc', slug: 'love_compatibility', name: 'Love Compatibility', description: 'Test your compatibility score!', category: 'romantic', emoji: '💞', difficulty: 'easy', min_players: 2, max_players: 2, is_featured: true, play_count: 1620, route_path: '/games/love_compatibility' },
  { id: 's-lovecalc2', slug: 'love_compatibility2', name: 'Love Compatibility 2', description: 'Advanced compatibility test.', category: 'romantic', emoji: '💕', difficulty: 'easy', min_players: 2, max_players: 2, is_featured: false, play_count: 720, route_path: '/games/love_compatibility2' },
  { id: 's-romanticcalc', slug: 'romantic_calculator', name: 'Romantic Calculator', description: 'Calculate your love percentage!', category: 'romantic', emoji: '💘', difficulty: 'easy', min_players: 2, max_players: 2, is_featured: false, play_count: 540, route_path: '/games/romantic_calculator' },
  { id: 's-lovemaze', slug: 'lovemaze', name: 'Love Maze', description: 'Navigate the maze of love together.', category: 'romantic', emoji: '🧩', difficulty: 'medium', min_players: 2, max_players: 2, is_featured: false, play_count: 280, route_path: '/games/lovemaze' },
  { id: 's-anniversary', slug: 'anniversary_planner', name: 'Anniversary Planner', description: 'Plan your perfect anniversary.', category: 'romantic', emoji: '📅', difficulty: 'easy', min_players: 2, max_players: 2, is_featured: false, play_count: 230, route_path: '/games/anniversary_planner' },
  { id: 's-bucketlist', slug: 'couple_bucketlist', name: 'Couple Bucket List', description: 'Check off dreams together.', category: 'romantic', emoji: '📋', difficulty: 'easy', min_players: 2, max_players: 2, is_featured: false, play_count: 310, route_path: '/games/couple_bucketlist' },

  // ── Party ──────────────────────────────────────────────────────────
  { id: 's-gfrules', slug: 'girlfriend_rules', name: 'Girlfriend Rules', description: 'Fun rules game for couples.', category: 'multiplayer', emoji: '👩', difficulty: 'easy', min_players: 2, max_players: 4, is_featured: false, play_count: 400, route_path: '/games/girlfriend_rules' },
  { id: 's-bfrules', slug: 'boyfriend_rules', name: 'Boyfriend Rules', description: 'Fun rules game for couples.', category: 'multiplayer', emoji: '👨', difficulty: 'easy', min_players: 2, max_players: 4, is_featured: false, play_count: 380, route_path: '/games/boyfriend_rules' },
  { id: 's-kissing', slug: 'kissinggame', name: 'Kissing Spinner', description: 'Spin the wheel for a romantic dare.', category: 'multiplayer', emoji: '💋', difficulty: 'easy', min_players: 2, max_players: 2, is_featured: false, play_count: 350, route_path: '/games/kissinggame' },
  { id: 's-loveemoji2', slug: 'love_emoji2', name: 'Love Emoji 2', description: 'Emoji guessing fun for groups.', category: 'multiplayer', emoji: '😂', difficulty: 'easy', min_players: 2, max_players: 6, is_featured: false, play_count: 290, route_path: '/games/love_emoji2' },
  { id: 's-couplephoto', slug: 'couple_photo', name: 'Couple Photo', description: 'Photo challenge for couples.', category: 'multiplayer', emoji: '📷', difficulty: 'easy', min_players: 2, max_players: 4, is_featured: false, play_count: 260, route_path: '/games/couple_photo' },

  // ── Quiz ───────────────────────────────────────────────────────────
  { id: 's-trivia', slug: 'triviabattle', name: 'Trivia Battle', description: 'Battle with love trivia questions.', category: 'quiz', emoji: '⚔️', difficulty: 'medium', min_players: 2, max_players: 4, is_featured: true, play_count: 1120, route_path: '/games/triviabattle' },
  { id: 's-emoji-quiz', slug: 'loveemojiquiz', name: 'Love Emoji Quiz', description: 'Guess the movie or song from emojis.', category: 'quiz', emoji: '😀', difficulty: 'easy', min_players: 2, max_players: 2, is_featured: false, play_count: 430, route_path: '/games/loveemojiquiz' },
  { id: 's-emoji-quiz2', slug: 'love_emoji_quiz', name: 'Love Emoji Quiz 2', description: 'More emoji guessing fun.', category: 'quiz', emoji: '😊', difficulty: 'easy', min_players: 2, max_players: 2, is_featured: false, play_count: 350, route_path: '/games/love_emoji_quiz' },
  { id: 's-riddles', slug: 'love_riddles', name: 'Love Riddles', description: 'Solve love riddles together.', category: 'quiz', emoji: '🧩', difficulty: 'medium', min_players: 2, max_players: 2, is_featured: false, play_count: 240, route_path: '/games/love_riddles' },
  { id: 's-riddles2', slug: 'love_riddles2', name: 'Love Riddles 2', description: 'More love riddles.', category: 'quiz', emoji: '🧠', difficulty: 'medium', min_players: 2, max_players: 2, is_featured: false, play_count: 200, route_path: '/games/love_riddles2' },
  { id: 's-quotes', slug: 'love_quotes_quiz', name: 'Love Quotes Quiz', description: 'Guess the love quote.', category: 'quiz', emoji: '💬', difficulty: 'medium', min_players: 2, max_players: 2, is_featured: false, play_count: 180, route_path: '/games/love_quotes_quiz' },
  { id: 's-spelling', slug: 'heartspelling', name: 'Heart Spelling', description: 'Spell love words before your partner.', category: 'quiz', emoji: '✍️', difficulty: 'easy', min_players: 2, max_players: 2, is_featured: false, play_count: 220, route_path: '/games/heartspelling' },
  { id: 's-couplequiz2', slug: 'couplequiz2', name: 'Couple Quiz 2', description: 'More couple questions.', category: 'quiz', emoji: '💡', difficulty: 'medium', min_players: 2, max_players: 2, is_featured: false, play_count: 320, route_path: '/games/couplequiz2' },
  { id: 's-rel-riddles', slug: 'relationship_riddles', name: 'Relationship Riddles', description: 'Relationship puzzles for two.', category: 'quiz', emoji: '🤔', difficulty: 'medium', min_players: 2, max_players: 2, is_featured: false, play_count: 170, route_path: '/games/relationship_riddles' },
  { id: 's-couple-riddles', slug: 'couple_riddles', name: 'Couple Riddles', description: 'Riddles designed for couples.', category: 'quiz', emoji: '🧩', difficulty: 'medium', min_players: 2, max_players: 2, is_featured: false, play_count: 150, route_path: '/games/couple_riddles' },

  // ── Word / Puzzle ──────────────────────────────────────────────────
  { id: 's-ws1', slug: 'couple_word_search', name: 'Couple Word Search', description: 'Find love words together.', category: 'puzzle', emoji: '🔍', difficulty: 'easy', min_players: 2, max_players: 2, is_featured: false, play_count: 330, route_path: '/games/couple_word_search' },
  { id: 's-ws2', slug: 'couple_word_search2', name: 'Couple Word Search 2', description: 'More word search fun.', category: 'puzzle', emoji: '🔎', difficulty: 'easy', min_players: 2, max_players: 2, is_featured: false, play_count: 280, route_path: '/games/couple_word_search2' },
  { id: 's-lovehangman2', slug: 'lovehangman2', name: 'Love Hangman 2', description: 'More hangman words to guess.', category: 'puzzle', emoji: '💬', difficulty: 'medium', min_players: 2, max_players: 2, is_featured: false, play_count: 190, route_path: '/games/lovehangman2' },
  { id: 's-patterns', slug: 'couplepatterns', name: 'Couple Patterns', description: 'Memory pattern challenge.', category: 'puzzle', emoji: '🧩', difficulty: 'medium', min_players: 2, max_players: 2, is_featured: false, play_count: 210, route_path: '/games/couplepatterns' },
  { id: 's-heartcolors', slug: 'heartcolors', name: 'Heart Colors', description: 'Match heart colors fast!', category: 'puzzle', emoji: '🎨', difficulty: 'easy', min_players: 2, max_players: 2, is_featured: false, play_count: 240, route_path: '/games/heartcolors' },
  { id: 's-sequences', slug: 'lovesequences', name: 'Love Sequences', description: 'Complete the sequence before your partner.', category: 'puzzle', emoji: '🔢', difficulty: 'hard', min_players: 2, max_players: 2, is_featured: false, play_count: 160, route_path: '/games/lovesequences' },
  { id: 's-rhythm', slug: 'heartrhythm', name: 'Heart Rhythm', description: 'Tap to the beat of love.', category: 'action', emoji: '🎵', difficulty: 'medium', min_players: 2, max_players: 2, is_featured: false, play_count: 230, route_path: '/games/heartrhythm' },

  // ── Creative ───────────────────────────────────────────────────────
  { id: 's-loveletter', slug: 'loveletter', name: 'Love Letter', description: 'Write a love letter to your partner.', category: 'creative', emoji: '✉️', difficulty: 'easy', min_players: 2, max_players: 2, is_featured: false, play_count: 310, route_path: '/games/loveletter' },
  { id: 's-loveletters2', slug: 'loveletters', name: 'Love Letters 2', description: 'More love letter prompts.', category: 'creative', emoji: '💌', difficulty: 'easy', min_players: 2, max_players: 2, is_featured: false, play_count: 250, route_path: '/games/loveletters' },
  { id: 's-poetry', slug: 'couple_poetry', name: 'Couple Poetry', description: 'Write poetry together.', category: 'creative', emoji: '📜', difficulty: 'medium', min_players: 2, max_players: 2, is_featured: false, play_count: 140, route_path: '/games/couple_poetry' },
  { id: 's-timecapsule', slug: 'couple_timecapsule', name: 'Couple Time Capsule', description: 'Write messages for the future.', category: 'creative', emoji: '⏳', difficulty: 'easy', min_players: 2, max_players: 2, is_featured: false, play_count: 180, route_path: '/games/couple_timecapsule' },
  { id: 's-photostory', slug: 'couple_photo_story', name: 'Couple Photo Story', description: 'Tell stories with photos.', category: 'creative', emoji: '📸', difficulty: 'easy', min_players: 2, max_players: 2, is_featured: false, play_count: 270, route_path: '/games/couple_photo_story' },

  // ── Cards ──────────────────────────────────────────────────────────
  { id: 's-hearts', slug: 'hearts', name: 'Hearts Card', description: 'Card game classic for four.', category: 'strategy', emoji: '♥️', difficulty: 'hard', min_players: 4, max_players: 4, is_featured: false, play_count: 320, route_path: '/games/hearts' },
  { id: 's-couplemem', slug: 'couple_memory_match', name: 'Couple Memory Match', description: 'Memory card game for two.', category: 'puzzle', emoji: '🃏', difficulty: 'easy', min_players: 2, max_players: 2, is_featured: false, play_count: 300, route_path: '/games/couple_memory_match' },
  { id: 's-coupmem2', slug: 'couple_memory', name: 'Couple Memory', description: 'Memory challenge for couples.', category: 'puzzle', emoji: '🧠', difficulty: 'medium', min_players: 2, max_players: 2, is_featured: false, play_count: 260, route_path: '/games/couple_memory' },
  { id: 's-golfs', slug: 'couplegolfs', name: 'Couple Golfs', description: '9 holes of love golf.', category: 'strategy', emoji: '⛳', difficulty: 'medium', min_players: 2, max_players: 2, is_featured: false, play_count: 290, route_path: '/games/couplegolfs' },

  // ── Extra ──────────────────────────────────────────────────────────
  { id: 's-wyr2', slug: 'romantic_would_you_rather2', name: 'Romantic Would You Rather', description: 'More spicy questions for two.', category: 'quiz', emoji: '💭', difficulty: 'easy', min_players: 2, max_players: 4, is_featured: false, play_count: 470, route_path: '/games/romantic_would_you_rather2' },
  { id: 's-lovequotes', slug: 'love_quotes', name: 'Love Quotes', description: 'Guess the quote that speaks love.', category: 'quiz', emoji: '💝', difficulty: 'easy', min_players: 2, max_players: 2, is_featured: false, play_count: 160, route_path: '/games/love_quotes' },
];

export default STATIC_GAMES;
