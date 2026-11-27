import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BestResultCard } from '@/components/search/BestResultCard';
import { SearchField } from '@/components/search/SearchField';
import { SearchResultRow } from '@/components/search/SearchResultRow';
import { SearchStatus } from '@/components/search/SearchStatus';
import { BookScreenColors as C } from '@/constants/BookScreenColors';
import { MaxContentWidth } from '@/constants/theme';
import { useBookSearch } from '@/hooks/useBookSearch';
import { useAuth } from '@/hooks/useAuth';
import { useLibraryShelves } from '@/hooks/useLibraryShelves';
import type { BookInfo } from '@/types/Book';

/** Search by title or author (Figma « Maquettes v2 », frame 06). */
export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { query, setQuery, submit, retry, state } = useBookSearch();
  const results = state.status === 'success' ? state.results : [];
  const { isSignedIn } = useAuth();
  // A guest owns no book: an empty list keeps the hook from querying the library
  const shelves = useLibraryShelves(isSignedIn ? results.map((book) => book.isbn13) : []);

  const openBook = (book: BookInfo) => router.push(`/book/${book.isbn13}`);

  return (
    <View style={styles.screen}>
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

      <View style={[styles.column, styles.header]}>
        <Text style={styles.title} accessibilityRole="header">
          Recherche
        </Text>
        <SearchField value={query} onChangeText={setQuery} onSubmit={submit} />
      </View>

      {state.status === 'success' ? (
        <FlatList
          data={state.results.slice(1)}
          keyExtractor={(book) => book.isbn13}
          extraData={shelves}
          renderItem={({ item }) => (
            <SearchResultRow book={item} shelf={shelves.get(item.isbn13)} onPress={() => openBook(item)} />
          )}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.count} accessibilityLiveRegion="polite">
                {state.results.length} résultat{state.results.length > 1 ? 's' : ''} pour « {state.query} »
              </Text>
              <BestResultCard
                book={state.results[0]}
                shelf={shelves.get(state.results[0].isbn13)}
                onPress={() => openBook(state.results[0])}
              />
            </View>
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[styles.column, { paddingBottom: insets.bottom + 24 }]}
        />
      ) : (
        <View style={[styles.column, styles.status]}>
          <SearchStatus state={state} onRetry={retry} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.background,
  },
  column: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  header: {
    gap: 16,
    paddingBottom: 16,
  },
  title: {
    color: C.text,
    fontSize: 28,
    fontWeight: '700',
  },
  listHeader: {
    gap: 16,
    paddingBottom: 16,
  },
  count: {
    color: C.textSecondary,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  status: {
    paddingTop: 32,
  },
});
