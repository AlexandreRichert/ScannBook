import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Fonts, Palette } from '@/constants/theme';

export const FieldIcons = {
  email: { ios: 'envelope', android: 'mail', web: 'mail' },
  password: { ios: 'lock', android: 'lock', web: 'lock' },
  code: { ios: 'number', android: 'pin', web: 'pin' },
} satisfies Record<string, SymbolViewProps['name']>;

type TextFieldProps = TextInputProps & {
  label: string;
  icon?: SymbolViewProps['name'];
  hint?: string;
  error?: string | null;
  /** Adds the eye button that shows the typed password. */
  revealable?: boolean;
};

/** Form field of the Figma « Champ » component: label, icon inside the field, red border on error. */
export function TextField({
  label,
  icon,
  hint,
  error,
  revealable = false,
  secureTextEntry,
  style,
  ...inputProps
}: TextFieldProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <View style={styles.field}>
      <View style={styles.control}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.zone, error ? styles.zoneError : styles.zoneDefault]}>
          {icon && <SymbolView name={icon} size={20} tintColor={Palette.inkSecondary} />}
          <TextInput
            accessibilityLabel={label}
            placeholderTextColor={Palette.inkTertiary}
            secureTextEntry={secureTextEntry && !isRevealed}
            style={[styles.input, style]}
            {...inputProps}
          />
          {revealable && secureTextEntry && (
            <Pressable
              onPress={() => setIsRevealed((value) => !value)}
              accessibilityRole="button"
              accessibilityLabel={isRevealed ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              hitSlop={12}
              style={({ pressed }) => pressed && styles.pressed}>
              <SymbolView
                name={
                  isRevealed
                    ? { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' }
                    : { ios: 'eye', android: 'visibility', web: 'visibility' }
                }
                size={20}
                tintColor={Palette.inkSecondary}
              />
            </Pressable>
          )}
        </View>
      </View>
      {error ? <FieldError message={error} /> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function FieldError({ message, alert = false }: { message: string; alert?: boolean }) {
  return (
    <View style={styles.error} accessibilityRole={alert ? 'alert' : undefined}>
      <SymbolView
        name={{ ios: 'exclamationmark.circle', android: 'error', web: 'error' }}
        size={16}
        tintColor={Palette.danger}
      />
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  control: {
    gap: 7,
  },
  label: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
  },
  zone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 4,
    // Always 1.5 wide so the error border does not shift the content
    borderWidth: 1.5,
    backgroundColor: Palette.paperRaised,
  },
  zoneDefault: {
    borderColor: Palette.lineStrong,
  },
  zoneError: {
    borderColor: Palette.danger,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
    color: Palette.ink,
    fontFamily: Fonts.body,
    fontSize: 16,
    fontWeight: '400',
  },
  pressed: {
    opacity: 0.6,
  },
  hint: {
    color: Palette.inkSecondary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    flexShrink: 1,
    color: Palette.danger,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
});
