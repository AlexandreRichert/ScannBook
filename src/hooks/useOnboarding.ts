import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const storageKey = (userId: string) => `onboarding-done:${userId}`;

/** Whether the « Premiers pas » still have to be shown to this account on this device. */
export function useOnboarding(userId: string | undefined) {
  const [state, setState] = useState<{ userId: string; done: boolean } | null>(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    AsyncStorage.getItem(storageKey(userId)).then(
      (value) => !cancelled && setState({ userId, done: value === 'true' }),
      // Better to skip the intro than to block the app on a storage error
      () => !cancelled && setState({ userId, done: true }),
    );
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const finish = useCallback(() => {
    if (!userId) return;
    setState({ userId, done: true });
    AsyncStorage.setItem(storageKey(userId), 'true').catch(() => {});
  }, [userId]);

  const needsOnboarding = !!userId && state?.userId === userId && !state.done;
  return { needsOnboarding, finish };
}
