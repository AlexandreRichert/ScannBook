import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BOOK_SHEET_GUTTER, BookSheet } from '@/components/book/BookSheet';
import { StatusButton } from '@/components/book/BookStatus';
import { RemoveFromLibrary } from '@/components/library/RemoveFromLibrary';
import { ShelfCard } from '@/components/library/ShelfCard';
import { ShelfPicker } from '@/components/library/ShelfPicker';
import { PressableScale } from '@/components/ui/PressableScale';
import { Fonts, Palette } from '@/constants/theme';
import { useLibraryEntry } from '@/hooks/useLibraryEntry';
import type { Shelf } from '@/lib/Shelves';
import type { BookInfo } from '@/types/Book';

/** Book screen: the sheet, with the library actions under the title and the remove action at the very end. */
export function LibraryPanel({ book }: { book: BookInfo }) {
  const library = useLibraryEntry(book.isbn13);
  const present = library.state.status === 'present';

  return (
    <BookSheet
      book={book}
      badge={present ? <InLibraryBadge /> : undefined}
      footer={present ? <RemoveFromLibrary onRemove={library.remove} /> : undefined}>
      <LibraryActions book={book} library={library} />
    </BookSheet>
  );
}

function InLibraryBadge() {
  return (
    <View style={styles.badge} accessibilityLiveRegion="polite">
      <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={12} tintColor={Palette.inkSecondary} />
      {/* Short on purpose: the metadata column is about 140 pt wide on a 390 pt phone */}
      <Text style={styles.badgeText} numberOfLines={1}>
        Dans mes livres
      </Text>
    </View>
  );
}

/** Adds the book to a shelf, or shows and changes the shelf it is on. */
function LibraryActions({ book, library }: { book: BookInfo; library: ReturnType<typeof useLibraryEntry> }) {
  const { state, reload, add, move, setDates, setCurrentPage } = library;
  const [shelf, setShelf] = useState<Shelf>('to_read');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleAdd(target: Shelf) {
    if (isSaving) return;
    setIsSaving(true);
    setError(await add(book, target));
    setIsSaving(false);
  }

  if (state.status === 'loading') {
    return (
      <ActivityIndicator style={styles.panel} color={Palette.ink} accessibilityLabel="Chargement de ta bibliothèque" />
    );
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
      <ShelfCard
        entry={state.entry}
        onMove={move}
        onDatesChange={setDates}
        onPageChange={setCurrentPage}
      />
    );
  }

  return (
    <View style={styles.panel}>
      <View style={styles.group}>
        <Text style={styles.caps} accessibilityRole="header">
          Pile
        </Text>
        <View style={styles.bleed}>
          <ShelfPicker
            value={shelf}
            onChange={setShelf}
            disabled={isSaving}
            scrollable
            contentContainerStyle={styles.bleedContent}
          />
        </View>
      </View>
      {error && (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      )}
      <View style={styles.actions}>
        <PressableScale
          haptic
          onPress={() => handleAdd(shelf)}
          disabled={isSaving}
          accessibilityRole="button"
          style={[styles.addButton, isSaving && styles.pressed]}>
          <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={20} tintColor={Palette.inkInverse} />
          <Text style={styles.addLabel} numberOfLines={1} adjustsFontSizeToFit>
            {isSaving ? 'Ajout…' : 'Ajouter à ma bibliothèque'}
          </Text>
        </PressableScale>
        <PressableScale
          haptic
          onPress={() => handleAdd('wishlist')}
          disabled={isSaving}
          accessibilityRole="button"
          accessibilityLabel="Ajouter à mes envies"
          style={[styles.wishButton, isSaving && styles.pressed]}>
          <SymbolView name={{ ios: 'heart', android: 'favorite_border', web: 'favorite_border' }} size={22} tintColor={Palette.ink} />
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    flexShrink: 1,
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
  },
  panel: {
    marginTop: 10,
    gap: 16,
  },
  group: {
    gap: 8,
  },
  caps: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.display,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 0.88,
    textTransform: 'uppercase',
  },
  // The chip row scrolls to the screen edges, past the content padding
  bleed: {
    marginHorizontal: -BOOK_SHEET_GUTTER,
  },
  bleedContent: {
    paddingHorizontal: BOOK_SHEET_GUTTER,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    paddingHorizontal: 20,
    borderRadius: 4,
    backgroundColor: Palette.accentStrong,
    experimental_backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.09) 0%, rgba(0, 0, 0, 0.1) 100%)',
  },
  addLabel: {
    flexShrink: 1,
    color: Palette.inkInverse,
    fontFamily: Fonts.display,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: -0.16,
  },
  wishButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.paperRaised,
    borderWidth: 1,
    borderColor: Palette.lineStrong,
  },
  pressed: {
    opacity: 0.7,
  },
  error: {
    color: Palette.danger,
    fontFamily: Fonts.body,
    fontSize: 15,
  },
});
