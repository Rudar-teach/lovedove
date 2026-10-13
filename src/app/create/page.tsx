'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cake, ChevronLeft, ChevronRight, Sparkles, ImageIcon,
  MessageCircle, Check, Upload, X, Eye, Link2, Copy,
  Music, Calendar, User, Palette, Loader2, ArrowLeft
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';
import toast from 'react-hot-toast';

type Step = 1 | 2 | 3 | 4;

const THEMES = [
  { id: 'pink', label: 'Rose Gold', emoji: '🌸', color: '#ec4899', from: '#fbcfe8', to: '#fda4af' },
  { id: 'purple', label: 'Twilight', emoji: '💜', color: '#a855f7', from: '#e9d5ff', to: '#c4b5fd' },
  { id: 'red', label: 'Passion', emoji: '❤️', color: '#ef4444', from: '#fecaca', to: '#fda4af' },
  { id: 'blue', label: 'Ocean', emoji: '💙', color: '#3b82f6', from: '#bfdbfe', to: '#a5b4fc' },
  { id: 'sunset', label: 'Sunset', emoji: '🌅', color: '#f97316', from: '#fed7aa', to: '#fbbf24' },
  { id: 'mint', label: 'Mint', emoji: '🌿', color: '#10b981', from: '#a7f3d0', to: '#6ee7b7' },
  { id: 'lavender', label: 'Lavender', emoji: '💐', color: '#8b5cf6', from: '#ddd6fe', to: '#fbcfe8' },
  { id: 'gold', label: 'Gold', emoji: '✨', color: '#eab308', from: '#fef08a', to: '#fcd34d' },
];

const FONTS = [
  { id: 'inter', label: 'Modern', family: 'Inter, sans-serif' },
  { id: 'serif', label: 'Elegant', family: 'Georgia, serif' },
  { id: 'cursive', label: 'Romantic', family: 'cursive' },
  { id: 'mono', label: 'Fun', family: 'ui-monospace, monospace' },
];

const RELATIONSHIPS = ['Best Friend', 'Girlfriend', 'Boyfriend', 'Husband', 'Wife', 'Sibling', 'Parent', 'Colleague', 'Crush', 'Other'];

const QUICK_MESSAGES = [
  "Wishing you the happiest birthday ever! May all your dreams come true 💕",
  "Another year of being absolutely amazing. Love you to the moon and back! 🎂",
  "To the person who makes every day brighter — happy birthday! ✨",
  "Today is your day. Smile, celebrate, and know how much you are loved. 💖",
];

function calcAge(birthDate: string): number | null {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  if (isNaN(b.getTime())) return null;
  const t = new Date();
  let age = t.getFullYear() - b.getFullYear();
  const m = t.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--;
  return age >= 0 && age < 130 ? age : null;
}

export default function CreateBirthdaySite() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Form state
  const [recipientName, setRecipientName] = useState('');
  const [fromName, setFromName] = useState('');
  const [birthdayDate, setBirthdayDate] = useState('');
  const [relationship, setRelationship] = useState(RELATIONSHIPS[0]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState('pink');
  const [font, setFont] = useState('inter');
  const [accent, setAccent] = useState('#ec4899');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [confetti, setConfetti] = useState(true);
  const [musicAutoplay, setMusicAutoplay] = useState(false);

  // Auth gate
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.replace('/auth/login'); return; }
    if (user) setFromName(user.full_name || '');
  }, [authLoading, isAuthenticated, user, router]);

  const age = useMemo(() => calcAge(birthdayDate), [birthdayDate]);
  const activeTheme = useMemo(() => THEMES.find(t => t.id === theme) || THEMES[0], [theme]);

  const canContinue = useMemo(() => {
    if (step === 1) return recipientName.trim().length >= 2;
    if (step === 2) return true; // photos optional
    if (step === 3) return message.trim().length >= 5;
    return true;
  }, [step, recipientName, message]);

  // ── Photo upload to Supabase Storage ────────────────────────────────
  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || !user) return;
    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files).slice(0, 6 - photos.length)) {
        if (!file.type.startsWith('image/')) continue;
        const ext = file.name.split('.').pop();
        const path = `birthday/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage
          .from('photos')
          .upload(path, file, { cacheControl: '3600', upsert: false });
        if (error) {
          toast.error(`Could not upload ${file.name}`);
          continue;
        }
        const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(path);
        newUrls.push(publicUrl);
      }
      if (newUrls.length) {
        setPhotos(prev => [...prev, ...newUrls]);
        toast.success(`Uploaded ${newUrls.length} photo${newUrls.length !== 1 ? 's' : ''}!`);
      }
    } catch (e: any) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  // ── Generate unique slug ────────────────────────────────────────────
  const generateSlug = useCallback(async (): Promise<string> => {
    const base = (recipientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'birthday').slice(0, 30);
    const suffix = Math.random().toString(36).slice(2, 6);
    return `${base}-${suffix}`;
  }, [recipientName]);

  // ── Publish the site ────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!user) return;
    if (!recipientName.trim()) { toast.error('Please enter a name'); setStep(1); return; }
    if (message.trim().length < 5) { toast.error('Add a short message'); setStep(3); return; }
    setSaving(true);
    try {
      const slug = await generateSlug();
      const { error } = await supabase.from('birthday_sites').insert({
        user_id: user.id,
        name: recipientName.trim(),
        from_name: fromName.trim() || 'Someone who loves you',
        message: message.trim(),
        slug,
        is_public: true,
        is_published: true,
        photos,
        theme,
        accent_color: accent,
        font_family: font,
        birthday_date: birthdayDate || null,
        age,
        relationship,
        spotify_url: spotifyUrl || null,
        confetti,
        music_autoplay: musicAutoplay,
        view_count: 0,
      });
      if (error) {
        if (error.code === '23505') {
          // duplicate slug — retry once
          const retrySlug = await generateSlug();
          const { error: e2 } = await supabase.from('birthday_sites').insert({
            user_id: user.id,
            name: recipientName.trim(),
            from_name: fromName.trim() || 'Someone who loves you',
            message: message.trim(),
            slug: retrySlug,
            is_public: true,
            is_published: true,
            photos, theme, accent_color: accent, font_family: font,
            birthday_date: birthdayDate || null, age, relationship,
            spotify_url: spotifyUrl || null, confetti, music_autoplay: musicAutoplay,
            view_count: 0,
          });
          if (e2) throw e2;
          setCreatedSlug(retrySlug);
        } else {
          throw error;
        }
      } else {
        setCreatedSlug(slug);
      }
      setStep(4);
      toast.success('🎂 Your birthday site is live!');
    } catch (e: any) {
      toast.error(e?.message || 'Could not publish. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = useMemo(() => {
    if (!createdSlug || typeof window === 'undefined') return '';
    return `${window.location.origin}/birthday/${createdSlug}`;
  }, [createdSlug]);

  const copyLink = async () => {
    if (!publicUrl) return;
    try { await navigator.clipboard.writeText(publicUrl); setLinkCopied(true); toast.success('Link copied!'); setTimeout(() => setLinkCopied(false), 2000); }
    catch { toast.error('Copy failed'); }
  };

  // ── Step navigation ─────────────────────────────────────────────────
  const next = () => {
    if (step === 3) { void handlePublish(); return; }
    if (step < 4) setStep((step + 1) as Step);
  };
  const back = () => {
    if (step === 4) { setCreatedSlug(null); setStep(3); return; }
    if (step > 1) setStep((step - 1) as Step);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50">
        <div className="text-center">
          <Cake className="w-12 h-12 text-pink-400 mx-auto animate-bounce" />
          <p className="text-gray-500 mt-3">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 relative overflow-hidden">
      {/* Floating background hearts */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-200/40 select-none"
            style={{ left: `${(i * 10.3) % 100}%`, fontSize: `${16 + (i % 4) * 6}px` }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.3 }}
          >
            {['🎂', '🎁', '💖', '🎈'][i % 4]}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-pink-600 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
              <Cake className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Birthday Site Builder
            </h1>
          </div>
          <LinkOrSpan />
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">
            <span className={step >= 1 ? 'text-pink-600' : ''}>1. Name</span>
            <span className={step >= 2 ? 'text-pink-600' : ''}>2. Photos</span>
            <span className={step >= 3 ? 'text-pink-600' : ''}>3. Message</span>
            <span className={step >= 4 ? 'text-pink-600' : ''}>4. Done</span>
          </div>
          <div className="h-2 rounded-full bg-white/60 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
              initial={false}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* ═══ STEP 1: NAME & DETAILS ═══ */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl shadow-2xl shadow-pink-200/40 border border-pink-100 p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Who's the birthday star?</h2>
                  <p className="text-sm text-gray-500">Tell us their name to personalize the celebration.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Their name <span className="text-pink-500">*</span>
                  </label>
                  <input
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                    placeholder="e.g. Aarav"
                    maxLength={50}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-400 focus:outline-none bg-pink-50/40 text-base font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Birthday date</label>
                  <input
                    type="date"
                    value={birthdayDate}
                    onChange={e => setBirthdayDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-400 focus:outline-none bg-pink-50/40 text-base"
                  />
                  {age !== null && (
                    <p className="text-xs text-pink-600 font-semibold mt-1.5">🎉 Turning {age} this year!</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">How do you know them?</label>
                  <div className="flex flex-wrap gap-2">
                    {RELATIONSHIPS.map(r => (
                      <button
                        key={r}
                        onClick={() => setRelationship(r)}
                        className={`px-3.5 py-2 rounded-2xl text-sm font-semibold border-2 transition-all ${
                          relationship === r
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent shadow-lg'
                            : 'border-pink-100 text-gray-600 hover:border-pink-300'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your name (the sender)</label>
                  <input
                    value={fromName}
                    onChange={e => setFromName(e.target.value)}
                    placeholder="So they know who made it 💕"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-400 focus:outline-none bg-pink-50/40 text-base"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 2: PHOTOS + THEME ═══ */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl shadow-2xl shadow-pink-200/40 border border-pink-100 p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Photos & vibe</h2>
                  <p className="text-sm text-gray-500">Add up to 6 photos and pick a theme they'll love.</p>
                </div>
              </div>

              {/* Photo grid */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {photos.map((url, i) => (
                  <motion.div
                    key={url}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative aspect-square rounded-2xl overflow-hidden group shadow-md"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold uppercase bg-pink-500 text-white px-2 py-0.5 rounded-full">Cover</span>
                    )}
                  </motion.div>
                ))}
                {photos.length < 6 && (
                  <label className={`aspect-square rounded-2xl border-2 border-dashed border-pink-300 flex flex-col items-center justify-center gap-1.5 text-pink-500 cursor-pointer hover:bg-pink-50 transition-colors ${uploading ? 'pointer-events-none opacity-60' : ''}`}>
                    {uploading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Upload className="w-7 h-7" />}
                    <span className="text-xs font-semibold">{uploading ? 'Uploading…' : 'Add photo'}</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => handlePhotoUpload(e.target.files)} />
                  </label>
                )}
              </div>

              {/* Theme picker */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-purple-500" /> Theme
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {THEMES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setTheme(t.id); setAccent(t.color); }}
                      className={`relative p-3 rounded-2xl text-center transition-all ${
                        theme === t.id ? 'ring-2 ring-pink-500 scale-105' : 'hover:scale-105'
                      }`}
                      style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
                    >
                      <div className="text-2xl mb-1">{t.emoji}</div>
                      <div className="text-[11px] font-bold text-gray-800">{t.label}</div>
                      {theme === t.id && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font picker */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">Font style</h3>
                <div className="grid grid-cols-4 gap-2">
                  {FONTS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFont(f.id)}
                      className={`p-3 rounded-2xl border-2 text-center transition-all ${
                        font === f.id ? 'border-pink-500 bg-pink-50' : 'border-pink-100 hover:border-pink-300'
                      }`}
                    >
                      <div className="text-2xl font-bold text-gray-800" style={{ fontFamily: f.family }}>Aa</div>
                      <div className="text-[11px] font-medium text-gray-500 mt-1">{f.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 3: MESSAGE + EXTRAS ═══ */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-3xl shadow-2xl shadow-pink-200/40 border border-pink-100 p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Write their story</h2>
                  <p className="text-sm text-gray-500">This is the heart of the surprise — make it count.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Birthday message <span className="text-pink-500">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={`Hey ${recipientName || 'there'}! Wishing you…`}
                  rows={5}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-400 focus:outline-none bg-pink-50/40 text-base resize-none"
                />
                <div className="flex items-center justify-between mt-1.5 text-xs text-gray-400">
                  <span>{message.length}/500</span>
                  <button onClick={() => setMessage(QUICK_MESSAGES[Math.floor(Math.random() * QUICK_MESSAGES.length)])} className="text-pink-600 font-semibold hover:underline">
                    ✨ Use a sample
                  </button>
                </div>
              </div>

              {/* Quick insert chips */}
              <div className="flex flex-wrap gap-2 mt-4 mb-6">
                {['🎂', '🎁', '💕', '✨', '🌟', '🎈', '💖', '🥂'].map(e => (
                  <button
                    key={e}
                    onClick={() => setMessage(m => m + ' ' + e)}
                    className="px-2.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-base"
                  >
                    {e}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                    <Music className="w-4 h-4 text-pink-500" /> Spotify song (optional)
                  </label>
                  <input
                    value={spotifyUrl}
                    onChange={e => setSpotifyUrl(e.target.value)}
                    placeholder="Paste a Spotify track link"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-400 focus:outline-none bg-pink-50/40 text-sm"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-pink-50/60">
                  <div>
                    <p className="font-semibold text-sm text-gray-800">🎊 Confetti animation</p>
                    <p className="text-xs text-gray-500">Colorful confetti when they open the site</p>
                  </div>
                  <button onClick={() => setConfetti(!confetti)} className={`relative w-12 h-7 rounded-full transition-colors ${confetti ? 'bg-pink-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${confetti ? 'translate-x-5' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-pink-50/60">
                  <div>
                    <p className="font-semibold text-sm text-gray-800">🎵 Auto-play music</p>
                    <p className="text-xs text-gray-500">Start the song automatically (they can mute)</p>
                  </div>
                  <button onClick={() => setMusicAutoplay(!musicAutoplay)} className={`relative w-12 h-7 rounded-full transition-colors ${musicAutoplay ? 'bg-pink-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${musicAutoplay ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ STEP 4: DONE ═══ */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl shadow-pink-300/50 border-2 border-pink-200 p-8 text-center"
            >
              <motion.div
                animate={{ rotate: [0, -8, 8, -8, 8, 0] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                className="text-8xl mb-4"
              >
                🎂
              </motion.div>
              <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Your site is live!
              </h2>
              <p className="text-gray-600 mb-6">Share this link with {recipientName} to reveal the surprise.</p>

              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 mb-6 border border-pink-100">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-pink-500 flex-shrink-0" />
                  <code className="text-sm text-pink-700 truncate flex-1 text-left">{publicUrl}</code>
                  <button onClick={copyLink} className="flex-shrink-0 px-3 py-1.5 bg-pink-500 text-white text-xs font-bold rounded-xl hover:bg-pink-600 transition-colors flex items-center gap-1.5">
                    {linkCopied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`${publicUrl} 🎂`)}`}
                  target="_blank" rel="noreferrer"
                  className="py-3 rounded-2xl bg-green-500 text-white font-bold text-sm shadow-lg hover:scale-105 transition-transform"
                >
                  💬 WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I made ${recipientName} a birthday surprise! 🎂`)}&url=${encodeURIComponent(publicUrl)}`}
                  target="_blank" rel="noreferrer"
                  className="py-3 rounded-2xl bg-gray-900 text-white font-bold text-sm shadow-lg hover:scale-105 transition-transform"
                >
                  🐦 Twitter
                </a>
                <a
                  href={publicUrl} target="_blank" rel="noreferrer"
                  className="py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-sm shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-4 h-4" /> Preview
                </a>
                <button
                  onClick={() => router.push('/my-sites')}
                  className="py-3 rounded-2xl bg-white border-2 border-pink-200 text-pink-600 font-bold text-sm hover:bg-pink-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  📋 All Sites
                </button>
              </div>

              <button
                onClick={() => { setStep(1); setRecipientName(''); setPhotos([]); setMessage(''); setBirthdayDate(''); setCreatedSlug(null); }}
                className="mt-6 text-sm text-gray-500 hover:text-pink-600 font-semibold"
              >
                + Make another birthday site
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        {step < 4 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={back}
              disabled={step === 1}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-gray-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={next}
              disabled={!canContinue || (step === 3 && saving)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-200/50 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-transform"
            >
              {step === 3 ? (saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</> : <><Sparkles className="w-4 h-4" /> Publish Site</>) : <>Continue <ChevronRight className="w-4 h-4" /></>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function LinkOrSpan() {
  return (
    <Link href="/my-sites" className="text-xs text-gray-500 hover:text-pink-600 font-semibold hidden sm:inline">
      My Sites
    </Link>
  );
}
