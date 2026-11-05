'use client';

// Global "Play with friend" button.
//
// Mounted once in the root layout. It activates ONLY on plain couple-game
// pages (/games/<slug>) and skips pages that already have their own
// friend UI:
//   - /games/bollywood/* (Bollywood pages render their own button)
//   - /games (catalog — has its own button + panel)
//   - /games/[slug] catch-all (its own friend-invite flow — detect it by
//     the absence of the individual game data below, and skip)
//
// It resolves the game name from STATIC_GAMES / bollywood data and offers
// the standard FriendPanel. The ?friend=1 deep-link and the
// ld_friend_pick handoff behave exactly like the per-page button.

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Clapperboard } from 'lucide-react';
import FriendPanel, { Friend } from './FriendPanel';
import { STATIC_GAMES } from '@/lib/staticGames';
import { getBollywoodGame } from '@/lib/bollywoodGames';

// Games that exist ONLY in the /games/[slug] catch-all page (no
// dedicated directory, not in STATIC_GAMES or the bollywood data).
const CATCHALL_GAME_NAMES: Record<string, string> = {
  'animalquiz': 'Animal Quiz',
  'anniversaryplanner': 'Anniversary Planner',
  'asteroids': 'Asteroids',
  'ballbounce': 'Ball Bounce',
  'balloonpop': 'Balloon Pop',
  'brickbreaker': 'Brick Breaker',
  'cardmatch': 'Card Match',
  'celebritycouples': 'Celebrity Couples',
  'charades': 'Charades',
  'colormatch': 'Color Match',
  'colorpersonality': 'Color Personality',
  'colorswitch': 'Color Switch',
  'couplebucketlist': 'Couple Bucket List',
  'couplechallenges': 'Couple Challenges',
  'couplegoals': 'Couple Goals',
  'coupletrivia': 'Couple Trivia',
  'couplewordsearch': 'Couple Word Search',
  'datenightideas': 'Date Night Ideas',
  'datenightroulette': 'Date Night Roulette',
  'diceroll': 'Dice Roll',
  'dodgeblocks': 'Dodge the Blocks',
  'dreaminterpretation': 'Dream Interpretation',
  'emojiquiz': 'Emoji Quiz',
  'endlessrunner': 'Endless Runner',
  'foodpreference': 'Food Preference',
  'fruitninja': 'Fruit Ninja Love',
  'guessthephoto': 'Guess the Photo',
  'helicopter': 'Helicopter Game',
  'historylovequiz': 'History Love Quiz',
  'jetpack': 'Jetpack Joyride',
  'lovecompatibility': 'Love Compatibility',
  'loveconfessions': 'Love Confessions',
  'lovejournal': 'Love Journal',
  'lovemadlibs': 'Love Mad Libs',
  'lovemessages': 'Love Messages',
  'loveplaylist': 'Love Playlist',
  'lovepoems': 'Love Poems',
  'loveriddle': 'Love Riddle',
  'lovetowerdefense': 'Love Tower Defense',
  'lovetrivia2': 'Love Trivia 2',
  'memorylane': 'Memory Lane',
  'memoryquiz': 'Memory Quiz',
  'movielines': 'Movie Lines',
  'movielovequiz': 'Movie Love Quiz',
  'musictastequiz': 'Music Taste Quiz',
  'neverhaveiever': 'Never Have I Ever',
  'patternmatch': 'Pattern Match',
  'personalityquiz': 'Personality Quiz',
  'pipeconnect': 'Pipe Connect',
  'promisecircle': 'Promise Circle',
  'quickmath': 'Quick Math',
  'refluxtest': 'Reflex Test',
  'relationshipquiz': 'Relationship Quiz',
  'scattergories': 'Scattergories',
  'sciencelove': 'Science of Love',
  'sequencememory': 'Sequence Memory',
  'simonsays': 'Simon Says',
  'spaceinvaders': 'Space Invaders Love',
  'spinthebottle': 'Spin the Bottle',
  'spotifyquiz': 'Spotify Quiz',
  'stacktower': 'Stack Tower',
  'strooptest': 'Stroop Test',
  'thisorthat': 'This or That',
  'travelquiz': 'Travel Quiz',
  'twotruths': 'Two Truths One Lie',
  'wordscramble': 'Word Scramble',
};

const PICK_KEY = 'ld_friend_pick';

// Friendly names for the dedicated game pages that live in their own
// /games/<slug> directory but are not part of STATIC_GAMES / bollywood.
// Shown in the FriendPanel header ("Playing X").
const DEDICATED_GAME_NAMES: Record<string, string> = {
  anniversary_planner: 'Anniversary Planner',
  boyfriend_rules: 'Boyfriend Rules',
  compatibilitytest: 'Compatibility Test',
  couple_bucketlist: 'Couple Bucket List',
  couple_drawing: 'Couple Drawing',
  couple_goals: 'Couple Goals',
  couple_goals2: 'Couple Goals 2',
  couple_goals_2: 'Couple Goals 2',
  couple_memory: 'Couple Memory',
  couple_memory_match: 'Couple Memory Match',
  couple_music_quiz: 'Couple Music Quiz',
  couple_photo: 'Couple Photo',
  couple_photo_story: 'Couple Photo Story',
  couple_pictionary: 'Couple Pictionary',
  couple_playlist: 'Couple Playlist',
  couple_poetry: 'Couple Poetry',
  couple_quiz: 'Couple Quiz',
  couple_reflex: 'Couple Reflex',
  couple_riddles: 'Couple Riddles',
  couple_scenarios: 'Couple Scenarios',
  couple_story2: 'Couple Story',
  couple_timecapsule: 'Couple Time Capsule',
  couple_truths: 'Couple Truths',
  couple_typing_race: 'Couple Typing Race',
  couple_word_search: 'Couple Word Search',
  couple_word_search2: 'Couple Word Search 2',
  couplecharades: 'Couple Charades',
  couplegolfs: 'Couple Golfs',
  couplememory2: 'Couple Memory',
  couplepatterns: 'Couple Patterns',
  couplepictionary: 'Couple Pictionary',
  couplequiz2: 'Couple Quiz',
  coupleriddles: 'Couple Riddles',
  couplescramble: 'Couple Scramble',
  coupletrivia2: 'Couple Trivia',
  cupidsarrow: "Cupid's Arrow",
  dancechallenge: 'Dance Challenge',
  drawingchallenge: 'Drawing Challenge',
  emojistory: 'Emoji Story',
  firstdate: 'First Date',
  flappyheart: 'Flappy Heart',
  future_together: 'Future Together',
  game2048: '2048',
  girlfriend_rules: 'Girlfriend Rules',
  hangman: 'Hangman Love',
  heartcatcher: 'Heart Catcher',
  heartcolors: 'Heart Colors',
  heartmatch: 'Heart Match',
  heartmath: 'Heart Math',
  heartpuzzle: 'Heart Puzzle',
  heartquiz: 'Heart Quiz',
  heartrhythm: 'Heart Rhythm',
  hearts: 'Hearts',
  heartspelling: 'Heart Spelling',
  howwell_met: 'How Well We Met',
  kissinggame: 'Kissing Spinner',
  love_achievements: 'Love Achievements',
  love_bingo: 'Love Bingo',
  love_challenges: 'Love Challenges',
  love_compatibility: 'Love Compatibility',
  love_compatibility2: 'Love Compatibility 2',
  love_countdown: 'Love Countdown',
  love_dares: 'Love Daress',
  love_dares2: 'Love Daress 2',
  love_emoji2: 'Love Emoji',
  love_emoji_quiz: 'Love Emoji Quiz',
  love_horoscope: 'Love Horoscope',
  love_journal: 'Love Journal',
  love_language_test: 'Love Language Test',
  love_madlibs: 'Love Mad Libs',
  love_qna: 'Love Q&A',
  love_quotes: 'Love Quotes',
  love_quotes_quiz: 'Love Quotes Quiz',
  love_resolutions: 'Love Resolutions',
  love_riddles: 'Love Riddles',
  love_riddles2: 'Love Riddles 2',
  love_scenario: 'Love Scenario',
  love_scenarios: 'Love Scenarios',
  love_scramble2: 'Love Scramble',
  love_story2: 'Love Story',
  love_story_builder: 'Love Story Builder',
  love_truths: 'Love Truths',
  love_wheel: 'Love Wheel',
  love_word_scramble: 'Love Word Scramble',
  love_word_search2: 'Love Word Search',
  lovebingo: 'Love Bingo',
  lovecalculator: 'Love Calculator',
  lovecrossword: 'Love Crossword',
  loveemojiquiz: 'Love Emoji Quiz',
  lovehangman2: 'Love Hangman',
  loveletter: 'Love Letter',
  loveletters: 'Love Letters',
  lovemath: 'Love Math',
  lovemaze: 'Love Maze',
  lovesequences: 'Love Sequences',
  lovesongquiz: 'Love Song Quiz',
  lovetrivia: 'Love Trivia',
  lovetyping: 'Love Typing',
  lovewordsearch: 'Love Word Search',
  memory: 'Memory Match',
  memorypalace: 'Memory Palace',
  numberguess: 'Number Guess',
  photoquiz: 'Photo Quiz',
  pong: 'Pong 2 Player',
  promisechain: 'Promise Chain',
  puzzlelove: 'Puzzle Love',
  quiz: 'Couple Quiz',
  relationship_goals: 'Relationship Goals',
  relationship_quiz: 'Relationship Quiz',
  relationship_riddles: 'Relationship Riddles',
  relationshipbingo: 'Relationship Bingo',
  rockpaperscissors: 'Rock Paper Scissors',
  romantic_calculator: 'Romantic Calculator',
  romantic_riddles2: 'Romantic Riddles',
  romantic_would_you_rather2: 'Romantic Would You Rather',
  snake: 'Love Snake',
  speeddate: 'Speed Date',
  tictactoe: 'Tic-Tac-Toe',
  triviabattle: 'Trivia Battle',
  truthordare: 'Truth or Dare',
  typingrace: 'Typing Race',
  who_knows_who: 'Who Knows Who',
  wordchain: 'Word Chain',
  wouldyourather: 'Would You Rather',
};

export default function GlobalPlayWithFriend() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const [gameName, setGameName] = useState('');
  const [gameSlug, setGameSlug] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const segs = pathname.split('/').filter(Boolean);
    // /games/<slug> exactly — two segments, first is "games"
    if (segs.length !== 2 || segs[0] !== 'games') {
      setActive(false);
      setOpen(false);
      return;
    }
    const slug = segs[1];
    // Pages that already provide a friend flow of their own
    if (slug === 'bollywood') return;

    const staticGame = STATIC_GAMES.find((g) => g.slug === slug || g.route_path === `/games/${slug}`);
    const bolly = getBollywoodGame(slug);
    const catchallName = CATCHALL_GAME_NAMES[slug];
    const dedicatedName = DEDICATED_GAME_NAMES[slug];
    if (!staticGame && !bolly && !dedicatedName && !catchallName) {
      // Unknown slug — probably the [slug] catch-all's own layout; stay quiet.
      setActive(false);
      return;
    }
    setGameSlug(slug);
    setGameName(staticGame?.name || bolly?.name || dedicatedName || catchallName || 'Game');
    setActive(true);

    // Deep-link: open the panel when arriving with ?friend=1
    const q = new URLSearchParams(window.location.search).get('friend');
    if (q === '1' || q === 'true') setOpen(true);

    // Handoff: a friend picked on the catalog page should auto-open here
    try {
      const pick = sessionStorage.getItem(PICK_KEY);
      if (pick) {
        const f = JSON.parse(pick);
        if (f?.name) {
          alert(
            `Continuing with ${f.name}!\n\nPass-and-play: Player 1 goes first, then Player 2. ` +
            'For quiz games, both answers reveal only after both have finished.'
          );
        }
        sessionStorage.removeItem(PICK_KEY);
      }
    } catch {
      /* sessionStorage unavailable — ignore */
    }
  }, [pathname]);

  if (!active) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 left-4 sm:left-6 z-50 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-bold rounded-2xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:scale-105 transition-all"
      >
        <Clapperboard className="w-4 h-4" />
        Play with friend
      </button>

      <FriendPanel
        gameName={gameName}
        gameSlug={gameSlug}
        open={open}
        onClose={() => setOpen(false)}
        onPlayFriend={(f: Friend) => {
          alert(
            `You chose ${f.name} for ${gameName}!\n\n` +
            'Pass-and-play: Player 1 goes first, then Player 2. ' +
            'For quiz games, both answers reveal only after both have finished.'
          );
          setOpen(false);
        }}
      />
    </>
  );
}
