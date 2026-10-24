// Bollywood game definitions
// Each game has a type that the shared BollywoodGame component renders.

export type BollywoodGameType =
  | 'quiz'       // multiple choice questions
  | 'memory'     // card flip memory match
  | 'rhythm'     // tap to the beat
  | 'wouldRather' // pick one of two
  | 'spotTheDiff' // visual spot the difference
  | 'wordSearch' // word search grid
  | 'reaction'   // tap reaction timing
  | 'charades'   // act it out, partner guesses
  | 'story'      // build a story together
  | 'riddle';    // solve a riddle

export interface BollywoodGameDef {
  slug: string;
  name: string;
  tagline: string;
  type: BollywoodGameType;
  emoji: string;
  gradient: string;
  category: 'Movie' | 'Song' | 'Dance' | 'Romance' | 'Classic' | 'Family';
  description: string;
  content: BollywoodContent;
}

export interface BollywoodContent {
  questions?: BollywoodQuestion[];
  pairs?: BollywoodPair[];
  words?: string[];
  riddles?: BollywoodRiddle[];
  wouldRathers?: BollywoodWould[];
  rhythm?: BollywoodRhythm;
  diffPairs?: BollywoodDiff[];
  charades?: BollywoodCharade[];
  story?: BollywoodStoryStep[];
}

export interface BollywoodQuestion {
  q: string;
  options: string[];
  correct: number; // index
  hint?: string;
  funFact?: string;
}

export interface BollywoodPair {
  front: string;
  back: string;
  match: string; // same group key
}

export interface BollywoodRiddle {
  riddle: string;
  answer: string;
  hint: string;
}

export interface BollywoodWould {
  a: string;
  b: string;
  aWin: string;
  bWin: string;
}

export interface BollywoodRhythm {
  notes: number[]; // beat positions on a 16-step grid
  tempo: 'slow' | 'medium' | 'fast';
}

export interface BollywoodDiff {
  items: string[];
  diffs: number[]; // which indices differ
}

export interface BollywoodCharade {
  prompt: string;
  answer: string;
  hint?: string;
}

export interface BollywoodStoryStep {
  prompt: string;
  options: string[];
  nextKey: string;
}

export const BOLLYWOOD_GAMES: BollywoodGameDef[] = [
  // ---------------- MOVIE QUIZ ----------------
  {
    slug: 'bollywood-quiz',
    name: 'Bollywood Icon Quiz',
    tagline: 'Do you know the stars of Hindustan?',
    type: 'quiz',
    emoji: '🎬',
    gradient: 'from-amber-400 via-orange-500 to-red-600',
    category: 'Movie',
    description: 'A 10-question challenge about Bollywood icons from 1995 to today.',
    content: {
      questions: [
        { q: 'Who played the iconic role of Prem in DDLJ?', options: ['Shah Rukh Khan', 'Aamir Khan', 'Salman Khan', 'Akshay Kumar'], correct: 0, funFact: 'Shah Rukh Khan\'s first major hit.' },
        { q: 'Which movie introduced the famous "Jab meti hui teri aankhein" scene?', options: ['Kuch Kuch Hota Hai', 'Dilwale Dulhania Le Jayenge', 'Hum Dil De Chuke Sanam', 'Dil To Pagal Hai'], correct: 1, funFact: 'One of the most iconic DDLJ scenes.' },
        { q: 'What is the name of the main villain in Sholay?', options: ['Gabbar Singh', 'Mangal Singh', 'Veeru Singh', 'Kachhi Singh'], correct: 0, funFact: 'Amjad Khan\'s Gabbar Singh remains the most-quoted Indian villain.' },
        { q: 'Which actor is known as the "Badshah" (King) of Bollywood?', options: ['Amitabh Bachchan', 'Salman Khan', 'Shah Rukh Khan', 'Ranveer Singh'], correct: 0, funFact: 'Amitabh Bachchan earned the Badshah title in the 1970s.' },
        { q: 'What is the Hindi meaning of "Kuch Kuch Hota Hai"?', options: ['Everything happens', 'Love is real', 'Some things happen', 'Life is sweet'], correct: 2, funFact: 'The KHH song became a massive hit in 1998.' },
        { q: 'Which dance move is called the "Hungama Song" from Bhool Bhulaiyaa?', options: ['Item dance', 'Bhangra', 'Salsa', 'Slow motion'], correct: 0, funFact: 'Item numbers are popular short dance sequences.' },
        { q: 'Who directed 3 Idiots?', options: ['Rajkumar Hirani', 'Karan Johar', 'Amar Kaushik', 'Vishal Bhardwaj'], correct: 0, funFact: 'The film became one of the most-watched Indian films globally.' },
        { q: 'Which 2017 film is set during a cricket match?', options: ['Dangal', 'Lagaan', 'M.S. Dhoni', '2048'], correct: 0, funFact: 'Dangal is based on real wrestler Phogat Singh\'s life.' },
        { q: 'What color was the "Kala" (black) in Kahaani\'s setting?', options: ['Not relevant', 'Kolkata monsoon', 'Mumbai rain', 'Delhi dust'], correct: 1, funFact: 'Kahaani (2012) is set in Kolkata monsoon.' },
        { q: 'Who played the main female lead in Bajrangi Bhaijaan?', options: ['Kajol', 'Yashaswini Chhedaay', 'Anushka Sharma', 'Deepika Padukone'], correct: 1, funFact: 'Her character was a 16-year-old mute girl with Alzheimer\'s.' },
      ],
    },
  },
  {
    slug: 'bollywood-song-quiz',
    name: 'Gana Gano - Song Quiz',
    tagline: 'Name that tune! Bollywood songs only.',
    type: 'quiz',
    emoji: '🎵',
    gradient: 'from-pink-500 via-fuchsia-500 to-purple-600',
    category: 'Song',
    description: 'Listen to the hint, name the song. 8 rounds of pure Bollywood music.',
    content: {
      questions: [
        { q: '"Kuch Kuch Hota Hai" - who is the main singer?', options: ['Sonu Nigam', 'Lata Mangeshkar', 'Arijit Singh', 'Kumar Sanu'], correct: 0, funFact: 'Sonu Nigam is the top male playback singer of the 2000s.' },
        { q: 'Which movie did "Chaiyya Chaiyya" come from?', options: ['Dil Se', 'Kaho Naa Pyaar', 'Humphrey', 'Taap Si'], correct: 0, funFact: 'Shot on a real train in 1998, it was an instant classic.' },
        { q: 'A.R. Rahman is most famous for scoring which film?', options: ['Slumdog Millionaire', 'Dil Chahta', 'Dilwala', 'KGF'], correct: 0, funFact: 'He won two Oscars for Slumdog Millionaire (2009).' },
        { q: '"Kun Faya Kun" - which movie?', options: ['Bajirao Mastani', 'Rang De Basanti', 'Gangubai', 'Bunty Aur'], correct: 0, funFact: 'Alia Bhatt and Ranveer Singh, choreographed by Terence Lewis.' },
        { q: 'Who sang "Tera Naam Le Ke"?', options: ['Shreya Ghoshal', 'Sunidhi Chauhan', 'Alka Yagnik', 'Kajal'], correct: 0, funFact: 'From the 2004 film "Koi Mil Gaya" (Star Wars in Hindi).' },
        { q: '"Mere Dil Mein" from which movie?', options: ['Jab We Met', 'Hum Tum', 'Kal Ho', 'Woh'], correct: 0, funFact: 'Deepika Padukone starrer from 2007.' },
        { q: 'Pritam is known for music in which 2010s film?', options: ['Yeh Jawaani', 'Talaash', 'Baahubali', 'PK'], correct: 0, funFact: 'Yeh Jawaani Hai Deewani (2013) was his breakthrough.' },
        { q: '"Jai Ho" - which film?', options: ['Slumdog', 'Dilwala', 'KGF', 'Lagaan'], correct: 0, funFact: 'Also an Oscar-winning song.' },
      ],
    },
  },
  {
    slug: 'classic-bollywood',
    name: 'Golden Age Quiz',
    tagline: 'From 1960-1990: who were the legends?',
    type: 'quiz',
    emoji: '🏛️',
    gradient: 'from-yellow-600 via-amber-500 to-orange-700',
    category: 'Classic',
    description: 'Test your knowledge of Hindi film history: Meena Kumari, Asha Parekh, and more.',
    content: {
      questions: [
        { q: 'Who is called the "Nightingale of India"?', options: ['Lata Mangeshkar', 'Asha Bhosle', 'Suresh Wadkar', 'Kishore Kumar'], correct: 0, funFact: 'Lata recorded over 5,000 songs for hundreds of films.' },
        { q: 'Sholay (1975) is considered the most-grossing film in which language?', options: ['Hindi', 'Tamil', 'Telugu', 'Bengali'], correct: 0, funFact: 'It remained the highest-grossing Indian film for 37 years.' },
        { q: 'Which actress played "Mother" in countless 1970s films?', options: ['Waheeda Rahman', 'Asha Parekh', 'Kajal', 'Rehanna'], correct: 0, funFact: 'Waheeda was a pioneer of parallel cinema.' },
        { q: 'Mughal-e-Azam (1960) featured which famous scene?', options: ['Pratap Mardan', 'Jodha', 'Padmavati', 'Panchvati'], correct: 2, funFact: 'The baraat scene took 4 months to shoot.' },
        { q: 'Which film introduced "Mere Haq Se"?', options: ['Bobby', 'Deewar', 'Kohrra', 'Parde'], correct: 1, funFact: 'Shakuntala Dev\'s Deewar (1975) was a box-office smash.' },
        { q: 'The "Aashiqui" (1990) film made which star a superstar?', options: ['Uday Chopra', 'Aamir Khan', 'Shah Rukh Khan', 'Salman Khan'], correct: 2, funFact: 'Shah Rukh Khan\'s first hit, directed by Manoj Kumar.' },
        { q: 'Which song is the catchphrase of "Andaz Apna Apna"?', options: ['Khalnayak', 'Paheli', 'Golu', 'Bunty'], correct: 0, funFact: 'Sharma ji\'s "khalnayak" was the film\'s signature catchphrase.' },
        { q: 'Drishti: which 1995 film starred "Kajol" as a tomboy?', options: ['KBC', 'Pyaar', 'Lara', 'Kuch'], correct: 2, funFact: 'Kajol\'s Lara Croft-inspired role in Laraaband.' },
      ],
    },
  },
  // ---------------- MEMORY GAMES ----------------
  {
    slug: 'kuch-kuch-memory',
    name: 'Kuch Kuch Hota Hai - Memory',
    tagline: 'Match the song lyrics. How many do you know?',
    type: 'memory',
    emoji: '💞',
    gradient: 'from-pink-400 via-rose-500 to-red-500',
    category: 'Romance',
    description: 'A memory card game with KHH song lyrics and iconic characters.',
    content: {
      pairs: [
        { front: 'Kuch Kuch Hota Hai', back: 'Lyric', match: 'khh-1' },
        { front: 'Anu (Kajol)', back: 'Character', match: 'khh-2' },
        { front: 'Rahul (Salman)', back: 'Character', match: 'khh-3' },
        { front: 'Anil Kapoor', back: 'Villain', match: 'khh-4' },
        { front: 'Shankar Ehsan Loy', back: 'Composer', match: 'khh-5' },
        { front: '1998', back: 'Year', match: 'khh-6' },
        { front: 'Karan Johar', back: 'Director', match: 'khh-7' },
        { front: 'Zoya', back: 'Character', match: 'khh-8' },
      ],
    },
  },
  {
    slug: 'sholay-memory',
    name: 'Sholay - Memory Match',
    tagline: 'Match the icons of Indian cinema\'s biggest dacoit film.',
    type: 'memory',
    emoji: '🔫',
    gradient: 'from-stone-500 via-amber-700 to-stone-900',
    category: 'Classic',
    description: 'A memory match with Sholay\'s characters, famous lines, and locations.',
    content: {
      pairs: [
        { front: 'Veeru (Amjad Khan)', back: 'Character', match: 'sh-1' },
        { front: 'Gabbar Singh', back: 'Character', match: 'sh-2' },
        { front: 'Thakur (Sanjeev Kumar)', back: 'Character', match: 'sh-3' },
        { front: 'Basanti (Hema Malini)', back: 'Character', match: 'sh-4' },
        { front: 'Arre', back: 'Line', match: 'sh-5' },
        { front: '1975', back: 'Year', match: 'sh-6' },
        { front: 'Ramesh Sippy', back: 'Director', match: 'sh-7' },
        { front: 'Mohan Singh', back: 'Actor', match: 'sh-8' },
      ],
    },
  },
  {
    slug: 'romance-memory',
    name: 'Romance Memory',
    tagline: 'Match Bollywood couples with their films.',
    type: 'memory',
    emoji: '💕',
    gradient: 'from-rose-400 via-pink-500 to-fuchsia-500',
    category: 'Romance',
    description: 'Match iconic on-screen couples with the movie they starred in.',
    content: {
      pairs: [
        { front: 'SRK + Kajol', back: 'DDLJ', match: 'rm-1' },
        { front: 'Shahid + Amrita', back: 'K3G', match: 'rm-2' },
        { front: 'Ranveer + Alia', back: 'Goli', match: 'rm-3' },
        { front: 'Aamir + Kareena', back: 'Lage', match: 'rm-4' },
        { front: 'Hrithik + Priyanka', back: 'Kal Ho', match: 'rm-5' },
        { front: 'Salman + Rani', back: 'Hum Tum', match: 'rm-6' },
      ],
    },
  },
  // ---------------- RHYTHM GAMES ----------------
  {
    slug: 'dil-dil-rhythm',
    name: 'Dil Dil Dil - Rhythm',
    tagline: 'Tap to the beat of Chak De! India\'s anthem.',
    type: 'rhythm',
    emoji: '🏏',
    gradient: 'from-blue-600 via-cyan-500 to-emerald-500',
    category: 'Dance',
    description: 'A rhythm game synced to a 4-on-the-floor beat. Tap on every downbeat!',
    content: {
      rhythm: {
        notes: [0, 4, 8, 12],
        tempo: 'medium',
      },
    },
  },
  {
    slug: 'baraat-rhythm',
    name: 'Baraat Rhythm',
    tagline: 'Hit the dhol beats like a real wedding.',
    type: 'rhythm',
    emoji: '🥁',
    gradient: 'from-red-500 via-orange-500 to-yellow-500',
    category: 'Dance',
    description: 'A dhol-rhythm game. 4 beats per bar, get the bhangra groove right.',
    content: {
      rhythm: {
        notes: [0, 2, 4, 8, 10, 12],
        tempo: 'fast',
      },
    },
  },
  {
    slug: 'ghum-ghum-rhythm',
    name: 'Ghum Ghum Beats',
    tagline: 'A chill ghazal-tempo tap game for slow nights.',
    type: 'rhythm',
    emoji: '🌙',
    gradient: 'from-indigo-500 via-violet-600 to-purple-700',
    category: 'Song',
    description: 'A slower, mellow rhythm game. Perfect for a chill evening.',
    content: {
      rhythm: {
        notes: [0, 6, 12],
        tempo: 'slow',
      },
    },
  },
  // ---------------- WOULD RATHER ----------------
  {
    slug: 'would-rather-bollywood',
    name: 'Would You Rather? Bollywood',
    tagline: 'Pick your fate. One answer locks it in.',
    type: 'wouldRather',
    emoji: '⚡',
    gradient: 'from-purple-500 via-fuchsia-500 to-pink-500',
    category: 'Romance',
    description: 'A 6-round would-you-rather game with Bollywood-themed dilemmas.',
    content: {
      wouldRathers: [
        { a: 'A lead role in a Ranbir Kapoor film', b: 'A song in a Salman Khan film', aWin: 'You\'re dramatic & deep', bWin: 'You\'re a star' },
        { a: 'Watch 5 hours of DDLJ on repeat', b: 'Watch 2 hours of Sholay on repeat', aWin: 'Romantic soul', bWin: 'Action lover' },
        { a: 'Item dance number', b: 'Slow romantic dance', aWin: 'Party animal', bWin: 'Soulful lover' },
        { a: 'Get a cameo in a Karan Johar film', b: 'Lead in an A R Rahman film', aWin: 'Glamour', bWin: 'Artistry' },
        { a: 'Wedding in Udaipur', b: 'Wedding in Manali', aWin: 'Regal vibes', bWin: 'Mountain magic' },
        { a: 'Aamir Khan\'s disciplined actor', b: 'Shah Rukh\'s star power', aWin: 'Dedication', bWin: 'Charisma' },
      ],
    },
  },
  {
    slug: 'love-choices',
    name: 'Love Choices',
    tagline: 'What would you do? 8 spicy dilemmas.',
    type: 'wouldRather',
    emoji: '💔',
    gradient: 'from-red-400 via-rose-500 to-pink-600',
    category: 'Romance',
    description: 'Couples: answer together and see if you make the same choices.',
    content: {
      wouldRathers: [
        { a: 'Travel to Goa together', b: 'Stay home and make biryani', aWin: 'Adventurous', bWin: 'Cozy homebody' },
        { a: 'Surprise party for your partner', b: 'Quiet candlelight dinner', aWin: 'Big spender', bWin: 'Romantic' },
        { a: 'First trip abroad', b: 'First trip to Himalaya', aWin: 'Worldly', bWin: 'Spiritual' },
        { a: 'Watch a sad film together', b: 'Watch a comedy together', aWin: 'Deep', bWin: 'Fun' },
        { a: 'Surprise trip in secret', b: 'Plan the trip together', aWin: 'Romantic surprise', bWin: 'Team player' },
        { a: 'Share your phone', b: 'Have separate phones', aWin: 'Open book', bWin: 'Independent' },
        { a: 'A grand wedding', b: 'An intimate 10-person wedding', aWin: 'Celebration', bWin: 'Intimate' },
        { a: 'Gift: a song playlist', b: 'Gift: a handwritten letter', aWin: 'Modern', bWin: 'Classic' },
      ],
    },
  },
  {
    slug: 'couple-goals-choices',
    name: 'Couple Goals',
    tagline: 'Set a goal, pick how you do it.',
    type: 'wouldRather',
    emoji: '🎯',
    gradient: 'from-teal-400 via-emerald-500 to-green-600',
    category: 'Romance',
    description: 'What are you two actually going to do this year?',
    content: {
      wouldRathers: [
        { a: 'Learn to cook together', b: 'Order food together', aWin: 'Homemade', bWin: 'Pampered' },
        { a: 'Travel: road trip', b: 'Travel: flight', aWin: 'Slow & scenic', bWin: 'Fast & far' },
        { a: 'Movie night: Bollywood', b: 'Movie night: Hollywood', aWin: 'Local', bWin: 'Global' },
        { a: 'Fitness: gym together', b: 'Fitness: dance together', aWin: 'Iron', bWin: 'Groove' },
        { a: 'Save for a house', b: 'Save for a trip', aWin: 'Stable', bWin: 'Experiences' },
        { a: 'One big trip', b: 'Many small trips', aWin: 'Adventure', bWin: 'Frequent' },
      ],
    },
  },
  // ---------------- WORD SEARCH ----------------
  {
    slug: 'bollywood-words',
    name: 'Bollywood Word Hunt',
    tagline: 'Find 10 famous terms hidden in the grid.',
    type: 'wordSearch',
    emoji: '🔤',
    gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
    category: 'Classic',
    description: 'A word hunt with 10 Bollywood icons and terms scattered in a 10x10 grid.',
    content: {
      words: ['AMITABH', 'SRK', 'KOLKA', 'RAJA', 'BAAZAAR', 'SULTAN', 'MADRAS', 'DILWALA', 'KABRI', 'SHOLAY'],
    },
  },
  {
    slug: 'music-words',
    name: 'Music Legend Hunt',
    tagline: 'Find the top 10 singers hidden in the grid.',
    type: 'wordSearch',
    emoji: '🎤',
    gradient: 'from-violet-400 via-purple-500 to-fuchsia-600',
    category: 'Song',
    description: 'A word search challenge with legendary Indian singers.',
    content: {
      words: ['LATA', 'MUKESH', 'ASHA', 'SONU', 'KISHORE', 'ALKA', 'SHREYA', 'ARIJIT', 'PRAKASH', 'KAILASH'],
    },
  },
  // ---------------- RIDDLES ----------------
  {
    slug: 'bollywood-riddles',
    name: 'Bollywood Riddles',
    tagline: 'The riddles of Hindustan. Can you solve them all?',
    type: 'riddle',
    emoji: '🧠',
    gradient: 'from-amber-500 via-orange-600 to-red-700',
    category: 'Classic',
    description: 'Six riddles whose answers are all famous in Bollywood history.',
    content: {
      riddles: [
        { riddle: 'I have many names - Lata, Asha, Kishore. I make films sing. What am I?', answer: 'Playback singers', hint: 'Three legendary singers.' },
        { riddle: 'I was a hit in 1995 and 1999. I made SRK a star. Who am I?', answer: 'Baazigar & Dilwala', hint: 'Two SRK back-to-back hits.' },
        { riddle: 'I am the dacoit of Sholay. My famous catchphrase is "Kisi ki naakti"?', answer: 'Gabbar Singh', hint: 'Amjad Khan\'s role.' },
        { riddle: 'I have a white mustache, two swords, and a famous 1970 song. Who am I?', answer: 'Deewana (Rakesh)', hint: 'Rakesh\'s 1979 hit.' },
        { riddle: 'I am the most-grossing Indian film of the 1970s. I am a classic. What am I?', answer: 'Sholay', hint: '4 characters, one dacoit.' },
        { riddle: 'I turned Aamir into a superstar in 1993. I was a hit. What am I?', answer: 'Dilwala', hint: 'Aamir\'s first big hit.' },
      ],
    },
  },
  {
    slug: 'romance-riddles',
    name: 'Romance Riddles',
    tagline: 'Riddles about love, Hindi style.',
    type: 'riddle',
    emoji: '❤️',
    gradient: 'from-pink-500 via-rose-500 to-red-600',
    category: 'Romance',
    description: 'Four riddles whose answers are iconic love stories from Hindi film.',
    content: {
      riddles: [
        { riddle: 'I was a train, I had a window, I had a heart. Which movie am I?', answer: 'Koi Mil Gaya (2004)', hint: 'A train romance.' },
        { riddle: 'I am a song from 1998. I made everyone dance. Who am I?', answer: 'Kuch Kuch Hota Hai', hint: 'Karan Johar director.' },
        { riddle: 'I am a film that made "Tera Naam Le Ke" famous. What am I?', answer: 'Tera (2004)', hint: 'Kajal\'s 2004 hit.' },
        { riddle: 'I am a film where a woman travels 700 km to meet her love. What am I?', answer: 'DDLJ', hint: 'The most famous train romance.' },
      ],
    },
  },
  // ---------------- CHARADES ----------------
  {
    slug: 'bollywood-charades',
    name: 'Bollywood Charades',
    tagline: 'Act it out, your partner guesses. 6 rounds.',
    type: 'charades',
    emoji: '🎭',
    gradient: 'from-fuchsia-500 via-pink-500 to-rose-600',
    category: 'Dance',
    description: 'Pass-and-play charades. One partner acts, the other guesses the movie/actor.',
    content: {
      charades: [
        { prompt: 'Pretend you are Shah Rukh Khan on a train, declaring your love', answer: 'DDLJ (Prem)', hint: 'The most famous train scene ever.' },
        { prompt: 'Act like you are a dacoit in a village, shooting your gun', answer: 'Gabbar / Sholay', hint: 'The dacoit of Indian cinema.' },
        { prompt: 'Pretend you are dancing at a wedding, doing a bhangra', answer: 'Item Number / Wedding', hint: 'The high-energy dance sequence.' },
        { prompt: 'Act like you are Amitabh Bachchan delivering a dialogue, pointing your finger', answer: 'Deewar / Sharafe', hint: 'The angry, intense dialog delivery.' },
        { prompt: 'Pretend you are a hero in a slow-motion jump, landing with a hero pose', answer: 'Masala Action', hint: 'The classic slow-mo entry.' },
        { prompt: 'Act like you are crying, and then suddenly smiling', answer: 'Drama Queen / DDLJ scene', hint: 'The emotional shift.' },
      ],
    },
  },
  {
    slug: 'dance-moves',
    name: 'Dance Move Charades',
    tagline: 'Act the move, partner names the song.',
    type: 'charades',
    emoji: '💃',
    gradient: 'from-yellow-400 via-orange-500 to-red-500',
    category: 'Dance',
    description: 'Guess the famous Bollywood dance move or song just from an act-out.',
    content: {
      charades: [
        { prompt: 'Spin in a slow-motion, then freeze in a pose', answer: 'Goli Goli / Chup', hint: 'Ranveer Singh\'s signature spin.' },
        { prompt: 'Tap your foot, then point, then tap again', answer: 'Dhol / Baraat', hint: 'Wedding beat dance.' },
        { prompt: 'Slow lean forward, then backward, smiling', answer: 'Kuch Kuch / Hum Tum', hint: 'Slow-romantic lean.' },
        { prompt: 'Pretend to throw water, then laugh', answer: 'Monsoon / Bheegi', hint: 'Rain dance.' },
        { prompt: 'Act like you are climbing a mountain, looking back, calling out', answer: 'Jaanwar / Tera', hint: 'Himalayan call-back.' },
      ],
    },
  },
  // ---------------- STORY BUILDER ----------------
  {
    slug: 'love-story-builder-bolly',
    name: 'Bollywood Love Story',
    tagline: 'Build your own DDLJ-style romance, one choice at a time.',
    type: 'story',
    emoji: '📖',
    gradient: 'from-pink-400 via-fuchsia-500 to-purple-600',
    category: 'Romance',
    description: 'A 5-choice story. Your choices determine your Bollywood-style love arc.',
    content: {
      story: [
        { prompt: 'You meet your love interest at a train station. What do you do?', options: ['Stare and smile', 'Walk up and say hi', 'Sit on the bench and read'], nextKey: 'meet' },
        { prompt: 'At the first date, where do you go?', options: ['A small chai dhaba', 'A fancy restaurant', 'A park in the rain'], nextKey: 'date' },
        { prompt: 'They send you a song. Which song?', options: ['Kuch Kuch Hota Hai', 'Tera Naam Le Ke', 'Mere Dil Mein'], nextKey: 'song' },
        { prompt: 'A fight happens. What do you do?', options: ['Call immediately', 'Give them space', 'Write a letter'], nextKey: 'fight' },
        { prompt: 'The grand finale. Where does your story end?', options: ['At the wedding', 'At the airport', 'At the train station'], nextKey: 'end' },
      ],
    },
  },
  {
    slug: 'adventure-story',
    name: 'Sholay Adventure Story',
    tagline: 'A journey through the dacoit country. One path.',
    type: 'story',
    emoji: '🏜️',
    gradient: 'from-stone-400 via-amber-600 to-stone-800',
    category: 'Classic',
    description: 'A Sholay-style adventure. At every crossroads, choose. Three forks.',
    content: {
      story: [
        { prompt: 'You enter the dacoit hideout. What do you do first?', options: ['Hide behind a rock', 'Call out a challenge', 'Throw a stone'], nextKey: 'enter' },
        { prompt: 'The dacoit leader steps out. What is his line?', options: ['"Koi hain?"', '"Arre, kya kar rahe ho?"', '"Bhai, chala o?"'], nextKey: 'line' },
        { prompt: 'You escape. How?', options: ['On a horse', 'On foot through the desert', 'By a rope swing'], nextKey: 'escape' },
      ],
    },
  },
  // ---------------- SPOT THE DIFF ----------------
  {
    slug: 'bolly-diff',
    name: 'Spot the Bollywood Difference',
    tagline: 'Find the differences in two famous film posters.',
    type: 'spotTheDiff',
    emoji: '👀',
    gradient: 'from-indigo-400 via-blue-500 to-cyan-600',
    category: 'Classic',
    description: 'A visual spot-the-difference game with Bollywood poster scenes.',
    content: {
      diffPairs: [
        {
          items: ['🎬 Sholay Poster A: 3 figures, 2 horses, dacoit hut, sunset',
                  '🎬 Sholay Poster B: 3 figures, 2 horses, dacoit hut, sunset'],
          diffs: [2, 4],
        },
        {
          items: ['💫 KHH Poster A: Anu & Rahul, song, city skyline, 1998',
                  '💫 KHH Poster B: Anu & Rahul, song, city skyline, 1998'],
          diffs: [0, 5],
        },
        {
          items: ['🎶 Slumdog Poster A: slum, A.R. Rahman, Mumbai, 2008',
                  '🎶 Slumdog Poster B: slum, A.R. Rahman, Mumbai, 2008'],
          diffs: [1, 3],
        },
      ],
    },
  },
  // ---------------- REACTION GAMES ----------------
  {
    slug: 'reaction-test',
    name: 'Hero Reaction Test',
    tagline: 'How fast can you react like a Bollywood hero?',
    type: 'reaction',
    emoji: '⚡',
    gradient: 'from-yellow-400 via-orange-500 to-red-600',
    category: 'Dance',
    description: 'A pure speed-test game. Tap as fast as you can after the delay.',
    content: {},
  },
  {
    slug: 'hero-speed',
    name: 'Action Speed Test',
    tagline: 'Reflexes like a KGF hero?',
    type: 'reaction',
    emoji: '🏃',
    gradient: 'from-stone-500 via-red-700 to-stone-900',
    category: 'Classic',
    description: 'A lightning-speed tap game. Three attempts. Fastest one counts.',
    content: {},
  },
  // ---------------- MORE QUIZ GAMES ----------------
  {
    slug: 'heroines-quiz',
    name: 'Heroine Icon Quiz',
    tagline: 'From Srideevi to Alia — know the divas?',
    type: 'quiz',
    emoji: '👸',
    gradient: 'from-fuchsia-400 via-pink-500 to-rose-600',
    category: 'Movie',
    description: '8 questions about the greatest heroines in Bollywood history.',
    content: {
      questions: [
        { q: 'Who was the first actress to win the Filmfare Award for Best Actress?', options: ['Nargis', 'Waheeda', 'Meena Kumari', 'Sunehri'], correct: 0, funFact: 'Nargis won it in 1957 for "Bahu Ki Manzilloon".' },
        { q: 'Kajol & Shah Rukh starred in which 1998 hit?', options: ['Dil To Pagal', 'Dilwala', 'Kuch', 'Chal'], correct: 0, funFact: 'DDLJ — one of the most iconic duos.' },
        { q: 'Which actress played the lead in "Baghban" (2003)?', options: ['Tabu', 'Kajal', 'Srideevi', 'Kareena'], correct: 0, funFact: 'Aamir Khan and Tabu — both won for it.' },
        { q: 'Aishwarya Rai won the Miss World title in which year?', options: ['1994', '1995', '1993', '1996'], correct: 0, funFact: 'She was crowned Miss World in London 1994.' },
        { q: 'Which film made Priyanka Chopra an international star?', options: ['Don', 'Lara', 'The 33rd', 'Widow'], correct: 0, funFact: 'Don (2006) with John Abraham.' },
        { q: 'Deepika Padukone\'s first Bollywood film was?', options: ['Aisha', 'Fashion', 'Cocktail', 'Chennai'], correct: 0, funFact: 'Fashion (2009) with Nasser in the lead.' },
        { q: 'Who is called the "Bombay Girl" in Hindi cinema?', options: ['Kajol', 'Kareena', 'Zoya', 'Sunehri'], correct: 0, funFact: 'Kajol is famously a Mumbai-born Mumbai-raised star.' },
        { q: 'Which 2019 film had a "Dancing Villain" number?', options: ['Kesari', 'Rogebaa', 'Bunty', 'Jawaan'], correct: 0, funFact: 'The Kesari villain song became a hit.' },
      ],
    },
  },
  {
    slug: 'villains-quiz',
    name: 'Villain Master Quiz',
    tagline: 'Know the baddies of Hindustan?',
    type: 'quiz',
    emoji: '😈',
    gradient: 'from-gray-700 via-red-800 to-stone-900',
    category: 'Classic',
    description: '8 rounds on the most iconic villains in Indian cinema.',
    content: {
      questions: [
        { q: 'Who played Gabbar Singh in Sholay?', options: ['Amjad Khan', 'Kader Khan', 'Sanjeev', 'Mohan'], correct: 0, funFact: 'The most-quoted dacoit in Indian history.' },
        { q: 'The villain "Khalnayak" is from which film?', options: ['Aand', 'Hera', 'Andaz', 'Baazi'], correct: 0, funFact: 'Sharma ji\'s signature line from Andaz Apna Apna.' },
        { q: 'Amitabh Bachchan played a cop turned villain in which film?', options: ['Deewar', 'Sharafe', 'Deewana', 'Kala'], correct: 0, funFact: 'In Deewar he played a cop on the wrong side.' },
        { q: 'Saurabh Raj Jain is famous for villain roles in which series?', options: ['Khauff', 'Pataakha', 'Jagat', 'Pataak'], correct: 0, funFact: 'He built a villain persona across multiple web shows.' },
        { q: 'The "Black" villain was played by who?', options: ['Anurag', 'Fahadh', 'Pankaj', 'Mitesh'], correct: 0, funFact: 'A villain with a dark twist in a 2019 thriller.' },
        { q: 'Which 2019 film had a "Dancing Villain" number?', options: ['Kesari', 'Rogebaa', 'Bunty', 'Jawaan'], correct: 0, funFact: 'The Kesari villain song became a hit.' },
        { q: 'The "Dacoit" villain in a 2000s film was played by?', options: ['Akshaye', 'Kuldeeep', 'Pankaj', 'Rishi'], correct: 0, funFact: 'A villain with a dark twist in a 2000s hit.' },
        { q: 'The most-quoted villain line "Kya gaand mein deke dikhai" is from?', options: ['Sholay', 'Gulaab', 'Kahaani', 'Baazi'], correct: 0, funFact: 'Gabbar Singh\'s catchphrase.' },
      ],
    },
  },
  {
    slug: 'dialogue-quiz',
    name: 'Dialogue Quiz',
    tagline: 'Guess the movie from the line.',
    type: 'quiz',
    emoji: '💬',
    gradient: 'from-blue-500 via-indigo-600 to-purple-700',
    category: 'Movie',
    description: 'Famous lines. Match the dialogues to their movies.',
    content: {
      questions: [
        { q: 'The line "Jab meti hui teri aankhein" is from which film?', options: ['DDLJ', 'KHH', 'Hum Tum', 'Koi'], correct: 0, funFact: 'The most famous DDLJ line.' },
        { q: 'The line "Moghtazaf karo" is from which actor?', options: ['Amitabh Bachchan', 'Rajesh Khanna', 'Shah Rukh', 'Salman'], correct: 0, funFact: 'A famous Amitabh line from the 1970s.' },
        { q: 'The line "Kya kamaal hai" is a signature of which villain?', options: ['Gabbar', 'Khalnayak', 'Dadaji', 'Badshah'], correct: 0, funFact: 'A famous villain catchphrase.' },
        { q: 'The line "Mera naam Khan hai" is from which film?', options: ['Lage', 'Raone', 'KGF', 'Jawaan'], correct: 0, funFact: 'A famous Aamir Khan line from a 2007 film.' },
        { q: 'The line "Ishq ishq ishq, ab aaya ishq" is from which movie?', options: ['Hera Pheri', 'Andaz', 'Khalnayak', 'Bunty'], correct: 0, funFact: 'A famous romantic line.' },
        { q: 'The line "Kya gaand mein deke dikhai" is from which dacoit?', options: ['Gabbar', 'Veera', 'Mangal', 'Kachchi'], correct: 0, funFact: 'The most-quoted line from Sholay.' },
        { q: 'The line "Tujhe nahi chahiye koi" is from which song?', options: ['Tera (2004)', 'K3G', 'Woh', 'Lage'], correct: 0, funFact: 'A famous romantic song from 2004.' },
        { q: 'The line "Main tere liye hi hoon" is from which film?', options: ['Dilwala', 'K3G', 'Pyaar', 'Woh'], correct: 0, funFact: 'A famous line from a 2001 hit.' },
      ],
    },
  },
  {
    slug: 'movie-couples',
    name: 'Iconic Pairs',
    tagline: 'Match the famous on-screen couples.',
    type: 'memory',
    emoji: '💑',
    gradient: 'from-pink-500 via-rose-600 to-red-700',
    category: 'Romance',
    description: 'Memory match: match actors to the movies they appeared in together.',
    content: {
      pairs: [
        { front: 'Aamir + Kareena', back: 'Lage', match: 'mc-1' },
        { front: 'SRK + Kajol', back: 'DDLJ', match: 'mc-2' },
        { front: 'Ranveer + Alia', back: 'Goli', match: 'mc-3' },
        { front: 'Hrithik + Priyanka', back: 'Kal Ho', match: 'mc-4' },
        { front: 'Shahid + Amrita', back: 'K3G', match: 'mc-5' },
        { front: 'Salman + Sushmita', back: 'K3G2', match: 'mc-6' },
      ],
    },
  },
  {
    slug: 'bhangra-rhythm',
    name: 'Bhangra Rhythm',
    tagline: 'Hit the bhangra beat like a wedding pro.',
    type: 'rhythm',
    emoji: '🪘',
    gradient: 'from-red-500 via-orange-500 to-amber-500',
    category: 'Dance',
    description: 'A bhangra-tempo rhythm game. Fast, loud, full of energy.',
    content: {
      rhythm: { notes: [0, 2, 4, 6, 8, 10, 12], tempo: 'fast' },
    },
  },
  {
    slug: 'slow-dance',
    name: 'Slow Dance',
    tagline: 'A chill slow-tempo rhythm for late nights.',
    type: 'rhythm',
    emoji: '🌹',
    gradient: 'from-rose-400 via-pink-500 to-fuchsia-600',
    category: 'Romance',
    description: 'A slow-tempo rhythm game. Perfect for a quiet moment.',
    content: {
      rhythm: { notes: [0, 8], tempo: 'slow' },
    },
  },
  {
    slug: 'bolly-choices',
    name: 'Movie Choices',
    tagline: 'Which film would you pick? 8 rounds.',
    type: 'wouldRather',
    emoji: '🎬',
    gradient: 'from-amber-400 via-orange-500 to-red-600',
    category: 'Movie',
    description: 'Eight classic vs modern Bollywood choices.',
    content: {
      wouldRathers: [
        { a: 'Watch a 1975 dacoit film', b: 'Watch a 2023 action film', aWin: 'Classic soul', bWin: 'Modern fan' },
        { a: 'Slow-romantic period drama', b: 'High-energy item number', aWin: 'Deep', bWin: 'Energetic' },
        { a: 'Karan Johar love story', b: 'Rajkumar Hirani drama', aWin: 'Glamorous', bWin: 'Thoughtful' },
        { a: 'A film with a twist ending', b: 'A film with a happy ending', aWin: 'Plot twist lover', bWin: 'Happy ending' },
        { a: 'Aamir Khan\'s realism', b: 'Shah Rukh\'s romance', aWin: 'Artistic', bWin: 'Romantic' },
        { a: 'A period drama set in 1947', b: 'A modern thriller set in 2024', aWin: 'Historical', bWin: 'Contemporary' },
        { a: 'Watch the full original', b: 'Watch a remade version', aWin: 'Purist', bWin: 'Open to all' },
        { a: 'A film where the hero wins', b: 'A film where the villain wins', aWin: 'Good wins', bWin: 'Dark side' },
      ],
    },
  },
  {
    slug: 'dance-off',
    name: 'Dance Move Charades',
    tagline: 'Pantomime the move, partner names the song.',
    type: 'charades',
    emoji: '🕺',
    gradient: 'from-yellow-400 via-amber-500 to-orange-600',
    category: 'Dance',
    description: 'Six famous Bollywood dance moves. Act it out, guess the song.',
    content: {
      charades: [
        { prompt: 'Do the classic "Goli Goli" spin + freeze pose', answer: 'Goli Goli / Chup Chup', hint: 'Ranveer Singh\'s signature spin.' },
        { prompt: 'Tap-dance the bhangra beat with your feet', answer: 'Bhangra / Baraat Song', hint: 'The high-energy wedding beat.' },
        { prompt: 'Slow-romantic lean forward + eye contact', answer: 'Kuch Kuch / Hum Tum', hint: 'The slow-romantic lean.' },
        { prompt: 'Act like you are dancing in the rain, then spin', answer: 'Monsoon / Bheegi', hint: 'The famous rain dance.' },
        { prompt: 'Clap in rhythm, then spin, then pose', answer: 'Dil Dostana / Aaja', hint: 'The 2002 item number.' },
        { prompt: 'Do the classic "item girl" hip roll, slowly', answer: 'Kajra Re / Khol', hint: 'The 2006 item number.' },
      ],
    },
  },
  {
    slug: 'wedding-story',
    name: 'Baat Boli Wedding Story',
    tagline: 'Build a Bollywood-style wedding, one choice at a time.',
    type: 'story',
    emoji: '💒',
    gradient: 'from-pink-300 via-rose-400 to-fuchsia-500',
    category: 'Romance',
    description: 'A 4-choice wedding story. Your choices shape the baraat.',
    content: {
      story: [
        { prompt: 'Where does the wedding take place?', options: ['A haveli in Jaipur', 'A beach in Goa', 'A palace in Udaipur', 'A barn in Manali'], nextKey: 'venue' },
        { prompt: 'How does the baraat arrive?', options: ['A horse-drawn carriage', 'A dhol squad on foot', 'A decorated truck', 'A helicopter'], nextKey: 'baraat' },
        { prompt: 'What is the first song of the wedding?', options: ['Choli Ke Piche', 'Kajra Re', 'Baarish', 'Mehndi'], nextKey: 'song' },
        { prompt: 'What is the grand finale?', options: ['A firework display', 'A group dance', 'A slow song', 'A baraat procession'], nextKey: 'finale' },
      ],
    },
  },
  {
    slug: 'sholay-riddles',
    name: 'Sholay Riddles',
    tagline: 'Riddles from the classic dacoit film.',
    type: 'riddle',
    emoji: '🏜️',
    gradient: 'from-stone-400 via-amber-600 to-stone-800',
    category: 'Classic',
    description: 'Four riddles about the classic Sholay characters and scenes.',
    content: {
      riddles: [
        { riddle: 'I am a dacoit. My famous line is "Kya kamaal hai"? Who am I?', answer: 'Gabbar Singh', hint: 'Amjad Khan\'s most iconic role.' },
        { riddle: 'I am the thakur. I hire two heroes to find me. Who am I?', answer: 'Thakur', hint: 'Sanjeev Kumar\'s role.' },
        { riddle: 'I am a female character who is the daughter of the thakur. Who am I?', answer: 'Basanti', hint: 'Hema Malini\'s role.' },
        { riddle: 'I am the film that made a certain 1970s song famous. What am I?', answer: 'Sholay (1975)', hint: 'The most-grossing Indian film for 37 years.' },
      ],
    },
  },
  {
    slug: 'song-riddles',
    name: 'Song Riddles',
    tagline: 'Riddles about the greatest songs.',
    type: 'riddle',
    emoji: '🎶',
    gradient: 'from-violet-500 via-purple-600 to-fuchsia-700',
    category: 'Song',
    description: 'Four riddles whose answers are all classic Bollywood songs.',
    content: {
      riddles: [
        { riddle: 'I was a hit in 1998. I made everyone dance. What am I?', answer: 'Kuch Kuch Hota Hai', hint: 'Karan Johar\'s breakthrough.' },
        { riddle: 'I am a song from 2008. I am famous for a "Dil Dil Dil" line. What am I?', answer: 'Chak De! India', hint: 'Ankur Srivastava\'s film.' },
        { riddle: 'I was a 2010s hit. I made a certain dance move famous. What am I?', answer: 'Goli Goli', hint: 'Ranveer + Alia\'s wedding song.' },
        { riddle: 'I am a ghazal-style track. I make people cry. What am I?', answer: 'Tere Kyun (Koi Mil Gaya)', hint: 'The 2004 classic.' },
      ],
    },
  },
  {
    slug: 'item-number-memory',
    name: 'Item Number Memory',
    tagline: 'Match the song with the dancer.',
    type: 'memory',
    emoji: '💃',
    gradient: 'from-fuchsia-500 via-purple-600 to-indigo-700',
    category: 'Dance',
    description: 'Match iconic item numbers to the dancers who performed them.',
    content: {
      pairs: [
        { front: 'Kajra Re (2009)', back: 'Kajol', match: 'in-1' },
        { front: 'Chaki Chaki', back: 'Kajol', match: 'in-2' },
        { front: 'Jhoom', back: 'Esha', match: 'in-3' },
        { front: 'Mundian', back: 'Dil', match: 'in-4' },
        { front: 'Bachna', back: 'Kajol', match: 'in-5' },
        { front: 'Dance', back: 'Kajol', match: 'in-6' },
      ],
    },
  },
  {
    slug: 'bolly-trivia',
    name: 'Bollywood Trivia Battle',
    tagline: 'True or false — 8 rounds of film facts.',
    type: 'quiz',
    emoji: '🏆',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    category: 'Classic',
    description: 'A true/false trivia battle. How many facts do you get right?',
    content: {
      questions: [
        { q: 'Sholay is the most-grossing Indian film of the 1970s.', options: ['True', 'False'], correct: 0, funFact: 'It stayed on top for 37 years.' },
        { q: 'A.R. Rahman has won 2 Academy Awards.', options: ['True', 'False'], correct: 0, funFact: 'For Slumdog Millionaire (2009).' },
        { q: 'Lata Mangeshkar recorded over 5,000 songs.', options: ['True', 'False'], correct: 0, funFact: 'The highest-grossing playback singer of all time.' },
        { q: 'Kuch Kuch Hota Hai was released in 1998.', options: ['True', 'False'], correct: 0, funFact: 'Karan Johar\'s directorial debut.' },
        { q: 'Salman Khan started his career as a TV actor.', options: ['True', 'False'], correct: 0, funFact: 'He was on TV\'s "Malgudi Days" before film.' },
        { q: 'Veeru and Jai are the heroes of Sholay.', options: ['True', 'False'], correct: 0, funFact: 'Played by Amitabh Bachchan and Dharmendra.' },
        { q: 'The first Indian film to win an Oscar was "Mother India".', options: ['True', 'False'], correct: 0, funFact: 'Nargis starred in it. 1957.' },
        { q: 'The film "Agni Path" was the first to reach 100M box office.', options: ['True', 'False'], correct: 0, funFact: 'A 1980s hit that broke records.' },
      ],
    },
  },
  {
    slug: 'hero-charades',
    name: 'Hero Charades',
    tagline: 'Act the hero, partner guesses the star.',
    type: 'charades',
    emoji: '🤩',
    gradient: 'from-amber-500 via-orange-600 to-red-700',
    category: 'Classic',
    description: 'Pantomime famous Bollywood heroes. Six rounds.',
    content: {
      charades: [
        { prompt: 'Act like you are Amitabh Bachchan delivering an intense monologue, pointing your finger', answer: 'Amitabh / Sharafe', hint: 'The angry, intense dialog delivery.' },
        { prompt: 'Pretend to do the "Dilwala" slow-motion walk, then freeze', answer: 'Shah Rukh / DDLJ', hint: 'The most famous slow-mo hero entry.' },
        { prompt: 'Act like a dacoit, pulling a gun and pointing it playfully', answer: 'Gabbar / Sholay', hint: 'The classic dacoit stance.' },
        { prompt: 'Pretend to swing a boxing glove, like a heavyweight champ', answer: 'Akshay / Khiladi', hint: 'The action hero punch.' },
        { prompt: 'Act like a cop in a 1990s masala film, pointing and shouting', answer: 'Aamir / Dil', hint: 'The 1990s cop trope.' },
        { prompt: 'Pretend to be a super-star doing a signature pose at a press event', answer: 'SRK / Fan', hint: 'The super-star pose.' },
      ],
    },
  },
  {
    slug: 'dosti-quiz',
    name: 'Dosti Test',
    tagline: 'How strong is your bond? 8 friendship questions.',
    type: 'quiz',
    emoji: '🤝',
    gradient: 'from-emerald-400 via-green-500 to-teal-600',
    category: 'Family',
    description: 'A friendship challenge inspired by 3BHK and Dosti film culture.',
    content: {
      questions: [
        { q: 'The film "Dosti" (1994) starred which duo?', options: ['Amrish + Farooq', 'Rani + Srideevi', 'Shah + Kajol', 'Aamir + Kareena'], correct: 0, funFact: 'The classic 1994 friendship drama.' },
        { q: 'Which 3BHK character is famous for the line "Kaun kaun kaun"?', options: ['Raj', 'Kunal', 'Bhavesh', 'Chanchal'], correct: 0, funFact: 'The catchphrase from the TV series.' },
        { q: 'The film "Bunty Aur Bollbachchu" is about?', options: ['Two friends', 'A couple', 'Two villains', 'Two cops'], correct: 0, funFact: 'A 2003 friendship comedy.' },
        { q: 'Which TV show features four roommates?', options: ['3BHK', 'Sharma', 'Kaun', 'Kulfi'], correct: 0, funFact: 'The 2006 classic.' },
        { q: 'The famous friendship line "Dosti apna cheez hai" is from which film?', options: ['Dosti', 'Joey', '3BHK', 'Sharma'], correct: 0, funFact: 'The classic 1994 tagline.' },
        { q: 'Which actor is called the "Dosti King"?', options: ['Amitabh', 'Rajesh', 'Shah Rukh', 'Salman'], correct: 0, funFact: 'The 1970s actor known for friendship films.' },
        { q: 'The line "Tera dost hoon main" is from which film?', options: ['Dosti', 'K3G', 'DDLJ', 'Hera'], correct: 0, funFact: 'A classic 1990s line.' },
        { q: 'Which film has the famous "Dosti" duet?', options: ['Dosti', 'K3G', 'Pyaar', 'Woh'], correct: 0, funFact: 'The song became a friendship anthem.' },
      ],
    },
  },
  {
    slug: 'masala-choices',
    name: 'Masala Choices',
    tagline: 'Pick your side. 8 masala dilemmas.',
    type: 'wouldRather',
    emoji: '🌶️',
    gradient: 'from-red-500 via-orange-600 to-amber-700',
    category: 'Classic',
    description: 'Eight spicy masala-film dilemmas. No wrong answers.',
    content: {
      wouldRathers: [
        { a: 'A slow-mo hero entry', b: 'A fast-paced action sequence', aWin: 'Cinematic', bWin: 'Gritty' },
        { a: 'A song in the rain', b: 'A song at a rooftop', aWin: 'Romantic', bWin: 'Urban' },
        { a: 'A 1990s masala film', b: 'A 2020s parallel film', aWin: 'Nostalgic', bWin: 'Modern' },
        { a: 'An item number', b: 'A slow romantic song', aWin: 'Energetic', bWin: 'Soulful' },
        { a: 'A villain with a motive', b: 'A villain who is pure evil', aWin: 'Complex', bWin: 'Classic' },
        { a: 'A family drama', b: 'A romantic comedy', aWin: 'Deep', bWin: 'Light' },
        { a: 'A film with a twist ending', b: 'A film with a happy ending', aWin: 'Plot twist', bWin: 'Happy' },
        { a: 'Watch the full original', b: 'Watch the remake', aWin: 'Purist', bWin: 'Open' },
      ],
    },
  },
  {
    slug: 'parallel-choices',
    name: 'Parallel vs Mass',
    tagline: 'Pick your film lane. 6 rounds.',
    type: 'wouldRather',
    emoji: '🎥',
    gradient: 'from-indigo-500 via-blue-600 to-violet-700',
    category: 'Movie',
    description: 'Do you prefer the parallel cinema route or the mass route?',
    content: {
      wouldRathers: [
        { a: 'A parallel film like "Masaan"', b: 'A mass film like "Baahubali"', aWin: 'Artistic', bWin: 'Spectacle' },
        { a: 'A real-life based drama', b: 'A fictional action film', aWin: 'Grounded', bWin: 'Fantasy' },
        { a: 'A film with a social message', b: 'A film with pure entertainment', aWin: 'Thoughtful', bWin: 'Fun' },
        { a: 'A small-town setting', b: 'A big-city setting', aWin: 'Simple', bWin: 'Urban' },
        { a: 'A film with a female lead', b: 'A film with a male lead', aWin: 'Modern', bWin: 'Classic' },
        { a: 'A 2010s indie film', b: 'A 2000s blockbuster', aWin: 'Fresh', bWin: 'Nostalgic' },
      ],
    },
  },
  {
    slug: 'dacoit-adventure',
    name: 'Dacoit Adventure',
    tagline: 'A Sholay-style journey. 4 forks.',
    type: 'story',
    emoji: '🐎',
    gradient: 'from-amber-700 via-stone-700 to-stone-900',
    category: 'Classic',
    description: 'A Sholay-inspired adventure. Four crossroads, one path.',
    content: {
      story: [
        { prompt: 'You are on a horse, heading to the dacoit hideout. What do you do?', options: ['Ride fast', 'Ride slow and scout', 'Stop and rest'], nextKey: 'ride' },
        { prompt: 'You reach the village. What is the first thing you do?', options: ['Ask for water', 'Ask for food', 'Ask for directions'], nextKey: 'ask' },
        { prompt: 'A dacoit appears. What is your move?', options: ['Fight', 'Flee', 'Negotiate'], nextKey: 'fight' },
        { prompt: 'The escape. How do you get away?', options: ['On a horse', 'On foot', 'By boat'], nextKey: 'escape' },
      ],
    },
  },
];

export const getBollywoodGame = (slug: string) =>
  ALL_BOLLYWOOD_GAMES.find(g => g.slug === slug);

export const getBollywoodByType = (type: BollywoodGameType) =>
  ALL_BOLLYWOOD_GAMES.filter(g => g.type === type);

// ═══════════════════════════════════════════════════════════════
// NEW — 20 games (appended after BOLLYWOOD_GAMES array)
// ═══════════════════════════════════════════════════════════════

export const NEW_BOLLYWOOD_GAMES: BollywoodGameDef[] = [
  // ── MOVIE & FILM ───────────────────────────────────────────────
  {
    slug: 'masala-quiz',
    name: 'Masala Film Quiz',
    tagline: 'The ultimate masala movie test. 10 questions.',
    type: 'quiz',
    emoji: '🎞️',
    gradient: 'from-red-500 via-rose-600 to-red-800',
    category: 'Movie',
    description: '10 questions on classic masala films — who directed, which year, and iconic scenes.',
    content: {
      questions: [
        { q: 'Which 1995 masala film starred Shah Rukh Khan in his first big hit?', options: ['Baazigar', 'Dilwala', 'Kuch', 'Dil'], correct: 0, funFact: 'Baazigar (1993) was SRK\'s first major role.' },
        { q: 'The 1975 film "Sholay" was directed by?', options: ['Ramesh Sippy', 'Yash Chopra', 'Manoj', 'Sri'], correct: 0, funFact: 'Ramesh Sippy directed the all-time classic.' },
        { q: 'Which masala film featured the "Kuch Kuch Hota Hai" song?', options: ['Kuch', 'K3G', 'DDLJ', 'Hum'], correct: 0, funFact: 'The 1998 Karan Johar film of the same name.' },
        { q: 'Amitabh Bachchan\'s most famous 1970s role was in?', options: ['Deewar', 'Sharafe', 'Don', 'Kala'], correct: 0, funFact: 'Deewar (1975) cemented him as the Angrezi Badshah.' },
        { q: 'Which 2001 film was a Salman Khan masala hit?', options: ['Kistaani', 'K3G', 'Hum', 'Bhai'], correct: 0, funFact: 'Kistaani was a cult masala favorite.' },
        { q: 'The "Gully Boy" (2019) film was set in which city?', options: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'], correct: 0, funFact: 'A rapper\'s rise through Mumbai\'s underground scene.' },
        { q: 'Which 1990s film starred both Aamir and Kareena?', options: ['Lage', 'Dilwala', 'K3G', 'Raja'], correct: 0, funFact: 'Lage Raho (2007) was their first pairing.' },
        { q: 'The "Dada" (1999) film is famous for its?', options: ['Mass action', 'Romance', 'Comedy', 'Horror'], correct: 0, funFact: 'A 90s mass action cult classic.' },
        { q: 'Which 2017 masala film featured a train chase sequence?', options: ['Raone', 'Jawaan', 'Kesari', 'Bunty'], correct: 0, funFact: 'The 2017 masala action sequel.' },
        { q: 'The "Khauff" (2003) film was a horror sequel to?', options: ['K3G', 'K3', 'K3G2', 'K'], correct: 0, funFact: 'K3G\'s horror spinoff.' },
      ],
    },
  },
  {
    slug: 'slumdog-quiz',
    name: 'Slumdog Millionaire Quiz',
    tagline: 'Quiz from the Oscar-winning film.',
    type: 'quiz',
    emoji: '📺',
    gradient: 'from-amber-500 via-orange-600 to-amber-800',
    category: 'Movie',
    description: '8 questions about the life of the boy who made it to the quiz show.',
    content: {
      questions: [
        { q: 'What is the name of the main character in Slumdog Millionaire?', options: ['Raj', 'Rafi', 'Jami', 'Jama'], correct: 0, funFact: 'Raj is the 18-year-old who appears on India\'s Answer.' },
        { q: 'The film was set primarily in which Indian city?', options: ['Mumbai', 'Delhi', 'Kolkata', 'Chennai'], correct: 0, funFact: 'Mumbai\'s slums and quiz show stage.' },
        { q: 'The quiz show featured in the film is called?', options: ['India\'s Answer', 'KBC', 'Quiz', 'The Indian Answer'], correct: 0, funFact: 'A fictionalized version of a real Indian quiz show.' },
        { q: 'The film won how many Academy Awards?', options: ['8', '10', '12', '6'], correct: 0, funFact: 'It won 8 Oscars including Best Picture.' },
        { q: 'A.R. Rahman\'s score for the film featured which song?', options: ['Skyfall', 'Jai Ho', 'Kun Faya', 'Mere Dil'], correct: 1, funFact: 'Jai Ho also won an Oscar for Best Original Song.' },
        { q: 'The villain in the film is a?', options: ['Cop', 'Criminal', 'Teacher', 'Thakur'], correct: 0, funFact: 'A corrupt cop who exploits the slums.' },
        { q: 'The film is based on which novel?', options: ['Q&A', 'The Answer', 'Slumdog', '500 Words'], correct: 0, funFact: 'The original story is a short novel called "Q&A".' },
        { q: 'The final answer in the quiz show is?', options: ['The answer of the day', '10', '50', 'The last question'], correct: 0, funFact: 'The question he answers to win.' },
      ],
    },
  },
  {
    slug: '3-idiots-riddles',
    name: '3 Idiots Riddles',
    tagline: 'Riddles from the most-loved Indian comedy.',
    type: 'riddle',
    emoji: '🎓',
    gradient: 'from-sky-500 via-blue-600 to-indigo-700',
    category: 'Movie',
    description: '4 riddles inspired by 3 Idiots characters and famous lines.',
    content: {
      riddles: [
        { riddle: 'I am a character who always says "All is well"? Who am I?', answer: 'Rancho (Aamir Khan)', hint: 'The genius of the trio.' },
        { riddle: 'I am the strict professor? Who am I?', answer: 'Virus', hint: 'The strict professor.' },
        { riddle: 'I am the topper who is a copycat? Who am I?', answer: 'Chatur', hint: 'The topper of the class.' },
        { riddle: 'I am the quirky one of the trio? Who am I?', answer: 'Farhan', hint: 'The quirky one of the trio.' },
      ],
    },
  },
  {
    slug: 'villain-memory',
    name: 'Villain Match',
    tagline: 'Match the villain to their film.',
    type: 'memory',
    emoji: '🦹',
    gradient: 'from-gray-800 via-red-900 to-stone-950',
    category: 'Classic',
    description: 'Memory match: link famous Bollywood villains to their movies.',
    content: {
      pairs: [
        { front: 'Gabbar Singh', back: 'Sholay', match: 'v-1' },
        { front: 'Khalnayak', back: 'Andaz', match: 'v-2' },
        { front: 'Sardar', back: 'Hera', match: 'v-3' },
        { front: 'Badshah', back: 'Baazi', match: 'v-4' },
        { front: 'Dadaji', back: 'Dhadak', match: 'v-5' },
        { front: 'Kaanu', back: 'K3G', match: 'v-6' },
      ],
    },
  },
  {
    slug: 'hero-story',
    name: 'Hero\'s Love Story',
    tagline: 'A DDLJ-style romance. 5 choices.',
    type: 'story',
    emoji: '🚂',
    gradient: 'from-pink-500 via-rose-500 to-red-600',
    category: 'Romance',
    description: 'A 5-choice train romance. Your choices shape the love arc.',
    content: {
      story: [
        { prompt: 'You meet them on a train. What do you say first?', options: ['"Kahan jaate ho?"', '"Kaun ho tum?"', '"Mujhe accha lagta hai tumse baat karke"'], nextKey: 'first' },
        { prompt: 'The train stops at a small town. What do you do?', options: ['Get off together', 'Stay on the train', 'Go separately, meet at the destination'], nextKey: 'stop' },
        { prompt: 'They tell you their story. How do you react?', options: ['Listen intently', 'Laugh and joke', 'Get emotional'], nextKey: 'story' },
        { prompt: 'The final station is near. What is your last question?', options: ['"Kahan milenge dobara?"', '"Apna naam batao"', '"Kya yeh sach hua?"'], nextKey: 'last' },
        { prompt: 'The doors open. What happens?', options: ['They hold your hand', 'They run after you', 'You both miss each other'], nextKey: 'end' },
      ],
    },
  },

  // ── SONG & MUSIC ───────────────────────────────────────────────
  {
    slug: 'ghazal-rhythm',
    name: 'Ghazal Rhythm',
    tagline: 'A mellow slow-tempo tap game.',
    type: 'rhythm',
    emoji: '🎻',
    gradient: 'from-violet-500 via-purple-700 to-indigo-900',
    category: 'Song',
    description: 'A slow-tempo ghazal rhythm. Perfect for quiet nights.',
    content: {
      rhythm: { notes: [0, 8], tempo: 'slow' },
    },
  },
  {
    slug: 'dhol-rhythm',
    name: 'Dhol Beat',
    tagline: 'Fast dhol taps. 6 hits per bar.',
    type: 'rhythm',
    emoji: '🥁',
    gradient: 'from-orange-500 via-red-500 to-red-700',
    category: 'Dance',
    description: 'A fast dhol rhythm game. Hit every beat for the perfect bhangra groove.',
    content: {
      rhythm: { notes: [0, 2, 4, 6, 8, 10], tempo: 'fast' },
    },
  },
  {
    slug: 'lyric-word-search',
    name: 'Lyric Word Hunt',
    tagline: 'Find 10 famous song words hidden in the grid.',
    type: 'wordSearch',
    emoji: '📜',
    gradient: 'from-fuchsia-500 via-pink-600 to-rose-700',
    category: 'Song',
    description: 'A word search challenge with famous Bollywood song lyrics and terms.',
    content: {
      words: ['MOHABBAT', 'KISHORE', 'LATA', 'ASHA', 'SONU', 'KAILASH', 'ANU', 'DIL', 'HAR', 'YAAD'],
    },
  },
  {
    slug: 'song-charades',
    name: 'Song Charades',
    tagline: 'Act the song, partner names it. 6 rounds.',
    type: 'charades',
    emoji: '🎤',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-600',
    category: 'Song',
    description: 'Pantomime a song title. Your partner guesses it.',
    content: {
      charades: [
        { prompt: 'Pretend to be a train moving, then stop at a station', answer: 'Tera / Train Song', hint: 'A famous train journey song.' },
        { prompt: 'Do the "Dil Dostana" slow-motion walk', answer: 'Dil Dostana (2002)', hint: 'The 2002 item number.' },
        { prompt: 'Pretend to be in the rain, spinning and laughing', answer: 'Monsoon / Bheegi', hint: 'The rain dance.' },
        { prompt: 'Act like you are dancing at a wedding, fast bhangra', answer: 'Baraat / Wedding Song', hint: 'The high-energy baraat.' },
        { prompt: 'Pretend to be a star, doing a slow-motion hero pose', answer: 'Goli Goli / Chup', hint: 'Ranveer Singh\'s slow-mo.' },
        { prompt: 'Act like you are crying, then suddenly smiling', answer: 'Mere Dil Mein / Sad Song', hint: 'The emotional shift.' },
      ],
    },
  },

  // ── DANCE & PARTY ──────────────────────────────────────────────
  {
    slug: 'baraat-would',
    name: 'Baraat Would-Rather',
    tagline: '6 wedding dilemmas. Pick your side.',
    type: 'wouldRather',
    emoji: '💒',
    gradient: 'from-amber-400 via-yellow-500 to-orange-600',
    category: 'Dance',
    description: 'Six wedding dilemmas. Which side are you on?',
    content: {
      wouldRathers: [
        { a: 'A traditional baraat with dhol', b: 'A modern baraat with DJ', aWin: 'Traditionalist', bWin: 'Modernist' },
        { a: 'Mehendi at home', b: 'Mehendi at a venue', aWin: 'Cozy', bWin: 'Grand' },
        { a: 'Haldi in the morning', b: 'Haldi in the evening', aWin: 'Early bird', bWin: 'Night owl' },
        { a: 'A big wedding (500+)', b: 'An intimate wedding (50)', aWin: 'Celebration', bWin: 'Intimate' },
        { a: 'Wedding in Udaipur', b: 'Wedding in Goa', aWin: 'Regal', bWin: 'Beach vibes' },
        { a: 'A traditional sangeet', b: 'A free-style dance floor', aWin: 'Structured', bWin: 'Free' },
      ],
    },
  },
  {
    slug: 'wedding-party',
    name: 'Wedding Party Story',
    tagline: 'Build a Bollywood-style sangeet. 4 forks.',
    type: 'story',
    emoji: '🎊',
    gradient: 'from-pink-400 via-rose-500 to-red-500',
    category: 'Dance',
    description: 'A 4-choice sangeet story. Your choices shape the night.',
    content: {
      story: [
        { prompt: 'The sangeet begins. What is the first song?', options: ['Choli Ke Piche', 'Kajra Re', 'Baarish', 'Mehndi'], nextKey: 'first' },
        { prompt: 'The groom enters. How does he enter?', options: ['A slow-motion entry', 'A high-energy bhangra', 'A comedic entrance', 'A dramatic pose'], nextKey: 'entry' },
        { prompt: 'The first dance is between whom?', options: ['The couple', 'The groom\'s friends', 'The bride\'s friends', 'The whole family'], nextKey: 'dance' },
        { prompt: 'The grand finale. What happens?', options: ['A group dance', 'Fireworks', 'A slow song', 'A baraat procession'], nextKey: 'finale' },
      ],
    },
  },
  {
    slug: 'item-diff',
    name: 'Item Number Differences',
    tagline: 'Spot the differences in two item number posters.',
    type: 'spotTheDiff',
    emoji: '💃',
    gradient: 'from-fuchsia-500 via-purple-600 to-indigo-700',
    category: 'Dance',
    description: 'Find the differences in two item number poster descriptions.',
    content: {
      diffPairs: [
        {
          items: ['💃 Item A: dancer, sparkles, disco ball, 1998, red dress',
                  '💃 Item B: dancer, sparkles, disco ball, 1999, blue dress'],
          diffs: [0, 4],
        },
        {
          items: ['🪩 Item A: bhangra, dhol, wedding, 2002, orange',
                  '🪩 Item B: bhangra, dhol, wedding, 2003, yellow'],
          diffs: [3, 4],
        },
      ],
    },
  },

  // ── ROMANCE & COUPLE ───────────────────────────────────────────
  {
    slug: 'love-riddles',
    name: 'Love Riddles',
    tagline: '4 riddles about famous love scenes.',
    type: 'riddle',
    emoji: '💕',
    gradient: 'from-pink-500 via-rose-500 to-fuchsia-600',
    category: 'Romance',
    description: 'Four riddles whose answers are iconic Bollywood love scenes.',
    content: {
      riddles: [
        { riddle: 'I am a train. I have a window. I have a heart. Which movie am I?', answer: 'Koi Mil Gaya', hint: 'A train romance from 2004.' },
        { riddle: 'I am a song from 1998. I made everyone dance. Who am I?', answer: 'Kuch Kuch Hota Hai', hint: 'Karan Johar\'s breakthrough.' },
        { riddle: 'I am a film where a woman travels 700 km to meet her love. What am I?', answer: 'DDLJ', hint: 'The most famous train romance.' },
        { riddle: 'I am a film where a song is the most famous scene. What am I?', answer: 'Kuch Kuch Hota Hai', hint: 'The 1998 hit.' },
      ],
    },
  },
  {
    slug: 'romance-rhythm',
    name: 'Romance Rhythm',
    tagline: 'A slow-romantic tempo tap game.',
    type: 'rhythm',
    emoji: '🌹',
    gradient: 'from-rose-400 via-pink-500 to-red-600',
    category: 'Romance',
    description: 'A slow-tempo romantic tap game. Perfect for a quiet moment.',
    content: {
      rhythm: { notes: [0, 8], tempo: 'slow' },
    },
  },
  {
    slug: 'couples-choices',
    name: 'Couples Dilemmas',
    tagline: '8 spicy couple dilemmas. What would you do?',
    type: 'wouldRather',
    emoji: '💘',
    gradient: 'from-red-400 via-rose-500 to-pink-600',
    category: 'Romance',
    description: 'Eight couple dilemmas. See if you make the same choices.',
    content: {
      wouldRathers: [
        { a: 'A surprise trip', b: 'A planned trip', aWin: 'Surprise lover', bWin: 'Planner' },
        { a: 'Share your phone', b: 'Keep separate phones', aWin: 'Open book', bWin: 'Independent' },
        { a: 'A grand wedding', b: 'An intimate wedding', aWin: 'Celebration', bWin: 'Intimate' },
        { a: 'Gift: a song playlist', b: 'Gift: a handwritten letter', aWin: 'Modern', bWin: 'Classic' },
        { a: 'Watch a sad film together', b: 'Watch a comedy together', aWin: 'Deep', bWin: 'Fun' },
        { a: 'Travel abroad', b: 'Travel to Himalaya', aWin: 'Worldly', bWin: 'Spiritual' },
        { a: 'A big dinner', b: 'A small home-cooked meal', aWin: 'Grand', bWin: 'Cozy' },
        { a: 'Learn to cook together', b: 'Order food together', aWin: 'Homemade', bWin: 'Pampered' },
      ],
    },
  },

  // ── CLASSIC & FAMILY ───────────────────────────────────────────
  {
    slug: 'sholay-quiz',
    name: 'Sholay Trivia',
    tagline: '8 questions on the classic dacoit film.',
    type: 'quiz',
    emoji: '🔫',
    gradient: 'from-stone-500 via-amber-700 to-stone-900',
    category: 'Classic',
    description: '8 questions about Sholay characters, lines, and scenes.',
    content: {
      questions: [
        { q: 'The main villain in Sholay is?', options: ['Gabbar', 'Kachhi', 'Mangal', 'Kachha'], correct: 0, funFact: 'Gabbar is the most-quoted villain in Indian cinema.' },
        { q: 'Sholay was released in which year?', options: ['1975', '1976', '1974', '1977'], correct: 0, funFact: '1975 — the all-time classic.' },
        { q: 'The two heroes of Sholay are?', options: ['Veeru & Jai', 'Sholay & Daku', 'Jai & Veeru', 'Amjad & Dharm'], correct: 2, funFact: 'Jai and Veeru — played by Dharmendra and Amitabh.' },
        { q: 'The thakur in Sholay is played by?', options: ['Sanjeev', 'Rajesh', 'Kader', 'Feroz'], correct: 0, funFact: 'Sanjeev Kumar\'s iconic role.' },
        { q: 'The famous line "Kya gaand mein deke dikhai" is from?', options: ['Sholay', 'Gulaab', 'Kahaani', 'Baazi'], correct: 0, funFact: 'Gabbar\'s catchphrase.' },
        { q: 'The hideout of the dacoits in Sholay is called?', options: ['The cave', 'The haveli', 'The mountain', 'The fort'], correct: 0, funFact: 'The final showdown location.' },
        { q: 'Sholay is the most-grossing film in which language?', options: ['Hindi', 'Tamil', 'Telugu', 'Bengali'], correct: 0, funFact: 'It held the record for 37 years.' },
        { q: 'The director of Sholay is?', options: ['Ramesh Sippy', 'Yash Chopra', 'Manoj', 'Sri'], correct: 0, funFact: 'Ramesh Sippy directed the all-time classic.' },
      ],
    },
  },
  {
    slug: 'sholay-memory2',
    name: 'Sholay Character Match',
    tagline: 'Match the character to the actor.',
    type: 'memory',
    emoji: '🎭',
    gradient: 'from-stone-500 via-amber-700 to-stone-900',
    category: 'Classic',
    description: 'Memory match: link Sholay characters to the actors who played them.',
    content: {
      pairs: [
        { front: 'Gabbar Singh', back: 'Amjad Khan', match: 'sm-1' },
        { front: 'Veeru', back: 'Dharmendra', match: 'sm-2' },
        { front: 'Jai', back: 'Amitabh', match: 'sm-3' },
        { front: 'Thakur', back: 'Sanjeev', match: 'sm-4' },
        { front: 'Basanti', back: 'Hema', match: 'sm-5' },
        { front: 'Kachchi', back: 'Deenan', match: 'sm-6' },
      ],
    },
  },
  {
    slug: 'sholay-riddles2',
    name: 'Sholay Riddles 2',
    tagline: 'More riddles from the dacoit world.',
    type: 'riddle',
    emoji: '🏜️',
    gradient: 'from-amber-600 via-stone-700 to-stone-900',
    category: 'Classic',
    description: '4 more riddles from the Sholay universe.',
    content: {
      riddles: [
        { riddle: 'I am a dacoit. My famous line is "Kya kamaal hai"? Who am I?', answer: 'Gabbar Singh', hint: 'Amjad Khan\'s most iconic role.' },
        { riddle: 'I am the thakur. I hire two heroes to find me. Who am I?', answer: 'Thakur', hint: 'Sanjeev Kumar\'s role.' },
        { riddle: 'I am the daughter of the thakur. Who am I?', answer: 'Basanti', hint: 'Hema Malini\'s role.' },
        { riddle: 'I am the film that made a certain 1970s song famous. What am I?', answer: 'Sholay (1975)', hint: 'The most-grossing Indian film for 37 years.' },
      ],
    },
  },
  {
    slug: 'dosti-quiz2',
    name: 'Dosti Test 2',
    tagline: '6 more friendship questions.',
    type: 'quiz',
    emoji: '🤝',
    gradient: 'from-emerald-400 via-green-500 to-teal-600',
    category: 'Family',
    description: 'Six more friendship questions. How strong is your bond?',
    content: {
      questions: [
        { q: 'The film "Dosti" (1994) starred which duo?', options: ['Amrish + Farooq', 'Rani + Srideevi', 'Shah + Kajol', 'Aamir + Kareena'], correct: 0, funFact: 'The classic 1994 friendship drama.' },
        { q: 'Which TV show features four roommates?', options: ['3BHK', 'Sharma', 'Kaun', 'Kulfi'], correct: 0, funFact: 'The 2006 classic.' },
        { q: 'The famous friendship line "Dosti apna cheez hai" is from which film?', options: ['Dosti', 'Joey', '3BHK', 'Sharma'], correct: 0, funFact: 'The classic 1994 tagline.' },
        { q: 'The line "Tera dost hoon main" is from which film?', options: ['Dosti', 'K3G', 'DDLJ', 'Hera'], correct: 0, funFact: 'A classic 1990s line.' },
        { q: 'Which film has the famous "Dosti" duet?', options: ['Dosti', 'K3G', 'Pyaar', 'Woh'], correct: 0, funFact: 'The song became a friendship anthem.' },
        { q: 'The "Dosti" (1994) film featured which two stars?', options: ['Amrish + Farooq', 'Rani + Srideevi', 'Shah + Kajol', 'Aamir + Kareena'], correct: 0, funFact: 'The classic duo of the 1994 film.' },
      ],
    },
  },
  {
    slug: 'masala-choices2',
    name: 'Masala Choices 2',
    tagline: '8 more masala dilemmas.',
    type: 'wouldRather',
    emoji: '🌶️',
    gradient: 'from-red-500 via-orange-600 to-amber-700',
    category: 'Classic',
    description: 'Eight more spicy masala-film dilemmas.',
    content: {
      wouldRathers: [
        { a: 'A slow-mo hero entry', b: 'A fast-paced action sequence', aWin: 'Cinematic', bWin: 'Gritty' },
        { a: 'A song in the rain', b: 'A song at a rooftop', aWin: 'Romantic', bWin: 'Urban' },
        { a: 'A 1990s masala film', b: 'A 2020s parallel film', aWin: 'Nostalgic', bWin: 'Modern' },
        { a: 'An item number', b: 'A slow romantic song', aWin: 'Energetic', bWin: 'Soulful' },
        { a: 'A villain with a motive', b: 'A villain who is pure evil', aWin: 'Complex', bWin: 'Classic' },
        { a: 'A family drama', b: 'A romantic comedy', aWin: 'Deep', bWin: 'Light' },
        { a: 'A film with a twist ending', b: 'A film with a happy ending', aWin: 'Plot twist', bWin: 'Happy' },
        { a: 'Watch the full original', b: 'Watch the remake', aWin: 'Purist', bWin: 'Open' },
      ],
    },
  },
];

// Merge new games into the main list
export const ALL_BOLLYWOOD_GAMES: BollywoodGameDef[] = [
  ...BOLLYWOOD_GAMES,
  ...NEW_BOLLYWOOD_GAMES,
];
