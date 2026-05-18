import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  id: string;
  name: string | null;
  handle: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  role: string | null;
  branch: string | null;
  section: string | null;
  semester: string | null;
  batch: string | null;
  gender: string | null;
  github_url: string | null;
  skills: string[] | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata: Record<string, string>) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, handle, avatar_url, banner_url, bio, role, branch, section, semester, batch, gender, github_url, skills')
        .eq('id', userId)
        .maybeSingle();
      if (!error && data) setProfile(data as Profile);
    } catch {
      // Silently fail - profile may not exist yet
    }
  }, []);

  const ensureProfile = useCallback(async (currentUser: User) => {
    try {
      const { data: existing } = await supabase
        .from('profiles')
        .select('id, name, handle, avatar_url, banner_url, bio, role, branch, section, semester, batch, gender, github_url, skills')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (existing) {
        setProfile(existing as Profile);
      } else {
        // Auto-create profile (trigger should handle this, but fallback)
        const meta = currentUser.user_metadata;
        const profileData = {
          id: currentUser.id,
          name: meta?.full_name || meta?.name || currentUser.email?.split('@')[0] || 'User',
          handle: currentUser.email?.split('@')[0] || currentUser.id.slice(0, 8),
          avatar_url: meta?.avatar_url || null,
          bio: 'MNNIT Student',
          role: 'Student',
          branch: meta?.branch || 'CSE',
          section: meta?.section || 'A',
        };
        const { data: newProfile, error } = await supabase.from('profiles').insert(profileData).select().maybeSingle();
        if (!error && newProfile) setProfile(newProfile as unknown as Profile);
      }
    } catch {
      // Profile creation may fail if trigger already created it
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Set up auth listener FIRST. Keep the callback synchronous to avoid Supabase auth deadlocks.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (event === 'SIGNED_OUT') {
        setProfile(null);
        return;
      }

      if (event === 'TOKEN_REFRESHED' && !session) {
        // Session expired and couldn't be refreshed
        setProfile(null);
        toast.error('Your session has expired. Please sign in again.');
        return;
      }

      if (session?.user) {
        // Defer to avoid Supabase deadlocks
        setTimeout(() => ensureProfile(session.user), 300);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;

      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) ensureProfile(session.user);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [ensureProfile]);

  const signUp = async (email: string, password: string, metadata: Record<string, string>) => {
    // Validate email domain
    if (!email.endsWith('@mnnit.ac.in')) {
      return { error: { message: 'Only @mnnit.ac.in email addresses are allowed' } };
    }
    if (password.length < 6) {
      return { error: { message: 'Password must be at least 6 characters' } };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      return { error: { message: 'Email and password are required' } };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signInWithGoogle = async () => {
    const callbackUrl = new URL('/auth/callback', window.location.origin);
    const lovableToken = new URLSearchParams(window.location.search).get('__lovable_token');
    if (lovableToken) {
      callbackUrl.searchParams.set('__lovable_token', lovableToken);
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl.toString() },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    if (!email.trim()) {
      return { error: { message: 'Email is required' } };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    if (newPassword.length < 6) {
      return { error: { message: 'Password must be at least 6 characters' } };
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signUp, signIn, signInWithGoogle, signOut, refreshProfile, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};
