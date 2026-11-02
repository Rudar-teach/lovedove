'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Heart, Sparkles, Minimize2, Maximize2 } from 'lucide-react';

const botResponses: { [key: string]: string } = {
  greeting: "Hey there, lovely soul! 💕 I'm your relationship advisor. Whether it's about love, friendship, or just needing someone to listen - I'm here for you. What's on your heart today?",

  // Relationship problems
  "fight|argument|fight with|arguing|conflict": "Oh no, conflicts are tough but normal in every relationship! 💭 Here's what helps:\n\n1. **Cool down first** - Don't say things you'll regret when emotions are high\n2. **Use 'I feel' statements** instead of blaming\n3. **Listen to understand**, not to reply\n4. **Remember you're on the same team** 💑\n\nRemember: A healthy fight can actually strengthen your bond. It shows you care enough to work through things together. Want to talk about what happened specifically? 😊",

  "breakup|breaking up|ended|over|ex": "I'm so sorry you're going through this 💔. Breakups hurt deeply, and that's completely okay. Remember:\n\n1. **Feel your feelings** - Don't push them away\n2. **Lean on friends & family** - You don't have to do this alone\n3. **Self-care is essential** - Treat yourself gently\n4. **Time really does heal** - Even when it doesn't feel like it\n5. **Learn and grow** - Every experience teaches us something\n\nYou're stronger than you know. Would you like to talk more about what you're going through? 💖",

  "cheat|cheating|betray|unfaithful|trust": "Trust issues are among the deepest wounds in relationships 😢. If trust has been broken:\n\n1. **Honesty from both sides** is crucial for healing\n2. **Counseling can help** - A neutral third party makes a difference\n3. **Take time** to process your emotions\n4. **Decide what you need** to feel safe again\n5. **Remember your worth** - betrayal is never your fault\n\nThis is a heavy situation, and I'm here to listen if you need to talk more. You deserve respect and love. 💕",

  "jealous|jealousy|insecure|insecurity": "Jealousy is such a common feeling, but it can be managed! 💪 Here are some tips:\n\n1. **Communicate openly** with your partner about what makes you feel this way\n2. **Build your self-confidence** - you are enough!\n3. **Identify the root cause** - is it past experiences or current situations?\n4. **Practice gratitude** in your relationship\n5. **Trust is built over time** through small consistent actions\n\nRemember: a little jealousy can show you care, but too much can hurt. Want to talk about what's triggering these feelings? 💖",

  "communication|talk|listen|talking": "Communication is the foundation of every great relationship! 📢 Here's how to improve it:\n\n1. **Be present** - put phones away, make eye contact\n2. **Express feelings, not just facts** - share how things make you feel\n3. **Check in regularly** - don't wait for big problems\n4. **Be vulnerable** - real connection needs openness\n5. **Appreciate each other's effort** - acknowledge good communication\n\nSmall daily conversations build big love over time. Is there something specific you want to communicate better? 💬",

  "lonely|alone|loneliness|distance": "Feeling lonely in a relationship or alone in general is really painful 💔. Here's what can help:\n\n1. **Share your feelings** with your partner/friends honestly\n2. **Pursue your own interests** - a happy you = a happy relationship\n3. **Quality over quantity** - make time together meaningful\n4. **Stay connected** through texts, calls, or letters when apart\n5. **Consider professional help** if loneliness persists\n\nYou matter, and your feelings are valid. Would you like to talk more about what you're experiencing? 💕",

  "love|falling|fall in love|crush": "Love is the most beautiful feeling in the world! 💖 Here are some thoughts:\n\n1. **Be authentic** - love someone for who they truly are\n2. **Take it slow** - good things grow naturally\n3. **Communicate your feelings** clearly but gently\n4. **Respect boundaries** - yours and theirs\n5. **Enjoy the journey** - falling in love is magical!\n\nRemember: True love is patient, kind, and grows through both joy and challenges. What's your situation? 😊",

  "marriage|married|proposal|wedding": "Marriage is a beautiful commitment! 💍 Here's what makes it work:\n\n1. **Know each other deeply** - values, dreams, fears\n2. **Talk about everything** - money, kids, goals, problems\n3. **Keep the romance alive** - small gestures matter\n4. **Grow together** - relationships evolve, embrace change\n5. **Choose each other daily** - marriage is a daily decision\n\nEvery strong marriage is built on friendship, respect, and choosing love even when it's hard. What's on your mind about this? 💒",

  "parents|family|mom|dad|in-laws": "Family relationships are so important but can be complex! 👨‍👩‍👧‍👦 Here's some advice:\n\n1. **Set healthy boundaries** with love and respect\n2. **Communicate openly** about expectations\n3. **Include them** in your life when possible\n4. **Support your partner** in their family dynamics\n5. **Create your own traditions** as a couple\n\nRemember: you're building a new family unit with your partner, while honoring where you came from. What specific situation are you dealing with? 💕",

  "sex|intimate|intimacy|physical": "Intimacy is an important part of relationships, but it's deeply personal. 💝 Here are some thoughts:\n\n1. **Open communication** about needs and comfort levels is essential\n2. **Consent and respect** are non-negotiable\n3. **Emotional connection** often enhances physical connection\n4. **Take it at your pace** - everyone is different\n5. **Professional guidance** can help if needed\n\nEvery relationship is unique. What matters most is mutual comfort, respect, and happiness. Want to discuss something specific? 💖",

  "friend|friendship|best friend|bff": "Friendships are precious relationships too! 👭💙 Here's how to nurture them:\n\n1. **Be there consistently** - show up in small and big moments\n2. **Listen actively** - sometimes people just need to be heard\n3. **Be honest but kind** - true friends tell the truth with love\n4. **Make time** - friendship needs investment\n5. **Celebrate wins** - your friend's joy is your joy too!\n\nGood friends are family we choose. What's going on with your friendship? 💕",

  // Emotional support
  "sad|depressed|depression|anxiety|anxious|stress|stressed": "I hear you, and I want you to know that what you're feeling matters 💙. It's okay to not be okay sometimes. Here are some things that might help:\n\n1. **Take it one moment at a time** - you don't have to fix everything today\n2. **Talk to someone you trust** - sharing lightens the load\n3. **Be gentle with yourself** - you're doing the best you can\n4. **Small self-care acts** - a walk, a warm drink, some music\n5. **Professional help is strength** - therapists are guides, not crutches\n\nYou are not alone. Your feelings are valid. And things can get better, I promise. 💖",

  "happy|great|wonderful|amazing|good": "That's wonderful to hear! 🥰 Happiness is contagious, and I'm glad you're feeling good. Cherish these moments!\n\nRemember to:\n1. **Share your joy** with loved ones\n2. **Be grateful** for what makes you happy\n3. **Remember this feeling** for harder days\n4. **Spread positivity** - your happiness can brighten others' days too!\n\nKeep shining! ✨ What's making you happy today? 💕",

  "confused|confusion|don't know|what should|help me": "Confusion is often a sign that you're thinking deeply about something important 🤔. Here's how to find clarity:\n\n1. **Write it out** - journaling can reveal answers\n2. **Talk to someone** - fresh perspectives help\n3. **Trust your gut** - your intuition knows more than you think\n4. **Take small steps** - clarity often comes from action\n5. **Give yourself grace** - confusion is part of growing\n\nWhat's confusing you? Let's figure it out together! 💖",

  // Default fallback
  default: "Thank you for sharing that with me! 💕 As your relationship advisor, I'm here to help with any matters of the heart. Whether it's:\n\n💬 Relationship challenges\n💖 Love and dating advice\n💝 Communication tips\n💔 Heartbreak support\n👨‍👩‍👧 Family dynamics\n\nTell me more about what's on your mind, and I'll do my best to help you through it! 😊"
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: 'bot', text: botResponses.greeting }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hasOpened, setHasOpened] = useState(false);

  useEffect(() => {
    const handler = () => {
      setIsOpen(true);
      setHasOpened(true);
    };
    document.addEventListener('openChatBot', handler as EventListener);
    return () => document.removeEventListener('openChatBot', handler as EventListener);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getBotResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();

    // Check for matches in order of specificity
    for (const [pattern, response] of Object.entries(botResponses)) {
      if (pattern === 'greeting' || pattern === 'default') continue;

      const keywords = pattern.split('|');
      if (keywords.some(keyword => msg.includes(keyword))) {
        return response;
      }
    }

    // Emotional support patterns
    if (msg.match(/sad|depressed|anxiety|stressed|lonely|alone|scared|afraid|worried|hurt/)) {
      return botResponses['sad|depressed|depression|anxiety|anxious|stress|stressed'];
    }

    // Love patterns
    if (msg.match(/love|like|crush|heart|feelings|dating/)) {
      return botResponses['love|falling|fall in love|crush'];
    }

    // Relationship patterns
    if (msg.match(/relationship|partner|boyfriend|girlfriend|husband|wife|spouse/)) {
      return botResponses['communication|talk|listen|talking'];
    }

    // Help patterns
    if (msg.match(/help|advice|suggest|what should|how to/)) {
      return "Of course, I'm here to help! 💕 Relationships are beautiful but can be complex. Tell me specifically what you're going through - is it about:\n\n1. A fight or argument?\n2. Communication issues?\n3. Trust or jealousy?\n4. Intimacy concerns?\n5. Family matters?\n6. Or something else entirely?\n\nThe more you share, the better I can help you! 😊";
    }

    // Greeting patterns
    if (msg.match(/hi|hello|hey|good morning|good evening|howdy|greetings/)) {
      return "Hey there, beautiful soul! 👋 So glad you're here. How can I help your heart today? Whether it's love advice, relationship concerns, or just someone to talk to - I'm all ears! 💕";
    }

    // Thank you patterns
    if (msg.match(/thank|thanks|thank you|thx|appreciate/)) {
      return "Aww, you're so welcome! 💕 That's what I'm here for. Remember, love is a journey, and you're doing great. Come back anytime you need to talk! 💖";
    }

    return botResponses.default;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay for natural feel
    setTimeout(() => {
      const response = getBotResponse(userMessage);
      setMessages(prev => [...prev, { role: 'bot', text: response }]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Show notification after 5 seconds if not opened
  useEffect(() => {
    if (!hasOpened && !isOpen) {
      const timer = setTimeout(() => {
        // Small animation hint
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [hasOpened, isOpen]);

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setIsOpen(true);
              setHasOpened(true);
            }}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-pink-500 via-rose-500 to-fuchsia-500 rounded-full shadow-2xl shadow-pink-400/50 flex items-center justify-center group"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <MessageCircle className="w-7 h-7 text-white" />
            </motion.div>
            <motion.div
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Heart className="w-3 h-3 text-white" fill="white" />
            </motion.div>
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full bg-pink-400/30"
              animate={{ scale: [1, 1.5, 1.5], opacity: [0.5, 0, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: isMinimized ? 'auto' : '600px'
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed bottom-6 right-6 z-50 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-pink-200/30 border border-pink-100/50 overflow-hidden ${
              isMinimized ? 'w-80' : 'w-[380px]'
            }`}
          >
            {/* 3D Animated Header */}
            <div className="relative bg-gradient-to-r from-pink-500 via-rose-500 to-fuchsia-500 p-4 overflow-hidden">
              {/* Animated background hearts */}
              <div className="absolute inset-0 overflow-hidden opacity-20">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-white text-xs"
                    animate={{
                      y: [0, -20, 0],
                      x: [0, Math.random() * 20 - 10, 0],
                      opacity: [0, 1, 0],
                      rotate: [0, 360, 0]
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`
                    }}
                  >
                    💕
                  </motion.div>
                ))}
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                  >
                    <Heart className="w-5 h-5 text-white" fill="white" />
                  </motion.div>
                  <div>
                    <h3 className="text-white font-bold text-sm">Relationship Advisor 💕</h3>
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="flex items-center gap-1 text-white/80 text-xs"
                    >
                      <motion.span
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-1.5 h-1.5 bg-green-300 rounded-full"
                      />
                      Always here to help
                    </motion.div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="text-white/80 hover:text-white transition-colors p-1"
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setIsMinimized(false);
                    }}
                    className="text-white/80 hover:text-white transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div className="h-[420px] overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-pink-50/30 to-white">
                  <AnimatePresence>
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-br-md'
                              : 'bg-white text-gray-700 border border-pink-100 rounded-bl-md shadow-sm'
                          }`}
                        >
                          {msg.role === 'bot' && (
                            <div className="flex items-center gap-1 mb-1">
                              <Heart className="w-3 h-3 text-pink-500" fill="currentColor" />
                              <span className="text-xs font-semibold text-pink-600">Advisor</span>
                            </div>
                          )}
                          {msg.text.split('\n').map((line, i) => (
                            <p key={i} className={line.startsWith('**') && line.endsWith('**') ? 'font-semibold mt-1' : 'mt-0.5'}>
                              {line.replace(/\*\*/g, '')}
                            </p>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white border border-pink-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                                className="w-2 h-2 bg-pink-400 rounded-full"
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400 ml-1">thinking...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <div className="px-4 py-2 bg-pink-50/50 border-t border-pink-100/50">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {['Need relationship advice', 'Feeling sad', 'Having a fight', 'Trust issues'].map((quick, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setInput(quick);
                        }}
                        className="whitespace-nowrap px-3 py-1 bg-white border border-pink-200 rounded-full text-xs text-pink-700 hover:bg-pink-100 transition-colors"
                      >
                        {quick}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-pink-100/50">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Share what's on your heart... 💕"
                      className="flex-1 px-4 py-2.5 bg-pink-50/50 border border-pink-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:bg-white transition-all placeholder:text-gray-400"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-pink-300/30 hover:shadow-pink-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </>
            )}

            {/* Minimized State */}
            {isMinimized && (
              <div className="p-3">
                <p className="text-sm text-gray-600 text-center">Click to expand the chat ✨</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
