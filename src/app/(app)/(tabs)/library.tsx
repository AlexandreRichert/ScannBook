import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Bookcase } from '@/components/library/Bookcase';
import { BottomTabInset, Fonts, MaxContentWidth, Palette } from '@/constants/theme';
import { useLibrary } from '@/hooks/useLibrary';
import type { Shelf } from '@/lib/Shelves';

/** Library tab: every shelf at a glance as one bookcase (Figma frame 15), each cubby opening its shelf. */
export default function LibraryScreen() {
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
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + BottomTabInset + 24 },
      ]}>
      <StatusBar style="dark" />
      <View style={styles.heading}>
        <Text style={styles.title} accessibilityRole="header">
          Mes piles
        </Text>
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
    gap: 28,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  heading: {
    gap: 4,
    paddingHorizontal: 4,
  },
  title: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -1.05,
  },
  count: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
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
