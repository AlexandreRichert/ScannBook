import { StyleSheet, View } from 'react-native';

import { BookCover } from '@/components/BookCover';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { BookInfo } from '@/types/Book';

/** Cover, title, authors and the optional details of a book. */
export function BookDetails({ book }: { book: BookInfo }) {
  const details = [
    book.publisher,
    book.publishedDate,
    book.pageCount === undefined ? undefined : `${book.pageCount} pages`,
  ].filter((detail) => detail !== undefined);

  return (
    <View style={styles.book}>
      <View style={styles.header}>
        <BookCover key={book.isbn13} title={book.title} coverUrl={book.coverUrl} />
        <View style={styles.headerText}>
          <ThemedText type="smallBold">{book.title}</ThemedText>
          {book.subtitle && <ThemedText type="small">{book.subtitle}</ThemedText>}
          <ThemedText type="small">
            {book.authors.length > 0 ? book.authors.join(', ') : 'Auteur inconnu'}
          </ThemedText>
          {details.length > 0 && (
            <ThemedText type="small" themeColor="textSecondary">
              {details.join(' · ')}
            </ThemedText>
          )}
          <ThemedText type="code" themeColor="textSecondary">
            {book.isbn13}
          </ThemedText>
        </View>
      </View>
      {book.description && <ThemedText type="small">{book.description}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  book: {
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  headerText: {
    flex: 1,
    gap: Spacing.one,
  },
});
