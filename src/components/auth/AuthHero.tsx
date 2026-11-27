import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DecorCoverView, type DecorCover } from '@/components/decor/DecorCover';
import { LogoMark } from '@/components/Logo';
import { Fonts, Palette } from '@/constants/theme';

type PlacedCover = DecorCover & { centerX: number; centerY: number; rotate: number };

// Each side cover is half hidden by its inner neighbour, so its text hugs the outer, visible edge
const SIDE_COVERS: PlacedCover[] = [
  { title: 'La Peste', author: 'Albert Camus', color: '#1F3550', ink: '#F1E9D6', titleSize: 15, width: 96, centerX: -132, centerY: 162, rotate: -20 },
  { title: 'La Horde du Contrevent', author: 'Alain Damasio', color: '#1D3140', ink: '#E6EEF1', titleSize: 9, uppercase: true, align: 'right', width: 96, centerX: 132, centerY: 162, rotate: 20 },
  { title: 'Le Mythe\nde Sisyphe', author: 'Albert Camus', color: '#EADBC0', ink: '#5A2410', titleSize: 10, width: 96, centerX: -66, centerY: 129, rotate: -10 },
  { title: 'La\nChute', author: 'Albert Camus', color: '#D9A814', ink: '#1A1608', titleSize: 15, align: 'right', width: 96, centerX: 66, centerY: 129, rotate: 10 },
];

const FRONT_COVER: PlacedCover = {
  title: 'L’Étranger',
  author: 'Albert Camus',
  color: '#D9A860',
  ink: '#22344A',
  titleSize: 17,
  width: 112,
  centerX: 0,
  centerY: 118,
  rotate: 0,
};

const STAGE_WIDTH = 390;
// Height of the mockup hero below its 54 pt status bar, the real inset is added on top
const STAGE_HEIGHT = 386;

/** Brown header of the sign-in screen and of the guest home: fanned book covers above the app title. */
export function AuthHero({ title, subtitle }: { title: string; subtitle?: string }) {
  const insets = useSafeAreaInsets();

  return (
    <View>
      <View style={styles.overscroll} />
      <View style={[styles.hero, { paddingTop: insets.top }]}>
        <View style={styles.stage} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {[...SIDE_COVERS, FRONT_COVER].map((cover, index) => (
            <Cover key={cover.title} cover={cover} order={index} />
          ))}
        </View>
        <Animated.View entering={FadeIn.delay(260).duration(320)} style={styles.titleBlock}>
          <View style={styles.titleRow}>
            <LogoMark size={44} />
            <Text style={styles.title} accessibilityRole="header" numberOfLines={1} adjustsFontSizeToFit>
              {title}
            </Text>
          </View>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </Animated.View>
      </View>
    </View>
  );
}

// The covers fan out one after the other, outer ones first. The tilt sits on the
// inner view because the entering animation drives the outer one's transform.
function Cover({ cover, order }: { cover: PlacedCover; order: number }) {
  const height = cover.width * 1.5;
  return (
    <Animated.View
      entering={FadeInDown.delay(order * 70)
        .springify()
        .damping(16)
        .stiffness(190)}
      style={{
        position: 'absolute',
        left: STAGE_WIDTH / 2 + cover.centerX - cover.width / 2,
        top: cover.centerY - height / 2,
      }}>
      <DecorCoverView cover={cover} style={{ transform: [{ rotate: `${cover.rotate}deg` }] }} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hero: {
    overflow: 'hidden',
    backgroundColor: Palette.accent,
  },
  // Keeps the iOS bounce above the hero in brown instead of showing the paper background
  overscroll: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '100%',
    height: 1000,
    backgroundColor: Palette.accent,
  },
  stage: {
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
    alignSelf: 'center',
  },
  titleBlock: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 44,
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  title: {
    flexShrink: 1,
    color: Palette.inkInverse,
    fontFamily: Fonts.display,
    fontSize: 50,
    // Not 50: under the font's own line height iOS cuts the top of the letters
    lineHeight: 60,
    fontWeight: '700',
    letterSpacing: -2.25,
    textAlign: 'center',
  },
  // White on the light brown is 3.2:1, which WCAG only accepts for large text (19 px bold and up)
  subtitle: {
    color: Palette.inkInverse,
    fontFamily: Fonts.display,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
});
