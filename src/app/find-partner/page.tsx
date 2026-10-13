'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Heart, Sparkles, Check, X, ChevronRight, UserPlus, MessageCircle, Bell, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

type Step = 'preferences' | 'about' | 'searching' | 'matches' | 'waiting';

interface MatchResult {
  id: string;
  user: {
    id: string;
    full_name: string;
    username: string;
    avatar_url: string;
    bio: string;
    interests: string[];
  };
  score: number;
  reasons: string[];
}

export default function FindPartner() {
  const [step, setStep] = useState<Step>('preferences');
  const [userId, setUserId] = useState<string | null>(null);
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

  const availableInterests = [
    'Music', 'Movies', 'Travel', 'Cooking', 'Gaming', 'Reading',
    'Sports', 'Art', 'Photography', 'Dancing', 'Hiking', 'Technology',
    'Fashion', 'Fitness', 'Poetry', 'Animals', 'Nature', 'Comedy'
  ];

  const traitsList = [
    'Kind', 'Funny', 'Ambitious', 'Creative', 'Loyal', 'Adventurous',
    'Intelligent', 'Romantic', 'Empathetic', 'Energetic', 'Patient', 'Honest'
  ];

  const isReady = userId !== null;

  // ── Get user + load any existing preferences ──────────────────────────
  useEffect(() => {
    let cancelled = false;
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) { window.location.href = '/auth/login'; return; }
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('gender, interests, location, bio, relationship_type')
        .eq('id', user.id)
        .single();

      const { data: prefs } = await supabase
        .from('partner_preferences')
        .select('gender_preference, interests, relationship_goals, traits_looking_for')
        .eq('user_id', user.id)
        .single();

      if (cancelled) return;
      if (profile) {
        setGender(profile.gender || '');
        setInterests(profile.interests || []);
        setLocation(profile.location || '');
        setBio(profile.bio || '');
        setRelationshipType(profile.relationship_type || '');
      }
      if (prefs) {
        setLookingFor(prefs.gender_preference || '');
        setPartnerInterests(prefs.interests || []);
        setRelationshipType(prefs.relationship_goals || relationshipType || '');
        setPartnerTraits(prefs.traits_looking_for || []);
      }
    };
    getUser();
    return () => { cancelled = true; };
  }, []);

  const toggle = (arr: string[], setArr: (v: string[]) => void, v: string) =>
    setArr(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  // ── Client-side scoring (same algorithm as the SQL function) ───────────
  const scoreMatch = useCallback((me: any, them: any, myPrefs: any, theirPrefs: any) => {
    let score = 0;
    const reasons: string[] = [];

    // Gender fit
    if (myPrefs?.gender_preference && myPrefs.gender_preference !== 'any' && them.gender === myPrefs.gender_preference) {
      score += 30; reasons.push("You're exactly who they're looking for");
    }
    if (theirPrefs?.gender_preference && theirPrefs.gender_preference !== 'any' && me.gender === theirPrefs.gender_preference) {
      score += 30; reasons.push("They're exactly who you're looking for");
    }

    // Shared interests
    const shared = (me.interests || []).filter((i: string) => (them.interests || []).includes(i));
    if (shared.length) {
      score += Math.min(30, shared.length * 10);
      reasons.push(`You both love ${shared.slice(0, 3).join(', ')}`);
    }

    // Desired interests overlap
    if (myPrefs?.interests?.length && them.interests?.length) {
      const overlap = myPrefs.interests.filter((i: string) => them.interests.includes(i));
      if (overlap.length) { score += 15; reasons.push(`You're both into ${overlap[0]}`); }
    }

    // Desired traits overlap
    if (myPrefs?.traits_looking_for?.length && them.traits?.length) {
      const overlap = myPrefs.traits_looking_for.filter((t: string) => them.traits.includes(t));
      if (overlap.length) { score += 15; reasons.push(`You share ${overlap[0]} values`); }
    }

    // Same relationship goals
    if (myPrefs?.relationship_goals && theirPrefs?.relationship_goals && myPrefs.relationship_goals === theirPrefs.relationship_goals) {
      score += 10; reasons.push('Same relationship goals');
    }

    // Same city
    if (me.location && them.location && me.location.toLowerCase() === them.location.toLowerCase()) {
      score += 5; reasons.push('You live in the same city');
    }

    return { score: Math.min(100, score), reasons: reasons.slice(0, 3) };
  }, []);

  // ── Run the match search ───────────────────────────────────────────────
  const findMatches = useCallback(async () => {
    if (!userId) return;
    setSubmitting(true);
    setError('');
    setStep('searching');

    try {
      // Save my profile fields
      await supabase.from('profiles').update({
        gender, interests, location, bio,
        relationship_type: relationshipType || null,
      }).eq('id', userId);

      // Save my partner preferences (upsert)
      const { error: prefError } = await supabase.from('partner_preferences').upsert({
        user_id: userId,
        gender_preference: lookingFor || 'any',
        interests: partnerInterests,
        relationship_goals: relationshipType || 'any',
        traits_looking_for: partnerTraits,
      }, { onConflict: 'user_id' });
      if (prefError) console.error('Prefs save error:', prefError);

      // Small delay so the "searching" animation is visible
      await new Promise(r => setTimeout(r, 1400));

      // Pull candidates (RLS makes search-visible profiles readable)
      const { data: candidates } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, bio, gender, interests, traits, location')
        .neq('id', userId)
        .eq('search_visible', true)
        .limit(200);

      if (!candidates || candidates.length === 0) {
        setStep('waiting');
        return;
      }

      const { data: myProfile } = await supabase
        .from('profiles')
        .select('id, gender, interests, traits, location')
        .eq('id', userId)
        .single();

      const { data: myPrefs } = await supabase
        .from('partner_preferences')
        .select('gender_preference, interests, relationship_goals, traits_looking_for')
        .eq('user_id', userId)
        .single();

      // Batch-fetch other people's prefs
      const { data: allPrefs } = await supabase
        .from('partner_preferences')
        .select('user_id, gender_preference, interests, relationship_goals, traits_looking_for')
        .in('user_id', candidates.map(c => c.id));

      const prefsById: Record<string, any> = {};
      for (const p of allPrefs || []) prefsById[p.user_id] = p;

      // Score everyone
      const scored = candidates
        .map(c => ({ c, ...scoreMatch(myProfile || {}, c, myPrefs, prefsById[c.id]) }))
        .filter(m => m.score >= 20)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

      if (scored.length === 0) {
        setStep('waiting');
        return;
      }

      // Persist top matches (matches table)
      for (const m of scored) {
        await supabase.from('matches').upsert({
          user1_id: userId,
          user2_id: m.c.id,
          match_score: m.score,
          match_reasons: m.reasons,
          user1_accepted: true,
          is_active: true,
        }, { onConflict: 'user1_id, user2_id' });
      }

      setMatches(scored.map(m => ({
        id: `${userId}-${m.c.id}`,
        user: m.c,
        score: m.score,
        reasons: m.reasons,
      })));
      setStep('matches');
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
      setStep('about');
    } finally {
      setSubmitting(false);
    }
  }, [userId, gender, interests, location, bio, relationshipType, lookingFor, partnerInterests, partnerTraits, scoreMatch]);

  // ── Add friend + start chat ────────────────────────────────────────────
  const addFriendAndChat = async (matchUserId: string) => {
    if (!userId) return;

    // 1) Send friend request (upsert-safe)
    await supabase.from('friend_requests').upsert({
      sender_id: userId,
      receiver_id: matchUserId,
      status: 'pending',
    }, { onConflict: 'sender_id, receiver_id' });

    // 2) Find or create conversation
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user1_id.eq.${userId},user2_id.eq.${matchUserId}),and(user1_id.eq.${matchUserId},user2_id.eq.${userId})`)
      .single();

    let convId = existing?.id;
    if (!convId) {
      const { data } = await supabase
        .from('conversations')
        .insert({ user1_id: userId, user2_id: matchUserId })
        .select('id')
        .single();
      convId = data?.id;
    }

    // 3) Accept on matches side
    await supabase.from('matches')
      .update({ user2_accepted: true })
      .eq('user1_id', userId).eq('user2_id', matchUserId);

    toast.success('Friend request sent! Opening chat... 💬');
    setTimeout(() => { window.location.href = `/chat/${convId}`; }, 600);
  };

  const justAddFriend = async (matchUserId: string) => {
    await supabase.from('friend_requests').upsert({
      sender_id: userId,
      receiver_id: matchUserId,
      status: 'pending',
    }, { onConflict: 'sender_id, receiver_id' });
    toast.success('Friend request sent! 💕');
  };

  if (!isReady) {
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
                step === s || step === 'searching' || step === 'matches' || step === 'waiting'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
              }`}>
                {i + 1}
              </div>
              {i < 2 && (
                <div className={`w-16 h-1 rounded ${
                  (step === 'about' && s === 'preferences') || step === 'searching' || step === 'matches' || step === 'waiting'
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 1: About you ─────────────────────────────────────────── */}
        {step === 'preferences' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Tell Us About You</h2>
            <p className="text-gray-500 mb-6">Help us find the perfect match for you</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">I am a</label>
                <div className="flex gap-3">
                  {['male', 'female', 'other'].map(g => (
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

        {/* ── STEP 2: What you're looking for ───────────────────────────── */}
        {step === 'about' && (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">What Are You Looking For?</h2>
            <p className="text-gray-500 mb-6">Help us match you with the right person</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">My Interests</label>
                <div className="flex flex-wrap gap-2">
                  {availableInterests.map(interest => (
                    <button key={interest} onClick={() => toggle(interests, setInterests, interest)}
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
                    <button key={interest} onClick={() => toggle(partnerInterests, setPartnerInterests, interest)}
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
                    <button key={trait} onClick={() => toggle(partnerTraits, setPartnerTraits, trait)}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tell us about yourself</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  placeholder="Share a bit about your personality, hobbies, and what makes you unique..."
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

        {/* ── SEARCHING (animated) ──────────────────────────────────────── */}
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

        {/* ── WAITING (no matches right now) ────────────────────────────── */}
        {step === 'waiting' && (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-pink-100">
            <div className="relative inline-block mb-6">
              <Bell className="w-20 h-20 text-purple-400" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">We&apos;re Finding Your Match!</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              When a perfect match for you appears, <span className="font-semibold text-purple-600">you will be notified</span> right here
              and by email. You can also find friends by username below.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/friends"
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all inline-flex items-center justify-center gap-2">
                <Search className="w-5 h-5" />
                Search by Username
              </Link>
              <button onClick={findMatches}
                className="px-6 py-3 border-2 border-purple-300 text-purple-600 font-semibold rounded-xl hover:bg-purple-50 transition-all inline-flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Check Again
              </button>
            </div>
          </div>
        )}

        {/* ── MATCHES LIST ──────────────────────────────────────────────── */}
        {step === 'matches' && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {matches.length > 0 ? `Found ${matches.length} Matches!` : 'No matches found yet'}
              </h2>
              <p className="text-gray-500">
                {matches.length > 0
                  ? 'People who share your interests and values — add them as friends to play together!'
                  : 'Keep your profile updated for better matches'}
              </p>
            </div>

            {matches.length > 0 ? (
              <div className="grid gap-4">
                {matches.map((match) => (
                  <div key={match.id} className="bg-white rounded-2xl shadow-lg p-6 border border-pink-100 hover:shadow-xl transition-all">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0 overflow-hidden">
                        {match.user.avatar_url
                          ? <img src={match.user.avatar_url} alt="" className="w-full h-full object-cover" />
                          : (match.user.full_name || match.user.username || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-800">
                            {match.user.full_name || match.user.username}
                          </h3>
                          <span className={`px-2 py-0.5 text-white text-xs font-bold rounded-full ${
                            match.score >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                            : match.score >= 60 ? 'bg-gradient-to-r from-pink-500 to-purple-500'
                            : 'bg-gray-400'
                          }`}>
                            {match.score}% Match
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">@{match.user.username}</p>
                        {match.user.bio && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{match.user.bio}</p>}
                        {match.user.interests?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {match.user.interests.slice(0, 5).map(interest => (
                              <span key={interest} className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs rounded-full">{interest}</span>
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
                      <button onClick={() => justAddFriend(match.user.id)}
                        className="flex-1 py-2.5 border-2 border-pink-300 text-pink-600 font-medium rounded-xl hover:bg-pink-50 transition-all flex items-center justify-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Add Friend
                      </button>
                      <button onClick={() => addFriendAndChat(match.user.id)}
                        className="flex-1 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Add &amp; Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-pink-100">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No matches yet</h3>
                <p className="text-gray-500 mb-6">Keep your profile active — matches will appear when someone compatible joins!</p>
                <button onClick={() => setStep('about')} className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl">
                  Update My Profile
                </button>
              </div>
            )}

            {matches.length > 0 && (
              <div className="mt-8 text-center">
                <Link href="/friends" className="text-purple-600 font-medium hover:text-purple-800 inline-flex items-center gap-1">
                  Go to Friends <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
