import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookStatus, StatusButton, StatusText } from '@/components/book/BookStatus';
import { BookOpeningProvider } from '@/components/library/BookOpening';
import { ShelfHeader } from '@/components/library/shelf-view/ShelfHeader';
import { ShelfRowView } from '@/components/library/shelf-view/ShelfRowView';
import { buildShelfRows, coverWidthFor, SHELF_PADDING } from '@/components/library/shelf-view/ShelfRows';
import { Fonts, MaxContentWidth, Palette } from '@/constants/theme';
import { useLibrary } from '@/hooks/useLibrary';
import { useLibrarySort } from '@/hooks/useLibrarySort';
import { sortBooks } from '@/lib/LibrarySort';
import { countByShelf, SHELVES, type Shelf } from '@/lib/Shelves';

/** One shelf in full: covers then spines on wooden boards (Figma frame 16), opened from the bookcase. */
export default function ShelfScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { state, retry } = useLibrary();
  const { shelf: requested } = useLocalSearchParams<{ shelf: string }>();
  const shelf = asShelf(requested) ?? 'to_read';
  const [sort, setSort] = useLibrarySort();

  const contentWidth = Math.min(width, MaxContentWidth) - 2 * SHELF_PADDING;
  const coverWidth = coverWidthFor(contentWidth);

  const rows = useMemo(() => {
    if (state.status !== 'success') return [];
    const books = sortBooks(state.books.filter((book) => book.status === shelf), sort);
    return buildShelfRows(books, { contentWidth, allCovers: shelf === 'reading' });
  }, [state, shelf, sort, contentWidth]);

  const scan = () => router.navigate('/scan');

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: '',
          headerBackTitle: 'Retour',
          headerTintColor: Palette.ink,
          headerBackTitleStyle: { fontFamily: Fonts.body },
          headerStyle: { backgroundColor: Palette.paper },
          headerShadowVisible: false,
        }}
      />
      <StatusBar style="dark" />

      {state.status === 'success' ? (
        <BookOpeningProvider>
          <FlatList
            style={styles.fill}
            data={rows}
            keyExtractor={(row) => row.key}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(Math.min(index, 5) * 50).duration(280)}>
                <ShelfRowView row={item} coverWidth={coverWidth} />
              </Animated.View>
            )}
            ListHeaderComponent={
              <ShelfHeader shelf={shelf} counts={countByShelf(state.books)} sort={sort} onSortChange={setSort} />
            }
            contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 24 }]}
            ListEmptyComponent={
              <View style={styles.empty}>
                <BookStatus
                  icon={{ ios: 'books.vertical', android: 'library_books', web: 'library_books' }}
                  title="Aucun livre ici"
                  actions={<StatusButton label="Scanner un livre" onPress={scan} />}
                />
              </View>
            }
          />
        </BookOpeningProvider>
      ) : (
        <>
          <ShelfHeader shelf={shelf} sort={sort} onSortChange={setSort} />
          {state.status === 'loading' ? (
            <ActivityIndicator style={styles.fill} color={Palette.ink} accessibilityLabel="Chargement de ta bibliothèque" />
          ) : (
            <View style={[styles.fill, styles.empty]}>
              <BookStatus
                icon={{ ios: 'wifi.slash', android: 'wifi_off', web: 'wifi_off' }}
                tone="error"
                title="Bibliothèque indisponible"
                actions={<StatusButton label="Réessayer" onPress={retry} />}>
                <StatusText>Vérifie ta connexion et réessaie.</StatusText>
              </BookStatus>
            </View>
          )}
        </>
      )}
    </View>
  );
}

function asShelf(value: string | undefined): Shelf | undefined {
  return SHELVES.find((shelf) => shelf === value);
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.paper,
  },
  fill: {
    flex: 1,
  },
  list: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SHELF_PADDING,
  },
});
