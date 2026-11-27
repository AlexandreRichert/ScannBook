import { Image } from 'expo-image';
import { Fragment, useState, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BookCover } from '@/components/BookCover';
import { Fonts, Palette, Space } from '@/constants/theme';
import type { BookInfo } from '@/types/Book';

const COVER_WIDTH = 164;
const COVER_HEIGHT = COVER_WIDTH * 1.5;
/** How far the cover hangs below the tinted band, onto the paper. */
const COVER_OVERHANG = 76;
const BAND_PADDING = Space.block;
/** Radius of the page where it rises over the band, like the top of a sheet. */
const SHEET_RADIUS = 24;
/** About 3 lines at 15 px on a phone: shorter descriptions are shown whole. */
const COLLAPSIBLE_DESCRIPTION_LENGTH = 140;

export const BOOK_SHEET_GUTTER = Space.gutter;
/** Top padding the book screen gives its content, which the band climbs back over to touch the header. */
export const BOOK_SHEET_TOP = 8;
/** Height of the navigation bar under the status bar: the band runs behind it, the header being transparent. */
export const BOOK_HEADER_BAR = Platform.OS === 'ios' ? 44 : 56;
// Light: the cover stays recognizable behind its sharp copy, as a soft echo of it
const BACKDROP_BLUR = 10;

/**
 * Book details: a tinted band the cover hangs out of, then everything centered under it.
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
  /** Shown under the authors, e.g. « Dans mes livres ». */
  badge?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const facts = [
    { label: 'Éditeur', value: book.publisher },
    { label: 'Parution', value: book.publishedDate?.slice(0, 4) },
    { label: 'Pages', value: book.pageCount?.toString() },
  ].filter((fact): fact is { label: string; value: string } => fact.value !== undefined);

  return (
    <View style={styles.sheet}>
      <BookBand backdrop={book.coverUrl}>
        <Animated.View entering={FadeInDown.duration(320)}>
          <BookCover
            key={book.isbn13}
            isbn13={book.isbn13}
            title={book.title}
            authors={book.authors}
            coverUrl={book.coverUrl}
            width={COVER_WIDTH}
          />
        </Animated.View>
      </BookBand>

      <Animated.View entering={FadeIn.delay(90).duration(300)} style={styles.heading}>
        <Text style={styles.title} accessibilityRole="header">
          {book.title}
        </Text>
        {book.subtitle && <Text style={styles.subtitle}>{book.subtitle}</Text>}
        <Text style={styles.authors}>{book.authors.length > 0 ? book.authors.join(', ') : 'Auteur inconnu'}</Text>
        {badge !== undefined && <View style={styles.badge}>{badge}</View>}
      </Animated.View>

      {facts.length > 0 && (
        <Animated.View entering={FadeIn.delay(140).duration(300)} style={styles.facts}>
          {facts.map((fact, index) => (
            <Fragment key={fact.label}>
              {index > 0 && <View style={styles.factRule} />}
              <View style={styles.fact}>
                <Text style={styles.factLabel}>{fact.label}</Text>
                <Text style={styles.factValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
                  {fact.value}
                </Text>
              </View>
            </Fragment>
          ))}
        </Animated.View>
      )}

      {children}

      {book.description && <Description text={book.description} />}

      {footer}
    </View>
  );
}

/**
 * The band at the top of a book screen, running behind the transparent header. With a `backdrop`
 * it is the cover itself, blurred and washed out; without, a plain cream. Its child, the sharp
 * cover, hangs below it. Shared with the skeleton.
 */
export function BookBand({ children, backdrop }: { children: ReactNode; backdrop?: string }) {
  const insets = useSafeAreaInsets();
  const header = insets.top + BOOK_HEADER_BAR;

  return (
    <View
      style={[
        styles.band,
        { height: header + COVER_HEIGHT - COVER_OVERHANG + BAND_PADDING, paddingTop: header + BAND_PADDING },
      ]}>
      <View style={styles.overscroll} />
      {backdrop !== undefined && (
        // Clipped on its own: the band itself must let the cover hang out of it
        <View style={styles.backdrop}>
          <Image source={backdrop} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={BACKDROP_BLUR} />
          <View style={styles.backdropVeil} />
        </View>
      )}
      <View style={styles.lip} />
      {children}
    </View>
  );
}

function Description({ text }: { text: string }) {
  const collapsible = text.length > COLLAPSIBLE_DESCRIPTION_LENGTH;
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.description}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
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

const styles = StyleSheet.create({
  sheet: {
    gap: Space.card,
  },
  // Bleeds over the screen padding on three sides, up to the header of the same color
  band: {
    alignItems: 'center',
    marginTop: -BOOK_SHEET_TOP,
    marginHorizontal: -BOOK_SHEET_GUTTER,
    marginBottom: COVER_OVERHANG,
    backgroundColor: Palette.accentSoft,
  },
  // Keeps the iOS bounce above the band in its color instead of showing the paper background
  overscroll: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '100%',
    height: 1000,
    backgroundColor: Palette.accentSoft,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  // White over the blur: the back button and the cover stay readable on any cover
  backdropVeil: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  facts: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Palette.line,
  },
  factRule: {
    width: 1,
    marginVertical: Space.block,
    backgroundColor: Palette.line,
  },
  fact: {
    flex: 1,
    alignItems: 'center',
    gap: Space.tight,
    paddingVertical: Space.block,
    paddingHorizontal: Space.item,
  },
  factLabel: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
  },
  factValue: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: -0.16,
    textAlign: 'center',
  },
  // The page color, rounded, over the bottom of the band: the content reads as a sheet laid on it
  lip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SHEET_RADIUS,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
    backgroundColor: Palette.paper,
  },
  sectionTitle: {
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  heading: {
    alignItems: 'center',
    gap: Space.tight,
  },
  title: {
    marginTop: Space.tight,
    color: Palette.ink,
    fontFamily: Fonts.display,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.9,
    textAlign: 'center',
  },
  badge: {
    marginTop: Space.item,
  },
  subtitle: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    textAlign: 'center',
  },
  authors: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  description: {
    gap: Space.item,
    marginTop: Space.card,
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
