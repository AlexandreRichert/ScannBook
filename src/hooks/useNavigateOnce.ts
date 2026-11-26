import { useFocusEffect, useRouter, type Href } from 'expo-router';
import { useCallback, useRef } from 'react';

/**
 * `router.push` that opens at most one screen until this screen is focused
 * again: double taps and actions racing each other (a scan and a tap) are
 * ignored. A ref, so the lock applies at once, before any render.
 */
export function useNavigateOnce() {
  const router = useRouter();
  const navigatingRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      navigatingRef.current = false;
    }, []),
  );

  return useCallback(
    (href: Href) => {
      if (navigatingRef.current) return;
      navigatingRef.current = true;
      router.push(href);
    },
    [router],
  );
}
