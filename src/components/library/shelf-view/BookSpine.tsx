import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useOpenBook, type BookTarget } from '@/components/library/BookOpening';
import { PressableScale } from '@/components/ui/PressableScale';
import { Fonts } from '@/constants/theme';
import type { LibraryBook } from '@/data/Library';

import { spineLook, type SpineScale } from './ShelfRows';

/** Book shown by the spine, title running bottom to top like on a real shelf. */
export function BookSpine({
  book,
  scale,
  interactive = true,
}: {
  book: LibraryBook;
  scale?: SpineScale;
  /** False inside something already pressable, where a nested button is invalid on web. */
  interactive?: boolean;
}) {
  const openBook = useOpenBook();
  const ref = useRef<BookTarget>(null);
  const { color, thickness, length, ink, fillet } = spineLook(book.isbn13, scale);
  const authors = book.authors.length > 0 ? book.authors.join(', ') : 'Auteur inconnu';
  const box = [styles.spine, { width: thickness, height: length, backgroundColor: color }];

  // Laid out horizontally then turned, since RN text cannot run vertically on its own
  const label = (
    <View
      style={[
        styles.label,
        { width: length, height: thickness, left: (thickness - length) / 2, top: (length - thickness) / 2 },
      ]}>
      <View style={[styles.fillet, { height: thickness - 8, backgroundColor: fillet }]} />
      <Text style={[styles.title, { color: ink, fontSize: thickness < 30 ? 9 : 11 }]} numberOfLines={1}>
        {book.title}
      </Text>
      <View style={[styles.fillet, { height: thickness - 8, backgroundColor: fillet }]} />
    </View>
  );

  if (!interactive) return <View style={box}>{label}</View>;

  return (
    // The plain View is what gets measured to start the opening animation from the spine's place
    <View ref={ref} collapsable={false}>
      <PressableScale
        onPress={() => openBook(book, ref, color)}
        accessibilityRole="button"
        accessibilityLabel={`${book.title}, ${authors}`}
        style={box}>
        {label}
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  spine: {
    borderRadius: 2,
    overflow: 'hidden',
    experimental_backgroundImage:
      'linear-gradient(90deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.05) 20%, rgba(0, 0, 0, 0.05) 65%, rgba(0, 0, 0, 0.36) 100%)',
  },
  label: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
    transform: [{ rotate: '-90deg' }],
  },
  fillet: {
    width: 2,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.display,
    fontWeight: '500',
  },
});
