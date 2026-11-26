import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ScanScreenColors as C } from '@/constants/ScanScreenColors';

const SPINES = [
  { left: 18, width: 18, height: 84, color: '#1F3550' },
  { left: 38, width: 14, height: 70, color: '#D9A860' },
  { left: 54, width: 22, height: 98, color: '#B5532E' },
  { left: 162, width: 16, height: 78, color: '#7C9A6A' },
  { left: 180, width: 24, height: 102, color: '#6E1F26' },
  { left: 206, width: 14, height: 66, color: '#D9A814' },
] as const;

/** Books on a shelf around a round pictogram (Figma frame 04). Decorative only. */
export function ScanIllustration({ icon }: { icon: SymbolViewProps['name'] }) {
  return (
    <View style={styles.root} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.backdrop} />
      {SPINES.map((spine) => (
        <View
          key={spine.left}
          style={[
            styles.spine,
            { left: spine.left, width: spine.width, height: spine.height, backgroundColor: spine.color },
          ]}
        />
      ))}
      <View style={styles.shelf} />
      <View style={styles.pictogram}>
        <SymbolView name={icon} size={30} tintColor={C.text} />
      </View>
    </View>
  );
}

const SHELF_TOP = 168;

const styles = StyleSheet.create({
  root: {
    width: 234,
    height: 197,
  },
  backdrop: {
    position: 'absolute',
    left: 22,
    top: 0,
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: C.illustration,
  },
  spine: {
    position: 'absolute',
    bottom: 197 - SHELF_TOP,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    experimental_backgroundImage:
      'linear-gradient(90deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.04) 30%, rgba(0, 0, 0, 0.34) 100%)',
  },
  shelf: {
    position: 'absolute',
    top: SHELF_TOP,
    left: 0,
    right: 0,
    height: 9,
    backgroundColor: C.shelf,
    experimental_backgroundImage:
      'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 35%, rgba(0, 0, 0, 0.25) 100%)',
  },
  pictogram: {
    position: 'absolute',
    left: 81,
    top: 86,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
