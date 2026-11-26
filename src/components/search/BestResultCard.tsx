import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookWithSpine } from '@/components/BookWithSpine';
import { BookScreenColors as C } from '@/constants/BookScreenColors';
import { ShelfTag } from '@/components/search/ShelfTag';
import { authorsLabel, joinDetails, publicationYear } from '@/lib/BookFormat';
import { inLibraryLabel, type Shelf } from '@/lib/Shelves';
import type { BookInfo } from '@/types/Book';

type BestResultCardProps = {
  book: BookInfo;
  /** Set when the book is already in the library. */
  shelf?: Shelf;
  onPress: () => void;
};

export function BestResultCard({ book, shelf, onPress }: BestResultCardProps) {
  const authors = authorsLabel(book.authors);
  const details = joinDetails(
    book.publisher,
    publicationYear(book.publishedDate),
    book.pageCount ? `${book.pageCount} p.` : undefined,
  );

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={joinDetails(
        'Meilleur résultat',
        book.title,
        authors,
        details,
        shelf && inLibraryLabel(shelf),
      )}
      style={({ pressed }) => [styles.card, shelf && styles.owned, pressed && styles.pressed]}>
      <View style={styles.tilt}>
        <BookWithSpine key={book.isbn13} title={book.title} coverUrl={book.coverUrl} width={88} />
      </View>
      <View style={styles.text}>
        <Text style={styles.label}>Meilleur résultat</Text>
        <Text style={styles.title} numberOfLines={3}>
          {book.title}
        </Text>
        <Text style={styles.authors} numberOfLines={2}>
          {authors}
        </Text>
        {details !== '' && (
          <Text style={styles.details} numberOfLines={2}>
            {details}
          </Text>
        )}
        {shelf && (
          <View style={styles.tag}>
            <ShelfTag shelf={shelf} />
          </View>
        )}
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    minHeight: 150,
    paddingLeft: 14,
    paddingRight: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: C.highlight,
  },
  tilt: {
    transform: [{ rotate: '-4deg' }],
  },
  text: {
    flex: 1,
    gap: 3,
  },
  label: {
    color: C.accent,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  title: {
    color: C.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  authors: {
    color: C.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  details: {
    color: C.textTertiary,
    fontSize: 13,
    lineHeight: 18,
  },
  owned: {
    borderWidth: 1.5,
    borderColor: C.primary,
    backgroundColor: C.owned,
  },
  tag: {
    marginTop: 4,
  },
  pressed: {
    opacity: 0.7,
  },
});
