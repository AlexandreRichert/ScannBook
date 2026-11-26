import { StyleSheet, View } from 'react-native';

import { BookScreenColors as C } from '@/constants/BookScreenColors';

/** `ratio` between 0 and 1. */
export function ProgressBar({ ratio }: { ratio: number }) {
  const percent = Math.round(ratio * 100);
  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percent, text: `${percent} %` }}>
      <View style={[styles.fill, { width: `${percent}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: C.skeleton,
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: C.primary,
  },
});