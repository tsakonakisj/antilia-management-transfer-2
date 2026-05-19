import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (authUserId: string) => {
    if (!supabase) return null;
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUserId)
      .maybeSingle();
    return data as User | null;
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id).then(profile => {
          setUser(profile);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          const profile = await loadUserProfile(session.user.id);
          setUser(profile);
        } else {
          setUser(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (data.user) {
      const profile = await loadUserProfile(data.user.id);
      if (!profile) throw new Error('User profile not found');
      setUser(profile);
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);
    }
  };

  const logout = () => {
    if (supabase) supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
