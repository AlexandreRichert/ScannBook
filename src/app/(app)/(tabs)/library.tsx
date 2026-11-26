import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookStatus, StatusButton, StatusText } from '@/components/book/BookStatus';
import { LibraryBookRow } from '@/components/library/LibraryBookRow';
import { ShelfPicker } from '@/components/library/ShelfPicker';
import { BookScreenColors as C } from '@/constants/BookScreenColors';
import { BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { useLibrary } from '@/hooks/useLibrary';
import { countByShelf, type Shelf } from '@/lib/Shelves';

export default function LibraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, retry } = useLibrary();
  const [shelf, setShelf] = useState<Shelf>('to_read');

  const scan = () => router.navigate('/scan');

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16 }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          Ma bibliothèque
        </Text>
        {state.status === 'success' && (
          <ShelfPicker value={shelf} onChange={setShelf} counts={countByShelf(state.books)} />
        )}
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
          data={state.books.filter((book) => book.status === shelf)}
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