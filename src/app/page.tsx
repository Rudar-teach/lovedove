'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Heart, Gamepad2, Trophy, Users, Sparkles, ChevronRight, Gift,
  Camera, MessageCircle, Star, Filter, Search, Zap, HeartHandshake, ArrowRight,
  Play, ExternalLink, Award, Flame, Target, Crown, Rocket,
  PartyPopper, Music, Palette, Dumbbell, BookOpen, Coffee,
  Globe, Shield, Clock, Users2, HeartPulse, Smile
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ShinyText from '@/components/premium/ShinyText';
import ChatBot from '@/components/chat/ChatBot';

const games = [
  { name: 'Tic-Tac-Toe', slug: 'tictactoe', icon: '⭕❌', desc: 'Classic strategy', gradient: 'from-pink-400 to-rose-500', category: 'Classic', players: '2 Players' },
  { name: 'Memory Match', slug: 'memory', icon: '🎴', desc: 'Find the pairs', gradient: 'from-rose-400 to-pink-500', category: 'Classic', players: '2 Players' },
  { name: 'Memory Palace', slug: 'memorypalace', icon: '🏰', desc: 'Match love symbols', gradient: 'from-rose-400 to-rose-500', category: 'Classic', players: '2 Players' },
  { name: 'Rock Paper Scissors', slug: 'rockpaperscissors', icon: '🪨', desc: 'Classic hand game', gradient: 'from-stone-400 to-stone-600', category: 'Classic', players: '2 Players' },
  { name: 'Hangman Love', slug: 'hangman', icon: '💌', desc: 'Guess the love word', gradient: 'from-rose-400 to-red-500', category: 'Classic', players: '2 Players' },
  { name: 'Number Guess', slug: 'numberguess', icon: '🔢', desc: 'Guess the number', gradient: 'from-sky-400 to-sky-600', category: 'Classic', players: '2 Players' },
  { name: '2048 Love', slug: 'game2048', icon: '🔲', desc: 'Merge numbers', gradient: 'from-orange-400 to-amber-500', category: 'Classic', players: '1 Player' },
  { name: 'Love Snake', slug: 'snake', icon: '🐍', desc: 'Classic snake game', gradient: 'from-lime-400 to-green-600', category: 'Classic', players: '1 Player' },
  { name: 'Pong 2 Player', slug: 'pong', icon: '🏓', desc: 'Classic pong battle', gradient: 'from-sky-400 to-sky-600', category: 'Arcade', players: '2 Players' },
  { name: 'Flappy Heart', slug: 'flappyheart', icon: '💘', desc: 'Flappy bird love edition', gradient: 'from-pink-400 to-rose-500', category: 'Arcade', players: '1 Player' },
  { name: "Cupid's Arrow", slug: 'cupidsarrow', icon: '🏹', desc: 'Shoot the hearts', gradient: 'from-red-400 to-pink-500', category: 'Arcade', players: '1 Player' },
  { name: 'Heart Catcher', slug: 'heartcatcher', icon: '🫶', desc: 'Catch falling hearts', gradient: 'from-rose-400 to-pink-500', category: 'Arcade', players: '1 Player' },
  { name: 'Hearts Card', slug: 'hearts', icon: '♥️', desc: 'Card game classic', gradient: 'from-red-500 to-rose-600', category: 'Arcade', players: '4 Players' },
  { name: 'Couple Patterns', slug: 'couplepatterns', icon: '🧩', desc: 'Memory pattern challenge', gradient: 'from-purple-400 to-pink-500', category: 'Classic', players: '2 Players' },
  { name: 'Couple Word Search', slug: 'couple_word_search', icon: '🔍', desc: 'Find love words together', gradient: 'from-blue-400 to-indigo-500', category: 'Classic', players: '2 Players' },
  { name: 'Couple Word Search 2', slug: 'couple_word_search2', icon: '🔎', desc: 'More word search fun', gradient: 'from-cyan-400 to-blue-500', category: 'Classic', players: '2 Players' },
  { name: 'Heart Spelling', slug: 'heartspelling', icon: '✍️', desc: 'Spell love words', gradient: 'from-pink-400 to-rose-500', category: 'Quiz', players: '2 Players' },
  { name: 'Heart Colors', slug: 'heartcolors', icon: '🎨', desc: 'Match heart colors', gradient: 'from-rose-400 to-red-500', category: 'Classic', players: '2 Players' },
  { name: 'Love Emoji Quiz', slug: 'loveemojiquiz', icon: '😀', desc: 'Guess from emojis', gradient: 'from-yellow-400 to-orange-500', category: 'Quiz', players: '2 Players' },
  { name: 'Love Sequences', slug: 'lovesequences', icon: '🔢', desc: 'Complete the sequence', gradient: 'from-indigo-400 to-purple-500', category: 'Puzzle', players: '2 Players' },
  { name: 'Heart Rhythm', slug: 'heartrhythm', icon: '🎵', desc: 'Tap to the beat', gradient: 'from-pink-500 to-rose-500', category: 'Arcade', players: '2 Players' },
  { name: 'Girlfriend Rules', slug: 'girlfriend_rules', icon: '👩', desc: 'Fun rules game', gradient: 'from-fuchsia-400 to-pink-500', category: 'Party', players: '2 Players' },
  { name: 'Boyfriend Rules', slug: 'boyfriend_rules', icon: '👨', desc: 'Fun rules game', gradient: 'from-blue-400 to-indigo-500', category: 'Party', players: '2 Players' },
  { name: 'Love Compatibility', slug: 'love_compatibility', icon: '💞', desc: 'Test your compatibility', gradient: 'from-pink-400 to-red-500', category: 'Love', players: '2 Players' },
  { name: 'Love Emoji Quiz 2', slug: 'love_emoji_quiz', icon: '😊', desc: 'More emoji fun', gradient: 'from-orange-400 to-pink-500', category: 'Quiz', players: '2 Players' },
  { name: 'Couple Memory Match', slug: 'couple_memory_match', icon: '🃏', desc: 'Memory card game', gradient: 'from-teal-400 to-cyan-500', category: 'Classic', players: '2 Players' },
  { name: 'Love Riddles', slug: 'love_riddles', icon: '🧩', desc: 'Solve love riddles', gradient: 'from-purple-400 to-fuchsia-500', category: 'Quiz', players: '2 Players' },
  { name: 'Love Riddles 2', slug: 'love_riddles2', icon: '🧠', desc: 'More love riddles', gradient: 'from-violet-400 to-purple-500', category: 'Quiz', players: '2 Players' },
  { name: 'Love Quotes Quiz', slug: 'love_quotes_quiz', icon: '💬', desc: 'Guess the love quote', gradient: 'from-rose-400 to-pink-500', category: 'Quiz', players: '2 Players' },
  { name: 'Couple Memory', slug: 'couple_memory', icon: '🧠', desc: 'Memory challenge', gradient: 'from-blue-400 to-cyan-500', category: 'Classic', players: '2 Players' },
  { name: 'Anniversary Planner', slug: 'anniversary_planner', icon: '📅', desc: 'Plan your anniversary', gradient: 'from-pink-400 to-rose-500', category: 'Love', players: '2 Players' },
  { name: 'Couple Photo Story', slug: 'couple_photo_story', icon: '📸', desc: 'Tell stories with photos', gradient: 'from-amber-400 to-orange-500', category: 'Creative', players: '2 Players' },
  { name: 'Love Compatibility 2', slug: 'love_compatibility2', icon: '💕', desc: 'Advanced compatibility', gradient: 'from-red-400 to-rose-500', category: 'Love', players: '2 Players' },
  { name: 'Couple Photo', slug: 'couple_photo', icon: '📷', desc: 'Photo challenge', gradient: 'from-fuchsia-400 to-pink-500', category: 'Party', players: '2 Players' },
  { name: 'Love Quotes', slug: 'love_quotes', icon: '💝', desc: 'Guess the quote', gradient: 'from-rose-400 to-red-500', category: 'Quiz', players: '2 Players' },
  { name: 'Love Emoji 2', slug: 'love_emoji2', icon: '😂', desc: 'Emoji guessing fun', gradient: 'from-yellow-400 to-amber-500', category: 'Party', players: '2+ Players' },
  { name: 'Couple Bucket List', slug: 'couple_bucketlist', icon: '📋', desc: 'Check off dreams together', gradient: 'from-sky-400 to-blue-500', category: 'Love', players: '2 Players' },
  { name: 'Couple Time Capsule', slug: 'couple_timecapsule', icon: '⏳', desc: 'Write messages for the future', gradient: 'from-purple-400 to-indigo-500', category: 'Creative', players: '2 Players' },
  { name: 'Romantic Calculator', slug: 'romantic_calculator', icon: '💘', desc: 'Love percentage', gradient: 'from-pink-400 to-red-500', category: 'Love', players: '2 Players' },
  { name: 'Couple Quiz 2', slug: 'couplequiz2', icon: '💡', desc: 'More couple questions', gradient: 'from-teal-400 to-emerald-500', category: 'Quiz', players: '2 Players' },
  { name: 'Love Hangman 2', slug: 'lovehangman2', icon: '💬', desc: 'More hangman words', gradient: 'from-rose-400 to-red-500', category: 'Classic', players: '2 Players' },
  { name: 'Would You Rather', slug: 'wouldyourather', icon: '🤔', desc: 'Tough choices', gradient: 'from-orange-400 to-pink-500', category: 'Quiz', players: '2+ Players' },
  { name: 'Romantic Would You Rather 2', slug: 'romantic_would_you_rather2', icon: '💭', desc: 'More spicy questions', gradient: 'from-fuchsia-400 to-purple-500', category: 'Quiz', players: '2+ Players' },
  { name: 'Kissing Spinner', slug: 'kissinggame', icon: '💋', desc: 'Spin the wheel', gradient: 'from-red-400 to-rose-500', category: 'Party', players: '2 Players' },
  { name: 'Couple Riddles', slug: 'couple_riddles', icon: '🧩', desc: 'Riddles for couples', gradient: 'from-violet-400 to-purple-500', category: 'Quiz', players: '2 Players' },
  { name: 'Love Letter', slug: 'loveletter', icon: '✉️', desc: 'Write a love letter', gradient: 'from-rose-400 to-pink-500', category: 'Creative', players: '2 Players' },
  { name: 'Love Letters 2', slug: 'loveletters', icon: '💌', desc: 'More love letters', gradient: 'from-pink-400 to-rose-500', category: 'Creative', players: '2 Players' },
  { name: 'Relationship Riddles', slug: 'relationship_riddles', icon: '🤔', desc: 'Relationship puzzles', gradient: 'from-indigo-400 to-blue-500', category: 'Quiz', players: '2 Players' },
  { name: 'Couple Poetry', slug: 'couple_poetry', icon: '📜', desc: 'Write poetry together', gradient: 'from-fuchsia-400 to-pink-500', category: 'Creative', players: '2 Players' },
  { name: 'Couple Golfs', slug: 'couplegolfs', icon: '⛳', desc: '9 holes of love', gradient: 'from-lime-400 to-green-600', category: 'Love', players: '2 Players' },
  { name: 'Love Maze', slug: 'lovemaze', icon: '🧭', desc: 'Navigate the maze of love', gradient: 'from-rose-400 to-fuchsia-500', category: 'Love', players: '2 Players' },
  { name: 'Puzzle Love', slug: 'puzzlelove', icon: '🧩', desc: 'Sliding puzzle', gradient: 'from-rose-400 to-red-500', category: 'Love', players: '1 Player' },
  { name: 'Love Horoscope', slug: 'love_horoscope', icon: '⭐', desc: 'Check your love stars', gradient: 'from-purple-400 to-fuchsia-500', category: 'Love', players: '2 Players' },
  { name: 'Dance Challenge', slug: 'dancechallenge', icon: '💃', desc: 'Show your moves', gradient: 'from-pink-400 to-fuchsia-500', category: 'Party', players: '2+ Players' },
  { name: 'First Date', slug: 'firstdate', icon: '🌹', desc: 'Simulate a first date', gradient: 'from-rose-400 to-pink-500', category: 'Quiz', players: '2 Players' },
  { name: 'Love Story Builder', slug: 'love_story_builder', icon: '📖', desc: 'Build your love story', gradient: 'from-teal-400 to-cyan-500', category: 'Creative', players: '2 Players' },
  { name: 'Couple Quiz', slug: 'quiz', icon: '💡', desc: 'How well do you know each other?', gradient: 'from-rose-400 to-red-500', category: 'Quiz', players: '2 Players' },
  { name: 'Love Story 2', slug: 'love_story2', icon: '📕', desc: 'Another love story', gradient: 'from-pink-400 to-rose-500', category: 'Creative', players: '2 Players' },
  { name: 'Love Journal', slug: 'love_journal', icon: '📔', desc: 'Write your feelings', gradient: 'from-amber-400 to-orange-500', category: 'Creative', players: '2 Players' },
  { name: 'Drawing Challenge', slug: 'drawingchallenge', icon: '🎨', desc: 'Draw & guess', gradient: 'from-amber-400 to-orange-500', category: 'Party', players: '2+ Players' },
  { name: 'Love Typing', slug: 'lovetyping', icon: '⌨️', desc: 'Type love messages', gradient: 'from-blue-400 to-indigo-500', category: 'Quiz', players: '2 Players' },
  { name: 'Typing Race', slug: 'typingrace', icon: '⚡', desc: 'Type romantic quotes', gradient: 'from-sky-400 to-sky-600', category: 'Quiz', players: '2 Players' },
  { name: 'Couple Typing Race', slug: 'couple_typing_race', icon: '🏁', desc: 'Race to type', gradient: 'from-emerald-400 to-teal-500', category: 'Quiz', players: '2 Players' },
  { name: 'Heart Match', slug: 'heartmatch', icon: '💖', desc: 'Match the hearts', gradient: 'from-rose-400 to-pink-500', category: 'Classic', players: '2 Players' },
  { name: 'Love Math', slug: 'lovemath', icon: '➕', desc: 'Solve love math', gradient: 'from-pink-400 to-rose-500', category: 'Quiz', players: '2 Players' },
  { name: 'Love Resolutions', slug: 'love_resolutions', icon: '🎯', desc: 'Make resolutions together', gradient: 'from-amber-400 to-yellow-500', category: 'Love', players: '2 Players' },
  { name: 'Couple Music Quiz', slug: 'couple_music_quiz', icon: '🎵', desc: 'Guess the love song', gradient: 'from-violet-400 to-purple-500', category: 'Quiz', players: '2 Players' },
  { name: 'Couple Trivia 2', slug: 'coupletrivia2', icon: '🧠', desc: 'Couple trivia round 2', gradient: 'from-fuchsia-400 to-indigo-500', category: 'Quiz', players: '2 Players' },
  { name: 'Couple Drawing', slug: 'couple_drawing', icon: '✏️', desc: 'Draw together', gradient: 'from-indigo-400 to-fuchsia-500', category: 'Creative', players: '2 Players' },
  { name: 'Speed Date', slug: 'speeddate', icon: '💬', desc: '8 rapid-fire questions', gradient: 'from-red-400 to-pink-500', category: 'Quiz', players: '2 Players' },
  { name: 'Word Chain', slug: 'wordchain', icon: '🔤', desc: 'Word building game', gradient: 'from-sky-400 to-sky-600', category: 'Quiz', players: '2+ Players' },
  { name: 'Couple Reflex', slug: 'couple_reflex', icon: '⚡', desc: 'Test your reflexes', gradient: 'from-orange-400 to-red-500', category: 'Arcade', players: '2 Players' },
  { name: 'Who Knows Who', slug: 'who_knows_who', icon: '🤷', desc: 'Test how well you know each other', gradient: 'from-teal-400 to-cyan-500', category: 'Quiz', players: '2 Players' },
  { name: 'Promise Chain', slug: 'promisechain', icon: '🔗', desc: 'Chain of promises', gradient: 'from-pink-400 to-rose-500', category: 'Love', players: '2 Players' },
  { name: 'Couple Charades', slug: 'couplecharades', icon: '🎭', desc: 'Act out love scenes', gradient: 'from-purple-400 to-fuchsia-500', category: 'Party', players: '2+ Players' },
  { name: 'How Well We Met', slug: 'howwell_met', icon: '💑', desc: 'How well do you remember?', gradient: 'from-rose-400 to-red-500', category: 'Quiz', players: '2 Players' },
  { name: 'Love Achievements', slug: 'love_achievements', icon: '🏆', desc: 'Track your achievements', gradient: 'from-amber-400 to-orange-500', category: 'Love', players: '2 Players' },
  { name: 'Heart Math', slug: 'heartmath', icon: '❤️', desc: 'Math with hearts', gradient: 'from-red-400 to-pink-500', category: 'Quiz', players: '2 Players' },
  { name: 'Couple Playlist', slug: 'couple_playlist', icon: '🎧', desc: 'Build your love playlist', gradient: 'from-indigo-400 to-purple-500', category: 'Creative', players: '2 Players' },
  { name: 'Couple Scenarios', slug: 'couple_scenarios', icon: '🎬', desc: 'What would you do?', gradient: 'from-fuchsia-400 to-pink-500', category: 'Quiz', players: '2 Players' },
  { name: 'Relationship Quiz', slug: 'relationship_quiz', icon: '💡', desc: 'Test your relationship IQ', gradient: 'from-teal-400 to-emerald-500', category: 'Quiz', players: '2 Players' },
  { name: 'Couple Truths', slug: 'couple_truths', icon: '🕯️', desc: 'Truths for couples', gradient: 'from-orange-400 to-red-500', category: 'Party', players: '2 Players' },
  { name: 'Love Language Test', slug: 'love_language_test', icon: '🗣️', desc: 'Discover love languages', gradient: 'from-pink-400 to-rose-500', category: 'Quiz', players: '2 Players' },
  { name: 'Future Together', slug: 'future_together', icon: '🔮', desc: 'Predict your future', gradient: 'from-purple-400 to-indigo-500', category: 'Love', players: '2 Players' },
  { name: 'Love Countdown', slug: 'love_countdown', icon: '⏱️', desc: 'Count the love moments', gradient: 'from-rose-400 to-pink-500', category: 'Love', players: '2 Players' },
  { name: 'Heart Quiz', slug: 'heartquiz', icon: '❓', desc: 'Heart trivia', gradient: 'from-red-400 to-rose-500', category: 'Quiz', players: '2 Players' },
  { name: 'Truth or Dare', slug: 'truthordare', icon: '😈', desc: 'Spicy questions', gradient: 'from-fuchsia-500 to-pink-500', category: 'Party', players: '2+ Players' },
  { name: 'Love Trivia', slug: 'lovetrivia', icon: '🌹', desc: 'Love & romance trivia', gradient: 'from-red-400 to-rose-500', category: 'Quiz', players: '2+ Players' },
  { name: 'Trivia Battle', slug: 'triviabattle', icon: '🧠', desc: 'Couple trivia', gradient: 'from-fuchsia-400 to-indigo-500', category: 'Quiz', players: '2 Players' },
  { name: 'Love Dares', slug: 'love_dares', icon: '😏', desc: 'Spicy dares', gradient: 'from-red-400 to-pink-500', category: 'Party', players: '2+ Players' },
  { name: 'Heart Puzzle', slug: 'heartpuzzle', icon: '🧩', desc: 'Solve the heart puzzle', gradient: 'from-rose-400 to-red-500', category: 'Puzzle', players: '1 Player' },
  { name: 'Couple Pictionary', slug: 'couplepictionary', icon: '✏️', desc: 'Draw & guess together', gradient: 'from-indigo-400 to-fuchsia-500', category: 'Party', players: '2 Players' },
  { name: 'Couple Story 2', slug: 'couple_story2', icon: '📗', desc: 'Write a story together', gradient: 'from-teal-400 to-cyan-500', category: 'Creative', players: '2 Players' },
  { name: 'Love Mad Libs', slug: 'love_madlibs', icon: '📝', desc: 'Fill in the blanks', gradient: 'from-amber-400 to-orange-500', category: 'Party', players: '2+ Players' },
  { name: 'Love Q&A', slug: 'love_qna', icon: '❓', desc: 'Ask each other questions', gradient: 'from-pink-400 to-rose-500', category: 'Quiz', players: '2 Players' },
  { name: 'Couple Goals', slug: 'couple_goals_2', icon: '🎯', desc: 'Set couple goals', gradient: 'from-emerald-400 to-teal-500', category: 'Love', players: '2 Players' },
  { name: 'Love Word Search 2', slug: 'love_word_search2', icon: '🔍', desc: 'More word search fun', gradient: 'from-blue-400 to-indigo-500', category: 'Classic', players: '2 Players' },
  { name: 'Couple Riddles 2', slug: 'coupleriddles', icon: '🧩', desc: 'More couple riddles', gradient: 'from-violet-400 to-purple-500', category: 'Quiz', players: '2 Players' },
  { name: 'Emoji Story', slug: 'emojistory', icon: '📖', desc: 'Tell a story with emojis', gradient: 'from-teal-400 to-cyan-500', category: 'Party', players: '2+ Players' },
  { name: 'Love Word Search', slug: 'lovewordsearch', icon: '🔎', desc: 'Find hidden love words', gradient: 'from-cyan-400 to-blue-500', category: 'Classic', players: '2 Players' },
  { name: 'Photo Quiz', slug: 'photoquiz', icon: '📸', desc: 'Guess your partner', gradient: 'from-fuchsia-400 to-pink-500', category: 'Quiz', players: '2 Players' },
  { name: 'Couple Memory 2', slug: 'couplememory2', icon: '🃏', desc: 'More memory fun', gradient: 'from-blue-400 to-cyan-500', category: 'Classic', players: '2 Players' },
  { name: 'Love Calculator', slug: 'lovecalculator', icon: '🧮', desc: 'Check compatibility', gradient: 'from-pink-400 to-rose-500', category: 'Love', players: '2 Players' },
  { name: 'Love Song Quiz', slug: 'lovesongquiz', icon: '🎵', desc: 'Guess the love song', gradient: 'from-pink-400 to-rose-500', category: 'Quiz', players: '2+ Players' },
];

const categories = ['All', 'Classic', 'Arcade', 'Party', 'Quiz', 'Love'];
const categoryColors: Record<string, string> = {
  All: 'from-pink-500 to-rose-500',
  Classic: 'from-blue-400 to-indigo-500',
  Arcade: 'from-orange-400 to-red-500',
  Party: 'from-fuchsia-500 to-purple-500',
  Quiz: 'from-teal-400 to-cyan-500',
  Love: 'from-rose-400 to-pink-500',
};

const features = [
  { icon: Camera, title: 'Birthday Websites', desc: 'Upload photos, add messages, and create stunning personalized birthday pages for your loved ones.', color: 'from-pink-500 to-rose-500', href: '/dashboard' },
  { icon: Gamepad2, title: '101 Couple Games', desc: 'From classics to party games, trivia to love quizzes - play together and strengthen your bond.', color: 'from-fuchsia-500 to-pink-500', href: '/games' },
  { icon: Users, title: 'Add Friends', desc: 'Connect with your partner or friends, challenge them to games, and compete together.', color: 'from-rose-500 to-red-500', href: '/friends' },
  { icon: Trophy, title: 'Earn Badges', desc: 'Unlock achievements like "10 Hours Together", "Game Master", and "Love Champions".', color: 'from-amber-400 to-orange-500', href: '/badges' },
  { icon: Clock, title: 'Track Playtime', desc: 'See how much time you spend playing together. Every moment counts on your love journey.', color: 'from-sky-400 to-blue-500', href: '/profile' },
  { icon: HeartHandshake, title: 'Share & Connect', desc: 'Share birthday pages and game links with your loved ones. Spread the love everywhere.', color: 'from-red-400 to-rose-500', href: '/find-partner' },
];

const badges = [
  { icon: Flame, name: '10 Hours Together', desc: 'Played 10 hours total', color: 'from-orange-400 to-red-500', earned: true },
  { icon: Trophy, name: 'Game Master', desc: 'Won 25 games', color: 'from-yellow-400 to-amber-500', earned: true },
  { icon: Crown, name: 'Love Champions', desc: 'Completed 50 games together', color: 'from-fuchsia-500 to-pink-500', earned: false },
  { icon: Star, name: 'Perfect Match', desc: '100% compatibility', color: 'from-blue-400 to-indigo-500', earned: true },
  { icon: Award, name: 'Social Butterfly', desc: 'Added 10 friends', color: 'from-teal-400 to-cyan-500', earned: false },
  { icon: Rocket, name: 'Early Bird', desc: 'First to play a new game', color: 'from-purple-400 to-fuchsia-500', earned: true },
];

const stats = [
  { number: '101+', label: 'Couple Games', icon: Gamepad2 },
  { number: '50K+', label: 'Happy Couples', icon: Users2 },
  { number: '1M+', label: 'Games Played', icon: Play },
  { number: '4.9★', label: 'User Rating', icon: Star },
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [clickedHearts, setClickedHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Lightweight auth check (no heavy queries)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data?.session);
    });
  }, []);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const heart = document.createElement('div');
    heart.className = 'heart-particle';
    heart.style.left = `${e.clientX - 10}px`;
    heart.style.top = `${e.clientY - 10}px`;
    heart.innerHTML = ['💖', '💕', '💗', '💓', '🩷'][Math.floor(Math.random() * 5)];
    heart.style.fontSize = '20px';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
  }, []);

  const rafRef = useRef<number | null>(null);
  const lastPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      if (dx * dx + dy * dy < 64) return;
      lastPos.current = { x: e.clientX, y: e.clientY };
      setMousePos({ x: e.clientX, y: e.clientY });
    });
  }, []);

  const filteredGames = games.filter(game => {
    const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         game.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div onClick={handleClick} onMouseMove={handleMouseMove} className="min-h-screen">
      {/* Floating Hearts Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-200/30 text-2xl"
            animate={{
              y: [0, '-120vh'],
              x: [0, Math.sin(i * 1.5) * 100],
              rotate: [0, 360],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 15 + i * 3,
              repeat: Infinity,
              delay: i * 2.5,
              ease: 'linear',
            }}
            style={{
              left: `${10 + i * 15}%`,
              bottom: '-50px',
            }}
          >
            💕
          </motion.div>
        ))}
      </div>

      {/* Hero Section */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-animated-gradient"
      >
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-20 left-10 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -30, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-20 right-10 w-96 h-96 bg-rose-300/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 20, 0],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-fuchsia-300/15 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.5 }}
            className="mb-6 sm:mb-8 inline-block"
          >
            <div className="relative">
              <span className="text-6xl sm:text-8xl md:text-9xl block animate-bounce" style={{ animationDuration: '3s' }}>
                💖
              </span>
              <motion.span
                animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 text-3xl sm:text-4xl"
              >
                💕
              </motion.span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black mb-4 sm:mb-6 leading-tight">
              <ShinyText
                text="Love Dove"
                className="bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-500 bg-clip-text text-transparent"
                color="from-pink-600 via-rose-500 to-fuchsia-500"
              />
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4"
          >
            Create beautiful birthday websites, play <span className="font-bold text-pink-600">101 couple games</span>,
            connect with friends, and celebrate your love story together. 💑
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-8 sm:mb-10"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.1 }}
                className="stat-counter flex items-center gap-2 sm:gap-3 bg-white/60 backdrop-blur-sm rounded-2xl px-4 sm:px-6 py-3 shadow-lg shadow-pink-100/30 border border-pink-100/50"
              >
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
                <div className="text-left">
                  <div className="text-lg sm:text-2xl font-black bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
          >
            <Link href="/auth/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative px-8 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-2xl shadow-2xl shadow-pink-300/40 hover:shadow-pink-400/50 transition-all duration-300 overflow-hidden group text-sm sm:text-base"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Your Love Journey
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            </Link>
            <Link href="/#games">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 sm:px-10 py-3.5 sm:py-4 bg-white/70 backdrop-blur-sm text-pink-600 font-bold rounded-2xl shadow-lg border border-pink-200/50 hover:bg-white hover:shadow-xl transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
              >
                <Play className="w-4 h-4" />
                Browse Games
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 rounded-full border-2 border-pink-300 flex items-start justify-center p-1.5">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-pink-500 rounded-full"
            />
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-50 text-pink-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-pink-100">
              <Sparkles className="w-3.5 h-3.5" />
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-gray-900 mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
                Celebrate Love
              </span>
            </h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
              Love Dove brings couples together with beautiful birthday pages, exciting games, and meaningful connections.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, i) => (
              <motion.a
                key={i}
                href={feature.href}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative bg-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-pink-100/30 border border-pink-100/50 hover:shadow-xl hover:shadow-pink-200/40 transition-all duration-500 cursor-pointer overflow-hidden"
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50/0 to-rose-50/0 group-hover:from-pink-50/50 group-hover:to-rose-50/50 transition-all duration-500" />

                <div className="relative z-10">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
                    transition={{ duration: 0.5 }}
                    className={`feature-icon-wrapper w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 sm:mb-5 shadow-lg`}
                  >
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </motion.div>

                  <h3 className="text-lg sm:text-xl font-display font-bold text-gray-900 mb-2 sm:mb-3 group-hover:text-pink-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                  <p className="mt-4 text-xs font-bold text-pink-500 flex items-center gap-1">
                    Open <ChevronRight className="w-3.5 h-3.5" />
                  </p>
                </div>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-pink-100/0 to-pink-100/0 group-hover:from-pink-100/30 group-hover:to-pink-100/10 rounded-bl-full transition-all duration-500" />
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Find a Partner Section */}
      <section id="find-partner" className="py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-pink-50/50 via-rose-50/30 to-white relative">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-50 text-rose-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-rose-100">
              <HeartHandshake className="w-3.5 h-3.5" />
              Find Your Match
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-gray-900 mb-4">
              Find Your Perfect{' '}
              <span className="bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">
                Partner
              </span>
            </h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto mb-8">
              Answer a few fun questions, and we will match you with someone who shares your interests, vibe, and love for games.
            </p>
            <Link href="/find-partner">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 sm:px-10 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-2xl shadow-2xl shadow-rose-300/40 hover:shadow-rose-400/50 transition-all duration-300 inline-flex items-center gap-3 text-sm sm:text-base"
              >
                <Users className="w-5 h-5" />
                Find a Partner Now
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: '📝', title: 'Share Your Preferences', desc: 'Tell us what you are looking for in a partner and what makes you unique.' },
              { icon: '💡', title: 'Get Smart Matches', desc: 'Our algorithm finds the best compatibility matches based on interests and goals.' },
              { icon: '💬', title: 'Chat & Play Together', desc: 'Connect instantly through chat and jump into games together.' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-pink-100/60 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section id="games" className="py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-white via-pink-50/30 to-white relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-50 text-pink-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-pink-100">
              <Gamepad2 className="w-3.5 h-3.5" />
              101 Games
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-gray-900 mb-4">
              Play Together,{' '}
              <span className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
                Stay Together
              </span>
            </h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
              Choose from 101 exciting games designed for couples. Every game brings you closer!
            </p>
          </motion.div>

          {/* Search & Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 sm:mb-10 space-y-4"
          >
            {/* Search bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-pink-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-300 shadow-sm transition-all"
              />
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                    selectedCategory === cat
                      ? `bg-gradient-to-r ${categoryColors[cat]} text-white shadow-lg shadow-pink-200/40`
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-pink-200 hover:text-pink-600'
                  }`}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Games Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredGames.map((game, i) => (
              <motion.div
                key={game.slug}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 10) * 0.05 }}
                whileHover={{ y: -8, scale: 1.03 }}
                onClick={() => window.location.href = `/games/${game.slug}`}
                className="game-card bg-white rounded-2xl p-4 sm:p-5 shadow-md border border-gray-100 hover:border-pink-200 group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50/0 to-rose-50/0 group-hover:from-pink-50/40 group-hover:to-rose-50/30 transition-all duration-500" />

                <div className="relative z-10">
                  <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                    {game.icon}
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-1 group-hover:text-pink-600 transition-colors line-clamp-1">
                    {game.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-2 line-clamp-1">{game.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${game.gradient} text-white font-medium`}>
                      {game.category}
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {game.players}
                    </span>
                  </div>
                </div>

                {/* Hover play icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-500/90 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white ml-0.5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredGames.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg">No games found. Try a different search!</p>
            </div>
          )}
        </div>
      </section>

      {/* Relationship Advisor Chatbot Feature */}
      <section id="advisor" className="py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-white via-rose-50/30 to-pink-50/50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 text-6xl opacity-10">💕</div>
        <div className="absolute bottom-10 right-10 text-5xl opacity-10">💖</div>
        <div className="absolute top-1/2 left-1/4 text-4xl opacity-10">💝</div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-50 text-pink-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-pink-100">
              <MessageCircle className="w-3.5 h-3.5" />
              Relationship Advisor
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-gray-900 mb-4">
              Need Someone to{' '}
              <span className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
                Talk To?
              </span>
            </h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto mb-8">
              Our AI relationship advisor is here for you 24/7. Get advice on love, conflicts, communication, and emotional support - anytime you need it.
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.dispatchEvent(new CustomEvent('openChatBot'))}
              className="px-8 sm:px-10 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-2xl shadow-2xl shadow-pink-300/40 hover:shadow-pink-400/50 transition-all duration-300 inline-flex items-center gap-3 text-sm sm:text-base"
            >
              <MessageCircle className="w-5 h-5" />
              Chat with Advisor
              <Sparkles className="w-4 h-4" />
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icon: '💬', title: 'Relationship Advice', desc: 'Get guidance on communication, trust, and building stronger bonds.' },
              { icon: '💝', title: 'Emotional Support', desc: 'Feel heard and understood. We are here to listen and comfort you.' },
              { icon: '💡', title: 'Conflict Resolution', desc: 'Learn healthy ways to navigate disagreements and grow together.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-pink-100/60 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Badges Section */}
      <section id="badges" className="py-20 sm:py-28 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-50 text-pink-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-pink-100">
              <Award className="w-3.5 h-3.5" />
              Achievements
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-gray-900 mb-4">
              Earn{' '}
              <span className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
                Badges
              </span>{' '}
              Together
            </h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
              Play games, spend time together, and unlock special badges that celebrate your love journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {badges.map((badge, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6, scale: 1.05 }}
                className={`relative bg-white rounded-2xl p-4 sm:p-6 text-center shadow-md border transition-all duration-300 ${
                  badge.earned
                    ? 'border-pink-100 shadow-pink-100/30 hover:shadow-lg hover:shadow-pink-200/40'
                    : 'border-gray-100 opacity-60'
                }`}
              >
                <div className="relative mb-3 sm:mb-4">
                  <motion.div
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-lg ${
                      badge.earned ? '' : 'grayscale'
                    }`}
                  >
                    <badge.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                  </motion.div>
                  {badge.earned && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center"
                    >
                      <span className="text-white text-xs">✓</span>
                    </motion.div>
                  )}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-1">{badge.name}</h3>
                <p className="text-[10px] sm:text-xs text-gray-400">{badge.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-white via-pink-50/30 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-50 text-pink-600 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-pink-100">
              <Users className="w-3.5 h-3.5" />
              Community
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-gray-900 mb-4">
              Join{' '}
              <span className="bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent">
                50,000+ Couples
              </span>
            </h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto">
              Be part of a vibrant community of couples who celebrate love every day through games and shared moments.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: HeartPulse, stat: '50K+', label: 'Active Couples', sublabel: 'Worldwide' },
              { icon: Gamepad2, stat: '1M+', label: 'Games Played', sublabel: 'This month' },
              { icon: MessageCircle, stat: '500K+', label: 'Messages Sent', sublabel: 'In games' },
              { icon: Trophy, stat: '2M+', label: 'Badges Earned', sublabel: 'Total' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-pink-100/50 text-center card-hover-glow"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 sm:w-7 sm:h-7 text-pink-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-pink-600 to-rose-500 bg-clip-text text-transparent mb-1">
                  {item.stat}
                </div>
                <div className="text-sm font-semibold text-gray-700 mb-0.5">{item.label}</div>
                <div className="text-xs text-gray-400">{item.sublabel}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-500" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-6xl">💕</div>
          <div className="absolute top-20 right-20 text-4xl">💖</div>
          <div className="absolute bottom-10 left-1/4 text-5xl">💗</div>
          <div className="absolute bottom-20 right-1/3 text-3xl">💓</div>
          <div className="absolute top-1/2 left-10 text-4xl">💝</div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto text-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl sm:text-6xl mb-6"
          >
            💑
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-white mb-4 sm:mb-6">
            Ready to Start Your Love Journey?
          </h2>
          <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-8 sm:mb-10">
            {isLoggedIn
              ? 'Build a beautiful birthday site for your loved one, or jump into a couple game right now.'
              : 'Join thousands of couples who are already playing, connecting, and celebrating their love on Love Dove.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            {isLoggedIn ? (
              <>
                <Link href="/dashboard">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 sm:px-10 py-3.5 sm:py-4 bg-white text-pink-600 font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 text-sm sm:text-base"
                  >
                    🎂 Make a Birthday Website
                  </motion.button>
                </Link>
                <Link href="/games">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 sm:px-10 py-3.5 sm:py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300 text-sm sm:text-base"
                  >
                    🎮 Play a Game
                  </motion.button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 sm:px-10 py-3.5 sm:py-4 bg-white text-pink-600 font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 text-sm sm:text-base"
                  >
                    Create Free Account
                  </motion.button>
                </Link>
                <Link href="/contact">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 sm:px-10 py-3.5 sm:py-4 bg-white/20 backdrop-blur-sm text-white font-bold rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300 text-sm sm:text-base"
                  >
                    Contact Us
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" fill="white" />
                </div>
                <span className="text-xl font-display font-black">Love Dove</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Where hearts connect & play. Create beautiful birthday websites and play couple games together.
              </p>
              <div className="flex gap-3">
                {['💕', '💖', '💗', '💓'].map((emoji, i) => (
                  <motion.span
                    key={i}
                    whileHover={{ scale: 1.3, y: -3 }}
                    className="text-xl cursor-pointer"
                  >
                    {emoji}
                  </motion.span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-gray-300 mb-4">Quick Links</h4>
              <div className="space-y-2.5">
                {['Home', 'Games', 'Badges', 'Contact'].map((link) => (
                  <Link
                    key={link}
                    href={link === 'Home' ? '/' : link === 'Games' ? '/#games' : link === 'Badges' ? '/#badges' : '/contact'}
                    className="block text-sm text-gray-400 hover:text-pink-400 transition-colors"
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-gray-300 mb-4">Popular Games</h4>
              <div className="space-y-2.5">
                {['Tic-Tac-Toe', 'Truth or Dare', 'Couple Quiz', 'Love Calculator'].map((game) => (
                  <Link
                    key={game}
                    href="/#games"
                    className="block text-sm text-gray-400 hover:text-pink-400 transition-colors"
                  >
                    {game}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-gray-300 mb-4">Contact</h4>
              <div className="space-y-2.5">
                <p className="text-sm text-gray-400">salariarudar5@gmail.com</p>
                <p className="text-sm text-gray-400">Made with 💖 by Rudar Salaria</p>
                <Link href="/contact" className="inline-flex items-center gap-1.5 text-sm text-pink-400 hover:text-pink-300 transition-colors mt-2">
                  Get in touch <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">
              © 2025 Love Dove. All rights reserved. Made with 💖
            </p>
            <div className="flex gap-6">
              <Link href="/contact" className="text-xs text-gray-500 hover:text-pink-400 transition-colors">
                Contact Us
              </Link>
              <span className="text-xs text-gray-600">Privacy Policy</span>
              <span className="text-xs text-gray-600">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Relationship Advisor ChatBot */}
      <ChatBot />
    </div>
  );
}
