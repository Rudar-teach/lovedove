'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && mounted) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (mounted) {
          if (data) setUser(data);
          else setUser({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.email || 'User',
            username: session.user.email?.split('@')[0] || 'user',
            avatar_url: null,
            cover_image_url: null,
            partner_id: null,
            bio: null,
            date_of_birth: null,
            anniversary_date: null,
            theme_color: 'pink',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          setIsLoading(false);
        }
      } else if (mounted) {
        setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (mounted) {
            if (data) setUser(data);
            else setUser({
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.email || 'User',
              username: session.user.email?.split('@')[0] || 'user',
              avatar_url: null,
              cover_image_url: null,
              partner_id: null,
              bio: null,
              date_of_birth: null,
              anniversary_date: null,
              theme_color: 'pink',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            setIsLoading(false);
          }
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
