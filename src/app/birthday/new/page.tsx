'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowLeft, Sparkles, Image as ImageIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

const THEMES = [
  { id: 'pink', name: 'Pink Romance', gradient: 'from-pink-400 to-rose-500', bg: 'bg-gradient-to-br from-pink-100 via-white to-rose-50' },
  { id: 'purple', name: 'Purple Dreams', gradient: 'from-purple-400 to-indigo-500', bg: 'bg-gradient-to-br from-purple-100 via-white to-indigo-50' },
  { id: 'blue', name: 'Ocean Blue', gradient: 'from-blue-400 to-cyan-500', bg: 'bg-gradient-to-br from-blue-100 via-white to-cyan-50' },
  { id: 'green', name: 'Garden Green', gradient: 'from-green-400 to-emerald-500', bg: 'bg-gradient-to-br from-green-100 via-white to-emerald-50' },
  { id: 'gold', name: 'Golden Glow', gradient: 'from-yellow-400 to-orange-500', bg: 'bg-gradient-to-br from-yellow-100 via-white to-orange-50' },
  { id: 'dark', name: 'Dark Elegance', gradient: 'from-gray-700 to-gray-900', bg: 'bg-gradient-to-br from-gray-100 via-white to-gray-50' },
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
    } catch (err) {
      toast.error('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => setPhotos(prev => prev.filter((_, i) => i !== index));

  const createBirthdaySite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setCreating(true);
    try {
      const slug = `${user.username}-birthday-${Date.now().toString(36)}`;
      const { error } = await supabase.from('birthday_sites').insert({
        user_id: user.id,
        name: name.trim(),
        message: message.trim(),
        photos,
        theme: selectedTheme,
        slug,
        is_public: true,
      });
      if (error) throw error;
      toast.success('Birthday site created! 🎉');
      router.push(`/birthday/${slug}`);
    } catch (err) {
      toast.error('Failed to create birthday site');
    } finally {
      setCreating(false);
    }
  };

  if (!isAuthenticated) return null;

  const theme = THEMES.find(t => t.id === selectedTheme)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard"><button className="p-2 hover:bg-white rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-gray-700" /></button></Link>
          <h1 className="text-3xl font-display font-bold gradient-text">Create Birthday Site</h1>
        </div>

        <form onSubmit={createBirthdaySite} className="space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Heart className="w-5 h-5 text-primary-500" /> Basic Info</h2>
              <div className="space-y-4">
                <Input label="Whose birthday?" placeholder="Enter the person's name" value={name} onChange={(e) => setName(e.target.value)} required />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Birthday Message</label>
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Write a special birthday message... 💌" className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-primary-500 outline-none resize-none" />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary-500" /> Choose Theme</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {THEMES.map(t => (
                  <button key={t.id} type="button" onClick={() => setSelectedTheme(t.id)} className={`p-4 rounded-2xl border-2 transition-all ${selectedTheme === t.id ? 'border-primary-500 ring-2 ring-primary-500/20 scale-105' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className={`w-full h-16 bg-gradient-to-br ${t.gradient} rounded-xl mb-2`} />
                    <p className="text-sm font-medium text-gray-900">{t.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-primary-500" /> Photos</h2>
              <div className={`border-2 border-dashed border-pink-300 rounded-2xl p-8 text-center ${theme.bg}`}>
                <input type="file" id="photo-upload" multiple accept="image/*" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                <label htmlFor="photo-upload" className="cursor-pointer block">
                  <ImageIcon className="w-12 h-12 text-primary-400 mx-auto mb-3" />
                  <p className="font-medium text-gray-700 mb-1">Click to upload photos</p>
                  <p className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'PNG, JPG, GIF up to 10MB'}</p>
                </label>
              </div>
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {photos.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt="" className="w-full h-24 object-cover rounded-xl" />
                      <button type="button" onClick={() => removePhoto(i)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">Preview of your theme:</p>
            <div className={`rounded-3xl p-8 ${theme.bg} border-2 border-dashed border-primary-200`}>
              <h2 className="text-2xl font-display font-bold text-center gradient-text">{name || 'Name'}</h2>
              {message && <p className="text-center text-gray-600 mt-2 italic">"{message.slice(0, 100)}..."</p>}
            </div>
          </div>

          <Button type="submit" isLoading={creating} className="w-full" size="lg">Create Birthday Site! 🎉</Button>
        </form>
      </div>
    </div>
  );
}