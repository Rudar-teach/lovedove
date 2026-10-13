'use client';

import { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import { Heart, ArrowLeft, Image as ImageIcon, Trash2, PartyPopper, Wand2, UploadCloud, Loader2, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import Button from '@/components/ui/Button';
import PremiumBackground from '@/components/PremiumBackground';
import toast from 'react-hot-toast';

// ── Static theme lists (module-scope → only built once) ─────────────────────
const PHOTO_THEMES = [
  { id: 'timeline',  name: 'Timeline',     emoji: '📅' },
  { id: 'collage',   name: 'Collage',      emoji: '🖼️' },
  { id: 'polaroid',  name: 'Polaroids',    emoji: '📸' },
  { id: 'heartgrid', name: 'Heart Grid',   emoji: '💖' },
  { id: 'masonry',   name: 'Masonry',      emoji: '🧱' },
  { id: 'slideshow', name: 'Slideshow',    emoji: '🎞️' },
] as const;

const SITE_THEMES = [
  { id: 'pink',    name: 'Pink Romance',  gradient: 'from-pink-400 to-rose-500',     preview: 'from-pink-300 to-rose-400' },
  { id: 'purple',  name: 'Purple Dreams', gradient: 'from-purple-400 to-indigo-500',  preview: 'from-purple-300 to-indigo-400' },
  { id: 'blue',    name: 'Ocean Blue',    gradient: 'from-blue-400 to-cyan-500',      preview: 'from-blue-300 to-cyan-400' },
  { id: 'green',   name: 'Garden Green',  gradient: 'from-green-400 to-emerald-500',  preview: 'from-green-300 to-emerald-400' },
  { id: 'gold',    name: 'Golden Glow',   gradient: 'from-yellow-400 to-orange-500',  preview: 'from-yellow-300 to-orange-400' },
  { id: 'dark',    name: 'Dark Elegance', gradient: 'from-gray-700 to-gray-900',      preview: 'from-gray-600 to-gray-800' },
] as const;

// ── Smart compressor: 1024px max, 70% JPEG, preserves original if already small ─
// For large batches we shrink more aggressively to keep total time down.
async function compressImage(file: File, maxDim = 1024, quality = 0.7): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const w0 = bitmap.width;
    const h0 = bitmap.height;
    const scale = Math.min(1, maxDim / Math.max(w0, h0));
    if (scale >= 1 && file.size < 600 * 1024) {
      // Already small enough — no compression needed
      return file;
    }
    const w = Math.max(1, Math.round(w0 * scale));
    const h = Math.max(1, Math.round(h0 * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    return new Promise<Blob>((resolve) => {
      canvas.toBlob(b => resolve(b ?? file), 'image/jpeg', quality);
    });
  } catch {
    return file; // If anything fails, send original
  }
}

type PhotoEntry = {
  id: string;
  url: string;          // preview URL (blob:) while uploading, public URL after
  theme: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  progress: number;     // 0-100
  errorMsg?: string;
  startedAt?: number;
  sizeKb?: number;
};

// ── Memoized photo card ──────────────────────────────────────────────────────
const PhotoCard = memo(function PhotoCard({
  photo, onRemove, onTheme, onRetry,
}: {
  photo: PhotoEntry;
  onRemove: (id: string) => void;
  onTheme: (id: string, theme: string) => void;
  onRetry: (id: string) => void;
}) {
  const ringColor = photo.status === 'error'
    ? 'ring-2 ring-red-300'
    : photo.status === 'done'
    ? 'ring-2 ring-emerald-300'
    : photo.status === 'uploading'
    ? 'ring-2 ring-primary-300'
    : '';
  return (
    <div className={`relative group rounded-xl overflow-hidden shadow-md aspect-square bg-gray-100 ${ringColor}`}>
      <img
        src={photo.url}
        alt=""
        className={`w-full h-full object-cover transition-opacity ${photo.status === 'uploading' ? 'opacity-60' : 'opacity-100'}`}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          // If the public URL fails, show a placeholder
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
      {photo.status === 'uploading' && (
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-1.5 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-[10px] font-bold">{photo.progress}%</span>
          {/* progress bar */}
          <div className="absolute inset-x-2 bottom-2 h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-200" style={{ width: `${photo.progress}%` }} />
          </div>
        </div>
      )}
      {photo.status === 'error' && (
        <div className="absolute inset-0 bg-red-50/90 flex flex-col items-center justify-center gap-1 p-2 text-center">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <p className="text-[10px] text-red-700 font-medium leading-tight">{photo.errorMsg || 'Failed'}</p>
          <button onClick={() => onRetry(photo.id)} className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold hover:bg-red-600">
            Retry
          </button>
        </div>
      )}
      {photo.status === 'done' && (
        <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-white rounded-full p-0.5 shadow-md">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        <select
          value={photo.theme}
          onChange={e => onTheme(photo.id, e.target.value)}
          className="text-[10px] bg-white/90 rounded-lg px-1 py-0.5 border-0 outline-none"
          onClick={e => e.stopPropagation()}
        >
          {PHOTO_THEMES.map(t => <option key={t.id} value={t.id}>{t.emoji} {t.name}</option>)}
        </select>
        <button type="button" onClick={() => onRemove(photo.id)} className="text-white hover:text-red-300">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
});

// ── Format seconds → "1m 23s" or "12s" ──────────────────────────────────────
function fmt(secs: number): string {
  if (secs < 60) return `${Math.round(secs)}s`;
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return `${m}m ${s}s`;
}

export default function CreateBirthdayPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedSiteTheme, setSelectedSiteTheme] = useState('pink');
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedPhotoTheme, setSelectedPhotoTheme] = useState('collage');
  const [dragOver, setDragOver] = useState(false);

  // Timer / progress state
  const [uploadStartedAt, setUploadStartedAt] = useState<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [avgPerPhoto, setAvgPerPhoto] = useState(2); // adaptive estimate
  const [storageReady, setStorageReady] = useState<boolean | null>(null);
  const tickRef = useRef<number | null>(null);

  // Tick every 250ms while uploading
  useEffect(() => {
    if (uploadStartedAt && uploading) {
      const tick = () => setElapsedSec((Date.now() - uploadStartedAt) / 1000);
      tick();
      tickRef.current = window.setInterval(tick, 250);
      return () => {
        if (tickRef.current) clearInterval(tickRef.current);
      };
    } else if (!uploading) {
      if (tickRef.current) clearInterval(tickRef.current);
    }
  }, [uploadStartedAt, uploading]);

  // Auth guard
  if (!isAuthenticated || !user) {
    if (typeof window !== 'undefined') router.replace('/auth/login');
    return null;
  }

  // ── One-time storage probe: is the `photos` bucket reachable? ─────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { error } = await supabase.storage.from('photos').list('', { limit: 1 });
        if (cancelled) return;
        if (error && /bucket|not found|404/i.test(error.message)) {
          setStorageReady(false);
        } else {
          setStorageReady(true);
        }
      } catch {
        if (!cancelled) setStorageReady(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Update a single photo by id (avoids re-rendering whole list) ──────────
  const patchPhoto = useCallback((id: string, patch: Partial<PhotoEntry>) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
  }, []);

  // ── Upload a single file (compress + upload) with progress callback ───────
  const uploadOne = useCallback(async (file: File, entryId: string, opts?: { maxDim?: number; quality?: number }) => {
    const start = Date.now();
    try {
      // Stage 1: compress
      patchPhoto(entryId, { status: 'uploading', progress: 10, startedAt: start });
      const blob = await compressImage(file, opts?.maxDim ?? 1024, opts?.quality ?? 0.7);

      // Stage 2: upload to Supabase storage
      patchPhoto(entryId, { progress: 30 });
      const buf = await blob.arrayBuffer();
      const fileName = `${user!.id}/${Date.now()}_${entryId.slice(2, 8)}.jpg`;

      // Supabase JS SDK doesn't have a built-in progress callback for v2.
      // Simulate progress while the actual upload is in flight.
      const tick = setInterval(() => {
        setPhotos(prev => prev.map(p => {
          if (p.id !== entryId) return p;
          const next = Math.min(90, p.progress + 5);
          return { ...p, progress: next };
        }));
      }, 200);

      const { error } = await supabase.storage
        .from('photos')
        .upload(fileName, buf, { contentType: 'image/jpeg', upsert: true });

      clearInterval(tick);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(fileName);
      const took = (Date.now() - start) / 1000;
      // Adapt estimate: exponential moving average
      setAvgPerPhoto(prev => prev * 0.6 + took * 0.4);

      patchPhoto(entryId, {
        url: publicUrl,
        status: 'done',
        progress: 100,
        sizeKb: Math.round(blob.size / 1024),
      });
      return { ok: true as const, took };
    } catch (e: any) {
      patchPhoto(entryId, {
        status: 'error',
        progress: 0,
        errorMsg: e?.message?.includes('bucket') ? 'Storage not set up' : 'Upload failed',
      });
      return { ok: false as const };
    }
  }, [user, patchPhoto]);

  // ── Multi-file uploader (concurrency 3, live timer, ETA) ──────────────────
  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    if (!user) return;
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!arr.length) {
      toast.error('Please choose image files (JPG, PNG, WebP)');
      return;
    }

    // Total size hint
    const totalMb = arr.reduce((s, f) => s + f.size, 0) / (1024 * 1024);
    const estSec = Math.max(3, Math.round(arr.length * avgPerPhoto));
    toast.success(
      `Uploading ${arr.length} photo${arr.length > 1 ? 's' : ''} (${totalMb.toFixed(1)} MB) — ~${fmt(estSec)}`,
      { duration: 2500 }
    );

    setUploading(true);
    setUploadStartedAt(Date.now());

    // 1) Add optimistic entries — show blob previews immediately!
    const newEntries: PhotoEntry[] = arr.map((f, i) => ({
      id: `p-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      url: URL.createObjectURL(f),
      theme: selectedPhotoTheme,
      status: 'pending',
      progress: 0,
      sizeKb: Math.round(f.size / 1024),
    }));
    setPhotos(prev => [...prev, ...newEntries]);

    // 2) Upload with concurrency cap of 4 (bigger batches → faster overall)
    const CONCURRENCY = 4;

    // Adaptive compression: bigger batches get smaller images so the whole
    // batch finishes faster. Single/few photos stay high quality.
    const compressOpts = arr.length > 12
      ? { maxDim: 640, quality: 0.55 }
      : arr.length > 6
      ? { maxDim: 768, quality: 0.62 }
      : { maxDim: 1024, quality: 0.7 };

    const queue = [...newEntries.map((e, i) => ({ entryId: e.id, file: arr[i] }))];
    const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
      while (queue.length) {
        const job = queue.shift();
        if (job) await uploadOne(job.file, job.entryId, compressOpts);
      }
    });
    await Promise.all(workers);

    // 3) Cleanup + summary
    const success = newEntries.length; // we'll count from current state below
    setUploading(false);
    setUploadStartedAt(null);
    setElapsedSec(0);

    setPhotos(prev => {
      const ok = prev.filter(p => p.status === 'done').length;
      const err = prev.filter(p => p.status === 'error').length;
      if (ok > 0) toast.success(`✅ ${ok} photo${ok > 1 ? 's' : ''} uploaded!`);
      if (err > 0) toast.error(`${err} failed — tap Retry`, { duration: 4000 });
      // revoke any remaining blob URLs that finished as errors
      prev.forEach(p => {
        if (p.url.startsWith('blob:')) URL.revokeObjectURL(p.url);
      });
      return prev;
    });
  }, [user, selectedPhotoTheme, avgPerPhoto, uploadOne]);

  // ── Retry a single failed photo ──────────────────────────────────────────
  const retryPhoto = useCallback((id: string) => {
    const photo = photos.find(p => p.id === id);
    if (!photo) return;
    // We need the original File object — but we only kept the blob URL.
    // For now, re-prompt the user to pick again. Keep entry in "uploading" state.
    patchPhoto(id, { status: 'uploading', progress: 5, errorMsg: undefined });
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const f = input.files?.[0];
      if (f) {
        const newUrl = URL.createObjectURL(f);
        patchPhoto(id, { url: newUrl });
        uploadOne(f, id);
      } else {
        patchPhoto(id, { status: 'error', errorMsg: 'Cancelled' });
      }
    };
    input.click();
  }, [photos, uploadOne, patchPhoto]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) uploadFiles(e.target.files);
    e.target.value = '';
  }, [uploadFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
  }, [uploadFiles]);

  const removePhoto = useCallback((id: string) => {
    setPhotos(prev => prev.filter(p => {
      if (p.id === id) {
        if (p.url.startsWith('blob:')) URL.revokeObjectURL(p.url);
        return false;
      }
      return true;
    }));
  }, []);

  const setPhotoTheme = useCallback((id: string, theme: string) => {
    setPhotos(prev => prev.map(p => p.id === id ? { ...p, theme } : p));
  }, []);

  const groupedPhotos = useMemo(() => {
    const map: Record<string, PhotoEntry[]> = {};
    for (const p of photos) {
      (map[p.theme] ||= []).push(p);
    }
    return map;
  }, [photos]);

  const siteTheme = useMemo(
    () => SITE_THEMES.find(t => t.id === selectedSiteTheme)!,
    [selectedSiteTheme]
  );

  const stats = useMemo(() => {
    let done = 0, uploading = 0, error = 0, pending = 0;
    for (const p of photos) {
      if (p.status === 'done') done++;
      else if (p.status === 'uploading') uploading++;
      else if (p.status === 'error') error++;
      else pending++;
    }
    return { done, uploading, error, pending, total: photos.length };
  }, [photos]);

  // ETA: based on actual avg so far, only for items still to process
  const remaining = stats.pending + stats.uploading;
  const etaSec = useMemo(() => {
    if (!uploading || remaining === 0) return 0;
    return Math.max(1, Math.round(remaining * avgPerPhoto));
  }, [uploading, remaining, avgPerPhoto]);

  const createBirthdaySite = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) { toast.error('Enter a name'); return; }
    if (stats.done === 0) { toast.error('Upload at least one photo first'); return; }
    if (uploading) { toast.error('Wait for uploads to finish'); return; }

    setCreating(true);
    try {
      const slug = `${user.username}-birthday-${Date.now().toString(36)}`;
      const photoData = photos
        .filter(p => p.status === 'done' && !p.url.startsWith('blob:'))
        .map(p => ({ url: p.url, theme: p.theme }));

      const { error } = await supabase.from('birthday_sites').insert({
        user_id: user.id,
        name: name.trim(),
        message: message.trim(),
        photos: photoData,
        photo_themes: selectedPhotoTheme,
        theme: selectedSiteTheme,
        slug,
        is_public: true,
      });
      if (error) throw error;
      toast.success('Birthday site created! 🎉');
      router.push(`/birthday/${slug}`);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create');
    } finally {
      setCreating(false);
    }
  }, [user, name, message, photos, selectedPhotoTheme, selectedSiteTheme, router, stats.done, uploading]);

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <button className="p-2.5 hover:bg-white/60 backdrop-blur-sm rounded-2xl transition-all">
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-display font-black gradient-text-animated">Create Birthday Site</h1>
              <p className="text-gray-600 text-sm mt-1">Make someone&apos;s special day unforgettable</p>
            </div>
          </div>

          {/* Storage warning banner */}
          {storageReady === false && (
            <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-bold mb-1">Storage bucket &quot;photos&quot; not set up yet</p>
                <p>Run this in your Supabase SQL editor, or create the bucket manually in Storage:</p>
                <pre className="mt-2 text-xs bg-amber-100 rounded-lg p-2 overflow-x-auto">insert into storage.buckets (id, name, public) values (&apos;photos&apos;, &apos;photos&apos;, true) on conflict do nothing;</pre>
              </div>
            </div>
          )}

          <form onSubmit={createBirthdaySite} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary-500" /> Basic Info
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Whose birthday?</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    placeholder="Enter the person's name"
                    autoComplete="off"
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-primary-500 outline-none bg-white/50 backdrop-blur-sm text-gray-900 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Birthday Message</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Write a special birthday message... 💌"
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-primary-500 outline-none resize-none bg-white/50 backdrop-blur-sm text-gray-900 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Site Theme */}
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary-500" /> Site Theme
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SITE_THEMES.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedSiteTheme(t.id)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-200 ${selectedSiteTheme === t.id ? 'border-primary-500 ring-4 ring-primary-500/20 scale-[1.02] shadow-lg' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className={`w-full h-16 bg-gradient-to-br ${t.preview} rounded-xl mb-3 shadow-md`} />
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Upload */}
            <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary-500" /> Photos
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Upload multiple photos — they appear instantly
                {stats.done > 0 && <span className="ml-2 text-emerald-600 font-medium">({stats.done} done)</span>}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {PHOTO_THEMES.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedPhotoTheme(t.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition-colors flex items-center gap-1.5 ${selectedPhotoTheme === t.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                  >
                    <span>{t.emoji}</span>{t.name}
                  </button>
                ))}
              </div>

              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${dragOver ? 'border-primary-500 bg-primary-50/50' : 'border-primary-300 bg-gradient-to-br from-primary-50/50 to-rose-50/50'}`}
              >
                <input
                  type="file"
                  id="photo-upload"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <label htmlFor="photo-upload" className="cursor-pointer block">
                  <UploadCloud className="w-12 h-12 text-primary-400 mx-auto mb-3" />
                  <p className="font-bold text-gray-700 mb-1">
                    {uploading ? 'Uploading... photos will appear below' : 'Drop photos here or click to upload'}
                  </p>
                  <p className="text-sm text-gray-500">JPG, PNG, WebP — auto-compressed, shown instantly</p>
                </label>
              </div>

              {/* Live timer + ETA while uploading */}
              {uploading && uploadStartedAt && (
                <div className="mt-4 bg-gradient-to-r from-primary-50 to-rose-50 border border-primary-200 rounded-2xl p-4 flex items-center gap-4">
                  <div className="bg-white rounded-full p-2 shadow-sm">
                    <Clock className="w-5 h-5 text-primary-600 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-gray-800">
                        Uploading {stats.uploading + stats.pending} of {stats.total}...
                      </p>
                      <p className="text-sm font-mono font-bold text-primary-700">
                        ⏱ {fmt(elapsedSec)} <span className="text-gray-400 font-normal">/ ~{fmt(etaSec)} left</span>
                      </p>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-primary-400 to-rose-500 transition-all duration-300"
                        style={{ width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ✅ {stats.done} done · ⏳ {stats.uploading} uploading · ⏸ {stats.pending} queued{stats.error > 0 && ` · ❌ ${stats.error} failed`}
                    </p>
                  </div>
                </div>
              )}

              {photos.length > 0 && (
                <div className="mt-5 space-y-4">
                  {PHOTO_THEMES.map(pt => {
                    const group = groupedPhotos[pt.id];
                    if (!group?.length) return null;
                    return (
                      <div key={pt.id}>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                          <span>{pt.emoji}</span> {pt.name} ({group.length})
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {group.map(photo => (
                            <PhotoCard
                              key={photo.id}
                              photo={photo}
                              onRemove={removePhoto}
                              onTheme={setPhotoTheme}
                              onRetry={retryPhoto}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4 font-medium">Preview of your theme:</p>
              <div className={`rounded-[2rem] p-10 bg-gradient-to-br ${siteTheme.gradient} shadow-2xl transition-all duration-300`}>
                <PartyPopper className="w-12 h-12 text-white/80 mx-auto mb-4" />
                <h2 className="text-3xl font-display font-black text-white text-center">
                  {name || 'Name'}
                </h2>
                {message && (
                  <p className="text-center text-white/80 mt-3 italic text-lg font-light">
                    &ldquo;{message.slice(0, 100)}{message.length > 100 ? '...' : ''}&rdquo;
                  </p>
                )}
                {stats.done > 0 && (
                  <p className="text-center text-white/60 mt-3 text-sm">{stats.done} photos attached</p>
                )}
              </div>
            </div>

            <Button type="submit" isLoading={creating} className="w-full" size="lg" disabled={uploading}>
              {uploading ? '⏳ Uploading...' : 'Create Birthday Site! 🎉'}
            </Button>
          </form>
        </div>
      </div>
    </PremiumBackground>
  );
}
