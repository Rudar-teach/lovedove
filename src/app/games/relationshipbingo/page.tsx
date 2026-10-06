'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Sparkles, Trophy, Flame, Star, Share2, Plus, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';

interface Milestone {
  id: number;
  text: string;
  emoji: string;
  category: 'firsts' | 'adventures' | 'traditions' | 'milestones' | 'dreams';
}

interface CategoryInfo {
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
}

const CATEGORIES: Record<string, CategoryInfo> = {
  firsts: { name: 'Firsts', emoji: '\u{1F31F}', color: 'text-rose-600', bgColor: 'bg-rose-50 border-rose-200' },
  adventures: { name: 'Adventures', emoji: '\u{1F3D4}', color: 'text-emerald-600', bgColor: 'bg-emerald-50 border-emerald-200' },
  traditions: { name: 'Traditions', emoji: '\u{1F370}', color: 'text-amber-600', bgColor: 'bg-amber-50 border-amber-200' },
  milestones: { name: 'Milestones', emoji: '\u{1F3C6}', color: 'text-violet-600', bgColor: 'bg-violet-50 border-violet-200' },
  dreams: { name: 'Dreams', emoji: '\u{2728}', color: 'text-sky-600', bgColor: 'bg-sky-50 border-sky-200' },
};

const DEFAULT_MILESTONES: Milestone[] = [
  // Firsts (10)
  { id: 1, text: "First date", emoji: "\u{1F60D}", category: "firsts" },
  { id: 2, text: "First kiss", emoji: "\u{1F48B}", category: "firsts" },
  { id: 3, text: "First 'I love you'", emoji: "\u{1F49C}", category: "firsts" },
  { id: 4, text: "First trip together", emoji: "\u{2708}", category: "firsts" },
  { id: 5, text: "First met family", emoji: "\u{1F46A}", category: "firsts" },
  { id: 6, text: "First dance", emoji: "\u{1F483}", category: "firsts" },
  { id: 7, text: "First argument (made up)", emoji: "\u{1F602}", category: "firsts" },
  { id: 8, text: "First holiday together", emoji: "\u{1F384}", category: "firsts" },
  { id: 9, text: "First movie together", emoji: "\u{1F3AC}", category: "firsts" },
  { id: 10, text: "First 'I'm sorry'", emoji: "\u{1F646}", category: "firsts" },

  // Adventures (8)
  { id: 11, text: "Beach day", emoji: "\u{1F3D6}", category: "adventures" },
  { id: 12, text: "Hiking trip", emoji: "\u{26F0}", category: "adventures" },
  { id: 13, text: "Road trip", emoji: "\u{1F697}", category: "adventures" },
  { id: 14, text: "Concert together", emoji: "\u{1F3B5}", category: "adventures" },
  { id: 15, text: "Camping night", emoji: "\u{1F3D5}", category: "adventures" },
  { id: 16, text: "Surprise visit", emoji: "\u{1F381}", category: "adventures" },
  { id: 17, text: "City exploration", emoji: "\u{1F3F0}", category: "adventures" },
  { id: 18, text: "Sunrise together", emoji: "\u{1F305}", category: "adventures" },

  // Traditions (7)
  { id: 19, text: "Sunday brunch", emoji: "\u{1F37F}", category: "traditions" },
  { id: 20, text: "Movie night ritual", emoji: "\u{1F4FA}", category: "traditions" },
  { id: 21, text: "Morning coffee together", emoji: "\u{2615}", category: "traditions" },
  { id: 22, text: "Goodnight texts", emoji: "\u{1F4F1}", category: "traditions" },
  { id: 23, text: "Weekly check-in", emoji: "\u{1F4CB}", category: "traditions" },
  { id: 24, text: "Cooking Sundays", emoji: "\u{1F373}", category: "traditions" },
  { id: 25, text: "Date night every Friday", emoji: "\u{1F4C5}", category: "traditions" },

  // Milestones (6)
  { id: 26, text: "Moved in together", emoji: "\u{1F3E0}", category: "milestones" },
  { id: 27, text: "Got a pet together", emoji: "\u{1F436}", category: "milestones" },
  { id: 28, text: "Met each other's best friend", emoji: "\u{1F91D}", category: "milestones" },
  { id: 29, text: "Survived a challenge", emoji: "\u{1F4AA}", category: "milestones" },
  { id: 30, text: "Celebrated 1 year", emoji: "\u{1F382}", category: "milestones" },
  { id: 31, text: "Said 'I do' or will", emoji: "\u{1F492}", category: "milestones" },

  // Dreams (6)
  { id: 32, text: "Vacation abroad", emoji: "\u{1F30D}", category: "dreams" },
  { id: 33, text: "Build a home", emoji: "\u{1F3D8}", category: "dreams" },
  { id: 34, text: "Start a family", emoji: "\u{1F476}", category: "dreams" },
  { id: 35, text: "Grow old together", emoji: "\u{1F474}", category: "dreams" },
  { id: 36, text: "Celebrate 10 years", emoji: "\u{1F3AF}", category: "dreams" },
  { id: 37, text: "Retire together", emoji: "\u{2615}", category: "dreams" },
];

const GRID_SIZE = 5;
const TOTAL_CELLS = 25;
const FREE_SPACE_INDEX = 12;

export default function RelationshipBingo() {
  const router = useRouter();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [marked, setMarked] = useState<boolean[]>(Array(TOTAL_CELLS).fill(false));
  const [isInitialized, setIsInitialized] = useState(false);
  const [customMilestones, setCustomMilestones] = useState<Milestone[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<string>('firsts');
  const [showShare, setShowShare] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const getNextId = useCallback(() => {
    const all = [...DEFAULT_MILESTONES, ...customMilestones];
    return all.length > 0 ? Math.max(...all.map(m => m.id)) + 1 : 1;
  }, [customMilestones]);

  const generateCard = useCallback(() => {
    const defaultShuffled = [...DEFAULT_MILESTONES].sort(() => Math.random() - 0.5);
    const customShuffled = [...customMilestones].sort(() => Math.random() - 0.5);

    const selectedDefault = defaultShuffled.slice(0, 22);
    const selectedCustom = customShuffled.slice(0, 2);

    const combined = [...selectedDefault, ...selectedCustom].sort(() => Math.random() - 0.5);

    const freeSpace: Milestone = {
      id: -1,
      text: 'Together',
      emoji: '❤️',
      category: 'milestones',
    };

    const grid: Milestone[] = [];
    for (let i = 0; i < TOTAL_CELLS; i++) {
      if (i === FREE_SPACE_INDEX) {
        grid.push(freeSpace);
      } else {
        grid.push(combined[i < FREE_SPACE_INDEX ? i : i - 1]);
      }
    }

    setMilestones(grid);
    setMarked(Array(TOTAL_CELLS).fill(false));
    const newMarked = [...Array(TOTAL_CELLS).fill(false)];
    newMarked[FREE_SPACE_INDEX] = true;
    setMarked(newMarked);
    setIsInitialized(true);
  }, [customMilestones]);

  const toggleCell = (index: number) => {
    if (index === FREE_SPACE_INDEX) return;
    setMarked(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const getMarkedCount = () => marked.filter(m => m).length;
  const getCompletionPercent = () => Math.round((getMarkedCount() / TOTAL_CELLS) * 100);

  const getCategoryStats = () => {
    const stats: Record<string, { total: number; marked: number }> = {};
    for (const cat of Object.keys(CATEGORIES)) {
      stats[cat] = { total: 0, marked: 0 };
    }
    milestones.forEach((m, i) => {
      if (i === FREE_SPACE_INDEX) return;
      if (m.category in stats) {
        stats[m.category].total++;
        if (marked[i]) stats[m.category].marked++;
      }
    });
    return stats;
  };

  const getLevelInfo = (percent: number) => {
    if (percent >= 90) return { level: 'Soulmates', emoji: '\u{1F495}', color: 'text-pink-600' };
    if (percent >= 70) return { level: 'Power Couple', emoji: '\u{1F4AA}', color: 'text-violet-600' };
    if (percent >= 50) { return { level: 'Going Strong', emoji: '\u{1F525}', color: 'text-orange-500' }; }
    if (percent >= 25) return { level: 'Building Memories', emoji: '\u{1F33F}', color: 'text-emerald-600' };
    return { level: 'Just Started', emoji: '\u{1F31F}', color: 'text-sky-600' };
  };

  const addCustomMilestone = () => {
    if (!newText.trim()) return;
    const milestone: Milestone = {
      id: getNextId(),
      text: newText.trim(),
      emoji: '⭐',
      category: newCategory as Milestone['category'],
    };
    setCustomMilestones(prev => [...prev, milestone]);
    setNewText('');
    setShowAddForm(false);
  };

  const removeCustomMilestone = (id: number) => {
    setCustomMilestones(prev => prev.filter(m => m.id !== id));
  };

  const resetCard = () => {
    setIsInitialized(false);
    setMilestones([]);
    setMarked(Array(TOTAL_CELLS).fill(false));
  };

  const getShareText = () => {
    const level = getLevelInfo(getCompletionPercent());
    const checkedItems = milestones
      .filter((m, i) => i !== FREE_SPACE_INDEX && marked[i])
      .map(m => `${m.emoji} ${m.text}`);

    return `\u{1F3C4} Relationship Milestone Bingo \u{1F3C4}\n` +
      `${level.emoji} Level: ${level.level} (${getCompletionPercent()}%)\n` +
      `Progress: ${getMarkedCount()}/${TOTAL_CELLS} milestones experienced!\n\n` +
      (checkedItems.length > 0 ? `Experienced:\n${checkedItems.join('\n')}` : 'No milestones marked yet.');
  };

  const copyShareText = async () => {
    try {
      await navigator.clipboard.writeText(getShareText());
      setShowShare(true);
      setTimeout(() => setShowShare(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = getShareText();
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setShowShare(true);
      setTimeout(() => setShowShare(false), 2000);
    }
  };

  const categoryStats = getCategoryStats();
  const levelInfo = getLevelInfo(getCompletionPercent());

  return (
    <PremiumBackground>
      <div className="min-h-screen pb-20">
        {/* Nav */}
        <nav className="relative z-50">
          <div className="glass-strong border-b border-white/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                  <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-white/60 transition">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 text-white" fill="white" />
                    </div>
                    <span className="font-display font-black text-xl gradient-text hidden sm:block">Love Dove</span>
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-500" />
                  <span className="font-bold text-gray-700">Milestone Bingo</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {/* Idle State */}
          {!isInitialized && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="text-7xl mb-6">{levelInfo.emoji}</div>
              <h1 className="text-4xl font-display font-black text-gray-900 mb-4">
                Relationship Milestone Bingo
              </h1>
              <p className="text-gray-600 mb-8 text-lg">
                Mark off milestones you and your partner have experienced together!
              </p>

              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-8 text-left">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" /> How to Play
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-lg">1.</span>
                    <span>Generate your bingo card with relationship milestones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">2.</span>
                    <span>Click any milestone you and your partner have experienced</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">3.</span>
                    <span>Track your progress across 5 romantic categories</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-lg">4.</span>
                    <span>Discover your relationship level and share with friends!</span>
                  </li>
                </ul>

                <div className="mt-5 pt-4 border-t border-pink-100">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(CATEGORIES).map(([key, cat]) => (
                      <span key={key} className={`px-3 py-1 rounded-full text-xs font-bold ${cat.bgColor} ${cat.color}`}>
                        {cat.emoji} {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Custom milestones preview */}
              {customMilestones.length > 0 && (
                <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-6 text-left">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" /> Custom Milestones
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {customMilestones.map(m => (
                      <span key={m.id} className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs font-medium text-amber-800">
                        {m.emoji} {m.text}
                        <button
                          onClick={() => removeCustomMilestone(m.id)}
                          className="ml-1 text-amber-400 hover:text-amber-600"
                        >
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <button onClick={generateCard} className="px-10 py-4 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  <Sparkles className="w-5 h-5 inline mr-2" /> Generate My Card
                </button>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-8 py-3 bg-white/70 rounded-2xl font-bold text-gray-700 hover:bg-white transition text-sm"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  {showAddForm ? 'Cancel' : 'Add Custom Milestone'}
                </button>
              </div>

              <AnimatePresence>
                {showAddForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 text-left overflow-hidden"
                  >
                    <h3 className="font-bold text-gray-900 mb-4">Add Your Own Milestone</h3>
                    <input
                      type="text"
                      value={newText}
                      onChange={e => setNewText(e.target.value)}
                      placeholder="e.g., First concert together"
                      className="w-full px-4 py-3 rounded-xl border border-pink-200 bg-white/80 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-300 mb-3"
                      onKeyDown={e => e.key === 'Enter' && addCustomMilestone()}
                    />
                    <div className="flex gap-2 mb-4">
                      {Object.entries(CATEGORIES).map(([key, cat]) => (
                        <button
                          key={key}
                          onClick={() => setNewCategory(key)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition ${
                            newCategory === key
                              ? `${cat.bgColor} ${cat.color} border-current`
                              : 'bg-white border-gray-200 text-gray-500'
                          }`}
                        >
                          {cat.emoji} {cat.name}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={addCustomMilestone}
                      disabled={!newText.trim()}
                      className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Milestone
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Playing State */}
          {isInitialized && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Progress Section */}
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-bold text-gray-700">
                      {getMarkedCount()}/{TOTAL_CELLS} milestones
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${levelInfo.color}`}>
                      {levelInfo.emoji} {levelInfo.level}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-3 bg-pink-100 rounded-full overflow-hidden mb-2">
                  <motion.div
                    className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${getCompletionPercent()}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span className="font-bold text-rose-600">{getCompletionPercent()}% complete</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-5 mb-6">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-amber-500" /> Category Progress
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(CATEGORIES).map(([key, cat]) => {
                    const stat = categoryStats[key];
                    const percent = stat.total > 0 ? Math.round((stat.marked / stat.total) * 100) : 0;
                    return (
                      <div key={key} className={`flex items-center gap-3 p-3 rounded-xl border ${cat.bgColor}`}>
                        <span className="text-xl">{cat.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-xs font-bold ${cat.color} truncate`}>{cat.name}</span>
                            <span className="text-xs font-bold text-gray-600">{stat.marked}/{stat.total}</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-current"
                              style={{ color: cat.color }}
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bingo Grid */}
              <div className="mb-4">
                <div className="grid grid-cols-5 gap-2">
                  {milestones.map((milestone, index) => {
                    const isFreeSpace = index === FREE_SPACE_INDEX;
                    const isMarked = marked[index];
                    const catInfo = CATEGORIES[milestone.category] || CATEGORIES.firsts;

                    return (
                      <motion.button
                        key={index}
                        onClick={() => toggleCell(index)}
                        whileHover={!isFreeSpace ? { scale: 1.05 } : undefined}
                        whileTap={!isFreeSpace ? { scale: 0.95 } : undefined}
                        className={`relative aspect-square rounded-2xl p-1.5 sm:p-2 text-[10px] sm:text-xs font-bold transition-all border-2 flex flex-col items-center justify-center text-center leading-tight ${
                          isFreeSpace
                            ? 'bg-gradient-to-br from-rose-100 to-pink-100 border-rose-300 cursor-default'
                            : isMarked
                              ? 'bg-gradient-to-br from-rose-500 to-pink-500 text-white border-rose-600 shadow-md'
                              : 'bg-white/70 text-gray-700 border-pink-100 hover:bg-white hover:border-pink-300'
                        }`}
                      >
                        <span className="text-base sm:text-lg leading-none mb-0.5">{milestone.emoji}</span>
                        <span className="line-clamp-2">{milestone.text}</span>
                        {isMarked && !isFreeSpace && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center"
                          >
                            <span className="text-white text-[8px] font-black">&#10003;</span>
                          </motion.span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <span key={key} className={`px-3 py-1 rounded-full text-xs font-bold ${cat.bgColor} ${cat.color}`}>
                    {cat.emoji} {cat.name}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                <button
                  onClick={generateCard}
                  className="flex-1 min-w-[140px] px-6 py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-xl transition text-sm"
                >
                  <RotateCcw className="w-4 h-4 inline mr-1.5" /> New Card
                </button>
                <button
                  onClick={copyShareText}
                  className="flex-1 min-w-[140px] px-6 py-3.5 bg-white/70 rounded-2xl font-bold hover:bg-white transition text-sm text-gray-700"
                >
                  <Share2 className="w-4 h-4 inline mr-1.5" />
                  {showShare ? 'Copied!' : 'Share'}
                </button>
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="px-4 py-3.5 bg-white/70 rounded-2xl font-bold hover:bg-white transition text-sm text-gray-700"
                >
                  {showHelp ? 'Hide' : 'How to Play'}
                </button>
              </div>

              <AnimatePresence>
                {showHelp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 mb-6 overflow-hidden"
                  >
                    <h3 className="font-bold text-gray-900 mb-3">How to Play</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold">1.</span>
                        <span>Click any milestone your relationship has experienced</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold">2.</span>
                        <span>The FREE space (center) is automatically marked</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold">3.</span>
                        <span>Track progress by category and unlock relationship levels</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold">4.</span>
                        <span>Share your results with your partner or on social media</span>
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Achievement Banner */}
              {getCompletionPercent() >= 50 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-[2rem] shadow-xl p-6 text-center text-white mb-6"
                >
                  <div className="text-4xl mb-2">{levelInfo.emoji}</div>
                  <h3 className="text-xl font-black mb-1">{levelInfo.level}</h3>
                  <p className="text-white/90 text-sm">
                    {getCompletionPercent() >= 90
                      ? "You two are truly meant to be! Soulmates forever! \u{1F495}"
                      : getCompletionPercent() >= 70
                        ? "What a powerful couple! Keep building those beautiful memories! \u{1F4AA}"
                        : getCompletionPercent() >= 50
                          ? "Halfway there! You're going strong together! \u{1F525}"
                          : ''}
                  </p>
                </motion.div>
              )}

              {/* Summary Footer */}
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-5">
                <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" /> Your Milestones
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                  {milestones.map((m, i) => {
                    if (i === FREE_SPACE_INDEX) return null;
                    const catInfo = CATEGORIES[m.category] || CATEGORIES.firsts;
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs ${
                          marked[i]
                            ? `${catInfo.bgColor} ${catInfo.color}`
                            : 'bg-gray-50 border-gray-100 text-gray-400'
                        }`}
                      >
                        <span>{m.emoji}</span>
                        <span className="truncate">{m.text}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-pink-100 text-center">
                  <button
                    onClick={resetCard}
                    className="text-sm text-gray-500 hover:text-gray-700 transition font-medium"
                  >
                    Back to start
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </PremiumBackground>
  );
}
