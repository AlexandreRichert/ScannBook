import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BOOK_SHEET_GUTTER } from '@/components/book/BookSheet';
import { BookSheetSkeleton } from '@/components/book/BookSheetSkeleton';
import { BookStatus, LookupErrorStatus, StatusButton, StatusText } from '@/components/book/BookStatus';
import { LibraryPanel } from '@/components/library/LibraryPanel';
import { BookScreenColors as C } from '@/constants/BookScreenColors';
import { Fonts, MaxContentWidth } from '@/constants/theme';
import { useBookByIsbn, type BookByIsbnState } from '@/hooks/useBookByIsbn';
import { invalidIsbnMessage } from '@/lib/BookLookupMessages';

/**
 * Details of a book, opened from the scanner, the manual entry or a deep link
 * such as `scannbook://book/9782080145307`.
 */
export default function BookScreen() {
  const { isbn } = useLocalSearchParams<{ isbn: string }>();
  const { state, search, retry } = useBookByIsbn();
  const insets = useSafeAreaInsets();
  const isStatus = state.status !== 'success' && state.status !== 'loading' && state.status !== 'idle';

  useEffect(() => {
    search(isbn);
  }, [isbn, search]);

  return (
    <>
      <Stack.Screen
        options={{
          title: '',
          headerBackTitle: 'Retour',
          headerTintColor: C.primary,
          headerBackTitleStyle: { fontFamily: Fonts.body },
          headerStyle: { backgroundColor: C.background },
          headerShadowVisible: false,
        }}
      />
      <StatusBar style="dark" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          isStatus && styles.statusContent,
          { paddingBottom: insets.bottom + 24 },
        ]}>
        <Animated.View key={state.status} entering={FadeIn.duration(220)}>
          <Content state={state} onRetry={retry} />
        </Animated.View>
      </ScrollView>
    </>
  );
}

function Content({ state, onRetry }: { state: BookByIsbnState; onRetry: () => void }) {
  const router = useRouter();

  // `navigate` goes back to the tabs already in the stack and switches to the
  // scanner, whether the book was opened from it, from the manual entry or by a link.
  const scanAgain = () => router.navigate('/scan');
  // Manual ISBN entry, shown as a modal over the book screen.
  const enterIsbn = () => router.push('/isbn');

  switch (state.status) {
    case 'idle':
    case 'loading':
      return <BookSheetSkeleton />;
    case 'success':
      return (
        <LibraryPanel key={state.book.isbn13} book={state.book} />
      );
    case 'not-found':
      return (
        <BookStatus
          icon={{ ios: 'exclamationmark.magnifyingglass', android: 'search_off', web: 'search_off' }}
          title="Aucun livre trouvé"
          actions={
            <>
              <StatusButton label="Saisir l’ISBN" onPress={enterIsbn} />
              <StatusButton label="Scanner à nouveau" variant="secondary" onPress={scanAgain} />
            </>
          }>
          <StatusText>
            Aucun résultat pour l’ISBN{'\n'}
            <StatusText strong>{state.isbn13}</StatusText>
          </StatusText>
        </BookStatus>
      );
    case 'error':
      return <LookupErrorStatus error={state.error} onRetry={onRetry} />;
    case 'invalid':
      return (
        <BookStatus
          icon={{ ios: 'barcode', android: 'barcode', web: 'barcode' }}
          title="ISBN invalide"
          actions={<StatusButton label="Saisir l’ISBN" onPress={enterIsbn} />}>
          <StatusText>{invalidIsbnMessage(state.reason)}</StatusText>
        </BookStatus>
      );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: BOOK_SHEET_GUTTER,
    paddingTop: 8,
  },
  statusContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
});
