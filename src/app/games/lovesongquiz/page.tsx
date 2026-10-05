'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Share2, RotateCcw, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

interface SongQuestion {
  lyric: string;
  answer: string;
  artist: string;
  options: string[];
}

const QUESTIONS: SongQuestion[] = [
  // Bollywood
  { lyric: "Tum hi ho ab tum hi ho, zindagi ab tum hi ho", answer: "Tum Hi Ho", artist: "Arijit Singh", options: ["Tum Hi Ho", "Channa Mereya", "Ae Dil Hai Mushkil", "Tera Ban Jaunga"] },
  { lyric: "Pee loon tere peene do, main hoon tera raasta", answer: "Pehla Nasha", artist: "Udit Narayan", options: ["Tum Mile", "Pehla Nasha", "Dil Hai Chhota Sa", "Jaadu Hai Nasha"] },
  { lyric: "Channa mereya mereya, o channa mereya mereya", answer: "Channa Mereya", artist: "Arijit Singh", options: ["Channa Mereya", "Ae Dil Hai Mushkil", "Bulleya", "Gerua"] },
  { lyric: "Gerua tera rang, mujhe laage jaise koi prem ka geet", answer: "Gerua", artist: "Arijit Singh & Antara Mitra", options: ["Gerua", "Janam Janam", "Tum Saath Ho", "Dil Diyan Gallan"] },
  { lyric: "Jab tak hai jaan, jaan le chalenge hum", answer: "Jab Tak Hai Jaan", artist: "Javed Ali", options: ["Jab Tak Hai Jaan", "Muskurane", "Saware", "Tum Hi Ho"] },
  { lyric: "Malhari ane waali hai, tu bach ke rehna", answer: "Bajirao Mastani", artist: "Sanjay Leela Bansali", options: ["Malhari", "Deewani Mastani", "Pinga", "Mohe Rang De Laal"] },
  { lyric: "Muskurane ki wajah tum ho, gungunane ki wajah tum ho", answer: "Muskurane", artist: "Arijit Singh", options: ["Muskurane", "Rangreza", "Zara Zara", "Sunn Raha Hai"] },
  { lyric: "Dil hai chhota sa, chhoti si aasha", answer: "Dil Hai Chhota Sa", artist: "Alka Yagnik", options: ["Dil Hai Chhota Sa", "Do Dil Mil Rahe Hain", "Pehla Nasha", "Tum Mile"] },
  { lyric: "Kun faya kun, jo chahe tu woh kar", answer: "Kun Faya Kun", artist: "Javed Ali, Kailash Kher", options: ["Kun Faya Kun", "Arziyan", "Tum Ho", "Mannat"] },
  { lyric: "Iktara, iktara, chalta hai tu iktara", answer: "Iktara", artist: "Kailasa", options: ["Iktara", "Albela Sajan", "Manmohana", "Soona Soona"] },
  // Hollywood
  { lyric: "My heart will go on and on, like a bird that's flown away", answer: "My Heart Will Go On", artist: "Celine Dion", options: ["My Heart Will Go On", "I Will Always Love You", "Unchained Melody", "Can't Help Falling in Love"] },
  { lyric: "Cause all of me loves all of you, you're my end and my beginning", answer: "All of Me", artist: "John Legend", options: ["All of Me", "Perfect", "Thinking Out Loud", "Just the Way You Are"] },
  { lyric: "Can't help falling in love with you, shall I stay? Would it be a sin?", answer: "Can't Help Falling in Love", artist: "Elvis Presley", options: ["Can't Help Falling in Love", "At Last", "Unchained Melody", "The Way You Look Tonight"] },
  { lyric: "Thinking out loud, that we were meant to be, I'm thinking out loud", answer: "Thinking Out Loud", artist: "Ed Sheeran", options: ["Thinking Out Loud", "Perfect", "All of Me", "At Last"] },
  { lyric: "You are the best thing that ever happened to me, I'd catch a grenade for you", answer: "Grenade", artist: "Bruno Mars", options: ["Grenade", "Just the Way You Are", "Perfect", "Marry You"] },
  { lyric: "I just wanna be your everything, don't you know you're my everything", answer: "Your Everything", artist: "Andy Gibb", options: ["Your Everything", "Endless Love", "Hero", "Truly Madly Deeply"] },
  { lyric: "You're beautiful, it's true, I saw your face in a crowded place", answer: "Beautiful", artist: "Christina Aguilera", options: ["Beautiful", "My Girl", "At Last", "Kiss from a Rose"] },
  { lyric: "Kiss the girl, she's been waiting for you, don't be shy", answer: "Kiss the Girl", artist: "The Little Mermaid", options: ["Kiss the Girl", "A Whole New World", "Beauty and the Beast", "Can You Feel the Love Tonight"] },
  { lyric: "Ain't no mountain high enough, ain't no valley low enough", answer: "Ain't No Mountain High Enough", artist: "Marvin Gaye & Tammi Terrell", options: ["Ain't No Mountain High Enough", "Endless Love", "I Just Called", "Baby Love"] },
  { lyric: "La la la di da, I've been waiting all night for you to tell me you love me", answer: "La La La", artist: "Naughty Boy ft. Sam Smith", options: ["La La La", "Stay With Me", "Lay Me Down", "Too Good at Goodbyes"] },
  // Classics
  { lyric: "Fly me to the moon and let me play among the stars", answer: "Fly Me to the Moon", artist: "Frank Sinatra", options: ["Fly Me to the Moon", "Moon River", "Stardust", "Blue Moon"] },
  { lyric: "Let's do the time warp again, the transylvania transformation", answer: "Time Warp", artist: "The Rocky Horror Show", options: ["Time Warp", "Sweet Transvestite", "Dammit Janet", "I Can Make You a Man"] },
  { lyric: "Can't stop the feeling, just dance, dance, dance", answer: "Can't Stop the Feeling", artist: "Justin Timberlake", options: ["Can't Stop the Feeling", "Happy", "Uptown Funk", "Shake It Off"] },
  { lyric: "Unchained melody, oh my love, my darling, I've hungered for your touch", answer: "Unchained Melody", artist: "The Righteous Brothers", options: ["Unchained Melody", "Can't Help Falling in Love", "My All", "Kiss from a Rose"] },
  { lyric: "Sweet dreams are made of this, who am I to disagree?", answer: "Sweet Dreams", artist: "Eurythmics", options: ["Sweet Dreams", "Tainted Love", "True", "Video Killed the Radio Star"] },
  { lyric: "At last, my love has come along, my lonely days are over", answer: "At Last", artist: "Etta James", options: ["At Last", "Endless Love", "Stand by Your Man", "I Will Always Love You"] },
  { lyric: "Endless love, endless love, I want to share with you till the end of time", answer: "Endless Love", artist: "Diana Ross & Lionel Richie", options: ["Endless Love", "Islands in the Stream", "Ain't No Mountain", "Up Where We Belong"] },
  { lyric: "Truly, madly, deeply I am crazy about you", answer: "Truly Madly Deeply", artist: "Savage Garden", options: ["Truly Madly Deeply", "I Knew I Loved You", "Torn", "Breathe Again"] },
  { lyric: "Marry you, I'm gonna marry you, no matter what you do", answer: "Marry You", artist: "Bruno Mars", options: ["Marry You", "Just the Way You Are", "Count on Me", "You Belong with Me"] },
  { lyric: "Sign, sign, everywhere a sign, blocking out the scenery", answer: "Signs", artist: "Five Man Electrical Band", options: ["Signs", "Love Will Keep Us Together", "Afternoon Delight", "Dancing Queen"] },
  { lyric: "L-O-V-E, just spell it, L-O-V-E", answer: "L-O-V-E", artist: "Nat King Cole", options: ["L-O-V-E", "Unforgettable", "Mona Lisa", "Nature Boy"] },
  { lyric: "I just called to say I love you, I just called to say I care", answer: "I Just Called to Say I Love You", artist: "Stevie Wonder", options: ["I Just Called to Say I Love You", "Signed Sealed Delivered", "Superstition", "Isn't She Lovely"] },
  { lyric: "Kiss from a rose, on the grave, oh baby I compare you to a kiss from a rose", answer: "Kiss from a Rose", artist: "Seal", options: ["Kiss from a Rose", "Unchained Melody", "My All", "Endless Love"] },
  { lyric: "Come away with me in the night, come away with me", answer: "Come Away with Me", artist: "Norah Jones", options: ["Come Away with Me", "Don't Know Why", "Turn Me On", "Feelin' the Same Way"] },
  { lyric: "A thousand years, I'd love you for a thousand more", answer: "A Thousand Years", artist: "Christina Perri", options: ["A Thousand Years", "The Scientist", "Fix You", "Yellow"] },
  { lyric: "Let Her Go, you only need her when she's gone", answer: "Let Her Go", artist: "Passenger", options: ["Let Her Go", "Counting Stars", "Photograph", "Halo"] },
];

export default function LoveSongQuizPage() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [questions, setQuestions] = useState<SongQuestion[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const startQuiz = () => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, 10));
    setCurrent(0);
    setScore(0);
    setAnswered(false);
    setSelected(null);
    setShowResult(false);
    setStreak(0);
    setBestStreak(0);
    setQuizStarted(true);
  };

  const handleAnswer = (option: string) => {
    if (answered) return;
    setAnswered(true);
    setSelected(option);
    if (option === questions[current].answer) {
      setScore(s => s + 1);
      setStreak(st => {
        const ns = st + 1;
        setBestStreak(bs => Math.max(bs, ns));
        return ns;
      });
    } else {
      setStreak(0);
    }
    setTimeout(() => setShowResult(true), 400);
  };

  const next = () => {
    if (current + 1 >= questions.length) {
      setQuizStarted(false);
    } else {
      setCurrent(c => c + 1);
      setAnswered(false);
      setSelected(null);
      setShowResult(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  if (!quizStarted) {
    return (
      <PremiumBackground>
        <div className="min-h-screen py-8 px-4">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-8">
              <Link href="/games">
                <button className="p-2 hover:bg-white rounded-full transition-colors">
                  <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
              </Link>
              <h1 className="text-3xl font-display font-black gradient-text-animated flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary-500" />
                Love Song Quiz
              </h1>
              <div className="w-10" />
            </div>

            <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                <div className="text-6xl mb-4">🎵</div>
                <h2 className="text-2xl font-display font-bold text-gray-800">Guess the Love Song!</h2>
                <p className="text-gray-600">10 questions from Bollywood, Hollywood &amp; Classic love songs</p>
                <div className="flex justify-center gap-2 text-2xl">
                  <span>🇮🇳</span><span>🇺🇸</span><span>🎵</span>
                </div>
                <Button onClick={startQuiz} variant="primary" size="lg" className="w-full">
                  Start Quiz 🎶
                </Button>
              </div>
            </TiltCard>

            <div className="text-center mt-4">
              <Button onClick={copyLink} variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-1" /> Invite Friend
              </Button>
            </div>
          </div>
        </div>
      </PremiumBackground>
    );
  }

  if (current >= questions.length && !showResult) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <PremiumBackground>
        <div className="min-h-screen py-8 px-4">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-8">
              <Link href="/games">
                <button className="p-2 hover:bg-white rounded-full transition-colors">
                  <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
              </Link>
              <h1 className="text-3xl font-display font-black gradient-text-animated flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary-500" />
                Results
              </h1>
              <div className="w-10" />
            </div>
            <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
              <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8 text-center space-y-4">
                <div className="text-6xl mb-2">{pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '💕'}</div>
                <h2 className="text-3xl font-display font-bold text-gray-800">
                  {pct >= 80 ? 'Music Maestro!' : pct >= 50 ? 'Great Taste!' : 'Keep Listening!'}
                </h2>
                <p className="text-xl text-gray-700 font-semibold">You got {score}/{questions.length} correct ({pct}%)</p>
                <p className="text-sm text-gray-500">Best streak: {bestStreak}</p>
                <Button onClick={startQuiz} variant="primary" size="lg" className="w-full">
                  Play Again 🎵
                </Button>
              </div>
            </TiltCard>
          </div>
        </div>
      </PremiumBackground>
    );
  }

  const q = questions[current];
  const isCorrect = selected === q.answer;

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/games">
              <button className="p-2 hover:bg-white rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-primary-500" /> Love Song Quiz
            </h1>
            <div className="text-sm font-bold text-gray-600">
              {score}/{current}
            </div>
          </div>

          {/* Progress */}
          <div className="w-full bg-white/50 rounded-full h-2 mb-4 border border-pink-100">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-rose-500"
              animate={{ width: `${((current) / questions.length) * 100}%` }}
            />
          </div>
          <p className="text-center text-sm text-gray-500 mb-4">
            Question {current + 1} of {questions.length}
          </p>

          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 space-y-5">
              {/* Lyric */}
              <div className="bg-gradient-to-r from-primary-50 to-rose-50 rounded-2xl p-5 border border-primary-100">
                <p className="text-lg font-medium text-gray-700 italic leading-relaxed">&ldquo;{q.lyric}&rdquo;</p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {q.options.map((opt, i) => {
                  let cls = 'bg-white border-gray-200 text-gray-700 hover:border-primary-300 hover:bg-primary-50/50';
                  if (answered) {
                    if (opt === q.answer) cls = 'bg-green-50 border-green-400 text-green-700';
                    else if (opt === selected) cls = 'bg-red-50 border-red-400 text-red-700';
                    else cls = 'opacity-50 border-gray-200 text-gray-400';
                  }
                  return (
                    <motion.button
                      key={i}
                      whileTap={answered ? {} : { scale: 0.98 }}
                      onClick={() => handleAnswer(opt)}
                      disabled={answered}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 font-medium transition-all ${cls}`}
                    >
                      <span className="mr-2 text-lg">{String.fromCharCode(65 + i)}.</span> {opt}
                    </motion.button>
                  );
                })}
              </div>

              {showResult && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {isCorrect ? (
                      <><CheckCircle className="w-6 h-6 text-green-500" /><span className="text-green-600 font-bold">Correct!</span></>
                    ) : (
                      <><XCircle className="w-6 h-6 text-red-500" /><span className="text-red-600 font-bold">{selected === q.answer ? 'Correct!' : 'Wrong!'}</span></>
                    )}
                  </div>
                  <div className="bg-pink-50 rounded-xl p-4 text-sm text-gray-600 space-y-1">
                    <p><Lightbulb className="w-4 h-4 inline mr-1 text-primary-500" /> <strong>Song:</strong> {q.answer}</p>
                    <p><strong>Artist:</strong> {q.artist}</p>
                  </div>
                  {streak > 2 && <p className="text-sm text-orange-500 font-semibold">🔥 {streak}x Streak!</p>}
                  <Button onClick={next} variant="primary" className="w-full">
                    {current + 1 < questions.length ? 'Next Question ➡️' : 'See Results 🏆'}
                  </Button>
                </motion.div>
              )}
            </div>
          </TiltCard>

          <div className="flex justify-center mt-4">
            <Button onClick={copyLink} variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-1" /> Invite Friend
            </Button>
          </div>
        </div>
      </div>
    </PremiumBackground>
  );
}
