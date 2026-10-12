import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: '🏠 Dashboard', icon: '🏠' },
    { path: '/profile', label: '👤 Profile', icon: '👤' },
    { path: '/games', label: '🎮 Games', icon: '🎮' },
    { path: '/friends', label: '👥 Friends', icon: '👥' },
    { path: '/birthday', label: '🎂 Birthday', icon: '🎂' },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-pink-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-3xl">💕</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Love Dove
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === link.path
                    ? 'bg-pink-100 text-pink-700'
                    : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-pink-50 transition-colors"
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  {profile?.full_name?.[0] || profile?.email?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </button>

            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-pink-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-pink-100">
                    <p className="font-medium text-sm">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-gray-500">{profile?.email}</p>
                  </div>
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50" onClick={() => setShowDropdown(false)}>
                    👤 My Profile
                  </Link>
                  <Link to="/stats" className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50" onClick={() => setShowDropdown(false)}>
                    📊 My Stats
                  </Link>
                  <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                    🚪 Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
