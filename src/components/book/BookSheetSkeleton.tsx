import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, type DimensionValue } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { BookBand } from '@/components/book/BookSheet';
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
        <BookBand>
          <View style={[styles.bone, styles.cover]} />
        </BookBand>

        <View style={styles.heading}>
          <View style={[styles.bone, styles.caps]} />
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
    gap: 20,
  },
  bone: {
    backgroundColor: Palette.line,
    borderRadius: 8,
  },
  cover: {
    width: 164,
    height: 246,
    borderRadius: 4,
  },
  caps: {
    width: 150,
    height: 10,
  },
  heading: {
    alignItems: 'center',
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
