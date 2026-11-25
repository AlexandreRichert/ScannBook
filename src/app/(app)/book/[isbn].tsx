import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookSheet } from '@/components/book/BookSheet';
import { BookSheetSkeleton } from '@/components/book/BookSheetSkeleton';
import { BookStatus, StatusButton, StatusText } from '@/components/book/BookStatus';
import { BookScreenColors as C } from '@/constants/BookScreenColors';
import { MaxContentWidth } from '@/constants/theme';
import { useBookByIsbn, type BookByIsbnState } from '@/hooks/useBookByIsbn';
import {
  bookLookupErrorMessage,
  bookLookupErrorTitle,
  invalidIsbnMessage,
} from '@/lib/BookLookupMessages';

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
        <Content state={state} onRetry={retry} />
      </ScrollView>
    </>
  );
}

function Content({ state, onRetry }: { state: BookByIsbnState; onRetry: () => void }) {
  const router = useRouter();

  // Temporary targets until the scanner (US-03) and manual entry (US-01) exist.
  const scanAgain = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const enterIsbn = () => router.navigate('/isbn-test');

  switch (state.status) {
    case 'idle':
    case 'loading':
      return <BookSheetSkeleton />;
    case 'success':
      return <BookSheet book={state.book} />;
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
      return (
        <BookStatus
          icon={
            state.error.kind === 'network'
              ? { ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' }
              : { ios: 'exclamationmark.triangle', android: 'warning', web: 'warning' }
          }
          tone="error"
          title={bookLookupErrorTitle(state.error)}
          actions={
            <StatusButton
              label="Réessayer"
              icon={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }}
              onPress={onRetry}
            />
          }>
          <StatusText>{bookLookupErrorMessage(state.error)}</StatusText>
        </BookStatus>
      );
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
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  statusContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
});
