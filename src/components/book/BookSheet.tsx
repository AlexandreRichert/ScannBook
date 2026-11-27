import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { BookCover } from '@/components/BookCover';
import { Fonts, Palette } from '@/constants/theme';
import { spineFor } from '@/lib/Spines';
import type { BookInfo } from '@/types/Book';

const COVER_WIDTH = 136;
/** About 3 lines at 15 px on a phone: shorter descriptions are shown whole. */
const COLLAPSIBLE_DESCRIPTION_LENGTH = 140;
/** Longer titles drop to the smaller display size so they stay on two lines. */
const SHORT_TITLE_LENGTH = 14;

/**
 * Book details laid out as the « Fiche livre » mockups (Figma frames 07 and 10).
 * `children` (the library actions) sit between the title and the summary, so the main action needs no scrolling.
 * `footer` comes last, for the destructive action.
 */
export function BookSheet({
  book,
  badge,
  children,
  footer,
}: {
  book: BookInfo;
  /** Shown above the metadata, e.g. « Dans ma bibliothèque ». */
  badge?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const metadata = [
    { label: 'Éditeur', value: book.publisher },
    { label: 'Parution', value: book.publishedDate?.slice(0, 4) },
    { label: 'Pages', value: book.pageCount?.toString() },
  ].filter((item): item is { label: string; value: string } => item.value !== undefined);

  return (
    <View style={styles.sheet}>
      <View style={styles.hero}>
        <View style={styles.stand}>
          {/* The book drops onto its shelf; the tilt sits on the inner view because entering drives the outer transform */}
          <Animated.View entering={FadeInDown.springify().damping(15).stiffness(180)}>
          <View style={styles.book}>
            <View style={[styles.spine, { backgroundColor: spineFor(book.isbn13).color }]}>
              <View style={[styles.fillet, styles.filletTop]} />
              <View style={[styles.fillet, styles.filletBottom]} />
            </View>
            <BookCover
              key={book.isbn13}
              isbn13={book.isbn13}
              title={book.title}
              authors={book.authors}
              coverUrl={book.coverUrl}
              width={COVER_WIDTH}
            />
          </View>
          </Animated.View>
          <View style={styles.shelf} />
        </View>

        <Animated.View entering={FadeIn.delay(120).duration(260)} style={styles.metadata}>
          {badge}
          {metadata.map((item, index) => (
            <View key={item.label} style={styles.metadataGroup}>
              {(index > 0 || badge !== undefined) && <View style={styles.rule} />}
              <Text style={styles.caps}>{item.label}</Text>
              <Text style={styles.metadataValue} numberOfLines={2}>
                {item.value}
              </Text>
            </View>
          ))}
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(90).duration(300)} style={styles.heading}>
        <Text
          style={[styles.title, book.title.length <= SHORT_TITLE_LENGTH && styles.titleLarge]}
          accessibilityRole="header">
          {book.title}
        </Text>
        {book.subtitle && <Text style={styles.subtitle}>{book.subtitle}</Text>}
        <Text style={styles.authors}>{book.authors.length > 0 ? book.authors.join(', ') : 'Auteur inconnu'}</Text>
      </Animated.View>

      {children}

      {book.description && <Description text={book.description} />}

      {footer}
    </View>
  );
}

function Description({ text }: { text: string }) {
  const collapsible = text.length > COLLAPSIBLE_DESCRIPTION_LENGTH;
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.description}>
      <Text style={styles.caps} accessibilityRole="header">
        Résumé
      </Text>
      <Text style={styles.descriptionText} numberOfLines={collapsible && !expanded ? 3 : undefined}>
        {text}
      </Text>
      {collapsible && (
        <Pressable
          onPress={() => setExpanded((value) => !value)}
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.readMoreButton, pressed && styles.pressed]}>
          <Text style={styles.readMore}>{expanded ? 'Réduire' : 'Lire la suite'}</Text>
        </Pressable>
      )}
    </View>
  );
}

export const BOOK_SHEET_GUTTER = 24;

const styles = StyleSheet.create({
  sheet: {
    gap: 14,
  },
  hero: {
    flexDirection: 'row',
    gap: 12,
    // The cover stand runs to the left edge of the screen, past the content padding
    marginLeft: -BOOK_SHEET_GUTTER,
  },
  stand: {
    width: 214,
    height: 226,
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    backgroundColor: Palette.paperSunken,
  },
  book: {
    flexDirection: 'row',
    marginBottom: 7,
    transform: [{ rotate: '-2deg' }],
  },
  spine: {
    width: 15,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
    experimental_backgroundImage:
      'linear-gradient(90deg, rgba(0, 0, 0, 0.3) 0%, rgba(255, 255, 255, 0.16) 40%, rgba(0, 0, 0, 0.26) 100%)',
  },
  fillet: {
    position: 'absolute',
    left: 2,
    width: 11,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  filletTop: {
    top: 16,
  },
  filletBottom: {
    bottom: 18,
  },
  shelf: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 7,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: Palette.wood,
    experimental_backgroundImage:
      'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 35%, rgba(0, 0, 0, 0.25) 100%)',
  },
  metadata: {
    flex: 1,
    paddingTop: 6,
    paddingRight: BOOK_SHEET_GUTTER - 8,
    gap: 10,
  },
  metadataGroup: {
    gap: 2,
  },
  rule: {
    height: 1,
    marginBottom: 10,
    backgroundColor: Palette.line,
  },
  caps: {
    color: Palette.inkTertiary,
    fontFamily: Fonts.display,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '500',
    letterSpacing: 0.88,
    textTransform: 'uppercase',
  },
  metadataValue: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: -0.16,
  },
  heading: {
    gap: 2,
  },
  title: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -1.05,
  },
  titleLarge: {
    fontSize: 50,
    lineHeight: 58,
    letterSpacing: -2.25,
  },
  subtitle: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  authors: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  description: {
    gap: 8,
    marginTop: 14,
  },
  descriptionText: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
  },
  readMore: {
    color: Palette.accentStrong,
    fontFamily: Fonts.display,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: -0.07,
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.6,
  },
});
