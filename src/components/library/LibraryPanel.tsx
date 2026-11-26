import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { StatusButton } from '@/components/book/BookStatus';
import { ShelfPicker } from '@/components/library/ShelfPicker';
import { BookScreenColors as C } from '@/constants/BookScreenColors';
import { useLibraryEntry } from '@/hooks/useLibraryEntry';
import { SHELF_LABELS, type Shelf } from '@/lib/Shelves';
import type { BookInfo } from '@/types/Book';

/** Bottom of the book screen: add the book to a shelf, or show the shelf it is on. */
export function LibraryPanel({ book }: { book: BookInfo }) {
  const { state, reload, add } = useLibraryEntry(book.isbn13);
  const [shelf, setShelf] = useState<Shelf>('to_read');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleAdd() {
    if (isSaving) return;
    setIsSaving(true);
    setError(await add(book, shelf));
    setIsSaving(false);
  }

  if (state.status === 'loading') {
    return <ActivityIndicator style={styles.panel} color={C.primary} accessibilityLabel="Chargement de ta bibliothèque" />;
  }

  if (state.status === 'error') {
    return (
      <View style={styles.panel}>
        <Text style={styles.error}>Impossible de vérifier ta bibliothèque.</Text>
        <StatusButton label="Réessayer" variant="secondary" onPress={reload} />
      </View>
    );
  }

  if (state.status === 'present') {
    return (
      <View style={[styles.panel, styles.confirmation]} accessibilityLiveRegion="polite">
        <SymbolView
          name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
          size={22}
          tintColor={C.primary}
        />
        <Text style={styles.confirmationText}>
          Dans ta pile <Text style={styles.strong}>{SHELF_LABELS[state.entry.status]}</Text>
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        Ajouter à une pile
      </Text>
      <ShelfPicker value={shelf} onChange={setShelf} disabled={isSaving} />
      {error && (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      )}
      <StatusButton label={isSaving ? 'Ajout…' : 'Ajouter à ma bibliothèque'} onPress={handleAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: 28,
    gap: 14,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 17,
    fontWeight: '700',
  },
  confirmation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  confirmationText: {
    flex: 1,
    color: C.text,
    fontSize: 16,
  },
  strong: {
    fontWeight: '700',
  },
  error: {
    color: C.error,
    fontSize: 15,
  },
});