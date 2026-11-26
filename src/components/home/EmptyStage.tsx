import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';
import { Palette } from '@/constants/theme';

/** Dashed book outlines standing on the shelf when nothing is being read (Figma frame 09). */
export function EmptyStage({ onPress, label }: { onPress: () => void; label: string }) {
  return (
    <View style={styles.stage}>
      <View style={[styles.outline, styles.side, styles.left]} />
      <View style={[styles.outline, styles.side, styles.right]} />
      <PressableScale
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[styles.outline, styles.center]}>
        <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={26} tintColor={Palette.inkSecondary} />
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  outline: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Palette.lineStrong,
    borderRadius: 3,
  },
  center: {
    width: 146,
    height: 219,
    alignItems: 'center',
    justifyContent: 'center',
  },
  side: {
    position: 'absolute',
    bottom: 0,
    width: 112,
    height: 168,
    transformOrigin: 'bottom',
  },
  left: {
    left: -10,
    transform: [{ rotate: '-6deg' }],
  },
  right: {
    right: -10,
    transform: [{ rotate: '6deg' }],
  },
});
