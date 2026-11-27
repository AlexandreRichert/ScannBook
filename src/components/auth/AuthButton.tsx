import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleSheet, Text } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';
import { Fonts, Palette } from '@/constants/theme';

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: SymbolViewProps['name'];
  /** Stable id for end-to-end tests (Maestro). */
  testID?: string;
};

/** Primary variant of the Figma « Bouton » component, with its top light gradient. */
export function AuthButton({ label, onPress, disabled = false, icon, testID }: AuthButtonProps) {
  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={[styles.button, disabled && styles.dimmed]}>
      {icon && <SymbolView name={icon} size={18} tintColor={Palette.inkInverse} />}
      <Text style={styles.label}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    paddingHorizontal: 24,
    borderRadius: 4,
    backgroundColor: Palette.ink,
    experimental_backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.09) 0%, rgba(0, 0, 0, 0.1) 100%)',
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
