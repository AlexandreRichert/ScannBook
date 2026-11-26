import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Animated, StyleSheet, useWindowDimensions, View } from 'react-native';

import { BookCover } from '@/components/BookCover';
import { PressableScale } from '@/components/ui/PressableScale';
import type { LibraryBook } from '@/data/Library';
import { spineFor } from '@/lib/Spines';

const CELL_WIDTH = 150;
const COVER_WIDTH = 146;
export const STAGE_HEIGHT = 236;

type ReadingCarouselProps = {
  books: LibraryBook[];
  onIndexChange: (index: number) => void;
};

/** Books being read standing on a shelf, the centered one in front (Figma frame 08). */
export function ReadingCarousel({ books, onIndexChange }: ReadingCarouselProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [scrollX] = useState(() => new Animated.Value(0));
  const lastIndex = books.length - 1;

  return (
    <Animated.FlatList
      data={books}
      keyExtractor={(book) => book.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={CELL_WIDTH}
      decelerationRate="fast"
      style={styles.list}
      contentContainerStyle={{ paddingHorizontal: (width - CELL_WIDTH) / 2 }}
      scrollEventThrottle={16}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
        useNativeDriver: true,
        listener: (event: { nativeEvent: { contentOffset: { x: number } } }) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / CELL_WIDTH);
          onIndexChange(Math.min(Math.max(index, 0), lastIndex));
        },
      })}
      renderItem={({ item, index }) => {
        const inputRange = [(index - 1) * CELL_WIDTH, index * CELL_WIDTH, (index + 1) * CELL_WIDTH];
        const scale = scrollX.interpolate({ inputRange, outputRange: [0.77, 1, 0.77], extrapolate: 'clamp' });
        const rotate = scrollX.interpolate({ inputRange, outputRange: ['6deg', '0deg', '-6deg'], extrapolate: 'clamp' });
        return (
          <Animated.View style={[styles.cell, { transform: [{ scale }, { rotate }] }]}>
            <PressableScale
              onPress={() => router.push(`/book/${item.isbn13}`)}
              accessibilityRole="button"
              accessibilityLabel={`Ouvrir ${item.title}`}
              style={styles.book}>
              <View style={[styles.spine, { backgroundColor: spineFor(item.isbn13).color }]}>
                <View style={[styles.fillet, styles.filletTop]} />
                <View style={[styles.fillet, styles.filletBottom]} />
              </View>
              <BookCover
                key={item.isbn13}
                isbn13={item.isbn13}
                title={item.title}
                authors={item.authors}
                coverUrl={item.cover_url ?? undefined}
                width={COVER_WIDTH}
              />
            </PressableScale>
          </Animated.View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    height: STAGE_HEIGHT,
    flexGrow: 0,
  },
  cell: {
    width: CELL_WIDTH,
    height: STAGE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
    // Shrinks and tilts the side books around their base so they stay on the shelf
    transformOrigin: 'bottom',
  },
  book: {
    flexDirection: 'row',
  },
  spine: {
    width: 16,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
    experimental_backgroundImage:
      'linear-gradient(90deg, rgba(0, 0, 0, 0.3) 0%, rgba(255, 255, 255, 0.16) 40%, rgba(0, 0, 0, 0.26) 100%)',
  },
  fillet: {
    position: 'absolute',
    left: 2,
    width: 12,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  filletTop: {
    top: 18,
  },
  filletBottom: {
    bottom: 20,
  },
});
