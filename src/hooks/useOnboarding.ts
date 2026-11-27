import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const GUEST = 'guest';
const storageKey = (viewer: string) => `onboarding-done:${viewer}`;

/**
 * Whether the « Premiers pas » still have to be shown on this device. A guest
 * sees them once, and signing in afterwards does not replay them.
 */
export function useOnboarding(userId: string | undefined) {
  const viewer = userId ?? GUEST;
  const [state, setState] = useState<{ viewer: string; done: boolean } | null>(null);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.multiGet([storageKey(GUEST), storageKey(viewer)]).then(
      (entries) => !cancelled && setState({ viewer, done: entries.some(([, value]) => value === 'true') }),
      // Better to skip the intro than to block the app on a storage error
      () => !cancelled && setState({ viewer, done: true }),
    );
    return () => {
      cancelled = true;
    };
  }, [viewer]);

  const finish = useCallback(() => {
    setState({ viewer, done: true });
    AsyncStorage.multiSet([
      [storageKey(GUEST), 'true'],
      [storageKey(viewer), 'true'],
    ]).catch(() => {});
  }, [viewer]);

  const needsOnboarding = state?.viewer === viewer && !state.done;
  return { needsOnboarding, finish };
}
