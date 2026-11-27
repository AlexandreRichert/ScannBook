import { DefaultTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { Preloader } from '@/components/Preloader';
import { AppFonts, Palette } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/hooks/useAuth';

SplashScreen.preventAutoHideAsync();

const NavigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Palette.accentStrong,
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
      {/* Plays once the stored session and the fonts are ready, and hides the native splash at that point */}
      <Preloader ready={!isLoading && fontsReady} />
    </>
  );
}
