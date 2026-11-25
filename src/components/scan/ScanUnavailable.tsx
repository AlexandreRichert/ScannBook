import { StatusBar } from 'expo-status-bar';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset } from '@/constants/theme';
import { ScanScreenColors as C } from '@/constants/ScanScreenColors';

type ScanUnavailableProps = {
  icon: SymbolViewProps['name'];
  title: string;
  body: string;
  /** Main action, e.g. opening the settings. Omitted when nothing can be done. */
  primary?: { label: string; onPress: () => void };
  onManualEntry: () => void;
};

/**
 * Shown instead of the camera when it cannot be used: permission not asked
 * yet, permission denied (Figma frame 04) or web.
 */
export function ScanUnavailable({ icon, title, body, primary, onManualEntry }: ScanUnavailableProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + 23, paddingBottom: insets.bottom + BottomTabInset + 24 },
      ]}>
      <StatusBar style="dark" />
      <Text style={styles.screenTitle} accessibilityRole="header">
        Scanner un livre
      </Text>

      <View style={styles.content}>
        <View style={styles.illustration}>
          <SymbolView name={icon} size={36} tintColor={C.primary} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>

        <View style={styles.actions}>
          {primary && (
            <Pressable
              onPress={primary.onPress}
              accessibilityRole="button"
              style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}>
              <Text style={[styles.buttonLabel, { color: C.onPrimary }]}>{primary.label}</Text>
            </Pressable>
          )}
          <Pressable
            onPress={onManualEntry}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.button,
              primary ? styles.secondary : styles.primary,
              pressed && styles.pressed,
            ]}>
            <SymbolView
              name={{ ios: 'keyboard', android: 'keyboard', web: 'keyboard' }}
              size={18}
              tintColor={primary ? C.primary : C.onPrimary}
            />
            <Text style={[styles.buttonLabel, { color: primary ? C.primary : C.onPrimary }]}>
              Saisir l’ISBN à la main
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.background,
    paddingHorizontal: 24,
  },
  screenTitle: {
    color: C.text,
    fontSize: 17,
    lineHeight: 40,
    fontWeight: '700',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: C.illustration,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    color: C.text,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },
  body: {
    color: C.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    gap: 12,
    marginTop: 39,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  primary: {
    backgroundColor: C.primary,
  },
  secondary: {
    backgroundColor: C.surface,
    borderColor: C.primary,
    borderWidth: 1.5,
  },
  buttonLabel: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.7,
  },
});
