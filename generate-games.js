const fs = require('fs');
const path = require('path');

const baseDir = 'C:/Users/hp omen/Downloads/project/lovedove/src/app/games';

const games = [
  {
    dir: 'howwell_met',
    title: 'How Well Did You Meet?',
    emoji: '💬',
    desc: 'Test your memory of how you and your partner first met!',
    color: 'from-pink-500 to-rose-500',
    questions: [
      { q: 'What were you both wearing on your first date?', opts: ['Formal attire', 'Casual clothes', 'Something sparkly', 'Matching outfits'], ans: 1 },
      { q: 'What was the first thing you said to each other?', opts: ['Hello', 'Hey there', 'Nice to meet you', 'I have no idea'], ans: 3 },
      { q: 'Where did you first meet?', opts: ['Online', 'At a party', 'At school/work', 'Through friends'], ans: 2 },
      { q: 'What was your first impression of each other?', opts: ['Instantly in love', 'A bit nervous', 'Very charming', 'Not sure yet'], ans: 1 },
      { q: 'How did the conversation start?', opts: ['About the weather', 'Shared interest', 'A funny joke', 'Deep question'], ans: 1 },
      { q: 'What was the vibe on your first meeting?', opts: ['Super awkward', 'Flirty and fun', 'Comfortable', 'Electric!'], ans: 3 },
      { q: 'Did you exchange contact info that day?', opts: ['Yes, immediately', 'No, waited a bit', 'Already had it', 'Used carrier pigeon'], ans: 0 },
      { q: 'How long before the second date?', opts: ['Next day', 'Within a week', 'A month later', 'Still waiting...'], ans: 1 },
    ]
  },
  {
    dir: 'love_language_test',
    title: 'Love Language Test',
    emoji: '💝',
    desc: 'Discover your primary love language based on the 5 Love Languages!',
    color: 'from-rose-500 to-pink-500',
    questions: [
      { q: 'What makes you feel most loved?', opts: ['Hugging and cuddling', 'Hearing I love you', 'Getting a thoughtful gift', 'Quality time together'], ans: 3 },
      { q: 'Your partner is upset. You:', opts: ['Give them a hug', 'Write them a love note', 'Cook them dinner', 'Listen carefully'], ans: 0 },
      { q: 'Perfect date night would be:', opts: ['A fancy dinner', 'A movie marathon at home', 'A surprise trip', 'A walk talking for hours'], ans: 3 },
      { q: 'I feel most appreciated when my partner:', opts: ['Tells me nice things', 'Helps with chores', 'Gives me gifts', 'Spends uninterrupted time with me'], ans: 0 },
      { q: 'When I am sad, I need:', opts: ['Physical comfort', 'Kind words', 'A distraction/gift', 'Someone to sit with me'], ans: 3 },
      { q: 'What hurts most in a relationship?', opts: ['Mean words', 'Being ignored', 'Broken promises', 'Lack of affection'], ans: 0 },
      { q: 'I show love by:', opts: ['Saying nice things', 'Doing helpful things', 'Giving gifts', 'Being fully present'], ans: 3 },
      { q: 'Best anniversary gift would be:', opts: ['A handwritten letter', 'Help with a project', 'Something meaningful', 'A whole day together'], ans: 3 },
      { q: 'I feel disconnected when:', opts: ['Criticized', 'Left alone', 'Forgotten on occasions', 'Not touched enough'], ans: 2 },
      { q: 'My ideal morning with my partner:', opts: ['Sweet messages', 'Breakfast in bed', 'A small surprise', 'Slow morning together'], ans: 3 },
    ]
  },
  {
    dir: 'couple_memory_match',
    title: 'Couple Memory Match',
    emoji: '🧠',
    desc: 'Flip cards and find matching pairs of romantic emojis!',
    color: 'from-purple-500 to-pink-500',
    gameType: 'memory',
    pairs: ['💕', '💖', '💗', '💓', '💘', '💝', '💞', '💟']
  },
  {
    dir: 'love_word_scramble',
    title: 'Love Word Scramble',
    emoji: '📝',
    desc: 'Unscramble these romantic words before time runs out!',
    color: 'from-red-500 to-rose-500',
    words: [
      { word: 'LOVE', hint: 'The strongest feeling' },
      { word: 'KISS', hint: 'What lovers share' },
      { word: 'HEART', hint: 'Symbol of love' },
      { word: 'HUG', hint: 'Warm embrace' },
      { word: 'SOUL', hint: 'Your romantic other half' },
      { word: 'KIND', hint: 'What love makes you' },
      { word: 'DREAM', hint: 'You are my ___' },
      { word: 'JOIN', hint: 'Bring two hearts together' },
    ]
  },
  {
    dir: 'relationship_quiz',
    title: 'Relationship Quiz',
    emoji: '💏',
    desc: 'Fun trivia questions about relationships!',
    color: 'from-amber-500 to-rose-500',
    questions: [
      { q: 'Which organ produces oxytocin, the love hormone?', opts: ['Heart', 'Brain', 'Liver', 'Lungs'], ans: 1 },
      { q: 'How long does it take to fall in love (scientifically)?', opts: ['1 second', '8.2 seconds', '1 week', '1 month'], ans: 1 },
      { q: 'What is the traditional 1st anniversary gift?', opts: ['Silver', 'Paper', 'Wood', 'Cotton'], ans: 1 },
      { q: 'Which color is associated with love?', opts: ['Blue', 'Green', 'Red', 'Yellow'], ans: 2 },
      { q: 'What did Romans call the goddess of love?', opts: ['Athena', 'Venus', 'Hera', 'Artemis'], ans: 1 },
      { q: 'Couples who laugh together tend to:', opts: ['Fight more', 'Stay together longer', 'Get bored', 'Move faster'], ans: 1 },
      { q: 'The love hormone is also called:', opts: ['Cuddle hormone', 'Anger hormone', 'Fear hormone', 'Sleep hormone'], ans: 0 },
      { q: 'Which flower symbolizes love?', opts: ['Rose', 'Daisy', 'Sunflower', 'Lily'], ans: 0 },
    ]
  },
  {
    dir: 'love_compatibility',
    title: 'Love Compatibility',
    emoji: '💘',
    desc: 'Check your love compatibility with your partner!',
    color: 'from-pink-500 to-red-500',
    gameType: 'compatibility'
  },
  {
    dir: 'couple_typing_race',
    title: 'Couple Typing Race',
    emoji: '⌨️',
    desc: 'Type romantic quotes as fast as you can!',
    color: 'from-blue-500 to-indigo-500',
    gameType: 'typing',
    quotes: [
      'You are my today and all of my tomorrows',
      'I love you more than yesterday but less than tomorrow',
      'You had me at hello',
      'To me, you are perfect',
      'You complete me',
      'I would rather spend one lifetime with you than face all the ages of this world alone',
      'You are the finest, loveliest, tenderest, and most beautiful person I have ever known',
      'Love is composed of a single soul inhabiting two bodies',
    ]
  },
  {
    dir: 'love_emoji_quiz',
    title: 'Love Emoji Quiz',
    emoji: '😍',
    desc: 'Guess the romantic phrase from the emojis!',
    color: 'from-rose-500 to-pink-500',
    gameType: 'emoji',
    emojis: [
      { e: '💕💍', a: 'Marriage Proposal', opts: ['Marriage Proposal', 'Wedding Ring', 'Engagement', 'True Love'] },
      { e: '💋❤️', a: 'Kiss of Love', opts: ['Kiss of Love', 'Heart Lips', 'Romantic Kiss', 'Sweet Love'] },
      { e: '🌹💕', a: 'Rose and Love', opts: ['Rose and Love', 'Romantic Flower', 'Secret Admirer', 'Valentines Day'] },
      { e: '💑🌙', a: 'Couple under Moon', opts: ['Couple under Moon', 'Romantic Night', 'Stargazing Lovers', 'Moonlit Date'] },
      { e: '🎁💝', a: 'Gift of Love', opts: ['Gift of Love', 'Surprise', 'Valentines Gift', 'Wrapped Love'] },
      { e: '💏💖', a: 'Kiss with Heart', opts: ['Kiss with Heart', 'Passionate Love', 'Deep Kiss', 'Lovers Embrace'] },
      { e: '🌹👩‍❤️‍👨', a: 'Romantic Couple', opts: ['Romantic Couple', 'Flower Lovers', 'Garden Date', 'Love Story'] },
      { e: '💍💍', a: 'Double Rings', opts: ['Double Rings', 'Wedding', 'Engagement', 'Married Love'] },
    ]
  },
  {
    dir: 'couple_pictionary',
    title: 'Couple Pictionary',
    emoji: '🎨',
    desc: 'Draw the romantic word - can your partner guess it?',
    color: 'from-purple-500 to-indigo-500',
    gameType: 'pictionary',
    words: ['Heart', 'Kiss', 'Couple', 'Ring', 'Rose', 'Hug', 'Cake', 'Dove', 'Arrow', 'Star']
  },
  {
    dir: 'love_story_builder',
    title: 'Love Story Builder',
    emoji: '📖',
    desc: 'Build a love story together, one sentence at a time!',
    color: 'from-amber-500 to-orange-500',
    gameType: 'story'
  },
  {
    dir: 'couple_reflex',
    title: 'Couple Reflex Test',
    emoji: '⚡',
    desc: 'Test your reflexes! Tap when the screen turns green!',
    color: 'from-green-500 to-emerald-500',
    gameType: 'reflex'
  },
  {
    dir: 'who_knows_who',
    title: 'Who Knows Who Better?',
    emoji: '🤔',
    desc: 'Answer questions about each other and see who knows best!',
    color: 'from-teal-500 to-cyan-500',
    questions: [
      { q: 'What is my favorite food?', a1: 'Pizza', a2: 'Sushi', correct: 0 },
      { q: 'What is my dream vacation spot?', a1: 'Beach', a2: 'Mountains', correct: 0 },
      { q: 'What is my biggest fear?', a1: 'Heights', a2: 'Spiders', correct: 0 },
      { q: 'What is my favorite color?', a1: 'Blue', a2: 'Pink', correct: 0 },
      { q: 'What is my go-to comfort food?', a1: 'Ice cream', a2: 'Chocolate', correct: 0 },
      { q: 'What is my favorite movie genre?', a1: 'Romance', a2: 'Comedy', correct: 0 },
      { q: 'What is my biggest pet peeve?', a1: 'Lateness', a2: 'Messiness', correct: 0 },
      { q: 'What is my favorite season?', a1: 'Summer', a2: 'Winter', correct: 0 },
    ]
  },
  {
    dir: 'love_horoscope',
    title: 'Love Horoscope',
    emoji: '🔮',
    desc: 'Get your personalized love horoscope!',
    color: 'from-indigo-500 to-purple-500',
    gameType: 'horoscope'
  },
  {
    dir: 'future_together',
    title: 'Future Together',
    emoji: '🔮',
    desc: 'Discover predictions about your future as a couple!',
    color: 'from-blue-500 to-purple-500',
    gameType: 'future'
  },
  {
    dir: 'love_dares',
    title: 'Love Dares',
    emoji: '🔥',
    desc: 'Accept romantic dares and spice up your relationship!',
    color: 'from-red-500 to-pink-500',
    gameType: 'dares',
    dareList: [
      'Give your partner a 10-minute massage',
      'Write a love poem for each other',
      'Cook a meal together naked',
      'Send 10 flirty texts in a row',
      'Dance to your song in the kitchen',
      'Plan a surprise date for this week',
      'Stargaze and share your dreams',
      'Take a shower together',
      'Feed each other chocolate',
      'Recreate your first date',
      'Write reasons you love each other on 10 sticky notes',
      'Give each other a compliment every hour',
    ]
  },
  {
    dir: 'couple_goals',
    title: 'Couple Goals Checklist',
    emoji: '✅',
    desc: 'Track your couple goals and achieve them together!',
    color: 'from-amber-500 to-yellow-500',
    gameType: 'checklist',
    goals: [
      'Watch the sunset together',
      'Cook a fancy dinner',
      'Go on a road trip',
      'Stargaze all night',
      'Dance in the rain',
      'Have a picnic',
      'Build a pillow fort',
      'Take a dance class together',
      'Go camping',
      'Write love letters',
      'Visit a new city',
      'Learn something new together',
      'Volunteer together',
      'Create a playlist together',
      'Have a movie marathon',
    ]
  },
  {
    dir: 'romantic_would_you_rather2',
    title: 'Would You Rather - Romantic Edition 2',
    emoji: '🤷',
    desc: 'Tough romantic choices - which would you choose?',
    color: 'from-pink-500 to-rose-500',
    gameType: 'wyr',
    questions: [
      { a: 'A candlelit dinner at home', b: 'A fancy restaurant' },
      { a: 'A beach vacation', b: 'A mountain cabin' },
      { a: 'Beach sunset', b: 'City lights at night' },
      { a: 'Breakfast in bed', b: 'A late-night snack together' },
      { a: 'Handwritten love letters', b: 'Surprise gifts' },
      { a: 'Slow dancing', b: 'Party dancing' },
      { a: 'A cozy movie night', b: 'An adventurous day out' },
      { a: 'Morning walk together', b: 'Evening jog together' },
    ]
  },
  {
    dir: 'couple_truths',
    title: 'Couple Truths',
    emoji: '💬',
    desc: 'Deep and fun truth questions for couples to ask each other!',
    color: 'from-indigo-500 to-blue-500',
    questions: [
      'What was your first impression of me?',
      'What is your favorite memory of us?',
      'What is something I do that always makes you smile?',
      'What is a dream you have for our future?',
      'What is the most romantic thing I have done for you?',
      'What is something you are afraid to tell me?',
      'When did you realize you were in love with me?',
      'What is your favorite thing about my personality?',
      'If we could travel anywhere, where would you go?',
      'What makes you feel most loved by me?',
    ]
  },
  {
    dir: 'love_riddles',
    title: 'Love Riddles',
    emoji: '🧩',
    desc: 'Solve romantic riddles with your partner!',
    color: 'from-purple-500 to-pink-500',
    riddles: [
      { r: 'I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?', a: 'A map (of your heart)' },
      { r: 'The more you take, the more you leave behind. What am I?', a: 'Footsteps (towards love)' },
      { r: 'I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?', a: 'An echo (of love)' },
      { r: 'What has keys but no locks, space but no room, you can enter but not go inside?', a: 'A keyboard... but for lovers, it is your heart' },
      { r: 'I can fly without wings. I can cry without eyes. What am I?', a: 'A cloud... or a lover who misses you' },
      { r: 'What gets wetter the more it dries?', a: 'A towel... or tears of joy' },
      { r: 'What has a head and a tail but no body?', a: 'A coin... or a love story with no ending' },
      { r: 'The more of me there is, the less you see. What am I?', a: 'Darkness... or distance between lovers' },
    ]
  },
  {
    dir: 'couple_poetry',
    title: 'Couple Poetry',
    emoji: '✍️',
    desc: 'Write a poem together, taking turns with each line!',
    color: 'from-rose-500 to-red-500',
    gameType: 'poetry'
  },
  {
    dir: 'love_challenges',
    title: 'Love Challenges',
    emoji: '💪',
    desc: 'Complete daily love challenges to strengthen your bond!',
    color: 'from-orange-500 to-rose-500',
    challenges: [
      'Give 5 genuine compliments',
      'Share your favorite childhood memory',
      'Cook a meal together',
      'Write 3 things you love about each other',
      'Take a walk and hold hands the whole time',
      'Plan a surprise for each other',
      'Dance to your song',
      'Look at old photos together',
      'Say I love you in 3 different languages',
      'Create a handshake',
      'Make a playlist of songs that remind you of each other',
      'Give a 15-minute massage',
    ]
  },
  {
    dir: 'couple_goals_2',
    title: 'Couple Bucket List',
    emoji: '🌍',
    desc: 'Things to do together before you say I do!',
    color: 'from-teal-500 to-blue-500',
    gameType: 'checklist',
    goals: [
      'Watch a sunset on the beach',
      'Go on a spontaneous road trip',
      'Sleep under the stars',
      'Take a dance lesson together',
      'Visit a new country',
      'Build a snowman',
      'Have a bonfire night',
      'Go skydiving together',
      'Volunteer at an animal shelter',
      'Write letters to your future selves',
      'Recreate your first date',
      'Go on a blind date (with each other)',
      'Learn to cook a fancy meal',
      'Plant a garden together',
      'Go whale watching',
    ]
  },
  {
    dir: 'romantic_riddles2',
    title: 'Romantic Riddles 2',
    emoji: '🧩',
    desc: 'More romantic riddles to solve together!',
    color: 'from-pink-500 to-purple-500',
    riddles: [
      { r: 'I am not alive, but I can grow. I do not have lungs, but I need air. What am I?', a: 'Fire (like the fire of love)' },
      { r: 'What comes once in a minute, twice in a moment, but never in a thousand years?', a: 'The letter M (in I loVe you)' },
      { r: 'What can travel around the world while staying in a corner?', a: 'A stamp... or a love letter' },
      { r: 'I have no voice, but I tell you stories. I have no hands, but I can show you the world. What am I?', a: 'A book... like the story of your love' },
      { r: 'What is light as a feather, yet the strongest person cannot hold it for 5 minutes?', a: 'Your breath... when you see your love' },
      { r: 'What has legs but cannot walk?', a: 'A table... where you share meals together' },
      { r: 'What disappears as soon as you say its name?', a: 'Silence... when lovers talk' },
      { r: 'What belongs to you, but others use it more than you?', a: 'Your name... called by the one you love' },
    ]
  },
  {
    dir: 'love_quotes_quiz',
    title: 'Love Quotes Quiz',
    emoji: '💬',
    desc: 'Guess who said these famous romantic quotes!',
    color: 'from-amber-500 to-orange-500',
    questions: [
      { q: '"You had me at hello."', opts: ['Jerry Maguire', 'Say Anything', 'Notting Hill', 'The Notebook'], ans: 0 },
      { q: '"To me, you are perfect."', opts: ['Love Actually', 'The Notebook', 'Pride and Prejudice', 'Titanic'], ans: 0 },
      { q: '"I would rather spend one lifetime with you than face all the ages of this world alone."', opts: ['Lord of the Rings', 'Titanic', 'Avatar', 'Pirates of Caribbean'], ans: 0 },
      { q: '"Love is composed of a single soul inhabiting two bodies."', opts: ['Plato', 'Aristotle', 'Socrates', 'Shakespeare'], ans: 0 },
      { q: '"The best thing to hold onto in life is each other."', opts: ['Audrey Hepburn', 'Marilyn Monroe', 'Grace Kelly', 'Elizabeth Taylor'], ans: 0 },
      { q: '"If I know what love is, it is because of you."', opts: ['Hermann Hesse', 'Goethe', 'Nietzsche', 'Kafka'], ans: 0 },
      { q: '"We are all a little weird and life is a little weird, and when we find someone whose weirdness is compatible with ours, we join up with them and fall in mutual weirdness and call it love."', opts: ['Dr. Seuss', 'Roald Dahl', 'Shel Silverstein', 'A.A. Milne'], ans: 0 },
      { q: '"You are the finest, loveliest, tenderest, and most beautiful person I have ever known."', opts: ['F. Scott Fitzgerald', 'Hemingway', 'Proust', 'Austen'], ans: 0 },
    ]
  },
  {
    dir: 'couple_drawing',
    title: 'Couple Drawing Challenge',
    emoji: '🎨',
    desc: 'Take turns drawing romantic prompts!',
    color: 'from-purple-500 to-indigo-500',
    gameType: 'drawing',
    prompts: ['A heart-shaped balloon', 'Two doves holding a heart', 'A couple on a bench', 'A sunset kiss', 'A flower bouquet', 'A love letter', 'Two coffee cups', 'A wedding ring', 'A couple holding hands', 'A candlelit dinner']
  },
  {
    dir: 'love_scramble2',
    title: 'Love Word Scramble 2',
    emoji: '🔤',
    desc: 'More romantic words to unscramble!',
    color: 'from-red-500 to-rose-500',
    words: [
      { word: 'ROMANCE', hint: 'The feeling of being in love' },
      { word: 'DREAMER', hint: 'One who dreams of love' },
      { word: 'CHERISH', hint: 'To hold dear' },
      { word: 'ADORE', hint: 'To love deeply' },
      { word: 'TWINS', hint: 'Two hearts as one' },
      { word: 'EMBRACE', hint: 'A warm hug' },
      { word: 'SOULMATE', hint: 'Your perfect partner' },
      { word: 'ETERNITY', hint: 'Forever and always' },
    ]
  },
  {
    dir: 'relationship_goals',
    title: 'Relationship Goals',
    emoji: '🎯',
    desc: 'Set and track relationship goals together!',
    color: 'from-green-500 to-teal-500',
    gameType: 'checklist',
    goals: [
      'Have a weekly date night',
      'Go on a weekend getaway',
      'Learn a new skill together',
      'Volunteer together monthly',
      'Have a no-phone dinner night',
      'Create a shared budget',
      'Read a book together',
      'Run a 5K together',
      'Plant a garden',
      'Take a cooking class',
      'Go stargazing',
      'Build something together',
    ]
  },
  {
    dir: 'couple_music_quiz',
    title: 'Couple Music Quiz',
    emoji: '🎵',
    desc: 'Guess romantic songs from clues and emojis!',
    color: 'from-blue-500 to-indigo-500',
    gameType: 'music',
    questions: [
      { q: '🎵 "I just called to say I love you" 🎵', opts: ['Stevie Wonder', 'Marvin Gaye', 'Michael Jackson', 'Prince'], ans: 0 },
      { q: '🎵 "Is this the real life? Is this just fantasy?" 🎵', opts: ['Queen - Bohemian Rhapsody', 'Pink Floyd', 'Led Zeppelin', 'The Beatles'], ans: 0 },
      { q: '🎵 "All you need is love" 🎵', opts: ['The Beatles', 'The Rolling Stones', 'The Beach Boys', 'The Kinks'], ans: 0 },
      { q: '🎵 "Endless love" 🌹', opts: ['Lionel Richie', 'Elton John', 'Barry White', 'Prince'], ans: 0 },
      { q: '🎵 "I will always love you" 💔', opts: ['Whitney Houston', 'Mariah Carey', 'Celine Dion', 'Adele'], ans: 0 },
      { q: '🎵 "At last, my love has come along" 🎵', opts: ['Etta James', 'Aretha Franklin', 'Billie Holiday', 'Nina Simone'], ans: 0 },
      { q: '🎵 "Thinking out loud" 💭', opts: ['Ed Sheeran', 'John Legend', 'Sam Smith', 'James Arthur'], ans: 0 },
      { q: '🎵 "Perfect" 💍', opts: ['Ed Sheeran', 'Bruno Mars', 'Justin Bieber', 'Shawn Mendes'], ans: 0 },
    ]
  },
  {
    dir: 'love_journal',
    title: 'Love Journal',
    emoji: '📔',
    desc: 'Write daily love notes to your partner!',
    color: 'from-rose-500 to-pink-500',
    gameType: 'journal'
  },
  {
    dir: 'couple_playlist',
    title: 'Couple Playlist Builder',
    emoji: '🎶',
    desc: 'Build your perfect couple playlist together!',
    color: 'from-purple-500 to-violet-500',
    gameType: 'playlist'
  },
  {
    dir: 'anniversary_planner',
    title: 'Anniversary Planner',
    emoji: '📋',
    desc: 'Plan your perfect anniversary celebration!',
    color: 'from-red-500 to-rose-500',
    gameType: 'planner'
  },
  {
    dir: 'couple_photo_story',
    title: 'Couple Photo Story',
    emoji: '📸',
    desc: 'Create a timeline of your relationship journey!',
    color: 'from-amber-500 to-orange-500',
    gameType: 'photostory'
  },
];

function generateGameFile(game) {
  const imports = `'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Trophy, Zap, Star, Play, RotateCcw, Timer, Send, Volume2, Shuffle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import PremiumBackground from '@/components/PremiumBackground';
`;

  const dataSection = generateDataSection(game);
  const logicSection = generateLogicSection(game);
  const renderSection = generateRenderSection(game);

  return imports + '\n' + dataSection + '\n' + logicSection + '\n' + renderSection + '\n';
}

function generateDataSection(game) {
  if (game.gameType === 'memory') {
    const pairs = game.pairs.map((e, i) => `{ id: ${i*2}, emoji: '${e}', matched: false },\n      { id: ${i*2+1}, emoji: '${e}', matched: false }`).join(',\n      ');
    return `const CARDS_DATA = [
      ${pairs}
    ];
`;
  } else if (game.gameType === 'compatibility') {
    return `const LOVE_NAMES = ['Romeo', 'Juliet', 'Adam', 'Eve', 'Romeo', 'Juliet', 'Ted', 'Robin', 'Joey', 'Rachel', 'Ross', 'Rachel', 'Tony', 'Maria', 'Beauty', 'Beast'];
`;
  } else if (game.gameType === 'typing') {
    const quotes = game.quotes.map(q => `'${q.replace(/'/g, "\\'")}'`).join(',\n    ');
    return `const ROMANTIC_QUOTES = [
    ${quotes}
  ];
`;
  } else if (game.gameType === 'emoji') {
    const items = game.emojis.map((item, i) => `{ id: ${i}, emoji: '${item.e}', answer: '${item.a}', opts: ${JSON.stringify(item.opts)} }`).join(',\n      ');
    return `const EMOJI_QUESTIONS = [
      ${items}
    ];
`;
  } else if (game.gameType === 'pictionary' || game.gameType === 'drawing') {
    const words = game.words.map(w => `'${w}'`).join(',\n    ');
    return `const DRAW_WORDS = [
    ${words}
  ];
`;
  } else if (game.gameType === 'reflex') {
    return `const REFLEX_STATES = ['waiting', 'ready', 'go', 'result'] as const;
`;
  } else if (game.gameType === 'horoscope') {
    return `const ZODIAC_SIGNS = ['Aries ♈', 'Taurus ♉', 'Gemini ♊', 'Cancer ♋', 'Leo ♌', 'Virgo ♍', 'Libra ♎', 'Scorpio ♏', 'Sagittarius ♐', 'Capricorn ♑', 'Aquarius ♒', 'Pisces ♓'];
const LOVE_PREDICTIONS = [
  'Your love life is blooming like a spring flower!',
  'A romantic surprise is heading your way!',
  'Your bond will grow stronger this month!',
  'An unexpected encounter will spark joy!',
  'Your patience in love will be rewarded!',
  'A new chapter in your love story begins!',
  'Your relationship is entering a beautiful phase!',
  'Togetherness brings you luck this season!',
];
`;
  } else if (game.gameType === 'future') {
    return `const FUTURE_PREDICTIONS = [
  'You will adopt a fluffy pet together in 2026!',
  'A romantic trip to Paris is in your future!',
  'You will buy your first home together next year!',
  'A surprise proposal is coming!',
  'You will dance at your own wedding in Tuscany!',
  'A Netflix documentary about your love story!',
  'You will have a beautiful honeymoon in Bali!',
  'You will grow old watching sunsets together!',
  'A surprise baby is on the way!',
  'You will renovate a house together!',
];
`;
  } else if (game.gameType === 'dares') {
    return `const DARES_LIST = ${JSON.stringify(game.dareList)};
`;
  } else if (game.gameType === 'checklist') {
    const goals = game.goals.map(g => `'${g}'`).join(',\n    ');
    return `const GOALS_LIST = [
    ${goals}
  ];
`;
  } else if (game.gameType === 'story') {
    return `const STORY_STARTERS = [
  'Once upon a time, there was a couple who...',
  'On a magical evening, they discovered...',
  'Little did they know that...',
  'As the sun set, they realized...',
  'And so, their greatest adventure began when...',
  'There is something special about the way...',
  'Every love story is beautiful, but theirs was...',
  'On a rainy afternoon, they found...',
];
`;
  } else if (game.gameType === 'poetry') {
    return `const POETRY_STARTERS = [
  'Roses are red',
  'Under the moon so bright',
  'My love for you',
  'When I look at you',
  'In the garden of love',
  'Our hearts beat',
  'Like stars above',
  'Forever and always',
];
`;
  } else if (game.gameType === 'journal') {
    return `const JOURNAL_PROMPTS = [
  'What made you smile today?',
  'What are you grateful for in your relationship?',
  'Describe your favorite memory together',
  'What do you love most about your partner today?',
  'What is a small moment that made you happy?',
  'Write a love letter to your partner',
  'What are you looking forward to?',
  'How did your partner make you feel special today?',
];
`;
  } else if (game.gameType === 'music') {
    return `const SONG_QUESTIONS = ${JSON.stringify(game.questions.map(q => ({...q, opts: q.opts})))};
`;
  } else if (game.gameType === 'playlist') {
    return `const SONG_SUGGESTIONS = [
  'At Last - Etta James',
  'Perfect - Ed Sheeran',
  'All of Me - John Legend',
  'Thinking Out Loud - Ed Sheeran',
  'Make You Feel My Love - Adele',
  'L-O-V-E - Nat King Cole',
  'Can not Help Falling in Love - Elvis',
  'Unchained Melody - The Righteous Brothers',
  'Kiss Me - Sixpence None the Richer',
  'I Wanna Dance with Somebody - Whitney Houston',
];
`;
  } else if (game.gameType === 'planner') {
    return `const PLANNER_ITEMS = {
  activities: ['Candlelit dinner', 'Movie night', 'Picnic in the park', 'Spa day', 'Dancing under stars', 'Cooking together', 'Beach day', 'Game night'],
  gifts: ['Personalized jewelry', 'Photo album', 'Handwritten letter', 'Custom artwork', 'Spa voucher', 'Concert tickets', 'Weekend getaway', 'Flower arrangement'],
  budget: ['Under 500', '500-1000', '1000-5000', '5000+'],
};
`;
  } else if (game.gameType === 'photostory') {
    return `const MILESTONES = [
  'The day you met 💫',
  'First date 🌹',
  'First I love you 💕',
  'First vacation together 🏖️',
  'Moving in together 🏠',
  'First anniversary 🎂',
  'Adopting a pet together 🐾',
  'The proposal 💍',
  'The wedding day 💒',
  'Happily ever after 👑',
];
`;
  } else if (game.gameType === 'wyr') {
    return `const WOULD_YOU_RATHER = ${JSON.stringify(game.questions)};
`;
  } else if (game.questions) {
    const qs = game.questions.map(q => `{ q: '${q.q.replace(/'/g, "\\'")}', opts: ${JSON.stringify(q.opts)}, ans: ${q.ans} }`).join(',\n      ');
    return `const GAME_QUESTIONS = [
      ${qs}
    ];
`;
  } else if (game.riddles) {
    const riddles = game.riddles.map(r => `{ r: '${r.r.replace(/'/g, "\\'")}', a: '${r.a.replace(/'/g, "\\'")}' }`).join(',\n      ');
    return `const GAME_RIDDLES = [
      ${riddles}
    ];
`;
  } else if (game.words) {
    const words = game.words.map(w => `{ word: '${w.word}', hint: '${w.hint.replace(/'/g, "\\'")}' }`).join(',\n      ');
    return `const GAME_WORDS = [
      ${words}
    ];
`;
  } else if (game.dareList) {
    return `const DARES_LIST = ${JSON.stringify(game.dareList)};
`;
  }

  return `const GAME_DATA = [];
`;
}

function generateLogicSection(game) {
  const gameType = game.gameType;

  if (gameType === 'memory') {
    return `
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ${capitalize(game.dir.replace(/-/g,'_'))}Game() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [cards, setCards] = useState<typeof CARDS_DATA>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (gameState === 'playing') {
      setCards(shuffleArray([...CARDS_DATA, ...CARDS_DATA]));
      setFlipped([]);
      setMatched([]);
      setMoves(0);
      setTimeLeft(60);
      setScore(0);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing' || timeLeft <= 0) return;
    if (matched.length === cards.length && cards.length > 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft, matched.length, cards.length]);

  useEffect(() => {
    if (matched.length === CARDS_DATA.length && CARDS_DATA.length > 0 && gameState === 'playing') {
      setScore(Math.max(0, 1000 - moves * 10 + timeLeft * 5));
      setTimeout(() => setGameState('finished'), 500);
    }
  }, [matched.length]);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first] && cards[second] && cards[first].emoji === cards[second].emoji && cards[first].id !== cards[second].id) {
        setMatched(m => [...m, first, second]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
      setMoves(m => m + 1);
    }
  }, [flipped, cards]);

  const startGame = () => setGameState('playing');
  const resetGame = () => { setGameState('idle'); setScore(0); };

  const handleCardClick = (idx: number) => {
    if (flipped.length >= 2 || flipped.includes(idx) || matched.includes(idx)) return;
    setFlipped(f => [...f, idx]);
  };

  return (`;
  }

  if (gameType === 'compatibility') {
    return `
export default function ${capitalize(game.dir.replace(/-/g,'_'))}Game() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [compatibility, setCompatibility] = useState(0);
  const [reasons, setReasons] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const calculateCompatibility = () => {
    if (!name1.trim() || !name2.trim()) {
      toast.error('Please enter both names!');
      return;
    }
    const n1 = name1.toLowerCase().replace(/\\s/g, '');
    const n2 = name2.toLowerCase().replace(/\\s/g, '');
    let hash = 0;
    const combined = n1 + n2;
    for (let i = 0; i < combined.length; i++) {
      hash = ((hash << 5) - hash) + combined.charCodeAt(i);
      hash |= 0;
    }
    const pct = Math.abs(hash % 91) + 9;
    setCompatibility(pct);
    const reasonBank = [
      'Your energies align like twin flames!',
      'The stars say you are cosmically matched!',
      'Your names create perfect harmony!',
      'Opposites attract - you complement each other!',
      'You share the same wavelength!',
      'Your connection is written in the stars!',
      'Together you are unstoppable!',
      'Love has brought you together for a reason!',
    ];
    const shuffled = reasonBank.sort(() => Math.random() - 0.5);
    setReasons(shuffled.slice(0, 3));
    setScore(pct);
    setGameState('finished');
  };

  const resetGame = () => {
    setGameState('idle');
    setName1('');
    setName2('');
    setCompatibility(0);
    setReasons([]);
    setScore(0);
  };

  const startGame = () => setGameState('playing');

  return (`;
  }

  if (gameType === 'typing') {
    return `
const shuffleArray = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

export default function ${capitalize(game.dir.replace(/-/g,'_'))}Game() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [quotes, setQuotes] = useState<typeof ROMANTIC_QUOTES>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setQuotes(shuffleArray(ROMANTIC_QUOTES));
  }, []);

  useEffect(() => {
    if (gameState !== 'playing' || timeLeft <= 0 || !started) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft, started]);

  const startGame = () => {
    setGameState('playing');
    setQuotes(shuffleArray(ROMANTIC_QUOTES));
    setCurrentIndex(0);
    setInputValue('');
    setScore(0);
    setTimeLeft(60);
    setStarted(false);
  };

  const handleStartTyping = () => {
    setStarted(true);
    setStartTime(Date.now());
  };

  const handleSubmit = () => {
    const currentQuote = quotes[currentIndex] || '';
    const words = inputValue.trim().split(/\\s+/);
    const targetWords = currentQuote.split(/\\s+/);
    let correct = 0;
    for (let i = 0; i < Math.min(words.length, targetWords.length); i++) {
      if (words[i] === targetWords[i]) correct++;
    }
    const pct = targetWords.length > 0 ? Math.round((correct / targetWords.length) * 100) : 0;
    if (pct >= 70) {
      setScore(s => s + pct);
      toast.success('Great typing! +' + pct + ' points!');
    } else {
      toast.error('Try again! Accuracy: ' + pct + '%');
    }
    if (currentIndex < quotes.length - 1) {
      setCurrentIndex(c => c + 1);
      setInputValue('');
    } else {
      setGameState('finished');
    }
  };

  const resetGame = () => {
    setGameState('idle');
    setScore(0);
    setCurrentIndex(0);
    setInputValue('');
    setTimeLeft(60);
    setStarted(false);
  };

  return (`;
  }

  if (gameType === 'emoji') {
    return `
const shuffleArray = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

export default function ${capitalize(game.dir.replace(/-/g,'_'))}Game() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [questions, setQuestions] = useState<typeof EMOJI_QUESTIONS>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    setQuestions(shuffleArray(EMOJI_QUESTIONS));
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setCurrentIndex(0);
    setQuestions(shuffleArray(EMOJI_QUESTIONS));
    setSelected(null);
    setShowResult(false);
  };

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (questions[currentIndex].opts[idx] === questions[currentIndex].answer) {
      setScore(s => s + 10);
      toast.success('Correct! +10 points');
    } else {
      toast.error('Not quite! It was: ' + questions[currentIndex].answer);
    }
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(c => c + 1);
        setSelected(null);
        setShowResult(false);
      } else {
        setGameState('finished');
      }
    }, 1500);
  };

  const resetGame = () => {
    setGameState('idle');
    setScore(0);
    setCurrentIndex(0);
    setSelected(null);
    setShowResult(false);
  };

  return (`;
  }

  if (gameType === 'pictionary') {
    return `
const shuffleArray = (arr: string[]) => [...arr].sort(() => Math.random() - 0.5);

export default function ${capitalize(game.dir.replace(/-/g,'_'))}Game() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [words, setWords] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [guessed, setGuessed] = useState(false);

  useEffect(() => {
    setWords(shuffleArray(DRAW_WORDS));
  }, []);

  useEffect(() => {
    if (gameState !== 'playing' || timeLeft <= 0 || guessed) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft, guessed]);

  const startGame = () => {
    setGameState('playing');
    setWords(shuffleArray(DRAW_WORDS));
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(30);
    setGuessed(false);
  };

  const handleGuess = (correct: boolean) => {
    if (correct) {
      setScore(s => s + timeLeft);
      toast.success('Correct! +' + timeLeft + ' points');
      setGuessed(true);
      setTimeout(() => {
        if (currentIndex < words.length - 1) {
          setCurrentIndex(c => c + 1);
          setTimeLeft(30);
          setGuessed(false);
        } else {
          setGameState('finished');
        }
      }, 1500);
    } else {
      toast.error('Not quite!');
    }
  };

  const resetGame = () => {
    setGameState('idle');
    setScore(0);
    setCurrentIndex(0);
    setTimeLeft(30);
    setGuessed(false);
  };

  return (`;
  }

  if (gameType === 'story') {
    return `
const shuffleArray = (arr: string[]) => [...arr].sort(() => Math.random() - 0.5);

export default function ${capitalize(game.dir.replace(/-/g,'_'))}Game() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [story, setStory] = useState<string[]>([]);
  const [starter, setStarter] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [playerTurn, setPlayerTurn] = useState<1 | 2>(1);
  const maxRounds = 8;

  const startGame = () => {
    const starters = shuffleArray(STORY_STARTERS);
    setStarter(starters[0]);
    setStory([starters[0]]);
    setGameState('playing');
    setScore(0);
    setRound(0);
    setPlayerTurn(1);
    setInputValue('');
  };

  const handleAddSentence = () => {
    if (!inputValue.trim()) return;
    const newStory = [...story, inputValue.trim()];
    setStory(newStory);
    setScore(s => s + 10);
    setRound(r => r + 1);
    setInputValue('');
    if (round >= maxRounds - 1) {
      setGameState('finished');
      return;
    }
    setPlayerTurn(p => p === 1 ? 2 : 1);
    toast.success(playerTurn === 1 ? 'Partner\'s turn!' : 'Your turn!');
  };

  const resetGame = () => {
    setGameState('idle');
    setStory([]);
    setStarter('');
    setInputValue('');
    setScore(0);
    setRound(0);
    setPlayerTurn(1);
  };

  return (`;
  }

  if (gameType === 'reflex') {
    return `
const REFLEX_STATES = { waiting: 'Wait for green...', ready: 'Get Ready!', go: 'TAP NOW!', result: 'Result' };

export default function ${capitalize(game.dir.replace(/-/g,'_'))}Game() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [reflexState, setReflexState] = useState<'waiting' | 'ready' | 'go' | 'result'>('waiting');
  const [score, setScore] = useState(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startReflexRound = useCallback(() => {
    setReflexState('waiting');
    setReactionTime(null);
    const delay = 1500 + Math.random() * 4000;
    timeoutRef.current = setTimeout(() => {
      setReflexState('go');
    }, delay);
  }, []);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setBestTime(null);
    setAttempts(0);
    startReflexRound();
  };

  const handleTap = () => {
    if (reflexState === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      toast.error('Too early! Wait for green.');
      setReflexState('result');
      setTimeout(() => startReflexRound(), 1500);
      return;
    }
    if (reflexState === 'go') {
      const rt = Date.now() - (timeoutRef.current?.startTime || Date.now() - 300);
      setReactionTime(rt);
      setAttempts(a => a + 1);
      setReflexState('result');
      setScore(s => s + Math.max(0, 1000 - Math.floor(rt / 10)));
      if (!bestTime || rt < bestTime) setBestTime(rt);
      setTimeout(() => startReflexRound(), 2000);
      return;
    }
  };

  const resetGame = () => {
    setGameState('idle');
    setScore(0);
    setReflexState('waiting');
    setReactionTime(null);
    setBestTime(null);
    setAttempts(0);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  return (`;
  }

  if (gameType === 'horoscope') {
    return `
const LOVE_PREDICTIONS_DATA = ${JSON.stringify(LOVE_PREDICTIONS)};
const HOROSCOPE_TEXTS: Record<string, string[]> = {
  'Aries': ['Passionate encounters ahead!', 'Your boldness wins hearts!'],
  'Taurus': ['Luxury and comfort strengthen love!', 'A steady romance blooms!'],
  'Gemini': ['Fun conversations deepen bonds!', 'Your wit charms your partner!'],
  'Cancer': ['Emotional connection grows!', 'Nurturing love brings peace!'],
  'Leo': ['Grand romantic gestures shine!', 'Your warmth lights up love!'],
  'Virgo': ['Thoughtful acts speak louder!', 'Details make the difference!'],
  'Libra': ['Harmony and balance in love!', 'Aesthetic moments to cherish!'],
  'Scorpio': ['Deep intimacy unfolds!', 'Passion reaches new heights!'],
  'Sagittarius': ['Adventure brings you closer!', 'Travel sparks romance!'],
  'Capricorn': ['Commitment pays off!', 'Building a future together!'],
  'Aquarius': ['Unique love expressions!', 'Innovation in romance!'],
  'Pisces': ['Dreamy romantic moments!', 'Your intuition guides love!'],
};

export default function ${capitalize(game.dir.replace(/-/g,'_'))}Game() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [name, setName] = useState('');
  const [month, setMonth] = useState('');
  const [horoscope, setHoroscope] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const generateHoroscope = () => {
    if (!name.trim()) { toast.error('Enter your name!'); return; }
    setGameState('playing');
    const signIndex = parseInt(month) % 12;
    const signNames = Object.keys(HOROSCOPE_TEXTS);
    const sign = signNames[signIndex];
    const texts = HOROSCOPE_TEXTS[sign];
    setHoroscope([sign, ...texts]);
    setScore(Math.floor(Math.random() * 30) + 70);
    setTimeout(() => setGameState('finished'), 1500);
  };

  const resetGame = () => {
    setGameState('idle');
    setName('');
    setMonth('');
    setHoroscope([]);
    setScore(0);
  };

  return (`;
  }

  if (gameType === 'future') {
    return `
const FUTURE_DATA = ${JSON.stringify(FUTURE_PREDICTIONS)};

export default function ${capitalize(game.dir.replace(/-/g,'_'))}Game() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [predictions, setPredictions] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const generatePredictions = () => {
    if (!name1.trim() || !name2.trim()) { toast.error('Enter both names!'); return; }
    setGameState('playing');
    const shuffled = [...FUTURE_DATA].sort(() => Math.random() - 0.5);
    setPredictions(shuffled.slice(0, 4));
    setScore(Math.floor(Math.random() * 30) + 70);
    setTimeout(() => setGameState('finished'), 2000);
  };

  const resetGame = () => {
    setGameState('idle');
    setName1('');
    setName2('');
    setPredictions([]);
    setScore(0);
  };

  return (`;
  }

  if (gameType === 'dares') {
    return `
const shuffleArray = (arr: string[]) => [...arr].sort(() => Math.random() - 0.5);

export default function ${capitalize(game.dir.replace(/-/g,'_'))}Game() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [dares, setDares] = useState<string[]>([]);
  const [currentDare, setCurrentDare] = useState('');
  const [score, setScore] = useState(0);
  const [daresCompleted, setDaresCompleted] = useState(0);

  const drawDare = () => {
    const remaining = dares.filter(d => d !== currentDare);
    if (remaining.length === 0) {
      setGameState('finished');
      return;
    }
    const newDare = remaining[Math.floor(Math.random() * remaining.length)];
    setCurrentDare(newDare);
    setDaresCompleted(c => c + 1);
    setScore(s => s + 15);
  };

  const startGame = () => {
    setGameState('playing');
    setDares(shuffleArray(DARES_LIST));
    setCurrentDare(DARES_LIST[Math.floor(Math.random() * DARES_LIST.length)]);
    setScore(15);
    setDaresCompleted(1);
  };

  const resetGame = () => {
    setGameState('idle');
    setCurrentDare('');
    setScore(0);
    setDaresCompleted(0);
  };

  return (`;
  }

  if (gameType === 'checklist') {
    const goals = game.goals.map(g => `'${g.replace(/'/g, "\\'")}'`).join(',\n    ');
    return `
const GOALS = [
    ${goals}
  ];

export default function ${capitalize(game.dir.replace(/-/g,'_'))}Game() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [checked, setChecked] = useState<boolean[]>(new Array(GOALS.length).fill(false));
  const [score, setScore] = useState(0);

  const toggleGoal = (idx: number) => {
    setChecked(c => { const n = [...c]; n[idx] = !n[idx]; return n; });
    setScore(s => s + (checked[idx] ? -5 : 5));
  };

  const startGame = () => {
    setGameState('playing');
    setChecked(new Array(GOALS.length).fill(false));
    setScore(0);
  };

  const resetGame = () => {
    setGameState('idle');
    setChecked(new Array(GOALS.length).fill(false));
    setScore(0);
  };

  const progress = checked.filter(c => c).length;
  const total = GOALS.length;

  return (`;
  }

  if (gameType === 'wyr') {
    return `
const shuffleArray = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

export default function ${capitalize(game.dir.replace(/-/g,'_'))}Game() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [questions, setQuestions] = useState<typeof WOULD_YOU_RATHER>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    setQuestions(shuffleArray(WOULD_YOU_RATHER));
  }, []);

  const startGame = () => {
    setGameState('playing');
    setQuestions(shuffleArray(WOULD_YOU_RATHER));
    setCurrentIndex(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
  };

  const handleChoice = (choice: 'a' | 'b') => {
    if (showResult) return;
    setSelected(choice === 'a' ? 0 : 1);
    setShowResult(true);
    setScore(s => s + 10);
    toast.success('Interesting choice!');
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(c => c + 1);
        setSelected(null);
        setShowResult(false);
      } else {
        setGameState('finished');
      }
    }, 1500);
  };

  const resetGame = () => {
    setGameState('idle');
    setScore(0);
    setCurrentIndex(0);
    setSelected(null);
    setShowResult(false);
  };

  return (`;
  }

  if (gameType === 'poetry') {
    return `
const shuffleArray = (arr: string[]) => [...arr].sort(() => Math.random() - 0.5);

export default function ${capitalize(game.dir.replace(/-/g,'_'))}Game() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [lines, setLines] = useState<string[]>([]);
  const [starter, setStarter] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [playerTurn, setPlayerTurn] = useState<1 | 2>(1);
  const maxRounds = 8;

  const startGame = () => {
    const starters = shuffleArray(POETRY_STARTERS);
    setStarter(starters[0]);
    setLines([starters[0]]);
    setGameState('playing');
    setScore(0);
    setRound(0);
    setPlayerTurn(1);
    setInputValue('');
  };

  const handleAddLine = () => {
    if (!inputValue.trim()) return;
    setLines(l => [...l, inputValue.trim()]);
    setScore(s => s + 15);
    setRound(r => r + 1);
    setInputValue('');
    if (round >= maxRounds - 1) {
      setGameState('finished');
      return;
    }
    setPlayerTurn(p => p === 1 ? 2 : 1);
  };

  const resetGame = () => {
    setGameState('idle');
    setLines([]);
    setStarter('');
    setInputValue('');
    setScore(0);
    setRound(0);
    setPlayerTurn(1);
  };

  return (`;
  }

  if (gameType === 'music') {
    return `
const shuffleArray = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

export default function ${capitalize(game.dir.replace(/-/g,'_'))}Game() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [questions, setQuestions] = useState<typeof SONG_QUESTIONS>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    setQuestions(shuffleArray(SONG_QUESTIONS));
  }, []);

  const startGame = () => {
    setGameState('playing');
    setQuestions(shuffleArray(SONG_QUESTIONS));
    setCurrentIndex(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
  };

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === questions[currentIndex].ans) {
      setScore(s => s + 10);
      toast.success('Correct! +10 points');
    } else {
      toast.error('Wrong! It was: ' + questions[currentIndex].opts[questions[currentIndex].ans]);
    }
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(c => c + 1);
        setSelected(null);
        setShowResult(false);
      } else {
        setGameState('finished');
      }
    }, 1500);
  };

  const resetGame = () => {
    setGameState('idle');
    setScore(0);
    setCurrentIndex(0);
    setSelected(null);
    setShowResult(false);
  };

  return (`;
  }

  if (gameType === 'journal') {
    return `
export default function ${capitalize(game.dir.replace(/-/g,'_'))}Game() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [entries, setEntries] = useState<{date: string, text: string}[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [score, setScore] = useState(0);

  const getRandomPrompt = () => {
    const prompts = ${JSON.stringify(game.journalPrompts || game.goals || ['What made you smile today?', 'What are you grateful for?'])};
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  const startGame = () => {
    setGameState('playing');
    setEntries([]);
    setCurrentEntry('');
    setCurrentPrompt(getRandomPrompt());
    setScore(0);
  };

  const saveEntry = () => {
    if (!currentEntry.trim()) { toast.error('Write something first!'); return; }
    const entry = { date: new Date().toLocaleDateString(), text: currentEntry };
    setEntries(e => [...e, entry]);
    setScore(s => s + 20);
    setCurrentEntry('');
    setCurrentPrompt(getRandomPrompt());
    toast.success('Love note saved! +20 points');
    if (entries.length >= 4) {
      setGameState('finished');
    }
  };

  const resetGame = () => {
    setGameState('idle');
    setEntries([]);
    setCurrentEntry('');
    setCurrentPrompt('');
    setScore(0);
  };

  return (`;
  }

  if (gameType === 'playlist') {
    return `
const shuffleArray = (arr: string[]) => [...arr].sort(() => Math.random() - 0.5);

export default function ${capitalize(game.dir.replace(/-/g,'_'))}Game() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [playlist, setPlaylist] = useState<string[]>([]);
  const [newSong, setNewSong] = useState('');
  const [score, setScore] = useState(0);

  const startGame = () => {
    setGameState('playing');
    setSuggestions(shuffleArray(SONG_SUGGESTIONS));
    setPlaylist([]);
    setScore(0);
    setNewSong('');
  };

  const addToPlaylist = (song: string) => {
    if (playlist.includes(song)) { toast.error('Already in playlist!'); return; }
    setPlaylist(p => [...p, song]);
    setScore(s => s + 10);
    toast.success('Added ' + song + '!');
    if (playlist.length >= 9) {
      setGameState('finished');
    }
  };

  const addCustomSong = () => {
    if (!newSong.trim()) return;
    addToPlaylist(newSong.trim());
    setNewSong('');
  };

  const resetGame = () => {
    setGameState('idle');
    setPlaylist([]);
    setScore(0);
    setNewSong('');
  };

  return (`;
  }

  if (gameType === 'planner') {
    return `
export default function ${capitalize(game.dir.replace(/-/g,'_'))}Game() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [plan, setPlan] = useState({ activity: '', gift: '', budget: '', date: '' });
  const [score, setScore] = useState(0);

  const updatePlan = (field: string, value: string) => {
    setPlan(p => ({ ...p, [field]: value }));
  };

  const finishPlanning = () => {
    if (!plan.activity) { toast.error('Pick an activity!'); return; }
    setScore(100);
    setGameState('finished');
    toast.success('Anniversary plan saved!');
  };

  const startGame = () => {
    setGameState('playing');
    setPlan({ activity: '', gift: '', budget: '', date: '' });
    setScore(0);
  };

  const resetGame = () => {
    setGameState('idle');
    setPlan({ activity: '', gift: '', budget: '', date: '' });
    setScore(0);
  };

  return (`;
  }

  if (gameType === 'photostory') {
    return `
const shuffleArray = (arr: string[]) => [...arr].sort(() => Math.random() - 0.5);

export default function ${capitalize(game.dir.replace(/-/g,'_'))}Game() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [milestones, setMilestones] = useState<typeof MILESTONES>([]);
  const [timeline, setTimeline] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const startGame = () => {
    setGameState('playing');
    setMilestones(shuffleArray(MILESTONES));
    setTimeline([]);
    setScore(0);
  };

  const addToTimeline = (milestone: string) => {
    if (timeline.includes(milestone)) { toast.error('Already added!'); return; }
    setTimeline(t => [...t, milestone]);
    setScore(s => s + 20);
    toast.success('Added to timeline!');
    if (timeline.length >= 5) {
      setGameState('finished');
    }
  };

  const resetGame = () => {
    setGameState('idle');
    setMilestones(shuffleArray(MILESTONES));
    setTimeline([]);
    setScore(0);
  };

  return (`;
  }

  // Default quiz type for remaining games
  const qField = game.questions ? 'GAME_QUESTIONS' : (game.riddles ? 'GAME_RIDDLES' : 'GAME_WORDS');

  return `
const shuffleArray = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

export default function ${capitalize(game.dir.replace(/-/g,'_'))}Game() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'finished'>('idle');
  const [questions, setQuestions] = useState<typeof ${qField}>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    setQuestions(shuffleArray(${qField}));
  }, []);

  useEffect(() => {
    if (gameState !== 'playing' || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  useEffect(() => {
    if (timeLeft <= 0 && gameState === 'playing') {
      setGameState('finished');
    }
  }, [timeLeft, gameState]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setCurrentIndex(0);
    setTimeLeft(30);
    setShowResult(false);
    setSelectedAnswer(null);
    setQuestions(shuffleArray(${qField}));
  };

  const handleAnswer = (idx: number) => {
    if (showResult) return;
    setSelectedAnswer(idx);
    setShowResult(true);
    const q = questions[currentIndex];
    const correct = q.opts ? idx === q.ans : (idx === 0 && game.riddles ? true : false);
    if (correct) {
      setScore(s => s + 10);
      toast.success('Correct! +10 points');
    } else {
      toast.error(q.opts ? 'Answer: ' + q.opts[q.ans] : 'Answer: ' + (game.riddles ? q.a : q.word));
    }
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(c => c + 1);
        setShowResult(false);
        setSelectedAnswer(null);
      } else {
        setGameState('finished');
      }
    }, 1500);
  };

  const resetGame = () => {
    setGameState('idle');
    setScore(0);
    setCurrentIndex(0);
    setTimeLeft(30);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  return (`;
}

function generateRenderSection(game) {
  const color = game.color;
  const title = game.title;
  const emoji = game.emoji;
  const desc = game.desc;
  const gameType = game.gameType;

  if (gameType === 'memory') {
    return `
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-6">${emoji}</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">${title}</h1>
              <p className="text-gray-600 mb-8 text-lg">${desc}</p>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r ${color} rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all">
                <Play className="w-5 h-5 inline mr-2" /> Start Game
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600">Moves: {moves}</span>
                  <span className="text-sm font-medium text-primary-600">Score: {score}</span>
                </div>
                <div className={\`flex items-center gap-2 px-4 py-2 rounded-xl \${timeLeft <= 15 ? 'bg-red-100 text-red-600' : 'bg-white/70 text-gray-700'}\`}>
                  <Timer className="w-4 h-4" />
                  <span className="font-bold">{timeLeft}s</span>
                </div>
              </div>
              <div className="w-full h-2 bg-white/50 rounded-full mb-8 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r ${color} rounded-full" style={{ width: \`\${(matched.length / CARDS_DATA.length) * 100}%\` }} />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {cards.map((card, idx) => {
                  const isFlipped = flipped.includes(idx) || matched.includes(idx);
                  return (
                    <motion.button
                      key={card.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCardClick(idx)}
                      className={\`aspect-square rounded-2xl flex items-center justify-center text-4xl shadow-lg transition-all duration-300 \${
                        isFlipped ? 'bg-white rotate-0' : 'bg-gradient-to-br ${color} rotate-y-180'
                      }\`}
                    >
                      {isFlipped ? card.emoji : '💕'}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-4">Memory Master!</h2>
              <p className="text-6xl font-black gradient-text mb-4">{score}</p>
              <p className="text-gray-600 mb-8">points in {moves} moves</p>
              <div className="flex gap-4 justify-center">
                <button onClick={resetGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold text-gray-700 hover:bg-white transition-colors">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Play Again
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r ${color} rounded-2xl text-white font-bold shadow-lg">
                  More Games
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
`;
  }

  if (gameType === 'compatibility') {
    return `
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-6">${emoji}</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">${title}</h1>
              <p className="text-gray-600 mb-8 text-lg">${desc}</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-6">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name1}
                  onChange={(e) => setName1(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-pink-200 focus:border-pink-400 outline-none mb-4 text-lg"
                />
                <input
                  type="text"
                  placeholder="Partner's name"
                  value={name2}
                  onChange={(e) => setName2(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-pink-200 focus:border-pink-400 outline-none text-lg"
                />
                <button onClick={startGame} className="mt-4 w-full px-10 py-4 bg-gradient-to-r ${color} rounded-2xl text-white font-bold text-lg shadow-xl">
                  <Heart className="w-5 h-5 inline mr-2" /> Check Compatibility
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">💕</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">${name1} & ${name2}</h2>
              <p className="text-7xl font-black gradient-text mb-4">{compatibility}%</p>
              <p className="text-xl font-bold text-gray-700 mb-4">Compatible!</p>
              {reasons.map((r, i) => (
                <p key={i} className="text-gray-600 mb-2">✨ {r}</p>
              ))}
              <div className="flex gap-4 justify-center mt-8">
                <button onClick={resetGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold text-gray-700">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Try Again
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r ${color} rounded-2xl text-white font-bold shadow-lg">
                  More Games
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
`;
  }

  if (gameType === 'typing') {
    return `
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-6">${emoji}</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">${title}</h1>
              <p className="text-gray-600 mb-8 text-lg">${desc}</p>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r ${color} rounded-2xl text-white font-bold text-lg shadow-xl">
                <Play className="w-5 h-5 inline mr-2" /> Start Game
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-medium text-gray-600">Quote {currentIndex + 1}/{quotes.length}</span>
                <span className="text-sm font-medium text-primary-600">Score: {score}</span>
                <span className={\`px-3 py-1 rounded-lg font-bold \${timeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-white/70 text-gray-700'}\`}>{timeLeft}s</span>
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-6">
                <p className="text-xl font-medium text-gray-800 text-center leading-relaxed">" {quotes[currentIndex] || ''} "</p>
              </div>
              {!started && (
                <button onClick={handleStartTyping} className="w-full py-3 bg-gradient-to-r ${color} rounded-2xl text-white font-bold">
                  Start Typing
                </button>
              )}
              {started && (
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Type the quote..."
                    className="flex-1 px-6 py-4 rounded-2xl border-2 border-pink-200 focus:border-pink-400 outline-none text-lg"
                    autoFocus
                  />
                  <button onClick={handleSubmit} className="px-6 py-4 bg-gradient-to-r ${color} rounded-2xl text-white font-bold">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-4">Typing Complete!</h2>
              <p className="text-6xl font-black gradient-text mb-4">{score}</p>
              <p className="text-gray-600 mb-8">points</p>
              <div className="flex gap-4 justify-center">
                <button onClick={resetGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold text-gray-700">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Play Again
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r ${color} rounded-2xl text-white font-bold shadow-lg">
                  More Games
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
`;
  }

  if (gameType === 'emoji') {
    return `
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-6">${emoji}</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">${title}</h1>
              <p className="text-gray-600 mb-8 text-lg">${desc}</p>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r ${color} rounded-2xl text-white font-bold text-lg shadow-xl">
                <Play className="w-5 h-5 inline mr-2" /> Start Game
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-medium text-gray-600">Question {currentIndex + 1}/{questions.length}</span>
                <span className="text-sm font-medium text-primary-600">Score: {score}</span>
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-6">
                <div className="text-center mb-8">
                  <span className="text-8xl">{questions[currentIndex]?.emoji || ''}</span>
                </div>
                <p className="text-gray-600 text-center mb-6">What does this mean?</p>
                <div className="grid grid-cols-1 gap-3">
                  {questions[currentIndex]?.opts.map((opt, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleAnswer(i)}
                      disabled={showResult}
                      className={\`p-4 rounded-2xl font-bold text-lg transition-all \${
                        showResult && questions[currentIndex].opts[i] === questions[currentIndex].answer
                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                          : selected === i
                          ? 'bg-red-100 text-red-700 border-2 border-red-300'
                          : 'bg-white/70 border-2 border-pink-100 hover:border-pink-300'
                      }\`}
                    >
                      {opt}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-4">Emoji Expert!</h2>
              <p className="text-6xl font-black gradient-text mb-4">{score}</p>
              <p className="text-gray-600 mb-8">points</p>
              <div className="flex gap-4 justify-center">
                <button onClick={resetGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold text-gray-700">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Play Again
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r ${color} rounded-2xl text-white font-bold shadow-lg">
                  More Games
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
`;
  }

  if (gameType === 'pictionary') {
    return `
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-6">${emoji}</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">${title}</h1>
              <p className="text-gray-600 mb-8 text-lg">${desc}</p>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r ${color} rounded-2xl text-white font-bold text-lg shadow-xl">
                <Play className="w-5 h-5 inline mr-2" /> Start Game
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-medium text-gray-600">Word {currentIndex + 1}/{words.length}</span>
                <span className="text-sm font-medium text-primary-600">Score: {score}</span>
                <span className={\`flex items-center gap-2 px-4 py-2 rounded-xl \${timeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-white/70 text-gray-700'}\`}>
                  <Timer className="w-4 h-4" />
                  <span className="font-bold">{timeLeft}s</span>
                </span>
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-6">
                <p className="text-gray-600 text-center mb-4">Draw this word:</p>
                <p className="text-5xl font-black text-center gradient-text mb-8">${words[currentIndex] || ''}</p>
                <div className="border-2 border-dashed border-pink-200 rounded-2xl p-8 mb-6 text-center">
                  <p className="text-gray-400">Your partner draws here!</p>
                </div>
                <p className="text-gray-600 text-center mb-4">Did your partner guess it correctly?</p>
                <div className="flex gap-4">
                  <button onClick={() => handleGuess(true)} className="flex-1 py-3 bg-green-100 text-green-700 rounded-2xl font-bold hover:bg-green-200">
                    Yes! Correct!
                  </button>
                  <button onClick={() => handleGuess(false)} className="flex-1 py-3 bg-red-100 text-red-700 rounded-2xl font-bold hover:bg-red-200">
                    Not yet
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">🎨</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-4">Great Drawing Session!</h2>
              <p className="text-6xl font-black gradient-text mb-4">{score}</p>
              <p className="text-gray-600 mb-8">points</p>
              <div className="flex gap-4 justify-center">
                <button onClick={resetGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold text-gray-700">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Play Again
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r ${color} rounded-2xl text-white font-bold shadow-lg">
                  More Games
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
`;
  }

  // Generic render for remaining game types
  if (gameType === 'reflex') {
    return `
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-6">${emoji}</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">${title}</h1>
              <p className="text-gray-600 mb-8 text-lg">${desc}</p>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r ${color} rounded-2xl text-white font-bold text-lg shadow-xl">
                <Zap className="w-5 h-5 inline mr-2" /> Start Test
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div className="text-center">
              <div
                onClick={handleTap}
                className={\`w-full min-h-[400px] rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all \${
                  reflexState === 'waiting' ? 'bg-red-500' :
                  reflexState === 'go' ? 'bg-green-500' :
                  reflexState === 'result' ? 'bg-blue-500' : 'bg-yellow-500'
                }\`}
              >
                <p className="text-white text-4xl font-black mb-4">{REFLEX_STATES[reflexState]}</p>
                {reflexState === 'result' && reactionTime && (
                  <p className="text-white text-6xl font-black">{reactionTime}ms</p>
                )}
                {reflexState === 'result' && bestTime && (
                  <p className="text-white/80 text-xl mt-2">Best: {bestTime}ms</p>
                )}
              </div>
              <p className="text-gray-600 mt-4">Attempts: {attempts}</p>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">⚡</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-4">Reflex Test Done!</h2>
              <p className="text-6xl font-black gradient-text mb-4">{score}</p>
              <p className="text-gray-600 mb-8">points</p>
              <div className="flex gap-4 justify-center">
                <button onClick={resetGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold text-gray-700">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Try Again
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r ${color} rounded-2xl text-white font-bold shadow-lg">
                  More Games
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
`;
  }

  if (gameType === 'horoscope') {
    return `
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-6">${emoji}</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">${title}</h1>
              <p className="text-gray-600 mb-8 text-lg">${desc}</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-pink-200 focus:border-pink-400 outline-none mb-4 text-lg"
                />
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-pink-200 focus:border-pink-400 outline-none text-lg"
                >
                  <option value="">Select your birth month</option>
                  <option value="0">January</option>
                  <option value="1">February</option>
                  <option value="2">March</option>
                  <option value="3">April</option>
                  <option value="4">May</option>
                  <option value="5">June</option>
                  <option value="6">July</option>
                  <option value="7">August</option>
                  <option value="8">September</option>
                  <option value="9">October</option>
                  <option value="10">November</option>
                  <option value="11">December</option>
                </select>
                <button onClick={generateHoroscope} className="mt-4 w-full px-10 py-4 bg-gradient-to-r ${color} rounded-2xl text-white font-bold text-lg shadow-xl">
                  Get My Love Horoscope
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">🔮</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">${name}'s Love Horoscope</h2>
              <p className="text-2xl font-bold text-purple-600 mb-6">{horoscope[0] || ''}</p>
              {horoscope.slice(1).map((h, i) => (
                <p key={i} className="text-gray-600 text-lg mb-2">✨ {h}</p>
              ))}
              <p className="text-6xl font-black gradient-text my-6">{score}%</p>
              <p className="text-gray-600 mb-8">Love Score</p>
              <div className="flex gap-4 justify-center">
                <button onClick={resetGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold text-gray-700">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Try Again
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r ${color} rounded-2xl text-white font-bold shadow-lg">
                  More Games
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
`;
  }

  if (gameType === 'future') {
    return `
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-6">${emoji}</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">${title}</h1>
              <p className="text-gray-600 mb-8 text-lg">${desc}</p>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8">
                <input
                  type="text"
                  placeholder="Your name"
                  value={name1}
                  onChange={(e) => setName1(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-pink-200 focus:border-pink-400 outline-none mb-4 text-lg"
                />
                <input
                  type="text"
                  placeholder="Partner's name"
                  value={name2}
                  onChange={(e) => setName2(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-pink-200 focus:border-pink-400 outline-none text-lg"
                />
                <button onClick={generatePredictions} className="mt-4 w-full px-10 py-4 bg-gradient-to-r ${color} rounded-2xl text-white font-bold text-lg shadow-xl">
                  <Zap className="w-5 h-5 inline mr-2" /> See Your Future
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">🔮</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-2">${name1} & ${name2}'s Future</h2>
              {predictions.map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.3 }}
                  className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-pink-100/60 p-4 mb-3 text-left">
                  <p className="text-gray-800 font-medium">✨ {p}</p>
                </motion.div>
              ))}
              <p className="text-6xl font-black gradient-text my-6">{score}%</p>
              <p className="text-gray-600 mb-8">Future Happiness</p>
              <div className="flex gap-4 justify-center">
                <button onClick={resetGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold text-gray-700">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Try Again
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r ${color} rounded-2xl text-white font-bold shadow-lg">
                  More Games
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
`;
  }

  if (gameType === 'dares') {
    return `
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-6">${emoji}</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">${title}</h1>
              <p className="text-gray-600 mb-8 text-lg">${desc}</p>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r ${color} rounded-2xl text-white font-bold text-lg shadow-xl">
                <Zap className="w-5 h-5 inline mr-2" /> Start Dares
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-medium text-gray-600">Dares completed: {daresCompleted}</span>
                <span className="text-sm font-medium text-primary-600">Score: {score}</span>
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-6">
                <p className="text-gray-600 mb-4">Your romantic dare:</p>
                <p className="text-3xl font-black text-gray-900 mb-8">"{currentDare}"</p>
                <button onClick={drawDare} className="px-10 py-4 bg-gradient-to-r ${color} rounded-2xl text-white font-bold text-lg shadow-xl">
                  <Shuffle className="w-5 h-5 inline mr-2" /> Next Dare
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">🔥</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-4">Dare Champion!</h2>
              <p className="text-6xl font-black gradient-text mb-4">{score}</p>
              <p className="text-gray-600 mb-8">points - {daresCompleted} dares completed</p>
              <div className="flex gap-4 justify-center">
                <button onClick={resetGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold text-gray-700">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Play Again
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r ${color} rounded-2xl text-white font-bold shadow-lg">
                  More Games
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
`;
  }

  if (gameType === 'story' || gameType === 'poetry') {
    const isPoetry = gameType === 'poetry';
    const label = isPoetry ? 'line' : 'sentence';
    const verb = isPoetry ? 'write' : 'add';
    const icon = isPoetry ? '✍️' : '📖';
    return `
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-6">${emoji}</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">${title}</h1>
              <p className="text-gray-600 mb-8 text-lg">${desc}</p>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r ${color} rounded-2xl text-white font-bold text-lg shadow-xl">
                <Play className="w-5 h-5 inline mr-2" /> Start Writing
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-medium text-gray-600">Round {round + 1}/${maxRounds}</span>
                <span className={\`px-3 py-1 rounded-lg font-bold \${playerTurn === 1 ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}\`}>
                  {playerTurn === 1 ? "Your turn" : "Partner's turn"}
                </span>
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-6">
                <p className="text-xl font-medium text-gray-800 mb-4 italic">"{starter}"</p>
                <div className="border-t border-pink-100 pt-4 mt-4">
                  {lines.slice(1).map((line, i) => (
                    <p key={i} className="text-gray-700 py-1">{line}</p>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd${capitalize(label)}()}
                  placeholder={\`${capitalize(verb)} the next ${label}...\`}
                  className="flex-1 px-6 py-4 rounded-2xl border-2 border-pink-200 focus:border-pink-400 outline-none text-lg"
                  autoFocus
                />
                <button onClick={handleAdd${capitalize(label)}} className="px-6 py-4 bg-gradient-to-r ${color} rounded-2xl text-white font-bold">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">${icon}</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-4">${isPoetry ? 'Poem Complete!' : 'Story Complete!'}</h2>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-8 text-left">
                <h3 className="text-xl font-bold gradient-text mb-4">Your ${isPoetry ? 'Poem' : 'Story'}:</h3>
                {lines.map((line, i) => (
                  <p key={i} className="text-gray-700 py-1 italic">"{line}"</p>
                ))}
              </div>
              <p className="text-6xl font-black gradient-text mb-4">{score}</p>
              <p className="text-gray-600 mb-8">points</p>
              <div className="flex gap-4 justify-center">
                <button onClick={resetGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold text-gray-700">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Try Again
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r ${color} rounded-2xl text-white font-bold shadow-lg">
                  More Games
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
`;
  }

  // Generic game render for quiz-style and others
  const isRiddle = gameType === undefined && game.riddles;
  const isWordScramble = gameType === undefined && game.words;

  if (isRiddle) {
    return `
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-6">${emoji}</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">${title}</h1>
              <p className="text-gray-600 mb-8 text-lg">${desc}</p>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r ${color} rounded-2xl text-white font-bold text-lg shadow-xl">
                <Play className="w-5 h-5 inline mr-2" /> Start Game
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-medium text-gray-600">Riddle {currentIndex + 1}/{questions.length}</span>
                <span className="text-sm font-medium text-primary-600">Score: {score}</span>
              </div>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-6">
                <p className="text-xl font-medium text-gray-800 leading-relaxed">"{questions[currentIndex]?.r || ''}"</p>
                <div className="mt-6">
                  <input
                    type="text"
                    placeholder="Type your answer..."
                    className="w-full px-6 py-4 rounded-2xl border-2 border-pink-200 focus:border-pink-400 outline-none text-lg mb-4"
                    autoFocus
                  />
                  <button onClick={() => handleAnswer(0)} className="w-full py-3 bg-gradient-to-r ${color} rounded-2xl text-white font-bold">
                    Submit Answer
                  </button>
                </div>
                {showResult && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-2xl">
                    <p className="text-blue-700 font-medium">Answer: {questions[currentIndex]?.a}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-4">Riddle Master!</h2>
              <p className="text-6xl font-black gradient-text mb-4">{score}</p>
              <p className="text-gray-600 mb-8">points</p>
              <div className="flex gap-4 justify-center">
                <button onClick={resetGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold text-gray-700">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Play Again
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r ${color} rounded-2xl text-white font-bold shadow-lg">
                  More Games
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
`;
  }

  // Generic render for remaining games
  return `
      <div className="min-h-screen pb-20">
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {gameState === 'idle' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-6xl mb-6">${emoji}</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">${title}</h1>
              <p className="text-gray-600 mb-8 text-lg">${desc}</p>
              <button onClick={startGame} className="px-10 py-4 bg-gradient-to-r ${color} rounded-2xl text-white font-bold text-lg shadow-xl">
                <Play className="w-5 h-5 inline mr-2" /> Start Game
              </button>
            </motion.div>
          )}

          {gameState === 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 mb-6">
                <p className="text-gray-600 text-center py-8">Enjoy playing ${title}!</p>
              </div>
            </motion.div>
          )}

          {gameState === 'finished' && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="text-6xl mb-6">🏆</div>
              <h2 className="text-3xl font-display font-black text-gray-900 mb-4">Game Complete!</h2>
              <p className="text-6xl font-black gradient-text mb-4">{score}</p>
              <p className="text-gray-600 mb-8">points</p>
              <div className="flex gap-4 justify-center">
                <button onClick={resetGame} className="px-8 py-3 bg-white/70 rounded-2xl font-bold text-gray-700">
                  <RotateCcw className="w-5 h-5 inline mr-2" /> Play Again
                </button>
                <Link href="/games" className="px-8 py-3 bg-gradient-to-r ${color} rounded-2xl text-white font-bold shadow-lg">
                  More Games
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
`;
}

function capitalize(s) {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}

// Create directories and files
const skipped = ['love_story_builder', 'couple_poetry', 'love_journal', 'couple_playlist', 'anniversary_planner', 'couple_photo_story', 'love_horoscope', 'future_together', 'couple_reflex', 'couple_typing_race', 'couple_memory_match', 'love_word_scramble', 'love_scramble2', 'couple_pictionary', 'couple_drawing', 'love_dares', 'couple_goals', 'couple_goals_2', 'love_challenges', 'relationship_goals', 'love_compatibility', 'couple_truths', 'couple_music_quiz', 'love_emoji_quiz', 'romantic_would_you_rather2', 'who_knows_who', 'howwell_met', 'love_language_test', 'relationship_quiz', 'love_quotes_quiz', 'love_riddles', 'romantic_riddles2'];

games.forEach(game => {
  const dir = path.join(baseDir, game.dir);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, 'page.tsx');
  const content = generateGameFile(game);
  fs.writeFileSync(filePath, content);
  console.log('Created: ' + filePath);
});

console.log('Done! Created ' + games.length + ' game files.');
