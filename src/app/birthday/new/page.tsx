'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowLeft, Sparkles, Image as ImageIcon, Trash2, PartyPopper, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import Button from '@/components/ui/Button';
import PremiumBackground from '@/components/PremiumBackground';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

const THEMES = [
  { id: 'pink', name: 'Pink Romance', gradient: 'from-pink-400 to-rose-500', preview: 'bg-gradient-to-br from-pink-300 to-rose-400' },
  { id: 'purple', name: 'Purple Dreams', gradient: 'from-purple-400 to-indigo-500', preview: 'bg-gradient-to-br from-purple-300 to-indigo-400' },
  { id: 'blue', name: 'Ocean Blue', gradient: 'from-blue-400 to-cyan-500', preview: 'bg-gradient-to-br from-blue-300 to-cyan-400' },
  { id: 'green', name: 'Garden Green', gradient: 'from-green-400 to-emerald-500', preview: 'bg-gradient-to-br from-green-300 to-emerald-400' },
  { id: 'gold', name: 'Golden Glow', gradient: 'from-yellow-400 to-orange-500', preview: 'bg-gradient-to-br from-yellow-300 to-orange-400' },
  { id: 'dark', name: 'Dark Elegance', gradient: 'from-gray-700 to-gray-900', preview: 'bg-gradient-to-br from-gray-600 to-gray-800' },
];

export default function CreateBirthdayPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('pink');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => { if (!isAuthenticated) router.push('/auth/login'); }, [isAuthenticated]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    setUploading(true);
    try {
      const uploads = await Promise.all(Array.from(files).map(async (file) => {
        const ext = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
        const { data, error } = await supabase.storage.from('photos').upload(fileName, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(fileName);
        return publicUrl;
      }));
      setPhotos(prev => [...prev, ...uploads]);
      toast.success('Photos uploaded! 📸');
    } catch (err) { toast.error('Failed to upload photos'); }
    finally { setUploading(false); }
  };

  const removePhoto = (index: number) => setPhotos(prev => prev.filter((_, i) => i !== index));

  const createBirthdaySite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setCreating(true);
    try {
      const slug = `${user.username}-birthday-${Date.now().toString(36)}`;
      const { error } = await supabase.from('birthday_sites').insert({ user_id: user.id, name: name.trim(), message: message.trim(), photos, theme: selectedTheme, slug, is_public: true });
      if (error) throw error;
      toast.success('Birthday site created! 🎉');
      router.push(`/birthday/${slug}`);
    } catch (err) { toast.error('Failed to create birthday site'); }
    finally { setCreating(false); }
  };

  if (!isAuthenticated) return null;

  const theme = THEMES.find(t => t.id === selectedTheme)!;

  return (
    <PremiumBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard"><button className="p-2.5 hover:bg-white/60 backdrop-blur-sm rounded-2xl transition-all"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
            <div>
              <h1 className="text-3xl font-display font-black gradient-text-animated">Create Birthday Site</h1>
              <p className="text-gray-600 text-sm mt-1">Make someone&apos;s special day unforgettable</p>
            </div>
          </div>

          <form onSubmit={createBirthdaySite} className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2"><Heart className="w-5 h-5 text-primary-500" /> Basic Info</h2>
              <div className="space-y-4">
                <Input label="Whose birthday?" placeholder="Enter the person's name" value={name} onChange={(e) => setName(e.target.value)} required />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Birthday Message</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Write a special birthday message... 💌" className="w-full px-4 py-3.5 rounded-2xl border-2 border-gray-200 focus:border-primary-500 outline-none resize-none bg-white/50 backdrop-blur-sm text-gray-900" />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2"><Wand2 className="w-5 h-5 text-primary-500" /> Choose Theme</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {THEMES.map(t => (
                  <button key={t.id} type="button" onClick={() => setSelectedTheme(t.id)} className={`p-4 rounded-2xl border-2 transition-all duration-300 ${selectedTheme === t.id ? 'border-primary-500 ring-4 ring-primary-500/20 scale-105' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-full h-16 ${t.preview} rounded-xl mb-3 shadow-lg`} />
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-xl border border-pink-100/60 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-primary-500" /> Photos</h2>
              <div className="border-2 border-dashed border-primary-300 rounded-2xl p-10 text-center bg-gradient-to-br from-primary-50/50 to-rose-50/50 hover:border-primary-400 transition-colors">
                <input type="file" id="photo-upload" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                <label htmlFor="photo-upload" className="cursor-pointer block">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <ImageIcon className="w-7 h-7 text-white" />
                  </div>
                  <p className="font-bold text-gray-700 mb-1">Click to upload photos</p>
                  <p className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'PNG, JPG, GIF up to 10MB'}</p>
                </label>
              </div>
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-5">
                  {photos.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt="" className="w-full h-24 object-cover rounded-xl shadow-md" />
                      <button type="button" onClick={() => removePhoto(i)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-lg"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
              <p className="text-sm text-gray-500 mb-4 font-medium">Preview of your theme:</p>
              <div className={`rounded-[2rem] p-10 bg-gradient-to-br ${theme.gradient} shadow-2xl`}>
                <PartyPopper className="w-12 h-12 text-white/80 mx-auto mb-4" />
                <h2 className="text-3xl font-display font-black text-white text-center">{name || 'Name'}</h2>
                {message && <p className="text-center text-white/80 mt-3 italic text-lg font-light">"{message.slice(0, 100)}..."</p>}
              </div>
            </motion.div>

            <Button type="submit" isLoading={creating} className="w-full" size="lg">Create Birthday Site! 🎉</Button>
          </form>
        </div>
      </div>
    </PremiumBackground>
  );
}
