import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookStatus, StatusButton, StatusText } from '@/components/book/BookStatus';
import { LibraryBookRow } from '@/components/library/LibraryBookRow';
import { ShelfPicker } from '@/components/library/ShelfPicker';
import { SortPicker } from '@/components/library/SortPicker';
import { BookScreenColors as C } from '@/constants/BookScreenColors';
import { BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { useLibrary } from '@/hooks/useLibrary';
import { useLibrarySort } from '@/hooks/useLibrarySort';
import { sortBooks } from '@/lib/LibrarySort';
import { countByShelf, type Shelf } from '@/lib/Shelves';

export default function LibraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, retry } = useLibrary();
  const [shelf, setShelf] = useState<Shelf>('to_read');
  const [sort, setSort] = useLibrarySort();

  const books = useMemo(
    () => (state.status === 'success' ? sortBooks(state.books.filter((book) => book.status === shelf), sort) : []),
    [state, shelf, sort],
  );

  const scan = () => router.navigate('/scan');

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16 }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Ma bibliothèque
        </Text>
        {state.status === 'success' && (
          <View style={styles.filters}>
            <ShelfPicker
              value={shelf}
              onChange={setShelf}
              counts={countByShelf(state.books)}
              scrollable
              contentContainerStyle={styles.filtersContent}
            />
          </View>
        )}
        {state.status === 'success' && <SortPicker value={sort} onChange={setSort} />}
      </View>

      {state.status === 'loading' && (
        <ActivityIndicator style={styles.fill} color={C.primary} accessibilityLabel="Chargement de ta bibliothèque" />
      )}

      {state.status === 'error' && (
        <View style={[styles.fill, styles.centered]}>
          <BookStatus
            icon={{ ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' }}
            tone="error"
            title="Bibliothèque indisponible"
            actions={<StatusButton label="Réessayer" onPress={retry} />}>
            <StatusText>Vérifie ta connexion et réessaie.</StatusText>
          </BookStatus>
        </View>
      )}

      {state.status === 'success' && (
        <FlatList
          style={styles.fill}
          data={books}
          keyExtractor={(book) => book.id}
          renderItem={({ item }) => <LibraryBookRow book={item} />}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + BottomTabInset + 24 },
          ]}
          ListEmptyComponent={
            <BookStatus
              icon={{ ios: 'books.vertical', android: 'library_books', web: 'library_books' }}
              title="Aucun livre ici"
              actions={<StatusButton label="Scanner un livre" onPress={scan} />}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 16,
  },
  title: {
    color: C.text,
    fontSize: 28,
    fontWeight: '700',
  },
    // Cancels the header padding so the row scrolls edge to edge, then puts it back inside the row
  filters: {
    marginHorizontal: -20,
  },
  filtersContent: {
    paddingHorizontal: 20,
  },
  fill: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  list: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: 20,
    gap: 10,
    flexGrow: 1,
  },
});