import { StyleSheet, View } from 'react-native';

import { Palette } from '@/constants/theme';

/** Dark wood board the books stand on. */
export function ShelfBoard() {
  return (
    <View style={styles.wrapper} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.board} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Keeps the row spacing the removed wall shadow used to give
  wrapper: {
    paddingBottom: 20,
  },
  board: {
    height: 11,
    backgroundColor: Palette.wood,
    experimental_backgroundImage:
      'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 35%, rgba(0, 0, 0, 0.25) 100%)',
  },
});
