import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type DimensionValue } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { BOOK_SHEET_GUTTER } from '@/components/book/BookSheet';
import { Fonts, Palette } from '@/constants/theme';

const DESCRIPTION_LINES: DimensionValue[] = ['100%', '100%', '60%'];

/** Placeholder of the book sheet while the lookup runs (Figma frame 12). */
export function BookSheetSkeleton() {
  const opacity = useSharedValue(1);
  const pulse = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  useEffect(() => {
    opacity.set(withRepeat(withTiming(0.45, { duration: 800, easing: Easing.inOut(Easing.ease) }), -1, true));
  }, [opacity]);

  return (
    <View style={styles.container} accessibilityLabel="Recherche du livre" accessibilityRole="progressbar">
      <Animated.View style={[styles.bones, pulse]}>
        <View style={styles.hero}>
          <View style={styles.stand}>
            <View style={[styles.bone, styles.cover]} />
          </View>
          <View style={styles.metadata}>
            {[0, 1, 2].map((index) => (
              <View key={index} style={styles.metadataGroup}>
                <View style={[styles.bone, styles.caps]} />
                <View style={[styles.bone, styles.value]} />
              </View>
            ))}
            <View style={[styles.bone, styles.chip]} />
          </View>
        </View>

        <View style={styles.heading}>
          <View style={[styles.bone, styles.title]} />
          <View style={[styles.bone, styles.authors]} />
        </View>
        <View style={styles.lines}>
          {DESCRIPTION_LINES.map((width, index) => (
            <View key={index} style={[styles.bone, styles.line, { width }]} />
          ))}
        </View>
      </Animated.View>

      <View style={styles.loader}>
        <ActivityIndicator color={Palette.accent} />
        <Text style={styles.loaderText}>Recherche du livre…</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  bones: {
    gap: 24,
  },
  bone: {
    backgroundColor: Palette.line,
    borderRadius: 8,
  },
  hero: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: -BOOK_SHEET_GUTTER,
  },
  stand: {
    width: 214,
    height: 226,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    backgroundColor: Palette.paperSunken,
  },
  cover: {
    width: 150,
    height: 204,
    borderRadius: 4,
    transform: [{ rotate: '-2deg' }],
  },
  metadata: {
    flex: 1,
    paddingTop: 6,
    paddingRight: BOOK_SHEET_GUTTER - 8,
    gap: 18,
  },
  metadataGroup: {
    gap: 8,
  },
  caps: {
    width: 54,
    height: 10,
  },
  value: {
    width: '90%',
    height: 18,
  },
  chip: {
    width: 92,
    height: 36,
    borderRadius: 18,
  },
  heading: {
    gap: 14,
  },
  title: {
    width: '72%',
    height: 44,
    borderRadius: 4,
  },
  authors: {
    width: 130,
    height: 18,
  },
  lines: {
    gap: 10,
  },
  line: {
    height: 12,
    borderRadius: 6,
  },
  loader: {
    alignItems: 'center',
    gap: 14,
    marginTop: 40,
  },
  loaderText: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 14,
    lineHeight: 18,
  },
});
