import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function BirthdayDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    loadSite();
    incrementView();
  }, [id]);

  const loadSite = async () => {
    const { data } = await supabase
      .from('birthday_sites')
      .select('*')
      .eq('id', id)
      .single();
    if (data) setSite(data);
  };

  const incrementView = async () => {
    await supabase.rpc('increment_view', { site_id: id });
  };

  const handlePhotoUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);

    const newPhotos = [...(site.photos || [])];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}-${file.name}`;

      await supabase.storage.from('birthday-photos').upload(path, file, { upsert: true });
      const { data: { publicUrl } } = supabase.storage.from('birthday-photos').getPublicUrl(path);
      newPhotos.push(publicUrl);
    }

    const { data } = await supabase
      .from('birthday_sites')
      .update({ photos: newPhotos })
      .eq('id', id)
      .select()
      .single();

    if (data) setSite(data);
    setUploading(false);
  };

  if (!site) return <div className="text-center py-12">Loading...</div>;

  const themes = {
    romantic: 'from-pink-400 via-red-400 to-pink-500',
    cute: 'from-pink-300 via-purple-300 to-pink-300',
    elegant: 'from-purple-400 via-indigo-400 to-purple-500',
    fun: 'from-yellow-300 via-pink-300 to-purple-300',
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className={`bg-gradient-to-br ${themes[site.theme] || themes.romantic} text-white py-20 px-4 text-center`}>
        <h1 className="text-6xl font-bold mb-4 animate-fadeIn">Happy Birthday</h1>
        <h2 className="text-5xl font-bold mb-6">{site.name}! 🎉</h2>
        {site.message && <p className="text-xl max-w-2xl mx-auto">{site.message}</p>}
      </div>

      {/* Photos */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h3 className="text-3xl font-bold text-center mb-8">📸 Beautiful Memories</h3>

        {user && site.user_id === user.id && (
          <div className="text-center mb-6">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
            >
              {uploading ? 'Uploading...' : '📷 Add Photos'}
            </button>
            <input ref={fileRef} type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
          </div>
        )}

        {site.photos && site.photos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {site.photos.map((photo, idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden shadow-lg aspect-square">
                <img src={photo} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No photos yet. {user && site.user_id === user.id && 'Add some memories!'}</p>
        )}

        <div className="text-center mt-8 text-gray-500">
          <p>👁️ {site.view_count} views • Created {new Date(site.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Share */}
      <div className="bg-pink-50 py-8 text-center">
        <h3 className="text-2xl font-bold mb-4">Share with loved ones! 💕</h3>
        <button
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          📋 Copy Link
        </button>
        <Link to="/birthday" className="ml-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 inline-block">
          ← Back to Sites
        </Link>
      </div>
    </div>
  );
}
