import { StyleSheet, View } from 'react-native';

import { BookCover } from '@/components/BookCover';

const SPINE_WIDTH = 12;
/** The cover slightly overlaps the spine. */
const SPINE_OVERLAP = 2;

type BookWithSpineProps = {
  isbn13: string;
  title: string;
  authors?: string[];
  coverUrl?: string;
  /** Width of the cover, without the spine. */
  width: number;
};

/** A cover drawn as a physical book: same spine for every book (Figma frame 06). */
export function BookWithSpine({ isbn13, title, authors, coverUrl, width }: BookWithSpineProps) {
  const height = width * 1.5;

  return (
    <View style={[styles.book, { width: width + SPINE_WIDTH - SPINE_OVERLAP, height }]}>
      <View style={styles.spine}>
        <View style={[styles.band, { top: 11 }]} />
        <View style={[styles.band, { bottom: 11 }]} />
      </View>
      <View style={[styles.cover, { left: SPINE_WIDTH - SPINE_OVERLAP }]}>
        <BookCover
          key={coverUrl ?? isbn13}
          isbn13={isbn13}
          title={title}
          authors={authors}
          coverUrl={coverUrl}
          width={width}
        />
        <View style={styles.hinge} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  book: {
    boxShadow:
      '0 2px 4px rgba(26, 20, 15, 0.2), 0 14px 28px rgba(26, 20, 15, 0.22), 0 30px 50px rgba(26, 20, 15, 0.14)',
  },
  spine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SPINE_WIDTH,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
    backgroundColor: '#D9A860',
    experimental_backgroundImage:
      'linear-gradient(90deg, rgba(0, 0, 0, 0.3) 0%, rgba(255, 255, 255, 0.16) 40%, rgba(0, 0, 0, 0.26) 100%)',
  },
  band: {
    position: 'absolute',
    left: 2,
    width: 6,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  cover: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    overflow: 'hidden',
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },
  hinge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 7,
    experimental_backgroundImage:
      'linear-gradient(90deg, rgba(0, 0, 0, 0.26) 0%, rgba(0, 0, 0, 0.03) 50%, rgba(255, 255, 255, 0.18) 62%, rgba(255, 255, 255, 0) 100%)',
  },
});
