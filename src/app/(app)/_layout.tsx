import { Stack } from 'expo-router';

import { Onboarding } from '@/components/onboarding/Onboarding';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';

export const unstable_settings = {
  // A deep link straight to /book/... still has the tabs below it, so back works.
  anchor: '(tabs)',
};

export default function AppLayout() {
  const { session } = useAuth();
  const { needsOnboarding, finish } = useOnboarding(session?.user.id);

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="book/[isbn]" options={{ title: '' }} />
        <Stack.Screen name="shelf/[shelf]" options={{ title: '' }} />
        <Stack.Screen name="isbn" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="edit-name" options={{ presentation: 'modal', headerShown: false }} />
      </Stack>
      {/* An overlay rather than a route, so no back gesture or deep link can land past it half done */}
      {needsOnboarding && <Onboarding onDone={finish} />}
    </>
  );
}
