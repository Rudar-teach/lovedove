const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'src', 'app', 'games');

const games = [
  {slug:'couplememory2',title:'Memory Cards',icon:'🎴',desc:'Match 12 pairs of love symbols',pairs:['💕','💖','💗','💓','💘','💝','❤️','🌹','💍','🎁','✨','🫶']},
  {slug:'lovewordsearch',title:'Word Search',icon:'🔎',desc:'Unscramble 10 love words',words:['LOVE','HEART','KISS','HUG','SOUL','DATE','DREAM','ROSE','CARE','TRUE']},
  {slug:'heartquiz',title:'Heart Quiz',icon:'💝',desc:'12 heart knowledge questions',qs:[{q:'Which organ pumps blood?',opts:['Brain','Heart','Lungs','Liver'],a:1},{q:'Heart attack symptom?',opts:['Headache','Chest pain','Sore throat','Cough'],a:1},{q:'Symbol of love?',opts:['Square','Triangle','Heart','Circle'],a:2},{q:'Average heartbeats per minute?',opts:['30','100','200','500'],a:1},{q:'Heart-healthy food?',opts:['Pizza','Salmon','Burger','Fries'],a:1},{q:'Heart emoji?',opts:['💙','❤️','💚','💛'],a:1},{q:'Heart chamber count?',opts:['2','3','4','5'],a:2},{q:'BPM stands for?',opts:['Beats Per Minute','Big Pink Man','Bacon Pizza','Banana Pudding'],a:0},{q:'Best heart check?',opts:['X-ray','ECG','MRI','CT scan'],a:1},{q:'Cardio means?',opts:['Card game','Heart exercise','Card type','Cardboard'],a:1},{q:'Color of love?',opts:['Blue','Red','Green','Yellow'],a:1},{q:'Healthy heart oil?',opts:['Butter','Olive oil','Lard','Margarine'],a:1}]},
  {slug:'couplecharades',title:'Couple Charades',icon:'🎭',desc:'Act out 16 romantic words!',words:['Kiss','Hug','Dance','Sing','Propose','Bake cake','Serenade','Slow dance','Jump for joy','Cry happy tears','Read love letter','Take selfie','Write poem','Send flower','Watch sunset','Pop the question']},
  {slug:'lovemath',title:'Love Math',icon:'➕',desc:'Solve math in 60 seconds!',math:true},
  {slug:'heartspelling',title:'Heart Spelling',icon:'✍️',desc:'Spell 12 love words',words:['LOVE','HEART','HUG','KISS','CARE','SOUL','ROSE','TRUE','MATE','SOAR','BEAM','GLOW']},
  {slug:'coupleriddles',title:'Couple Riddles',icon:'🧩',desc:'12 love riddles',qs:[{q:"I'm invisible but felt. I'm what people say when they care.",opts:['Love','Wind','Heat','Sound'],a:0},{q:'I have a head and tail but no body.',opts:['Snake','Coin','Worm','Pin'],a:1},{q:'The more you take, the more you leave behind.',opts:['Air','Footsteps','Memories','Time'],a:1},{q:'What has hands but cannot clap?',opts:['Statue','Clock','Robot','Monkey'],a:1},{q:'I speak without a mouth.',opts:['Ghost','Echo','Whistle','Song'],a:1},{q:'What can you catch but not throw?',opts:['Ball','Cold','Fish','Frisbee'],a:1},{q:'What has a heart but no organs?',opts:['Dog','Artichoke','Stone','Tree'],a:1},{q:'Word shorter when you add 2 letters?',opts:['Short','Brief','Small','Word'],a:0},{q:'Cities but no houses?',opts:['Map','Country','Globe','Atlas'],a:0},{q:'Starts with T and has T in it?',opts:['Teapot','T-Shirt','Tissue','Teeth'],a:0},{q:'Ring but no finger?',opts:['Phone','Coin','Saturn','Tree'],a:0},{q:"Share me and you haven't got me.",opts:['Love','Secret','Money','Time'],a:1}]},
  {slug:'loveemojiquiz',title:'Emoji Quiz',icon:'😀',desc:'Guess the movie!',qs:[{q:'🎬💔🚢',opts:['Titanic','Avatar','Inception','Matrix'],a:0},{q:'💋🕊️🍫',opts:['Bridget Jones','Forrest Gump','Ghost','Sleepless'],a:0},{q:'💍👰🤵',opts:['Wedding','Horror','Action','Sci-Fi'],a:0},{q:'🌹👨❤️👩',opts:['Romance','Comedy','Thriller','Mystery'],a:0},{q:'💌📮',opts:['Letter','Email','Text','Tweet'],a:0},{q:'🌙💋💫',opts:['Twilight','Eclipse','Sunrise','Dawn'],a:0},{q:'🕺💃❤️',opts:['Dirty Dancing','Horror','Sci-Fi','Mystery'],a:0},{q:'🏰👑',opts:['Royalty','Castle','Horror','Mystery'],a:0},{q:'💘🏹',opts:['Cupid','Archer','Horror','Mystery'],a:0},{q:'🌹❤️💔',opts:['Love story','Horror','Sci-Fi','Action'],a:0}]},
  {slug:'heartcolors',title:'Color Quiz',icon:'🎨',desc:'10 color questions',qs:[{q:'Color of love?',opts:['Blue','Red','Green','Yellow'],a:1},{q:'Color of peace?',opts:['White','Black','Red','Blue'],a:0},{q:'Color of jealousy?',opts:['Green','Blue','Red','Yellow'],a:0},{q:'Color of sadness?',opts:['Red','Blue','Green','Yellow'],a:1},{q:'Color of happiness?',opts:['Blue','Green','Yellow','Red'],a:2},{q:'Color of romance?',opts:['Pink','Blue','Green','Black'],a:0},{q:'Color of passion?',opts:['Blue','Red','Yellow','White'],a:1},{q:'Color of hope?',opts:['Yellow','Blue','Red','Black'],a:0},{q:'Color of trust?',opts:['Red','Blue','Green','Yellow'],a:1},{q:'Color of calm?',opts:['Red','Yellow','Blue','Pink'],a:2}]},
  {slug:'couplepatterns',title:'Pattern Memory',icon:'🎨',desc:'Memorize color patterns',pattern:true},
  {slug:'lovesequences',title:'Number Sequence',icon:'🔢',desc:'Find next number',qs:[{q:'2, 4, 6, 8, ?',opts:['10','9','12','11'],a:0},{q:'1, 1, 2, 3, 5, 8, ?',opts:['11','13','12','15'],a:1},{q:'3, 6, 9, 12, ?',opts:['14','15','16','18'],a:1},{q:'10, 20, 30, 40, ?',opts:['45','50','60','55'],a:1},{q:'1, 4, 9, 16, ?',opts:['20','25','30','36'],a:1},{q:'2, 4, 8, 16, ?',opts:['20','24','32','28'],a:2},{q:'100, 90, 80, 70, ?',opts:['60','50','65','55'],a:0},{q:'1, 3, 6, 10, ?',opts:['12','14','15','13'],a:2},{q:'5, 10, 15, 20, ?',opts:['22','25','30','24'],a:1},{q:'7, 14, 21, 28, ?',opts:['30','32','35','33'],a:2}]},
  {slug:'heartrhythm',title:'Heart Rhythm',icon:'💓',desc:'Tap to the beat!',rhythm:true},
];

for (const game of games) {
  const file = path.join(dir, game.slug, 'page.tsx');
  if (fs.existsSync(file)) { console.log('SKIP', file); continue; }

  let imp = "'use client';\nimport { useState";
  let st = "";
  let ui = "";

  if (game.pairs) {
    const p = game.pairs;
    imp += " } from 'react';\n";
    st = `
  const [cards, setCards] = useState<{id:number;icon:string;flipped:boolean;matched:boolean}[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const pairs = ${JSON.stringify(p)};
  const shuffle = () => {
    const all = [...pairs, ...pairs].sort(() => Math.random() - 0.5);
    setCards(all.map((icon, i) => ({id:i, icon, flipped:false, matched:false})));
    setMoves(0); setMatches(0);
  };
  const click = (i: number) => {
    if (cards[i].flipped || cards[i].matched || cards.filter(c => c.flipped).length === 2) return;
    const newCards = cards.map((card, idx) => idx === i ? {...card, flipped:true} : card);
    setCards(newCards);
    const fc = newCards.filter(c => c.flipped && !c.matched);
    if (fc.length === 2) {
      setTimeout(() => {
        if (fc[0].icon === fc[1].icon) {
          setCards(c => c.map(card => fc.some(f => f.id === card.id) ? {...card, matched:true} : card));
          setMatches(m => m + 1);
        } else {
          setCards(c => c.map(card => fc.some(f => f.id === card.id) ? {...card, flipped:false} : card));
        }
      }, 600);
    }
  };`;
    ui = `
      <div className="flex justify-center gap-4 mb-4">
        <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100"><p className="text-xs text-gray-500">Moves</p><p className="text-xl font-bold text-gray-800">{moves}</p></div>
        <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100"><p className="text-xs text-gray-500">Matches</p><p className="text-xl font-bold text-primary-600">{matches}/12</p></div>
      </div>
      <TiltCard intensity={5} glowColor="rgba(236,72,153,0.1)">
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-4">
          <div className="grid grid-cols-4 gap-2">
            {cards.map((card, i) => (<button key={card.id} onClick={() => click(i)} className={"aspect-square rounded-xl text-3xl flex items-center justify-center transition-all " + (card.flipped || card.matched ? 'bg-white shadow-md border-2 border-primary-200' : 'bg-gradient-to-br from-primary-400 to-rose-500 shadow-lg')}>{card.flipped || card.matched ? card.icon : '💕'}</button>))}
          </div>
        </div>
      </TiltCard>`;
  } else if (game.words && !game.qs) {
    const words = game.words;
    imp += " } from 'react';\n";
    st = `
  const [idx, setIdx] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [guess, setGuess] = useState('');
  const [phase, setPhase] = useState<'start'|'playing'|'result'>('start');
  const words = ${JSON.stringify(words)};
  const newWord = () => { setScrambled(words[idx].split('').sort(() => Math.random() - 0.5).join('')); setGuess(''); };
  const start = () => { setIdx(0); newWord(); setPhase('playing'); };
  const check = () => { if (guess.toUpperCase() === scrambled) { if (idx + 1 < words.length) { setIdx(i => i + 1); newWord(); } else setPhase('result'); } };`;
    ui = `
      <TiltCard intensity={5} glowColor="rgba(236,72,153,0.1)">
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 space-y-4">
          <p className="text-sm text-gray-500">Unscramble this word:</p>
          <div className="text-2xl font-mono font-bold text-center bg-pink-50 rounded-2xl py-4 border-2 border-dashed border-primary-200 tracking-widest">{scrambled}</div>
          <input value={guess} onChange={e => setGuess(e.target.value.toUpperCase())} placeholder="Type answer..." className="w-full text-center text-xl font-bold uppercase rounded-xl border-2 border-pink-200 p-3 focus:border-primary-400 outline-none" maxLength={scrambled.length} onKeyDown={e => e.key === 'Enter' && check()} />
          <Button onClick={check} variant="primary" className="w-full">Check</Button>
        </div>
      </TiltCard>
      <p className="text-center text-sm text-gray-500">Word {idx + 1} of ${words.length}</p>`;
  } else if (game.qs && !game.words) {
    const qs = game.qs;
    imp += " } from 'react';\n";
    st = `
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number|null>(null);
  const [phase, setPhase] = useState<'start'|'playing'|'result'>('start');
  const qs = ${JSON.stringify(qs)};
  const start = () => { setIdx(0); setScore(0); setSelected(null); setPhase('playing'); };
  const answer = (i: number) => { if (selected !== null) return; setSelected(i); if (i === qs[idx].a) setScore(s => s + 10); setTimeout(() => { if (idx + 1 >= qs.length) setPhase('result'); else { setIdx(i2 => i2 + 1); setSelected(null); } }, 1000); };`;
    ui = `
      <TiltCard intensity={5} glowColor="rgba(236,72,153,0.1)">
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 space-y-4">
          <div className="w-full bg-white/50 rounded-full h-2 border border-pink-100"><div className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-rose-500" style={{width: (((idx+1)/qs.length)*100)+'%'}}></div></div>
          <p className="text-lg font-semibold text-gray-800 text-center">{qs[idx].q}</p>
          <div className="grid grid-cols-1 gap-3">
            {qs[idx].opts.map((opt, i) => {
              let bg = 'bg-white border-gray-200 text-gray-700 hover:border-primary-300';
              if (selected !== null) { if (i === qs[idx].a) bg = 'bg-green-50 border-green-400 text-green-700'; else if (i === selected) bg = 'bg-red-50 border-red-400 text-red-700'; else bg = 'opacity-50 border-gray-200 text-gray-400'; }
              return <button key={i} onClick={() => answer(i)} disabled={selected !== null} className={"w-full text-left px-4 py-3 rounded-xl border-2 font-medium transition-all " + bg}>{String.fromCharCode(65+i)}. {opt}</button>;
            })}
          </div>
        </div>
      </TiltCard>`;
  } else if (game.math) {
    imp += ", useEffect, useRef } from 'react';\n";
    st = `
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [op, setOp] = useState('+');
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(60);
  const [phase, setPhase] = useState<'start'|'playing'|'result'>('start');
  const [guess, setGuess] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const next = () => {
    const x = Math.floor(Math.random() * 20) + 1;
    const y = Math.floor(Math.random() * 20) + 1;
    const ops = ['+','-','×'];
    setA(x); setB(y); setOp(ops[Math.floor(Math.random() * 3)]); setGuess('');
  };
  const answer = () => { if (parseInt(guess) === (op==='+'?a+b:op==='-'?a-b:a*b)) setScore(s => s + 10); next(); };
  const start = () => {
    setScore(0); setTime(60); setPhase('playing'); next();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTime(t => { if (t <= 1) { clearInterval(timerRef.current!); setPhase('result'); return 0; } return t - 1; }), 1000);
  };
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);`;
    ui = `
      <TiltCard intensity={5} glowColor="rgba(236,72,153,0.1)">
        <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 space-y-4">
          <div className="text-5xl font-bold text-center bg-pink-50 rounded-2xl py-4 border-2 border-dashed border-primary-200">{a} {op} {b} = ?</div>
          <input type="number" value={guess} onChange={e => setGuess(e.target.value)} onKeyDown={e => e.key === 'Enter' && answer()} className="w-full text-center text-3xl font-bold rounded-xl border-2 border-pink-200 p-3 focus:border-primary-400 outline-none" autoFocus />
          <Button onClick={answer} variant="primary" className="w-full" disabled={!guess}>Submit</Button>
        </div>
      </TiltCard>
      <div className="flex justify-center gap-4 mt-3">
        <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100"><p className="text-xs text-gray-500">Score</p><p className="text-xl font-bold text-primary-600">{score}</p></div>
        <div className="bg-white/70 backdrop-blur-xl rounded-xl px-4 py-2 shadow border border-pink-100"><p className="text-xs text-gray-500">Time</p><p className="text-xl font-bold text-gray-800">{time}s</p></div>
      </div>`;
  } else if (game.pattern) {
    imp += ", useEffect, useRef } from 'react';\n";
    st = `
  const [seq, setSeq] = useState<string[]>([]);
  const [userSeq, setUserSeq] = useState<string[]>([]);
  const [phase, setPhase] = useState<'start'|'show'|'input'|'result'>('start');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const colors = ['🔴','🟡','🟢','🔵'];
  const newSeq = (len: number) => {
    const s = Array.from({length: len}, () => colors[Math.floor(Math.random() * 4)]);
    setSeq(s); setUserSeq([]); setPhase('show');
    setTimeout(() => setPhase('input'), 1500 + len * 400);
  };
  const click = (c: string) => {
    if (phase !== 'input') return;
    const next = [...userSeq, c];
    setUserSeq(next);
    if (next[next.length - 1] !== seq[next.length - 1]) { setPhase('result'); return; }
    if (next.length === seq.length) { setScore(s => s + round * 10); setRound(r => r + 1); setTimeout(() => newSeq(round + 1), 1000); }
  };
  const start = () => { setScore(0); setRound(1); newSeq(3); };`;
    ui = `
      {phase === 'start' && (<div className="text-center py-8"><div className="text-6xl mb-4">🎨</div><p className="text-gray-600 mb-4">Memorize color patterns!</p><Button onClick={start} variant="primary" size="lg">Start 🎨</Button></div>)}
      {phase === 'show' && (<div className="text-center py-8"><p className="text-sm text-gray-500 mb-4">Memorize! Round {round}</p><div className="flex gap-3 justify-center">{seq.map((c,i) => (<motion.div key={i} initial={{scale:0}} animate={{scale:1}} transition={{delay:i*0.3}} className="text-5xl">{c}</motion.div>))}</div></div>)}
      {phase === 'input' && (<div className="text-center py-4"><p className="text-sm text-gray-500 mb-4">Your turn! Round {round}</p><div className="flex gap-3 justify-center mb-4">{colors.map(c => (<button key={c} onClick={() => click(c)} className="w-16 h-16 rounded-2xl text-3xl border-2 border-gray-200 hover:scale-110 transition-all">{c}</button>))}</div><div className="flex gap-1 justify-center min-h-[40px]">{userSeq.map((c,i) => (<span key={i} className="text-2xl">{c}</span>))}</div></div>)}
      {phase === 'result' && (<div className="text-center py-8 space-y-4"><div className="text-6xl">🏆</div><h2 className="text-2xl font-bold text-gray-800">Game Over!</h2><p className="text-xl text-gray-700 font-semibold">{score} pts · Round {round}</p><Button onClick={start} variant="primary">Play Again 🎨</Button></div>)}`;
  } else if (game.rhythm) {
    imp += ", useEffect, useRef } from 'react';\n";
    st = `
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<'start'|'playing'|'result'>('start');
  const [time, setTime] = useState(20);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const start = () => {
    setScore(0); setTime(20); setPhase('playing');
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setTime(t => { if (t <= 1) { clearInterval(timerRef.current!); setPhase('result'); return 0; } return t - 1; }), 1000);
  };
  const tap = () => { if (phase === 'playing') setScore(s => s + 1); };
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);`;
    ui = `
      {phase === 'start' && (<div className="text-center py-8"><div className="text-6xl mb-4">💓</div><p className="text-gray-600 mb-4">Tap the button!</p><Button onClick={start} variant="primary" size="lg">Start 💓</Button></div>)}
      {phase === 'playing' && (<div className="text-center py-8 space-y-4"><div className="text-6xl animate-pulse">💓</div><button onClick={tap} className="w-40 h-40 rounded-full bg-gradient-to-br from-primary-500 to-rose-500 text-white text-3xl font-bold shadow-2xl shadow-primary-500/40 hover:scale-105 active:scale-95 transition-all">TAP!</button><p className="text-lg text-gray-700 font-semibold">Score: {score} · Time: {time}s</p></div>)}
      {phase === 'result' && (<div className="text-center py-8 space-y-4"><div className="text-6xl">🏆</div><h2 className="text-2xl font-bold text-gray-800">Rhythm Master!</h2><p className="text-xl text-gray-700 font-semibold">{score} taps</p><Button onClick={start} variant="primary">Play Again 💓</Button></div>)}`;
  }

  const content = `${imp}
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PremiumBackground from '@/components/PremiumBackground';
import TiltCard from '@/components/3d/TiltCard';
import Button from '@/components/ui/Button';

export default function ${game.slug.charAt(0).toUpperCase() + game.slug.slice(1)}Page() {
${st}
  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/games"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700"/></button></Link>
            <h1 className="text-xl font-display font-black gradient-text-animated flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary-500"/> ${game.title}</h1>
            <div className="w-16"/>
          </div>
          <TiltCard intensity={5} glowColor="rgba(236, 72, 153, 0.1)">
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">${game.icon}</div>
                <h2 className="text-2xl font-display font-bold text-gray-800">${game.title}</h2>
                <p className="text-gray-600">${game.desc}</p>
              </div>
              ${ui}
            </div>
          </TiltCard>
        </div>
      </div>
    </PremiumBackground>
  );
}
`;
  fs.mkdirSync(path.join(dir, game.slug), { recursive: true });
  fs.writeFileSync(file, content);
  console.log('Created:', file);
}

console.log('\nDone! Created all games.');
