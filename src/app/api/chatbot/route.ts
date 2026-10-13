import { NextRequest, NextResponse } from 'next/server';

// Relationship advisor knowledge base
const RELATIONSHIP_RESPONSES: { [key: string]: string } = {
  // Greetings
  hi: "Hey there! 👋 I'm so happy you're here. How can I help your heart today? Whether it's love advice, dealing with a conflict, or just needing someone to listen - I'm here for you! 💕",
  hello: "Hello, beautiful soul! 💕 Welcome! I'm your relationship advisor. What's on your mind? Whether it's love, friendship, family, or just life - let's talk! 💝",
  hey: "Hey hey! 😊 So glad you stopped by. Tell me - how are you feeling today, and what can I help you with? 💕",

  // Relationship problems
  fight: "Oh no, conflicts are tough but normal! 💭 Here's what helps:\n\n1. **Take a breather** when emotions are high\n2. **Use 'I feel' statements** instead of blame\n3. **Listen first**, then speak\n4. **Remember you're on the same team** 💑\n5. **Find a solution together**, not who's right\n\nWant to tell me what the fight is about? I can offer specific advice! 💖",

  argument: "Arguments happen in every relationship - it's how we handle them that matters! 💪\n\n1. **Pause if needed** - it's okay to table a discussion\n2. **Stay focused on the issue**, not past mistakes\n3. **Validate each other's feelings** even if you disagree\n4. **Take responsibility** for your part\n5. **End with a hug** - remember you love each other 💕\n\nWhat was the argument about? Let's work through it together! 😊",

  cheating: "I'm so sorry you're dealing with this 💔. Cheating is one of the deepest wounds in a relationship. Here's some guidance:\n\n1. **Give yourself time** to feel all your emotions\n2. **Don't make decisions immediately** while in shock\n3. **Seek support** from someone you trust\n4. **Consider counseling** - individual or couples therapy\n5. **Remember your worth** - their choice doesn't define you\n\nYou're not alone in this. Would you like to talk more about what happened? 💝",

  breakup: "Breakups hurt so deeply 💔. Please know:\n\n1. **It's okay to grieve** - this is a real loss\n2. **Lean on your people** - friends and family love you\n3. **No-contact is healing** - distance helps recovery\n4. **Be your own Valentine** first - self-care matters most\n5. **Time really does heal** - even when you can't see it now\n\nYou're going to get through this. Want to talk about what you're feeling? 💕",

  lonely: "Feeling lonely is one of the hardest emotions 😢. You're not alone though:\n\n1. **Reach out** to someone - a text, a call, a visit\n2. **Join communities** with shared interests\n3. **Volunteer** - helping others fills your heart\n4. **Be patient with yourself** - loneliness passes\n5. **Consider talking to a professional** if it persists\n\nYou matter so much. I'm here to listen whenever you need. 💖",

  jealousy: "Jealousy is a normal human emotion, but it can be managed! 💚\n\n1. **Identify the root cause** - is it past hurt or current insecurity?\n2. **Communicate with your partner** calmly about your feelings\n3. **Build your self-confidence** - you ARE enough\n4. **Trust is built through actions** - focus on what they DO, not fears\n5. **Practice gratitude** for what you have 💕\n\nWant to share more about what's making you feel this way? 💝",

  // Love & Romance
  love: "Love is the most beautiful feeling! 💖 Here are some thoughts:\n\n1. **Be authentic** - love someone for who they truly are\n2. **Communicate openly** about your feelings\n3. **Respect each other's individuality**\n4. **Show love in their language** (words, actions, touch, time, gifts)\n5. **Choose each other daily** - love is a verb! 💕\n\nAre you falling in love, or working through love challenges? 😊",

  crush: "Having a crush is so exciting! 💕 Here are some tips:\n\n1. **Get to know them** beyond the surface\n2. **Be yourself** - authenticity is attractive\n3. **Start with friendship** - it builds strong foundations\n4. **Take it slow** - good things take time\n5. **Be brave** - shoot your shot when ready! 💪\n\nWant to tell me about your crush? I'm all ears! 😊",

  marriage: "Marriage is beautiful! 💍 Here's what makes it work:\n\n1. **Never stop dating** each other\n2. **Communicate about everything** - money, dreams, fears\n3. **Grow together** through life's changes\n4. **Forgive freely** - nobody's perfect\n5. **Keep the spark alive** with small gestures 💕\n\nAre you planning a wedding or working through married life? 💒",

  // Communication
  communication: "Communication is EVERYTHING in relationships! 📢\n\n1. **Be present** - put phones away, make eye contact\n2. **Use 'I feel'** instead of 'You always'\n3. **Listen to understand**, not reply\n4. **Check in daily** - even a 5-min chat helps\n5. **Express appreciation** - we say thanks too rarely! 💖\n\nWhat's going on with your communication? Let's work on it! 💬",

  // Emotional Support
  sad: "I'm sending you a big virtual hug 🤗💕. Being sad is okay - it means you're human.\n\n1. **Let yourself feel it** - don't push emotions away\n2. **Talk to someone** - sharing lightens the load\n3. **Do something gentle** - a walk, music, warm tea\n4. **Be kind to yourself** - treat yourself as you'd treat a friend\n5. **Reach out for help** if it gets too heavy 💝\n\nI'm here to listen. What's making you sad? 💙",

  depressed: "I'm so sorry you're feeling this way 💙. Depression is real and serious:\n\n1. **Please talk to a professional** - therapy helps SO much\n2. **Tell someone you trust** - don't carry it alone\n3. **Small steps count** - even getting out of bed is a win\n4. **Be gentle with yourself** - you're not lazy, you're struggling\n5. **Crisis line: 988** (US) or your local equivalent\n\nYou matter. Your life has value. Please don't give up. 💕",

  anxious: "Anxiety can be so overwhelming 😰. Here are some things that help:\n\n1. **Breathe deeply** - 4 counts in, 7 out, 8 hold\n2. **Ground yourself** - name 5 things you see, 4 hear, 3 touch\n3. **Challenge anxious thoughts** - is this fear realistic?\n4. **Move your body** - even a short walk helps\n5. **Talk to someone** - you don't have to fight this alone 💕\n\nWhat's making you anxious? Let's work through it together. 💝",

  stressed: "Stress is real and exhausting 😮‍💨. Let's tackle it:\n\n1. **Take breaks** - your mind needs rest\n2. **Prioritize** - not everything is urgent\n3. **Say no** sometimes - boundaries are healthy\n4. **Move your body** - exercise releases tension\n5. **Talk it out** - share with someone who cares 💖\n\nWhat's stressing you out? Let's figure out how to lighten the load! 💕",

  happy: "That's AMAZING! 🥰 Your happiness makes me happy too! ✨\n\n1. **Savor this moment** - feel it fully\n2. **Share your joy** - happiness multiplies when shared\n3. **Remember this feeling** for tougher days\n4. **Celebrate yourself** - you deserve this! 💕\n\nWhat's making you happy? I want to celebrate with you! 🎉",

  // Help/Confusion
  confused: "Confusion is so frustrating! 🤔 But it means you're thinking deeply:\n\n1. **Write it out** - journaling clarifies thoughts\n2. **Talk it through** - fresh perspectives help\n3. **Trust your gut** - your intuition is wise\n4. **Take action** - clarity often comes from doing\n5. **Be patient with yourself** - answers will come 💕\n\nWhat's confusing you? Let's figure it out together! 💝",

  help: "Of course! I'm here to help with anything 💕. I can assist with:\n\n💬 Relationship advice\n💖 Love & dating tips\n💔 Breakup support\n💭 Communication help\n🤝 Conflict resolution\n😢 Emotional support\n👨‍👩‍👧 Family matters\n💪 Self-confidence\n\nWhat would you like to talk about? 😊",

  // Family
  family: "Family relationships are complex and important! 👨‍👩‍👧‍👦\n\n1. **Set healthy boundaries** with love\n2. **Communicate openly** about expectations\n3. **Don't expect perfection** - they're human too\n4. **Choose your battles** - some things aren't worth it\n5. **Create your own traditions** if needed 💕\n\nWhat's going on with your family? I'm here to listen! 💝",

  // Intimacy
  intimacy: "Intimacy is a beautiful part of relationships! 💝\n\n1. **Communication is key** - talk about needs and comfort\n2. **Emotional connection** often enhances physical\n3. **Respect each other's pace** - no pressure\n4. **Foreplay starts outside the bedroom** - little touches all day\n5. **Keep exploring together** - intimacy grows! 💕\n\nWant to talk more about this in a healthy, respectful way? 💖",

  // Friendships
  friend: "Friendships are precious! 👫💕\n\n1. **Show up consistently** - be there in good and bad times\n2. **Be a good listener** - sometimes people just need to be heard\n3. **Celebrate their wins** genuinely\n4. **Apologize when wrong** - true friends own mistakes\n5. **Make time** - friendship needs investment 💖\n\nWhat's going on with your friend? 💕",

  // Thank you
  thanks: "You're so welcome! 💕 It's what I'm here for. Remember:\n\n💕 You are worthy of love\n💪 You are stronger than you think\n💖 You deserve happiness\n✨ I'm always here when you need me\n\nTake care of yourself! Come back anytime! 💝",

  // Goodbye
  bye: "Goodbye for now! 💕 Remember:\n\n💖 You are loved\n✨ You are enough\n💪 You are stronger than you know\n💕 Come back whenever you need me\n\nTake care of your beautiful heart! 💝",

  // Apologies
  sorry: "Apologies are powerful! 💝 A genuine apology includes:\n\n1. **'I'm sorry for [specific thing]'**\n2. **'I understand it hurt you because...'**\n3. **'I will do better by [action]'**\n4. **No excuses** - just ownership\n5. **'How can I make this right?'** 💕\n\nWho do you need to apologize to, or who do you need an apology from? 💖",

  // Default
  default: "Thank you for sharing that with me! 💕 I'm here to listen and help with anything on your heart. Whether it's:\n\n💬 Relationship advice\n💖 Love & dating\n💔 Heartbreak support\n🗣️ Communication issues\n👨‍👩‍👧 Family matters\n😢 Emotional support\n✨ Self-confidence\n\nTell me more, and I'll do my best to help! 💝"
};

function getBotResponse(message: string): string {
  const msg = message.toLowerCase().trim();

  // Direct keyword matching
  for (const [keyword, response] of Object.entries(RELATIONSHIP_RESPONSES)) {
    if (keyword === 'default') continue;
    if (msg.includes(keyword)) {
      return response;
    }
  }

  // Contextual patterns
  if (msg.match(/\b(he|she|they|partner|boyfriend|girlfriend|husband|wife|spouse)\b.*\b(left|gone|missing|ignore|ignored|distant)\b/)) {
    return "I can feel the pain in your words 💔. When someone we love becomes distant, it's one of the hardest things:\n\n1. **Give them space** but communicate your feelings\n2. **Don't assume the worst** - there might be reasons\n3. **Have an honest conversation** about where you stand\n4. **Take care of YOURSELF** during this uncertain time\n5. **Know your worth** - you deserve someone who shows up 💕\n\nWant to tell me more about what's happening? 💝";
  }

  if (msg.match(/\b(cheated|affair|unfaithful|betrayed)\b/)) {
    return RELATIONSHIP_RESPONSES.cheating;
  }

  if (msg.match(/\b(miss|hurt|heartbroken|cry|crying)\b/)) {
    return "Missing someone hurts so deeply 💔. Here's what I want you to know:\n\n1. **Your feelings are valid** - don't let anyone tell you to 'just move on'\n2. **Let yourself grieve** - it's part of healing\n3. **Stay connected to your people** - you need support now\n4. **Create new memories** - it helps the heart heal\n5. **Time will ease the pain** - I promise 💕\n\nI'm here to listen. What's your heart telling you? 💝";
  }

  if (msg.match(/\b(date|romance|romantic|valentine|anniversary)\b/)) {
    return "Romance keeps relationships alive! 💕 Here are some ideas:\n\n🌹 Surprise love notes\n🍳 Cook together\n🌅 Watch the sunrise/sunset\n🎬 Movie marathon of your favorite films\n💌 Recreate your first date\n🌟 Stargazing\n🎨 Couples art night\n💆 Give each other massages\n\nWhat kind of romance are you looking to create? 💖";
  }

  if (msg.match(/\b(self.?worth|self.?esteem|confidence|believe)\b/)) {
    return "Your worth is NOT determined by anyone else! 💪💕\n\n1. **You are enough** - just as you are\n2. **Practice self-compassion** - talk to yourself like a friend\n3. **Celebrate small wins** - they're all wins!\n4. **Set boundaries** - they show self-respect\n5. **Surround yourself with people who lift you up**\n6. **Remember**: you wouldn't say to others what you say to yourself 💖\n\nWhat's making you doubt yourself? Let's work through this together! ✨";
  }

  if (msg.match(/\b(angry|mad|furious|pissed|rage)\b/)) {
    return "Anger is a valid emotion! 💪 Let's work with it healthily:\n\n1. **Feel it first** - don't suppress it\n2. **Pause before reacting** - 10 deep breaths\n3. **Express it constructively** - 'I feel angry when...'\n4. **Move your body** - walk, run, dance it out\n5. **Write it down** - get it out of your head\n6. **Talk to someone** - don't let it fester 💕\n\nWhat's making you angry? I'm here to listen! 💝";
  }

  // Default response
  return RELATIONSHIP_RESPONSES.default;
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = getBotResponse(message);

    // Simulate thinking time for natural feel
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    name: 'Love Dove Relationship Advisor',
    capabilities: [
      'Relationship advice',
      'Emotional support',
      'Communication tips',
      'Conflict resolution',
      'Dating guidance',
      'Marriage counseling',
      'Friendship advice',
      'Family dynamics',
      'Self-worth building',
      'Heartbreak support'
    ]
  });
}
