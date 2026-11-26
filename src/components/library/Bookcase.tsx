import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BookCover } from '@/components/BookCover';
import { BookSpine } from '@/components/library/shelf-view/BookSpine';
import { spineLook, type SpineScale } from '@/components/library/shelf-view/ShelfRows';
import { PressableScale } from '@/components/ui/PressableScale';
import { Fonts, Palette, ShelfColors } from '@/constants/theme';
import type { LibraryBook } from '@/data/Library';
import { SHELF_LABELS, type Shelf } from '@/lib/Shelves';

// Mockup 15 order: what is being read first, abandoned books last
const ORDER: Shelf[] = ['reading', 'to_read', 'wishlist', 'read', 'abandoned'];
const CUBBY_SCALE: SpineScale = { thickness: 2.6, length: 1.15 };
const COVER_WIDTH = 52;
const BOOK_GAP = 2;
const COVER_GAP = 6;
const MORE_WIDTH = 40;
const SHELF_INSET = 8;

const EMPTY_TEXT: Record<Shelf, string> = {
  reading: 'Aucune lecture en cours',
  to_read: 'Rien à lire pour l’instant',
  wishlist: 'Aucune envie notée',
  read: 'Aucun livre terminé',
  abandoned: 'Aucun livre abandonné',
};

type BookcaseProps = {
  books: readonly LibraryBook[];
  onOpenShelf: (shelf: Shelf) => void;
};

/** Every shelf as one row of books on its own plank (Figma frame 15, without the heavy frame). */
export function Bookcase({ books, onOpenShelf }: BookcaseProps) {
  return (
    <View style={styles.bookcase}>
      {ORDER.map((shelf) => (
        <Cubby
          key={shelf}
          shelf={shelf}
          books={books.filter((book) => book.status === shelf)}
          onPress={() => onOpenShelf(shelf)}
        />
      ))}
    </View>
  );
}

function Cubby({ shelf, books, onPress }: { shelf: Shelf; books: LibraryBook[]; onPress: () => void }) {
  const [width, setWidth] = useState(0);
  const covers = shelf === 'reading';
  const { shown, hidden } = fitBooks(books, width, covers);

  return (
    <PressableScale
      onPress={onPress}
      pressedScale={0.98}
      accessibilityRole="button"
      accessibilityLabel={`${SHELF_LABELS[shelf]}, ${books.length} ${books.length > 1 ? 'livres' : 'livre'}`}>
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: ShelfColors[shelf] }]} />
        <Text style={styles.label}>{SHELF_LABELS[shelf]}</Text>
        <Text style={styles.count}>{books.length}</Text>
        <SymbolView
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          size={13}
          tintColor={Palette.inkSecondary}
          style={styles.chevron}
        />
      </View>

      {/* The whole cubby opens the shelf, so the books inside take no touches and stay out of the screen reader */}
      <View
        style={[styles.books, { gap: covers ? COVER_GAP : BOOK_GAP }]}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width - 2 * SHELF_INSET)}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants">
        {books.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.ghost} />
            <Text style={styles.emptyText}>{EMPTY_TEXT[shelf]}</Text>
          </View>
        ) : (
          <>
            {shown.map((book) =>
              covers ? (
                <BookCover
                  key={book.id}
                  isbn13={book.isbn13}
                  title={book.title}
                  coverUrl={book.cover_url ?? undefined}
                  width={COVER_WIDTH}
                />
              ) : (
                <BookSpine key={book.id} book={book} scale={CUBBY_SCALE} interactive={false} />
              ),
            )}
            {hidden > 0 && (
              <View style={styles.more}>
                <Text style={styles.moreText}>+{hidden}</Text>
              </View>
            )}
          </>
        )}
      </View>
      <View style={styles.plank} />
    </PressableScale>
  );
}

// Keeps whole books only: a spine cut by the cubby wall reads as a rendering bug
function fitBooks(books: LibraryBook[], width: number, covers: boolean) {
  if (width <= 0) return { shown: [], hidden: 0 };
  const gap = covers ? COVER_GAP : BOOK_GAP;
  const widthOf = (book: LibraryBook) => (covers ? COVER_WIDTH : spineLook(book.isbn13, CUBBY_SCALE).thickness);

  let used = 0;
  let count = 0;
  for (const book of books) {
    const next = used + (count > 0 ? gap : 0) + widthOf(book);
    const roomForMore = count + 1 < books.length ? gap + MORE_WIDTH : 0;
    if (next + roomForMore > width) break;
    used = next;
    count += 1;
  }
  return { shown: books.slice(0, count), hidden: books.length - count };
}

const styles = StyleSheet.create({
  bookcase: {
    gap: 26,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  label: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.72,
    textTransform: 'uppercase',
  },
  count: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.display,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 'auto',
  },
  books: {
    height: 96,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SHELF_INSET,
    pointerEvents: 'none',
  },
  plank: {
    height: 8,
    borderRadius: 2,
    backgroundColor: Palette.wood,
    experimental_backgroundImage:
      'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 35%, rgba(0, 0, 0, 0.25) 100%)',
  },
  more: {
    alignItems: 'center',
    justifyContent: 'center',
    width: MORE_WIDTH,
    height: 40,
    borderRadius: 4,
    backgroundColor: Palette.paperSunken,
  },
  moreText: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.display,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  empty: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  ghost: {
    width: 26,
    height: 72,
    borderRadius: 2,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Palette.lineStrong,
  },
  emptyText: {
    marginBottom: 6,
    color: Palette.inkTertiary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
  },
});
