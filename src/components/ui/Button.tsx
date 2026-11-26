import { Pressable, StyleSheet, Text } from 'react-native';

import { Fonts, Palette } from '@/constants/theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
};

export function Button({ label, onPress, disabled = false, fullWidth = false }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        fullWidth && styles.fullWidth,
        (pressed || disabled) && styles.dimmed,
      ]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 24,
    borderRadius: 4,
    minHeight: 56,
    backgroundColor: Palette.ink,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  dimmed: {
    opacity: 0.6,
  },
  label: {
    color: Palette.inkInverse,
    fontFamily: Fonts.display,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: -0.16,
  },
});
