import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { BookCover } from '@/components/BookCover';
import { PressableScale } from '@/components/ui/PressableScale';
import { Fonts, Palette, Space } from '@/constants/theme';
import type { LibraryBook } from '@/data/Library';

const COVER_WIDTH = 104;
const MAX_BOOKS = 10;

type BookStripProps = {
  books: readonly LibraryBook[];
  onOpen: (book: LibraryBook) => void;
};

/** A row of covers scrolling sideways, edge to edge of the screen. */
export function BookStrip({ books, onOpen }: BookStripProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.strip}
      contentContainerStyle={styles.row}>
      {books.slice(0, MAX_BOOKS).map((book) => {
        const authors = book.authors.length > 0 ? book.authors.join(', ') : 'Auteur inconnu';
        return (
          <PressableScale
            key={book.id}
            onPress={() => onOpen(book)}
            accessibilityRole="button"
            accessibilityLabel={`${book.title}, ${authors}`}
            style={styles.book}>
            <BookCover
              key={book.isbn13}
              isbn13={book.isbn13}
              title={book.title}
              authors={book.authors}
              coverUrl={book.cover_url ?? undefined}
              width={COVER_WIDTH}
            />
            <View>
              <Text style={styles.title} numberOfLines={2}>
                {book.title}
              </Text>
              <Text style={styles.author} numberOfLines={1}>
                {authors}
              </Text>
            </View>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Scrolls past the screen gutter on both sides, and starts aligned with the rest of the screen
  strip: {
    marginHorizontal: -Space.gutter,
  },
  row: {
    gap: Space.block,
    paddingHorizontal: Space.gutter,
  },
  book: {
    width: COVER_WIDTH,
    gap: Space.item,
  },
  title: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: -0.07,
  },
  author: {
    marginTop: 1,
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 16,
  },
});
