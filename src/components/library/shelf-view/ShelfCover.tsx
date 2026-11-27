import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BookCover } from '@/components/BookCover';
import { useOpenBook, type BookTarget } from '@/components/library/BookOpening';
import { ProgressBar } from '@/components/library/ProgressBar';
import { PressableScale } from '@/components/ui/PressableScale';
import { Fonts, Palette } from '@/constants/theme';
import type { LibraryBook } from '@/data/Library';
import { progressRatio } from '@/lib/ReadingProgress';

/** Cover standing on the shelf, with the reading progress on it for a book being read. */
export function ShelfCover({ book, width }: { book: LibraryBook; width: number }) {
  const openBook = useOpenBook();
  const ref = useRef<BookTarget>(null);
  const authors = book.authors.length > 0 ? book.authors.join(', ') : 'Auteur inconnu';
  const ratio =
    book.status === 'reading' && book.page_count !== null ? progressRatio(book.current_page, book.page_count) : null;

  return (
    <View ref={ref} collapsable={false}>
      <PressableScale
        onPress={() => openBook(book, ref)}
        accessibilityRole="button"
        accessibilityLabel={`${book.title}, ${authors}`}
        style={[styles.cover, { width }]}>
        <View style={styles.clip}>
          <BookCover
            key={book.isbn13}
            isbn13={book.isbn13}
            title={book.title}
            authors={book.authors}
            coverUrl={book.cover_url ?? undefined}
            width={width}
          />
          <View style={[styles.hinge, { width: width * 0.08 }]} />
          {ratio !== null && (
            <View style={styles.progress}>
              <View style={styles.bar}>
                <ProgressBar ratio={ratio} />
              </View>
              <Text style={styles.percent}>{Math.round(ratio * 100)} %</Text>
            </View>
          )}
        </View>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    borderTopLeftRadius: 1.5,
    borderBottomLeftRadius: 1.5,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  clip: {
    borderTopLeftRadius: 1.5,
    borderBottomLeftRadius: 1.5,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    overflow: 'hidden',
  },
  // The fold where the cover meets the spine (Figma « Mors »)
  hinge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    experimental_backgroundImage:
      'linear-gradient(90deg, rgba(0, 0, 0, 0.26) 0%, rgba(0, 0, 0, 0.03) 50%, rgba(255, 255, 255, 0.18) 62%, rgba(255, 255, 255, 0) 100%)',
  },
  progress: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  bar: {
    flex: 1,
  },
  percent: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
});
