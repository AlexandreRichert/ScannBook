import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { Onboarding } from '@/components/onboarding/Onboarding';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { takeReturnToBook } from '@/lib/ReturnAfterSignIn';

export const unstable_settings = {
  // A deep link straight to /book/... still has the tabs below it, so back works.
  anchor: '(tabs)',
};

export default function AppLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { session, isSignedIn } = useAuth();
  const { needsOnboarding, finish } = useOnboarding(session?.user.id);

  // A guest who signed in from a book screen lands back on that book. The router first sends
  // a new session to the home tab, so this waits until the sign-in screens are gone to open the book.
  const leftAuth = segments[0] !== '(auth)';
  useEffect(() => {
    if (!isSignedIn || !leftAuth) return;
    const book = takeReturnToBook();
    if (book) router.push(book);
  }, [isSignedIn, leftAuth, router]);

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="book/[isbn]" options={{ title: '' }} />
        <Stack.Screen name="isbn" options={{ presentation: 'modal', headerShown: false }} />
        {/* These two read the account's data, a guest reaching them by a link is sent back to the tabs */}
        <Stack.Protected guard={isSignedIn}>
          <Stack.Screen name="shelf/[shelf]" options={{ title: '' }} />
          <Stack.Screen name="edit-name" options={{ presentation: 'modal', headerShown: false }} />
        </Stack.Protected>
      </Stack>
      {/* An overlay rather than a route, so no back gesture or deep link can land past it half done */}
      {needsOnboarding && <Onboarding onDone={finish} />}
    </>
  );
}
