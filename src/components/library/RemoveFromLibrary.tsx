import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/PressableScale';
import { Fonts, Palette } from '@/constants/theme';
import { confirmDestructive } from '@/lib/ConfirmDestructive';

/** Last item of the book screen: removing is destructive, so it sits apart from the everyday actions. */
export function RemoveFromLibrary({ onRemove }: { onRemove: () => Promise<string | null> }) {
  const [error, setError] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  async function handleRemove() {
    if (isRemoving) return;
    const confirmed = await confirmDestructive(
      'Retirer ce livre ?',
      'Il quittera ta bibliothèque, avec sa pile et ses dates de lecture.',
      'Retirer',
    );
    if (!confirmed) return;
    setIsRemoving(true);
    const message = await onRemove();
    // On success the screen swaps back to the add form and unmounts this button
    if (message) {
      setError(message);
      setIsRemoving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.rule} />
      <PressableScale
        onPress={handleRemove}
        disabled={isRemoving}
        accessibilityRole="button"
        style={[styles.button, isRemoving && styles.pressed]}>
        <SymbolView name={{ ios: 'trash', android: 'delete', web: 'delete' }} size={18} tintColor={Palette.danger} />
        <Text style={styles.label}>Retirer de ma bibliothèque</Text>
      </PressableScale>
      {error && (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    marginTop: 18,
  },
  rule: {
    height: 1,
    backgroundColor: Palette.line,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
  },
  pressed: {
    opacity: 0.5,
  },
  label: {
    color: Palette.danger,
    fontFamily: Fonts.display,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: -0.07,
  },
  error: {
    color: Palette.danger,
    fontFamily: Fonts.body,
    fontSize: 15,
    textAlign: 'center',
  },
});
