import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Logo } from '@/components/Logo';
import { Headline } from '@/components/ui/Headline';
import { SHOWCASE_BOOKS } from '@/constants/ShowcaseBooks';
import { Fonts, Palette, Space } from '@/constants/theme';

export type WallCover = { isbn13: string; coverUrl: string };

const COVER_WIDTH = 92;
const COVER_GAP = 10;
const PER_ROW = 6;
const WALL_HEIGHT = 232;
// Barely there: the covers stay readable, the white veil does most of the softening
const BLUR = 1;

type CoverWallHeroProps = {
  /** The reader's own covers first; well-known books fill whatever room is left. */
  covers?: readonly WallCover[];
  /** Right end of the top bar: the avatar, or the way to sign in. */
  action: ReactNode;
  /** Words between asterisks are handwritten, see `Headline`. */
  title: string;
  body: string;
};

/** Top of a home tab: the logo, a wall of covers fading into the page, then the headline. */
export function CoverWallHero({ covers = [], action, title, body }: CoverWallHeroProps) {
  const own = new Set(covers.map((cover) => cover.isbn13));
  const wall = [...covers, ...SHOWCASE_BOOKS.filter((book) => !own.has(book.isbn13))].slice(0, 2 * PER_ROW);
  const rows = [wall.slice(0, PER_ROW), wall.slice(PER_ROW)];

  return (
    <View style={styles.hero}>
      <View style={styles.bar}>
        <Logo />
        {action}
      </View>

      <Animated.View
        entering={FadeIn.duration(420)}
        style={styles.wall}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants">
        {rows.map((row, index) => (
          // The second row is shifted by half a cover, like bricks
          <View key={index} style={[styles.row, index === 1 && styles.rowShifted]}>
            {row.map((cover) => (
              <Image
                key={cover.isbn13}
                source={cover.coverUrl}
                style={styles.cover}
                contentFit="cover"
                blurRadius={BLUR}
                transition={300}
                cachePolicy="memory-disk"
              />
            ))}
          </View>
        ))}
        <View style={styles.veil} />
        <View style={styles.fadeSides} />
        <View style={styles.fadeDown} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(320)} style={styles.text}>
        <Headline>{title}</Headline>
        <Text style={styles.body}>{body}</Text>
      </Animated.View>
    </View>
  );
}

const WHITE = '255, 255, 255';
const PAPER = '246, 243, 238';

const styles = StyleSheet.create({
  hero: {
    gap: Space.card,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
  },
  // Runs past the screen gutter on both sides
  wall: {
    height: WALL_HEIGHT,
    marginHorizontal: -Space.gutter,
    overflow: 'hidden',
    gap: COVER_GAP,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: COVER_GAP,
  },
  rowShifted: {
    marginLeft: COVER_WIDTH + COVER_GAP,
  },
  cover: {
    width: COVER_WIDTH,
    height: COVER_WIDTH * 1.5,
    borderRadius: 4,
    backgroundColor: Palette.paperSunken,
  },
  // A white veil washes the covers out everywhere, including on the web where gradients are not drawn
  veil: {
    ...StyleSheet.absoluteFill,
    backgroundColor: `rgba(${WHITE}, 0.42)`,
  },
  // Two gradients of the page color: the wall melts into the page instead of ending on an edge
  fadeSides: {
    ...StyleSheet.absoluteFill,
    experimental_backgroundImage: `linear-gradient(90deg, rgba(${PAPER}, 0.95) 0%, rgba(${PAPER}, 0) 28%, rgba(${PAPER}, 0) 72%, rgba(${PAPER}, 0.95) 100%)`,
  },
  fadeDown: {
    ...StyleSheet.absoluteFill,
    experimental_backgroundImage: `linear-gradient(180deg, rgba(${PAPER}, 0.7) 0%, rgba(${PAPER}, 0) 28%, rgba(${PAPER}, 0.35) 60%, rgba(${PAPER}, 1) 96%)`,
  },
  text: {
    gap: Space.item,
  },
  body: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
});
