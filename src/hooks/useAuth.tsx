
import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { supabase } from '@/data/Supabase';
import { authErrorMessage } from '@/lib/AuthErrors';

type AuthContextValue = {
  session: Session | null;
  isLoading: boolean;
  /** Resolves to a French error message, or null on success. */
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    // Keep this callback synchronous: awaiting another Supabase call inside it can deadlock the client
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession));

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error ? authErrorMessage(error.code) : null;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) return authErrorMessage(error.code);
    // Only happens if "Confirm email" is turned back on in Supabase
    if (!data.session) return 'Compte créé : confirme ton adresse email avant de te connecter.';
    return null;
  }

  return <AuthContext value={{ session, isLoading, signIn, signOut, signUp }}>{children}</AuthContext>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}