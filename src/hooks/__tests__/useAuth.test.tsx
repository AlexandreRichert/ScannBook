// First, so `jest` exists when the hoisted mock factories below run
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

import { supabase } from '@/data/Supabase';
import { AuthProvider, RECOVERY_PENDING_KEY, useAuth } from '@/hooks/useAuth';

type Listener = (event: AuthChangeEvent, session: Session | null) => void;

// What the provider subscribed with: lets a test play the events Supabase would send.
let mockEmit: Listener = () => {};

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@/data/Supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn((listener: Listener) => {
        mockEmit = listener;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      }),
      signOut: jest.fn(async () => {
        mockEmit('SIGNED_OUT', null);
        return { error: null };
      }),
      signInWithPassword: jest.fn(async () => ({ error: null })),
      verifyOtp: jest.fn(async () => ({ error: null })),
      updateUser: jest.fn(async () => ({ error: null })),
    },
  },
}));

const SESSION = { user: { id: 'user-1' } } as Session;

// Two literals: the Supabase return type is a union that a `Session | null` field does not match
const storedSession = (session: Session | null) =>
  jest
    .mocked(supabase.auth.getSession)
    .mockResolvedValue(session ? { data: { session }, error: null } : { data: { session: null }, error: null });

const pendingFlag = () => AsyncStorage.getItem(RECOVERY_PENDING_KEY);

async function renderAuth() {
  const { result } = await renderHook(() => useAuth(), { wrapper: AuthProvider });
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  return result;
}

afterEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('useAuth recovery', () => {
  it('signs in with a stored session when no recovery was pending', async () => {
    storedSession(SESSION);

    const auth = await renderAuth();

    expect(auth.current.isSignedIn).toBe(true);
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
  });

  it('drops the session of a recovery the app was closed on', async () => {
    await AsyncStorage.setItem(RECOVERY_PENDING_KEY, '1');
    storedSession(SESSION);

    const auth = await renderAuth();

    await waitFor(() => expect(auth.current.session).toBeNull());
    expect(supabase.auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(auth.current.isSignedIn).toBe(false);
    await waitFor(async () => expect(await pendingFlag()).toBeNull());
  });

  it('forgets a pending recovery that left no session', async () => {
    await AsyncStorage.setItem(RECOVERY_PENDING_KEY, '1');
    storedSession(null);

    const auth = await renderAuth();

    expect(auth.current.isSignedIn).toBe(false);
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
    await waitFor(async () => expect(await pendingFlag()).toBeNull());
  });

  it('remembers a recovery until the new password is saved', async () => {
    storedSession(null);
    const auth = await renderAuth();

    await act(async () => mockEmit('PASSWORD_RECOVERY', SESSION));

    expect(auth.current.isSignedIn).toBe(false);
    await waitFor(async () => expect(await pendingFlag()).toBe('1'));

    await act(async () => {
      await auth.current.resetPassword('reader@example.com', '123456', 'a-new-long-password');
    });

    expect(auth.current.isSignedIn).toBe(true);
    await waitFor(async () => expect(await pendingFlag()).toBeNull());
  });

  it('ends an unfinished recovery on a password sign-in', async () => {
    storedSession(null);
    const auth = await renderAuth();
    await act(async () => mockEmit('PASSWORD_RECOVERY', SESSION));

    await act(async () => {
      await auth.current.signIn('reader@example.com', 'the-old-password');
    });

    expect(auth.current.isSignedIn).toBe(true);
    await waitFor(async () => expect(await pendingFlag()).toBeNull());
  });
});
