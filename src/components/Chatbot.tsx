'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, Heart, X, Sparkles, Minimize2, Maximize2, MessageCircle } from 'lucide-react';

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const relationshipTips: Record<string, { message: string; options?: string[] }> = {
  default: {
    message: "Hi there! I'm LoveBot, your relationship companion. 💕 I'm here to help with any relationship questions, conflicts, or ideas. What's on your mind?",
    options: ['Having a conflict', 'Need date ideas', 'Feeling distant', 'Communication help', 'Just chatting']
  },
  'Having a conflict': {
    message: "Conflicts are normal in any relationship! Here's what helps:\n\n1. Take a deep breath before responding\n2. Use \"I feel\" statements, not \"You always\" accusations\n3. Listen without interrupting\n4. Focus on the issue, not the person\n5. Take a 10-minute break if things get heated\n\nWould you like me to help mediate a specific situation?",
    options: ['Yes, help me mediate', 'Need time-out tips', 'How to apologize', 'Back to main']
  },
  'Need date ideas': {
    message: "Here are some amazing date ideas! 💖\n\n🍳 Cook a new recipe together\n🏕️ Indoor picnic under blanket fort\n🎬 Recreate your first date\n🎨 Couples painting night\n🚴 Bike ride to a beautiful spot\n🧩 Play games together\n\nWhich type sounds fun?",
    options: ['Romantic ideas', 'Fun & playful', 'At-home dates', 'Budget ideas', 'Back to main']
  },
  'Feeling distant': {
    message: "Feeling distant is common. Here's what can help:\n\n1. Schedule quality time — even 20 min of undivided attention helps\n2. Share something vulnerable today\n3. Physical touch (hugs, hand-holding) releases oxytocin\n4. Ask genuine questions about their day\n5. Write them a heartfelt note\n\nWhat's been causing the distance?",
    options: ['Busy schedules', 'Less communication', 'Feeling taken for granted', 'Other reason', 'Back to main']
  },
  'Communication help': {
    message: "Great communication is the #1 key to happy relationships! 💬\n\nTry these:\n\n• Daily check-in: How are you really doing?\n• No phones during important talks\n• \"I appreciate when you...\" — positives matter!\n• Ask open-ended questions\n• Validate feelings before problem-solving\n\nWhat aspect would you like to work on?",
    options: ['Active listening', 'Expressing feelings', 'Conflict resolution', 'Daily habits', 'Back to main']
  },
  'Just chatting': {
    message: "I love that! 😊 Tell me anything — your relationship journey, a sweet moment, or even vent about a rough day. I'm here to listen and help!",
    options: ['Share a sweet moment', 'Need encouragement', 'Feeling grateful', 'Fun question', 'Back to main']
  },
  'Yes, help me mediate': {
    message: "I can help guide the conversation! First, can you briefly describe what happened? Keep it to 1-2 sentences.",
    options: ['They got upset', 'I made a mistake', 'We disagreed about something', 'It was a misunderstanding', 'Back to main']
  },
  'They got upset': {
    message: "When someone is upset, try:\n\n1. Acknowledge their feelings first: \"I see you're upset\"\n2. Don't defend immediately — just listen\n3. Ask: \"What do you need right now?\"\n4. Offer a genuine apology for the impact\n5. Discuss solutions together\n\nWould you like help crafting an apology message?",
    options: ['Yes, help me apologize', 'How to de-escalate', 'Back to main']
  },
  'I made a mistake': {
    message: "Owning mistakes shows strength! 💪 A great apology:\n\n1. \"I'm sorry for [specific action]\"\n2. \"I understand it made you feel [emotion]\"\n3. \"I will [specific change]\"\n4. Ask: \"Is there anything else you need?\"\n\nRemember — the apology is for THEM, not to make yourself feel better.",
    options: ['Need more apology tips', 'How to make amends', 'Back to main']
  },
  'We disagreed about something': {
    message: "Disagreements are healthy! The trick is disagreeing WELL:\n\n1. State your view without attacking\n2. Ask questions to understand theirs\n3. Find common ground\n4. Look for a win-win solution\n5. If stuck, agree to revisit later\n\nWhat were you disagreeing about?",
    options: ['Values / beliefs', 'Plans / schedule', 'Money', 'Family', 'Back to main']
  },
  'It was a misunderstanding': {
    message: "Misunderstandings happen to the best of us! Here's how to clear it up:\n\n1. Calmly state what you meant\n2. Ask what they understood\n3. Share both perspectives\n4. Agree on clearer communication next time\n5. Laugh about it — don't let it linger\n\nWant me to suggest a playful way to clear the air?",
    options: ['Playful ways to resolve', 'Serious discussion tips', 'Back to main']
  },
  'How to apologize': {
    message: "A great apology has 4 parts:\n\n1. **Own it** — \"I'm sorry for [specific thing]\"\n2. **Validate** — \"I understand it hurt you\"\n3. **Commit** — \"I will [specific action]\"\n4. **Ask** — \"What do you need from me?\"\n\nA sincere apology can heal almost any wound. 💕",
    options: ['Back to main']
  },
  'How to de-escalate': {
    message: "De-escalation techniques:\n\n1. Lower your voice, speak slowly\n2. Say \"I want to understand\"\n3. Take 5 deep breaths together\n4. Physical touch (if welcome) — a hand on shoulder\n5. Change the room or environment\n\nThe goal: both people feel safe before continuing.",
    options: ['Back to main']
  },
  'Romantic ideas': {
    message: "Romantic date ideas: ✨\n\n🌅 Sunrise/sunset walk on the beach\n🍷 Wine tasting at home\n💌 Write love letters to each other\n⭐ Stargazing with blankets\n🌹 Surprise flower delivery\n🎵 Dance to your favorite song\n\nWant more specific ideas?",
    options: ['At-home romance', 'Adventure dates', 'Back to main']
  },
  'Fun & playful': {
    message: "Fun date ideas! 🎉\n\n🎮 Video game tournament\n🎳 Bowling or arcade\n🧸 Build a pillow fort\n📸 Photo scavenger hunt\n🎭 Role-play dinner theater\n🍕 Pizza making contest\n\nWhat sounds most fun?",
    options: ['At-home fun', 'Outdoor adventures', 'Back to main']
  },
  'At-home dates': {
    message: "Cozy at-home dates: 🏠\n\n🎬 Movie marathon with homemade popcorn\n🍳 Cook a fancy dinner together\n🧘 Couples yoga\n📚 Read poetry to each other\n🎵 Create a playlist together\n💆 Take turns giving massages",
    options: ['Budget dates', 'Back to main']
  },
  'Budget ideas': {
    message: "Free & low-cost date ideas: 💰\n\n🌳 Park picnic with homemade food\n🚶 Explore a new neighborhood\n🎨 Art in the park\n🏖️ Beach day (no cost!)\n📚 Library date + coffee\n🏞️ Hike a local trail\n\nLove doesn't need money! 💕",
    options: ['Back to main']
  },
  'Busy schedules': {
    message: "Busy schedules are tough but manageable:\n\n1. Schedule \"us time\" like a meeting — honor it\n2. 10-minute morning coffee together\n3. Send voice notes throughout the day\n4. Cook together even if it's quick\n5. End each day with 5 minutes of genuine connection\n\nQuality > quantity when it comes to time together!",
    options: ['Back to main']
  },
  'Less communication': {
    message: "Let's rebuild that connection:\n\n1. Start small — one genuine check-in per day\n2. Share one highlight and one challenge each day\n3. No phones during meals\n4. Ask deeper questions beyond \"how was your day?\"\n5. Schedule weekly \"deep talk\" sessions\n\nCommunication is like a muscle — the more you use it, the stronger it gets! 💪",
    options: ['Back to main']
  },
  'Feeling taken for granted': {
    message: "That feeling is valid. Here's what helps:\n\n1. Share your feelings using \"I\" statements\n2. Point out specific things you appreciate\n3. Ask for small, daily gestures of appreciation\n4. Create appreciation rituals\n5. Lead by example — show gratitude\n\nYou deserve to feel valued! 💕",
    options: ['How to express needs', 'Building appreciation habits', 'Back to main']
  },
  'Other reason': {
    message: "I hear you. Every relationship has its unique challenges. The key is:\n\n1. Open, honest conversation\n2. Both people wanting to make it work\n3. Patience and understanding\n4. Sometimes, professional help is great too\n\nWant to talk more about what's going on?",
    options: ['Talk to me', 'Need professional help info', 'Back to main']
  },
  'Active listening': {
    message: "Active listening skills:\n\n1. Give full attention (put phone away)\n2. Make eye contact\n3. Don't formulate response while they talk\n4. Reflect back: \"So what you're saying is...\"\n5. Ask clarifying questions\n6. Validate feelings before solving\n\nThis alone can transform any conversation! 💬",
    options: ['Back to main']
  },
  'Expressing feelings': {
    message: "Expressing feelings well:\n\n1. Use \"I feel...\" not \"You make me feel...\"\n2. Be specific about the situation\n3. Say what you NEED, not what they did wrong\n4. Be vulnerable — strength in relationships\n5. Timing matters — don't bring up heavy things at 11PM\n\nPractice makes perfect! 💕",
    options: ['Back to main']
  },
  'Conflict resolution': {
    message: "Healthy conflict resolution:\n\n1. Same team mindset\n2. Take breaks if emotions run high\n3. Focus on the problem, not blame\n4. Seek to understand before being understood\n5. Compromise — not win/lose\n\nA resolved conflict makes you STRONGER together! 💪",
    options: ['Back to main']
  },
  'Daily habits': {
    message: "Daily relationship habits:\n\n☀️ Morning hug (6 seconds releases oxytocin)\n💬 Check-in message during the day\n🙏 Gratitude before bed\n🤗 Physical touch whenever possible\n💬 One genuine compliment daily\n\nSmall daily actions = big long-term results!",
    options: ['Back to main']
  },
  'Share a sweet moment': {
    message: "That's what relationships are all about! 💖\n\nCherish those moments and keep creating new ones. What made that moment special? Was it something they did, or just being together?\n\nEvery small moment of connection adds up to a beautiful love story! 📖",
    options: ['Back to main']
  },
  'Need encouragement': {
    message: "You've got this! 🌟\n\nRelationships aren't always easy, but the fact that you care enough to work on it says so much about your love.\n\nRemember:\n• Every challenge is an opportunity to grow together\n• Love is a verb — it's shown in actions\n• You're not alone in this journey\n\nYou and your partner can do hard things! 💪",
    options: ['Back to main']
  },
  'Feeling grateful': {
    message: "That's beautiful! 💕 Gratitude transforms relationships.\n\nHere's a quick exercise: Tell me ONE thing about your partner you're grateful for right now.\n\n(Go ahead, I'm listening!)\n\nPro tip: Share this with them — gratitude expressed aloud is 10x more powerful!",
    options: ['Back to main']
  },
  'Fun question': {
    message: "Let's play! Here's a fun couple question:\n\n🤔 If you could teleport anywhere in the world right now with your partner, where would you go and why?\n\nDiscuss this together — it reveals dreams, preferences, and you might discover something new about each other! ✈️",
    options: ['Another question', 'Back to main']
  },
  'Another question': {
    message: "Here's another one! 🎲\n\n💬 What's a small thing your partner does that always makes you smile?\n\nThis is a great reminder of the little things that matter most in love! 💖",
    options: ['One more question', 'Back to main']
  },
  'One more question': {
    message: "Last one! 💫\n\n📅 If you could relive any memory together, which one would it be?\n\nDiscussing this can bring back amazing feelings and inspire new memories to create! 📸",
    options: ['Back to main']
  },
  'Playful ways to resolve': {
    message: "Playful conflict resolution: 🎮\n\n1. Rock-paper-scissors decides (loser apologizes first!)\n2. Cook-off challenge — best dish wins\n3. Dance battle — laughter heals everything\n4. Make a funny face contest\n5. Write a silly love song about the situation\n\nHumor is the best medicine! 😄",
    options: ['Back to main']
  },
  'Serious discussion tips': {
    message: "For serious discussions:\n\n1. Set a time: \"Can we talk at 8pm?\"\n2. Pick a neutral space\n3. No distractions (phones off)\n4. Take turns speaking\n5. No interrupting\n6. Focus on the future: \"How do we fix this?\"\n\nYou've got this! 💪",
    options: ['Back to main']
  },
  'At-home romance': {
    message: "At-home romantic ideas: 🏠✨\n\n🛁 Candlelit bubble bath\n🍷 Wine + cheese tasting night\n💆 Take turns giving massages\n🎵 Slow dance in the living room\n📝 Write love letters to each other\n🌙 Stargaze through a window\n\nPerfect for cozy nights in!",
    options: ['Back to main']
  },
  'Adventure dates': {
    message: "Adventure date ideas: 🗺️\n\n🏔️ Go on a hike\n🚴 Bike to a new place\n🏖️ Beach/park day\n🎢 Visit an amusement park\n🏕️ Camping trip\n🚗 Random road trip\n\nAdventures create the best memories!",
    options: ['Back to main']
  },
  'Need professional help info': {
    message: "Seeking professional help is a sign of strength, not weakness. 💙\n\nConsider couples therapy if:\n• You keep having the same arguments\n• Trust has been broken\n• Communication consistently breaks down\n• You feel stuck and don't know how to move forward\n\nA therapist provides a neutral space and proven tools. Many couples report therapy saved their relationship!",
    options: ['Back to main']
  },
  'How to express needs': {
    message: "Expressing needs effectively:\n\n1. Be specific: \"I need quality time\" not \"You're never here\"\n2. Explain WHY it matters to you\n3. Ask, don't demand\n4. Be open to their needs too\n5. Thank them when they try\n\nYour needs matter. Speaking them kindly is the key. 💕",
    options: ['Back to main']
  },
  'Building appreciation habits': {
    message: "Building appreciation habits:\n\n🌅 Morning: Share one thing you appreciate about them\n💬 Text: Send a grateful message during the day\n🙏 Evening: Say one thing they did that you loved\n📝 Weekly: Write a short appreciation note\n🎁 Surprise: Small gestures of appreciation\n\nGratitude rewires the brain to see the good!",
    options: ['Back to main']
  },
  'Talk to me': {
    message: "I'm all ears! 💕 Tell me whatever is on your mind — there's no judgment here. Sometimes just putting feelings into words helps clarify everything.",
    options: ['Back to main']
  },
  'Talk to me more': {
    message: "I'm here for you! 💕 Take your time — whenever you're ready to share, I'll listen.",
    options: ['Back to main']
  },
  'Yes, help me apologize': {
    message: "Here's a template you can adapt:\n\n\"Hey, I wanted to talk about what happened. I'm sorry for [specific thing]. I understand it made you feel [emotion], and that's not okay. I care about you and I want to make this right. [What you'll do differently]. Can we talk about how to move forward?\" 💕",
    options: ['Back to main']
  },
  'How to make amends': {
    message: "Making amends:\n\n1. Follow through on promises\n2. Be patient — healing takes time\n3. Give them space if needed\n4. Show through actions, not just words\n5. Ask regularly: \"Is there anything else?\"\n\nConsistency rebuilds trust. One day at a time! 💪",
    options: ['Back to main']
  },
  'Values / beliefs': {
    message: "Value disagreements can be tricky. Try:\n\n1. Understand WHY each value matters to them\n2. Find the underlying need (security, freedom, family)\n3. Compromise on HOW, not WHAT\n4. Respect differences — you don't have to agree on everything\n5. Focus on shared values first\n\nLove means respecting differences! 💕",
    options: ['Back to main']
  },
  'Plans / schedule': {
    message: "Schedule disagreements? Try this:\n\n1. List everyone's priorities\n2. Find overlapping times\n3. Rotate who gets their way\n4. Build in \"free time\" buffers\n5. Use a shared calendar app\n\nPlanning together can even be fun! 📅",
    options: ['Back to main']
  },
  'Money': {
    message: "Money talks! Here's how to handle it:\n\n1. Have regular money conversations\n2. Agree on shared vs individual expenses\n3. Create a budget together\n4. Be transparent about spending\n5. Discuss financial goals as a team\n6. Remember: it's about values, not just numbers\n\nFinancial transparency = trust! 💰💕",
    options: ['Back to main']
  },
  'Family': {
    message: "Family dynamics can be complex:\n\n1. Discuss boundaries together\n2. Present a united front\n3. Share concerns, don't criticize their family\n4. Create traditions that are just yours\n5. Balance time with both families\n\nYou're building YOUR family now — together! 👨‍👩‍👦",
    options: ['Back to main']
  },
};

const keywordMap: Record<string, string> = {
  'fight|argument|angry|mad|upset|yelling|crying|disagree|conflict': 'Having a conflict',
  'date|dinner|romantic|surprise|movie|dinner|candle|wine': 'Need date ideas',
  'distant|cold|ignoring|drifting|apart|ignores|doesn.t talk': 'Feeling distant',
  'talk|communicat|listen|speak|silent|quiet|won.t talk': 'Communication help',
  'hello|hi|hey|start|begin|help|what can you do': 'Just chatting',
  'love|grateful|thankful|happy|blessed|appreciate': 'Feeling grateful',
  'game|play|fun|question|quiz': 'Fun question',
  'motivation|encouragement|sad|tough|hard|struggling': 'Need encouragement',
  'apolog|sorry|mistake|wrong|my bad|forgive': 'How to apologize',
  'de-escalat|calm|peace|cool down|breath': 'How to de-escalate',
  'values|belief|religion|politics|disagree|opinion': 'Values / beliefs',
  'schedule|plan|time|calendar|busy|when': 'Plans / schedule',
  'money|budget|spend|save|financial|expensive': 'Money',
  'family|parents|in-laws|mom|dad|relatives': 'Family',
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && !isInitialized) {
      const defaultMsg = relationshipTips.default;
      setMessages([{ role: 'bot', content: defaultMsg.message, timestamp: new Date() }]);
      setOptions(defaultMsg.options || []);
      setIsInitialized(true);
    }
  }, [isOpen, isInitialized]);

  const getBotResponse = (userMessage: string): { message: string; options?: string[] } => {
    const lower = userMessage.toLowerCase();

    // Check keyword map
    for (const [pattern, topic] of Object.entries(keywordMap)) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(lower)) {
        const response = relationshipTips[topic];
        if (response) return response;
      }
    }

    // Check direct match with options
    for (const [key, response] of Object.entries(relationshipTips)) {
      if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
        return response;
      }
    }

    // Contextual responses
    if (lower.match(/how are you|how do you feel|are you ok/)) {
      return { message: "I'm doing great, thanks for asking! I'm here to help YOU with your relationship. What's going on with you and your partner? 💕", options: ['Need date ideas', 'Having a conflict', 'Communication help', 'Back to main'] };
    }
    if (lower.match(/thank|thanks|thx/)) {
      return { message: "You're so welcome! 😊 That's what I'm here for. Remember, the best relationships are built one small moment at a time. Come back anytime! 💕", options: ['Back to main'] };
    }
    if (lower.match(/bye|goodbye|see you|later/)) {
      return { message: "Goodbye for now! 💕 Remember, every day is a chance to show your love. Come back anytime you need advice or just want to chat! Take care! ✨", options: ['Back to main'] };
    }
    if (lower.match(/love you|i love|romantic|sweet/)) {
      return { message: "Aww, that's beautiful! 💖 Love is the most powerful force in the world. Keep nurturing that connection — small daily acts of love create the strongest bonds. Want some ideas to keep the romance alive? 😊", options: ['Need date ideas', 'Romantic ideas', 'Back to main'] };
    }
    if (lower.length < 5) {
      return { message: "I'd love to understand more! Could you tell me a bit more about what's on your mind? I'm here to help with any relationship topic. 💕", options: ['Having a conflict', 'Need date ideas', 'Feeling distant', 'Communication help', 'Just chatting'] };
    }
    if (lower.match(/relationship|partner|boyfriend|girlfriend|husband|wife|spouse|couple/)) {
      return { message: "Relationships are such a beautiful journey! 💕 Whether it's about communication, conflict, dates, or anything else — I'm here to help. Could you tell me more about what's going on?", options: ['Having a conflict', 'Need date ideas', 'Feeling distant', 'Communication help', 'Just chatting'] };
    }

    return {
      message: "That's an interesting thought! 💭 While I may not have a specific answer for that, here's what I can help with:\n\n• Conflict resolution strategies\n• Creative date ideas\n• Communication techniques\n• Relationship tips & habits\n\nWhat would you like to explore?",
      options: ['Having a conflict', 'Need date ideas', 'Communication help', 'Back to main']
    };
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));

    const response = getBotResponse(text);
    const botMsg: Message = { role: 'bot', content: response.message, timestamp: new Date() };
    setMessages(prev => [...prev, botMsg]);
    setOptions(response.options || []);
    setIsTyping(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all hover:shadow-pink-500/40"
      >
        <Heart className="w-7 h-7 text-white" />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 border border-pink-200 hover:shadow-pink-500/20 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">LoveBot</p>
              <p className="text-xs text-gray-500">Click to continue chatting 💕</p>
            </div>
            <Sparkles className="w-4 h-4 text-pink-400 ml-auto" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[520px] bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-pink-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">LoveBot 💕</p>
            <p className="text-pink-100 text-xs">Relationship Companion</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(true)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <Minimize2 className="w-4 h-4" />
          </button>
          <button onClick={() => setIsOpen(false)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
              msg.role === 'user'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-800 rounded-bl-md'
            }`}>
              <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>
              <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-pink-100' : 'text-gray-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Options */}
      {options.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-1.5">
            {options.slice(0, 5).map(option => (
              <button
                key={option}
                onClick={() => sendMessage(option)}
                className="px-3 py-1.5 bg-pink-50 text-pink-600 text-xs font-medium rounded-full hover:bg-pink-100 transition-all border border-pink-200"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-pink-100">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <button type="submit" disabled={!inputValue.trim()}
            className="p-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
