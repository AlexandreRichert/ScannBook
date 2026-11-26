import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { spineLook } from '@/components/library/shelf-view/ShelfRows';
import { Fonts, Palette } from '@/constants/theme';

type BookCoverProps = {
  /** Picks the colors of the generated cover, so it matches the book's spine. */
  isbn13: string;
  title: string;
  authors?: string[];
  coverUrl?: string;
  width?: number;
};

/**
 * Book cover, or a typographic one generated from the title when the source has
 * none (frequent for French editions on Google Books) or when it fails to load.
 *
 * Give it a `key` tied to the book so the error state resets between books.
 */
export function BookCover({ isbn13, title, authors = [], coverUrl, width = 120 }: BookCoverProps) {
  const [failed, setFailed] = useState(false);

  if (!coverUrl || failed) return <GeneratedCover isbn13={isbn13} title={title} authors={authors} width={width} />;

  return (
    <Image
      source={coverUrl}
      style={[styles.image, { width, height: width * 1.5 }]}
      contentFit="cover"
      transition={200}
      cachePolicy="memory-disk"
      accessibilityLabel={`Couverture de ${title}`}
      onError={() => setFailed(true)}
    />
  );
}

// Laid out on a 100 pt wide cover, then scaled to the requested width
function GeneratedCover({ isbn13, title, authors, width }: Required<Omit<BookCoverProps, 'coverUrl'>>) {
  const { color, ink } = spineLook(isbn13);
  // Two layouts, picked from the ISBN like the color, so a shelf of generated covers is not uniform
  const framed = isbn13.charCodeAt(isbn13.length - 2) % 2 === 0;
  const scale = width / 100;
  const titleSize = (title.length <= 18 ? 15 : title.length <= 40 ? 12.5 : 10.5) * scale;
  const author = authors[0];
  // Below this width the author would be a few pixels high: the title alone reads better
  const showAuthor = Boolean(author) && width >= 70;

  return (
    <View
      style={[
        styles.generated,
        { width, height: width * 1.5, padding: 10 * scale, backgroundColor: color },
        framed && { alignItems: 'center', justifyContent: 'center' },
      ]}
      accessibilityRole="image"
      accessibilityLabel={`${title}, sans couverture`}>
      {framed && <View style={[styles.frame, { margin: 6 * scale, borderColor: ink }]} />}
      <View style={[styles.rule, { width: 18 * scale, height: Math.max(1, 2 * scale), backgroundColor: ink }]} />
      <Text
        style={[
          styles.title,
          framed && styles.titleCentered,
          { color: ink, fontSize: titleSize, lineHeight: titleSize * 1.08, marginTop: 6 * scale },
        ]}
        numberOfLines={framed ? 4 : 5}>
        {title}
      </Text>
      {showAuthor && (
        <Text
          style={[
            styles.author,
            framed ? styles.authorCentered : styles.authorBottom,
            { color: ink, fontSize: 6.5 * scale, letterSpacing: 0.6 * scale, marginTop: 8 * scale },
            !framed && { left: 10 * scale, right: 10 * scale, bottom: 10 * scale },
          ]}
          numberOfLines={2}>
          {author}
        </Text>
      )}
      <View style={[styles.hinge, { width: 7 * scale }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    borderRadius: 4,
    // Holds the cover's place while it downloads instead of leaving a hole that pops in
    backgroundColor: Palette.paperSunken,
  },
  generated: {
    overflow: 'hidden',
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    experimental_backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(0, 0, 0, 0.14) 100%)',
  },
  frame: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
    opacity: 0.5,
  },
  rule: {
    opacity: 0.8,
  },
  title: {
    fontFamily: Fonts.display,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  titleCentered: {
    textAlign: 'center',
  },
  author: {
    opacity: 0.85,
    fontFamily: Fonts.body,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  authorCentered: {
    textAlign: 'center',
  },
  authorBottom: {
    position: 'absolute',
  },
  hinge: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    experimental_backgroundImage:
      'linear-gradient(90deg, rgba(0, 0, 0, 0.26) 0%, rgba(0, 0, 0, 0.03) 50%, rgba(255, 255, 255, 0.18) 62%, rgba(255, 255, 255, 0) 100%)',
  },
});
