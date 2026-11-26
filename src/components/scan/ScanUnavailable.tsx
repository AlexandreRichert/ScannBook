import { StatusBar } from 'expo-status-bar';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  onSearch: () => void;
};

/**
 * Shown instead of the camera when it cannot be used: permission not asked
 * yet, permission denied (Figma frame 04) or web.
 */
export function ScanUnavailable({ icon, title, body, primary, onManualEntry, onSearch }: ScanUnavailableProps) {
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

      {/* Centered when it fits, scrollable when it doesn't (small screen, large text). */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.illustration}>
          <SymbolView name={icon} size={36} tintColor={C.primary} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>

        <View style={styles.actions}>
          {primary && <ActionButton label={primary.label} onPress={primary.onPress} />}
          <ActionButton
            icon={{ ios: 'keyboard', android: 'keyboard', web: 'keyboard' }}
            label="Saisir l’ISBN à la main"
            hint="Ouvre la saisie de l’ISBN au clavier"
            variant={primary ? 'secondary' : 'primary'}
            onPress={onManualEntry}
          />
          <ActionButton
            icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            label="Rechercher un livre"
            hint="Ouvre la recherche par titre ou auteur"
            variant="secondary"
            onPress={onSearch}
          />
        </View>
      </ScrollView>
    </View>
  );
}

type ActionButtonProps = {
  icon?: SymbolViewProps['name'];
  label: string;
  /** What happens on press, read after the label by screen readers. */
  hint?: string;
  variant?: 'primary' | 'secondary';
  onPress: () => void;
};

/** The icon is decorative: only the label is read. */
function ActionButton({ icon, label, hint, variant = 'primary', onPress }: ActionButtonProps) {
  const isPrimary = variant === 'primary';
  const color = isPrimary ? C.onPrimary : C.primary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primary : styles.secondary,
        pressed && styles.pressed,
      ]}>
      {icon && <SymbolView name={icon} size={18} tintColor={color} />}
      <Text style={[styles.buttonLabel, { color }]}>{label}</Text>
    </Pressable>
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
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
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
