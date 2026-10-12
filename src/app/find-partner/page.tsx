'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Heart, Users, Sparkles, Mail, MessageCircle, Check, X, ChevronRight, Shield } from 'lucide-react';
import Link from 'next/link';

type Step = 'preferences' | 'about' | 'searching' | 'matches';

interface MatchResult {
  id: string;
  user: {
    id: string;
    full_name: string;
    username: string;
    bio: string;
    avatar_url: string;
    interests: string[];
  };
  score: number;
  reasons: string[];
}

export default function FindPartner() {
  const [step, setStep] = useState<Step>('preferences');
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [error, setError] = useState('');

  // Form state
  const [gender, setGender] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [relationshipType, setRelationshipType] = useState('');
  const [partnerInterests, setPartnerInterests] = useState<string[]>([]);
  const [partnerTraits, setPartnerTraits] = useState<string[]>([]);
  const [partnerAgeMin, setPartnerAgeMin] = useState('18');
  const [partnerAgeMax, setPartnerAgeMax] = useState('35');

  const availableInterests = [
    'Music', 'Movies', 'Travel', 'Cooking', 'Gaming', 'Reading',
    'Sports', 'Art', 'Photography', 'Dancing', 'Hiking', 'Technology',
    'Fashion', 'Fitness', 'Poetry', 'Animals', 'Nature', 'Comedy'
  ];

  const traitsList = [
    'Kind', 'Funny', 'Ambitious', 'Creative', 'Loyal', 'Adventurous',
    'Intelligent', 'Romantic', 'Empathetic', 'Energetic', 'Patient', 'Honest'
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = '/auth/login'; return; }
      setUserId(user.id);
      setLoading(false);
    };
    getUser();
  }, [supabase.auth]);

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const togglePartnerInterest = (interest: string) => {
    setPartnerInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const toggleTrait = (trait: string) => {
    setPartnerTraits(prev =>
      prev.includes(trait) ? prev.filter(i => i !== trait) : [...prev, trait]
    );
  };

  const calculateMatchScore = useCallback((user1: any, user2: any): { score: number; reasons: string[] } => {
    let score = 0;
    const reasons: string[] = [];

    // Interest overlap
    const commonInterests = (user1.interests || []).filter((i: string) => (user2.interests || []).includes(i));
    if (commonInterests.length > 0) {
      score += commonInterests.length * 15;
      reasons.push(`Shared interests: ${commonInterests.slice(0, 3).join(', ')}`);
    }

    // Partner traits match
    if ((user2.traits || []).some((t: string) => (user1.traits || []).includes(t))) {
      score += 20;
      reasons.push('Personality traits align');
    }

    // Relationship goals
    if (user1.relationship_type === user2.relationship_type || user1.relationship_type === 'any' || user2.relationship_type === 'any') {
      score += 15;
      reasons.push('Same relationship goals');
    }

    // Location
    if (user1.location && user2.location && user1.location === user2.location) {
      score += 10;
      reasons.push('Same location');
    }

    return { score: Math.min(score, 100), reasons: reasons.slice(0, 3) };
  }, []);

  const findMatches = useCallback(async () => {
    setSubmitting(true);
    setError('');

    try {
      // Save preferences
      const prefData: any = {
        user_id: userId,
        gender_preference: lookingFor || 'any',
        age_min: parseInt(partnerAgeMin) || 18,
        age_max: parseInt(partnerAgeMax) || 100,
        interests: partnerInterests,
        relationship_goals: relationshipType || 'any',
        traits_looking_for: partnerTraits,
      };

      const { error: prefError } = await supabase
        .from('partner_preferences')
        .upsert(prefData, { onConflict: 'user_id' });

      if (prefError) { console.error('Prefs error:', prefError); }

      // Update profile
      await supabase.from('profiles').update({
        gender, looking_for: lookingFor, interests, bio, location, relationship_type: relationshipType,
        date_of_birth: age ? new Date().toISOString().split('T')[0] : undefined,
      }).eq('id', userId);

      setStep('searching');

      // Find potential matches
      const { data: candidates, error: matchError } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', userId)
        .neq('username', 'admin')
        .limit(50);

      if (matchError) { console.error('Match error:', matchError); }

      // Get current user's data
      const { data: currentUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Calculate scores
      const scored = (candidates || [])
        .map(candidate => {
          const result = calculateMatchScore(currentUser || {}, candidate);
          return { user: candidate, ...result };
        })
        .filter(m => m.score >= 20)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);

      // Save matches to DB
      if (scored.length > 0 && currentUser) {
        for (const match of scored) {
          await supabase.from('matches').upsert({
            user1_id: userId,
            user2_id: match.user.id,
            match_score: match.score,
            match_reasons: match.reasons,
            user1_accepted: true,
            is_active: true,
          }, { onConflict: 'user1_id, user2_id' });
        }
      }

      // Convert to MatchResult format
      const matchResults: MatchResult[] = scored.map(m => ({
        id: `${userId}-${m.user.id}`,
        user: {
          id: m.user.id,
          full_name: m.user.full_name || '',
          username: m.user.username || '',
          bio: m.user.bio || '',
          avatar_url: m.user.avatar_url || '',
          interests: m.user.interests || [],
        },
        score: m.score,
        reasons: m.reasons,
      }));

      setMatches(matchResults);
      setStep('matches');
    } catch (err) {
      console.error('Match finding error:', err);
      setError('Something went wrong. Please try again.');
      setStep('preferences');
    } finally {
      setSubmitting(false);
    }
  }, [userId, supabase, calculateMatchScore]);

  const sendNotifications = async (match: MatchResult) => {
    const currentUserEmail = (await supabase.auth.getUser()).data.user?.email;
    const matchUserEmail = match.user.username;

    try {
      // Email notification
      await fetch('/api/notifications/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: matchUserEmail,
          matchName: match.user.full_name || match.user.username,
          matchScore: match.score,
          reasons: match.reasons,
        }),
      });

      // WhatsApp notification (via WhatsApp Business API or callmebot)
      if (matchUserEmail) {
        const whatsappMsg = encodeURIComponent(
          `💕 Love Dove Alert!\n\nWe found a ${match.score}% match for you!\n\n${match.user.full_name || match.user.username} shares similar interests and relationship goals.\n\nReasons: ${match.reasons.join(', ')}\n\nLogin to Love Dove to connect! ❤️`
        );
        // Note: You need to set up a WhatsApp API service
        // For now, this opens WhatsApp with a pre-filled message
        window.open(`https://wa.me/?text=${whatsappMsg}`, '_blank');
      }
    } catch (err) {
      console.error('Notification error:', err);
    }
  };

  const startChat = async (matchUserId: string) => {
    // Create or get conversation
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user1_id.eq.${userId},user2_id.eq.${matchUserId}),and(user1_id.eq.${matchUserId},user2_id.eq.${userId})`)
      .single();

    let convId = existing?.id;

    if (!convId) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({ user1_id: userId, user2_id: matchUserId })
        .select('id')
        .single();
      convId = newConv?.id;
    }

    // Mark match as accepted
    await supabase.from('matches').update({ user2_accepted: true }).eq('user1_id', userId).eq('user2_id', matchUserId);

    // Redirect to chat
    window.location.href = `/chat/${convId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <div className="text-center">
          <Heart className="w-12 h-12 text-pink-400 animate-pulse mx-auto" />
          <p className="text-purple-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-pink-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            Love Dove
          </Link>
          <div className="flex items-center gap-2 text-sm text-purple-500">
            <Sparkles className="w-4 h-4" />
            Find Your Perfect Match
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {['preferences', 'about', 'matches'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step === s || (step === 'searching') || (step === 'matches')
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
              }`}>
                {i + 1}
              </div>
              {i < 2 && <div className={`w-16 h-1 rounded ${(step === s && s !== 'preferences') || (step === 'matches') ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {step === 'preferences' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Tell Us About You</h2>
            <p className="text-gray-500 mb-6">Help us find the perfect match for you</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
                <div className="flex gap-3">
                  {['male', 'female'].map(g => (
                    <button key={g} onClick={() => setGender(g)}
                      className={`flex-1 py-3 rounded-xl border-2 font-medium capitalize transition-all ${
                        gender === g ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-200 text-gray-500 hover:border-pink-300'
                      }`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Looking for</label>
                <div className="flex gap-3">
                  {['male', 'female', 'both'].map(g => (
                    <button key={g} onClick={() => setLookingFor(g)}
                      className={`flex-1 py-3 rounded-xl border-2 font-medium capitalize transition-all ${
                        lookingFor === g ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-500 hover:border-purple-300'
                      }`}>
                      {g === 'both' ? 'Both' : g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship type</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {['casual', 'serious', 'marriage', 'friendship', 'any'].map(r => (
                    <button key={r} onClick={() => setRelationshipType(r)}
                      className={`py-2 px-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                        relationshipType === r ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-200 text-gray-500'
                      }`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">My Age</label>
                  <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="25"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="City"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none" />
                </div>
              </div>
            </div>

            <button onClick={() => setStep('about')}
              className="mt-8 w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
              Next <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 'about' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">What Are You Looking For?</h2>
            <p className="text-gray-500 mb-6">Help us match you with the right person</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">My Interests</label>
                <div className="flex flex-wrap gap-2">
                  {availableInterests.map(interest => (
                    <button key={interest} onClick={() => toggleInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        interests.includes(interest)
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-pink-100'
                      }`}>
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Looking for these interests</label>
                <div className="flex flex-wrap gap-2">
                  {availableInterests.map(interest => (
                    <button key={interest} onClick={() => togglePartnerInterest(interest)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        partnerInterests.includes(interest)
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-purple-100'
                      }`}>
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Looking for these traits</label>
                <div className="flex flex-wrap gap-2">
                  {traitsList.map(trait => (
                    <button key={trait} onClick={() => toggleTrait(trait)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        partnerTraits.includes(trait)
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-rose-100'
                      }`}>
                      {trait}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Partner Age Range</label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={partnerAgeMin} onChange={e => setPartnerAgeMin(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none text-center" />
                    <span className="text-gray-400">to</span>
                    <input type="number" value={partnerAgeMax} onChange={e => setPartnerAgeMax(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none text-center" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tell us about yourself</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Share a bit about your personality, hobbies, and what makes you unique..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:outline-none resize-none" />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep('preferences')}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all">
                Back
              </button>
              <button onClick={findMatches} disabled={submitting}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                {submitting ? 'Finding Matches...' : 'Find My Match'}
              </button>
            </div>
          </div>
        )}

        {step === 'searching' && (
          <div className="text-center py-20">
            <div className="relative inline-block mb-8">
              <Heart className="w-24 h-24 text-pink-400 animate-bounce" />
              <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
              <Sparkles className="w-6 h-6 text-purple-400 absolute -bottom-1 -left-3 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Finding Your Perfect Match...</h2>
            <p className="text-gray-500 mb-6">Analyzing profiles and compatibility</p>
            <div className="flex justify-center gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-3 h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {step === 'matches' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {matches.length > 0 ? `Found ${matches.length} Matches!` : 'No matches found yet'}
              </h2>
              <p className="text-gray-500">
                {matches.length > 0 ? 'People who share your interests and values' : 'Keep your profile updated for better matches'}
              </p>
            </div>

            {matches.length > 0 ? (
              <div className="grid gap-4">
                {matches.map((match) => (
                  <div key={match.id} className="bg-white rounded-2xl shadow-lg p-6 border border-pink-100 hover:shadow-xl transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0">
                        {(match.user.full_name || match.user.username || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-800">
                            {match.user.full_name || match.user.username}
                          </h3>
                          <span className="px-2 py-0.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold rounded-full">
                            {match.score}% Match
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">@{match.user.username}</p>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{match.user.bio}</p>
                        {match.user.interests.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {match.user.interests.slice(0, 5).map(interest => (
                              <span key={interest} className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full">
                                {interest}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="space-y-1">
                          {match.reasons.map((reason, i) => (
                            <p key={i} className="text-xs text-purple-600 flex items-center gap-1">
                              <Heart className="w-3 h-3" /> {reason}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => sendNotifications(match)}
                        className="flex-1 py-2.5 border-2 border-purple-200 text-purple-600 font-medium rounded-xl hover:bg-purple-50 transition-all flex items-center justify-center gap-2">
                        <Mail className="w-4 h-4" />
                        Notify on WhatsApp
                      </button>
                      <button onClick={() => startChat(match.user.id)}
                        className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Start Chatting
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-pink-100">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No matches yet</h3>
                <p className="text-gray-500 mb-6">Keep your profile active — matches will appear when someone compatible joins!</p>
                <button onClick={() => setStep('about')} className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl">
                  Update My Profile
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
