'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';

interface AuthContextValue {
  initialized: boolean;
}

export const AuthContext = createContext<AuthContextValue>({ initialized: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    // Get the current session on mount
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          if (profile && mounted) setUser(profile);
        }
      } catch (e) {
        console.error('Auth init error:', e);
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    init();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          if (profile) setUser(profile);
          else setUser(null);
        } else {
          setUser(null);
        }
        setLoading(false);
        setInitialized(true);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setLoading]);

  // While initializing, show nothing on protected routes
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">💕</div>
          <p className="text-gray-600 font-medium">Loading Love Dove...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={{ initialized }}>{children}</AuthContext.Provider>;
}
