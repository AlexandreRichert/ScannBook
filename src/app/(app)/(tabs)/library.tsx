import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SignInPrompt } from '@/components/guest/SignInPrompt';
import { Bookcase } from '@/components/library/Bookcase';
import { Logo } from '@/components/Logo';
import { Headline } from '@/components/ui/Headline';
import { BottomTabInset, Fonts, MaxContentWidth, Palette, Space } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useLibrary } from '@/hooks/useLibrary';
import type { Shelf } from '@/lib/Shelves';

export default function LibraryScreen() {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) {
    return (
      <SignInPrompt
        icon={{ ios: 'books.vertical', android: 'library_books', web: 'library_books' }}
        title="Tes piles t’attendent"
        body="Connecte-toi pour ranger tes livres par pile : à lire, en cours, lus, wishlist."
      />
    );
  }
  return <Library />;
}

/** Library tab: every shelf at a glance as one bookcase (Figma frame 15), each cubby opening its shelf. */
function Library() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, retry } = useLibrary();

  const openShelf = (shelf: Shelf) => router.push({ pathname: '/shelf/[shelf]', params: { shelf } });
  const count = state.status === 'success' ? state.books.length : null;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Space.block, paddingBottom: insets.bottom + BottomTabInset + Space.gutter },
      ]}>
      <StatusBar style="dark" />
      <View style={styles.bar}>
        <Logo />
      </View>
      <View style={styles.heading}>
        <Headline>Mes *piles*</Headline>
        {count !== null && (
          <Text style={styles.count}>
            {count} {count > 1 ? 'livres rangés' : 'livre rangé'}
          </Text>
        )}
      </View>

      {state.status === 'loading' && (
        <ActivityIndicator style={styles.status} color={Palette.ink} accessibilityLabel="Chargement de ta bibliothèque" />
      )}
      {state.status === 'error' && (
        <View style={styles.status}>
          <Text style={styles.errorText}>Bibliothèque indisponible. Vérifie ta connexion.</Text>
          <Pressable onPress={retry} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.retry}>Réessayer</Text>
          </Pressable>
        </View>
      )}
      {state.status === 'success' && (
        <Animated.View entering={FadeIn.duration(250)}>
          <Bookcase books={state.books} onOpenShelf={openShelf} />
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.paper,
  },
  content: {
    gap: Space.section,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Space.gutter,
  },
  // Same height as the bar of the home tab, so the logo sits at the same place on every tab
  bar: {
    justifyContent: 'center',
    minHeight: 40,
    marginBottom: Space.item - Space.section,
  },
  heading: {
    gap: Space.item,
  },
  count: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  status: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 48,
  },
  errorText: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 16,
    textAlign: 'center',
  },
  retry: {
    color: Palette.accentStrong,
    fontFamily: Fonts.display,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
});
