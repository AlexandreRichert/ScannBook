import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { BookCover } from '@/components/BookCover';
import { ProgressBar } from '@/components/library/ProgressBar';
import { PressableScale } from '@/components/ui/PressableScale';
import { Fonts, Palette, Space } from '@/constants/theme';
import type { LibraryBook } from '@/data/Library';
import { progressRatio } from '@/lib/ReadingProgress';

const GAP = Space.block;
const COVER_WIDTH = 88;

type ReadingCardsProps = {
  books: readonly LibraryBook[];
  onOpen: (book: LibraryBook) => void;
};

/** The books being read, one card at a time: swipe sideways for the next one. */
export function ReadingCards({ books, onOpen }: ReadingCardsProps) {
  // Measured rather than read from the window: the cards fill the section, whatever its padding or max width
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const active = Math.min(index, books.length - 1);

  return (
    <View onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {width > 0 && (
        <FlatList
          data={books}
          keyExtractor={(book) => book.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={width + GAP}
          decelerationRate="fast"
          scrollEnabled={books.length > 1}
          ItemSeparatorComponent={Separator}
          scrollEventThrottle={32}
          onScroll={(event) => setIndex(Math.round(event.nativeEvent.contentOffset.x / (width + GAP)))}
          renderItem={({ item }) => <ReadingCard book={item} width={width} onPress={() => onOpen(item)} />}
        />
      )}
      {books.length > 1 && (
        <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {books.map((book, position) => (
            <View key={book.id} style={[styles.dot, position === active && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

function ReadingCard({ book, width, onPress }: { book: LibraryBook; width: number; onPress: () => void }) {
  const authors = book.authors.length > 0 ? book.authors.join(', ') : 'Auteur inconnu';
  const ratio = book.page_count !== null ? progressRatio(book.current_page, book.page_count) : null;

  return (
    // One button for the whole card: « Reprendre » inside is its visible label, not a second button
    <PressableScale
      onPress={onPress}
      pressedScale={0.98}
      accessibilityRole="button"
      accessibilityLabel={`Reprendre ${book.title}, ${authors}`}
      style={[styles.card, { width }]}>
      <BookCover
        key={book.isbn13}
        isbn13={book.isbn13}
        title={book.title}
        authors={book.authors}
        coverUrl={book.cover_url ?? undefined}
        width={COVER_WIDTH}
      />
      <View style={styles.body}>
        <View>
          <Text style={styles.title} numberOfLines={2}>
            {book.title}
          </Text>
          <Text style={styles.author} numberOfLines={1}>
            {authors}
          </Text>
        </View>
        <View style={styles.bottom}>
          {ratio !== null && (
            <View style={styles.progress}>
              <View style={styles.bar}>
                <ProgressBar ratio={ratio} trackColor={Palette.paperRaised} />
              </View>
              <Text style={styles.percent}>{Math.round(ratio * 100)} %</Text>
            </View>
          )}
          <View style={styles.footer}>
            <Text style={styles.page} numberOfLines={1}>
              {/* Short on purpose: it shares its line with the button */}
              {book.page_count !== null ? `p. ${book.current_page ?? 0} / ${book.page_count}` : ''}
            </Text>
            <View style={styles.resume}>
              <Text style={styles.resumeLabel}>Reprendre</Text>
            </View>
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  separator: {
    width: GAP,
  },
  card: {
    flexDirection: 'row',
    gap: Space.card,
    padding: Space.card,
    borderRadius: 6,
    backgroundColor: Palette.accentSoft,
  },
  body: {
    flex: 1,
    justifyContent: 'space-between',
    gap: Space.block,
  },
  title: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  author: {
    marginTop: 2,
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  bottom: {
    gap: Space.block,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bar: {
    flex: 1,
  },
  percent: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  page: {
    flexShrink: 1,
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 16,
  },
  resume: {
    justifyContent: 'center',
    height: 36,
    paddingHorizontal: Space.card,
    borderRadius: 4,
    backgroundColor: Palette.accentStrong,
  },
  resumeLabel: {
    color: Palette.inkInverse,
    fontFamily: Fonts.display,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: -0.07,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: Space.block,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.lineStrong,
    opacity: 0.5,
  },
  dotActive: {
    width: 18,
    backgroundColor: Palette.accent,
    opacity: 1,
  },
});
