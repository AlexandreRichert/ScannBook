import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { supabase } from '@/data/Supabase';
import { authErrorMessage } from '@/lib/AuthErrors';
import type { ProfileName } from '@/lib/ProfileName';

type AuthContextValue = {
  session: Session | null;
  /** False for a guest, and while a recovery code has opened a session that has no new password yet. */
  isSignedIn: boolean;
  isLoading: boolean;
  isRecovering: boolean;
  /** Resolves to a French error message, or null on success. */
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<string | null>;
  resetPassword: (email: string, code: string, password: string) => Promise<string | null>;
  /** Resolves to a French error message, or null on success. */
  updateName: (name: ProfileName) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// A recovery code opens a real session. This flag outlives the app, so closing it before
// the new password is saved cannot turn that session into a sign-in at the next launch.
export const RECOVERY_PENDING_KEY = 'auth.recovery-pending';

function rememberRecovery(pending: boolean) {
  const write = pending ? AsyncStorage.setItem(RECOVERY_PENDING_KEY, '1') : AsyncStorage.removeItem(RECOVERY_PENDING_KEY);
  // Best effort: a lost write only brings back the behaviour from before the flag existed
  write.catch(() => {});
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    const pendingRecovery = AsyncStorage.getItem(RECOVERY_PENDING_KEY).catch(() => null);
    Promise.all([supabase.auth.getSession(), pendingRecovery]).then(([{ data }, pending]) => {
      setSession(data.session);
      if (pending && data.session) {
        // Not signed in while the sign-out below runs; its SIGNED_OUT event then clears the flag
        setIsRecovering(true);
        // Local scope: the user's sessions on other devices are not ours to end
        supabase.auth.signOut({ scope: 'local' }).catch(() => {});
      } else if (pending) {
        rememberRecovery(false);
      }
      setIsLoading(false);
    });

    // Keep this callback synchronous: awaiting another Supabase call inside it can deadlock the client
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      // A valid recovery code signs the user in before they have picked a new password
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovering(true);
        rememberRecovery(true);
      }
      if (event === 'SIGNED_OUT') {
        setIsRecovering(false);
        rememberRecovery(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return authErrorMessage(error.code);
    // Knowing the password is a full sign-in, whatever recovery was left unfinished
    setIsRecovering(false);
    rememberRecovery(false);
    return null;
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
  async function requestPasswordReset(email: string) {
    // Succeeds even for unknown emails, so the screen never reveals who has an account
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    return error ? authErrorMessage(error.code) : null;
  }

  async function resetPassword(email: string, code: string, password: string) {
    // On a retry the code is already used, the recovery session is what remains
    if (!isRecovering) {
      const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'recovery' });
      if (error) return authErrorMessage(error.code);
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return authErrorMessage(error.code);
    setIsRecovering(false);
    rememberRecovery(false);
    return null;
  }

  // Stored as account metadata, so no table is needed; USER_UPDATED then refreshes the session
  async function updateName({ firstName, lastName }: ProfileName) {
    const { error } = await supabase.auth.updateUser({
      data: { first_name: firstName.trim(), last_name: lastName.trim() },
    });
    return error ? authErrorMessage(error.code) : null;
  }

  return (
    <AuthContext
      value={{
        session,
        isSignedIn: !!session && !isRecovering,
        isLoading,
        isRecovering,
        signIn,
        signOut,
        signUp,
        requestPasswordReset,
        resetPassword,
        updateName,
      }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}