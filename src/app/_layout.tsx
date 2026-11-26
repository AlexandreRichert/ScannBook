import { DefaultTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppFonts, Palette } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/hooks/useAuth';

SplashScreen.preventAutoHideAsync();

const NavigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Palette.ink,
    background: Palette.paper,
    card: Palette.paper,
    text: Palette.ink,
    border: Palette.line,
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={NavigationTheme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootNavigator() {
  const { session, isLoading, isRecovering } = useAuth();
  const [fontsLoaded, fontError] = useFonts(AppFonts);
  const isSignedIn = !!session && !isRecovering;
  // A font that fails to load falls back to the system font rather than blocking the app
  const fontsReady = fontsLoaded || !!fontError;
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={isSignedIn} redirectTo="/sign-in">
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!isSignedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        {/* Outside both guards: the privacy policy has to be readable before an account exists */}
        <Stack.Screen name="legal" />
      </Stack>
      {/* The overlay hides the native splash, so it waits until the stored session and the fonts are ready */}
      {!isLoading && fontsReady && <AnimatedSplashOverlay />}
    </>
  );
}
