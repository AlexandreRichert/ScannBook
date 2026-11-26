import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookCover } from '@/components/BookCover';
import { BookScreenColors as C } from '@/constants/BookScreenColors';
import { ShelfTag } from '@/components/search/ShelfTag';
import { authorsLabel, joinDetails, publicationYear } from '@/lib/BookFormat';
import { inLibraryLabel, type Shelf } from '@/lib/Shelves';
import type { BookInfo } from '@/types/Book';

type SearchResultRowProps = {
  book: BookInfo;
  /** Set when the book is already in the library. */
  shelf?: Shelf;
  onPress: () => void;
};

export function SearchResultRow({ book, shelf, onPress }: SearchResultRowProps) {
  const details = joinDetails(authorsLabel(book.authors), publicationYear(book.publishedDate));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={joinDetails(book.title, details, shelf && inLibraryLabel(shelf))}
      style={({ pressed }) => [styles.row, shelf && styles.owned, pressed && styles.pressed]}>
      <View>
        <BookCover
          key={book.isbn13}
          isbn13={book.isbn13}
          title={book.title}
          authors={book.authors}
          coverUrl={book.coverUrl}
          width={44}
        />
      </View>
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={2}>
          {book.title}
        </Text>
        <View style={styles.detailsLine}>
          {shelf && <ShelfTag shelf={shelf} />}
          <Text style={styles.details} numberOfLines={1}>
            {details}
          </Text>
        </View>
      </View>
      <SymbolView
        name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
        size={16}
        tintColor={C.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: C.text,
    fontSize: 17,
    fontWeight: '700',
  },
  detailsLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  details: {
    flexShrink: 1,
    color: C.textSecondary,
    fontSize: 14,
  },
  // Negative margin + padding: the box grows outward, so the cover stays aligned with the other rows.
  owned: {
    marginHorizontal: -10,
    marginVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: C.ownedBorder,
    backgroundColor: C.owned,
  },
  pressed: {
    opacity: 0.7,
  },
});
