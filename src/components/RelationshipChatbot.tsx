'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

const CHATBOT_PROMPT = `You are "Dove" 💕, a caring relationship assistant for couples on Love Dove. Your purpose is to help couples have better conversations, resolve conflicts, and strengthen their bond.

Guidelines:
- Be warm, empathetic, and supportive
- Ask thoughtful questions that help couples understand each other better
- Suggest fun conversation starters and bonding activities
- Help with conflict resolution by suggesting calm, constructive approaches
- Celebrate their relationship milestones
- Never take sides in arguments - always encourage understanding
- Keep responses concise (max 100 words)
- Use emojis sparingly but appropriately
- If a couple is having a serious conflict, gently suggest they talk calmly and listen to each other`;

type ChatbotMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
};

const SUGGESTED_TOPICS = [
  { emoji: '💬', label: 'Conversation Starters', prompt: 'Give us 5 fun conversation starters for couples' },
  { emoji: '💕', label: 'Date Night Ideas', prompt: 'Suggest 5 creative date night ideas' },
  { emoji: '🤝', label: 'Conflict Help', prompt: 'How can couples handle disagreements better?' },
  { emoji: '💝', label: 'Appreciation Tips', prompt: 'Ways to show appreciation to your partner' },
  { emoji: '🎯', label: 'Relationship Goals', prompt: 'Help us set relationship goals together' },
  { emoji: '😂', label: 'Fun Activities', prompt: 'Fun activities couples can do together at home' },
  { emoji: '💬', label: 'Deep Talks', prompt: 'Meaningful questions couples should ask each other' },
  { emoji: '🌸', label: 'Love Languages', prompt: 'Explain the 5 love languages simply' },
];

export default function RelationshipChatbot({ matchId, onClose }: { matchId: string; onClose?: () => void }) {
  const [messages, setMessages] = useState<ChatbotMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [conversationId, setConversationId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function initChat() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    // Load or create conversation
    const { data: existing } = await supabase
      .from('chatbot_conversations')
      .select('*')
      .eq('user_id', user.id)
      .eq('match_id', matchId)
      .single();

    if (existing) {
      setConversationId(existing.id);
      const { data: msgs } = await supabase
        .from('chatbot_messages')
        .select('*')
        .eq('conversation_id', existing.id)
        .order('created_at', { ascending: true });
      if (msgs) setMessages(msgs);
    } else {
      const { data: conv } = await supabase
        .from('chatbot_conversations')
        .insert({ user_id: user.id, match_id: matchId, title: 'Relationship Chat' })
        .select()
        .single();
      if (conv) setConversationId(conv.id);

      // Add welcome message
      const welcome = "Hi there! 💕 I'm Dove, your relationship assistant. I'm here to help you and your partner have better conversations, resolve conflicts, and strengthen your bond. What would you like to talk about?";
      const { data: sysMsg } = await supabase
        .from('chatbot_messages')
        .insert({ conversation_id: conv?.id, role: 'assistant', content: welcome })
        .select()
        .single();
      if (sysMsg) setMessages([sysMsg]);
    }
  }

  async function sendMessage(text?: string) {
    const msgText = text || input.trim();
    if (!msgText || loading) return;
    setLoading(true);
    setInput('');

    // Add user message
    const { data: userMsg } = await supabase
      .from('chatbot_messages')
      .insert({ conversation_id: conversationId, role: 'user', content: msgText })
      .select()
      .single();
    if (userMsg) setMessages(prev => [...prev, userMsg]);

    // Simulate AI response (in production, call an AI API)
    const response = await getAIResponse(msgText, messages);
    const { data: botMsg } = await supabase
      .from('chatbot_messages')
      .insert({ conversation_id: conversationId, role: 'assistant', content: response })
      .select()
      .single();
    if (botMsg) setMessages(prev => [...prev, botMsg]);

    setLoading(false);
  }

  async function getAIResponse(userMessage: string, history: ChatbotMessage[]): Promise<string> {
    // In production, call OpenAI/Anthropic API here
    // For now, use intelligent rule-based responses
    const lower = userMessage.toLowerCase();

    if (lower.includes('conflict') || lower.includes('fight') || lower.includes('argument') || lower.includes('angry')) {
      return "I understand conflicts are tough. Here's what helps: 🤝 1) Take a breath before responding 2) Use 'I feel' statements 3) Listen without interrupting 4) Focus on the issue, not the person 5) Find a compromise together. Remember: it's you two vs the problem, not you vs each other. 💕";
    }
    if (lower.includes('conversation') || lower.includes('talk') || lower.includes('start')) {
      return "Great idea! Try these: 🎯 'What's a childhood memory that makes you smile?' ✨ 'If we could travel anywhere tomorrow, where would you go?' 💫 'What's something you've always wanted to try?' 🌟 'What makes you feel most loved?' 🌈 'What's a dream you haven't told anyone about?'";
    }
    if (lower.includes('date') || lower.includes('night')) {
      return "Date night ideas! 💕 🍳 Cook a meal together from scratch 🎬 Have a movie marathon with themed snacks 🎨 Do a paint-and-sip at home 🌌 Stargazing with blankets and hot cocoa 🎮 Video game tournament night 🧁 Bake something together 🚶 Take a sunset walk and talk 🎵 Create a playlist of 'our songs' together";
    }
    if (lower.includes('appreciat') || lower.includes('thank') || lower.includes('grateful')) {
      return "Showing appreciation is so important! 💝 Try: Writing a love letter 📝 Leaving surprise sticky notes around the house 💌 Making their favorite meal 🍕 Giving a genuine compliment every day 🌟 Planning a surprise just because 🎁 Taking over one of their chores today 🧹 A warm hug that lasts 20 seconds! 🤗";
    }
    if (lower.includes('love language') || lower.includes('love')) {
      return "The 5 Love Languages 💕: 1) Words of Affirmation - kind words & compliments 2) Quality Time - undivided attention 3) Receiving Gifts - thoughtful tokens 4) Acts of Service - helping hands 5) Physical Touch - hugs, holding hands. Find out each other's primary language and love in the way they understand best! 💝";
    }
    if (lower.includes('goal') || lower.includes('future') || lower.includes('plan')) {
      return "Relationship goals to set together 🎯: 1) Have a weekly date night 2) Take a trip together this year 3) Learn something new together 4) Write down 10 things you love about each other 5) Try one new restaurant every month 6) Exercise together 3x a week 7) Read the same book and discuss. Which one sounds fun? 😊";
    }
    if (lower.includes('fun') || lower.includes('game') || lower.includes('activity')) {
      return "Fun couple activities! 🎮 🎲 Play board games or card games 🎨 Do a DIY craft project together 🍕 Cook/bake something fancy 🌿 Start a small garden 📸 Do a photo challenge (take 10 creative photos together) 🧩 Do a puzzle together 💃 Learn a dance routine from YouTube 🎵 Have a karaoke night";
    }
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return "Hey lovebirds! 💕 I'm Dove, your relationship assistant. I can help you with: 💬 Fun conversation starters 💝 Showing appreciation 🤝 Handling conflicts 💕 Date night ideas What's on your mind? 😊";
    }
    if (lower.includes('thank')) {
      return "You're so welcome! 💕 Remember, every small effort in your relationship matters. You're doing great by being here and investing in each other. Keep being amazing! 🌟";
    }

    return "That's a great topic! 💕 Here's my thought: The most important thing in any relationship is communication and understanding. Try to see things from your partner's perspective, express your feelings honestly, and always come from a place of love. Is there something specific you'd like help with? 😊";
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'bg-pink-50 text-gray-800 border border-pink-100'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-pink-100' : 'text-gray-400'}`}>
                {msg.role === 'assistant' ? '💕 Dove' : 'You'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-pink-50 rounded-2xl px-4 py-3 border border-pink-100">
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Topics */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-400 mb-2">Quick topics:</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_TOPICS.map(topic => (
              <button key={topic.label} onClick={() => sendMessage(topic.prompt)}
                className="px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-full text-xs font-medium transition-colors border border-pink-200">
                {topic.emoji} {topic.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t bg-white">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask Dove anything about your relationship... 💕"
            className="flex-1 p-3 bg-pink-50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
            className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full flex items-center justify-center hover:opacity-80 disabled:opacity-50 flex-shrink-0">
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
