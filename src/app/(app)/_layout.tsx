import { Stack } from 'expo-router';

export const unstable_settings = {
  // A deep link straight to /book/... still has the tabs below it, so back works.
  anchor: '(tabs)',
};

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="book/[isbn]" options={{ title: '' }} />
      <Stack.Screen name="isbn" options={{ presentation: 'modal', headerShown: false }} />
    </Stack>
  );
}
