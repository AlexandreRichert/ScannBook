import { StatusBar } from 'expo-status-bar';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScanIllustration } from '@/components/scan/ScanIllustration';
import { PressableScale } from '@/components/ui/PressableScale';
import { ScanScreenColors as C } from '@/constants/ScanScreenColors';
import { BottomTabInset, Fonts, Palette } from '@/constants/theme';

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
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + BottomTabInset + 24 },
      ]}>
      <StatusBar style="dark" />
      <Text style={styles.screenTitle} accessibilityRole="header">
        Scanner un livre
      </Text>

      <View style={styles.content}>
        <ScanIllustration icon={icon} />
        <View style={styles.text}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
        </View>

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
      </View>
    </ScrollView>
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
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      style={[styles.button, isPrimary ? styles.primary : styles.secondary]}>
      {icon && <SymbolView name={icon} size={20} tintColor={color} />}
      <Text style={[styles.buttonLabel, { color }]}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  screenTitle: {
    color: C.text,
    fontFamily: Fonts.display,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.55,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  text: {
    alignItems: 'center',
    gap: 8,
    maxWidth: 300,
    marginTop: 31,
  },
  title: {
    color: C.text,
    fontFamily: Fonts.display,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.55,
    textAlign: 'center',
  },
  body: {
    color: C.textSecondary,
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    textAlign: 'center',
  },
  actions: {
    alignSelf: 'stretch',
    gap: 12,
    marginTop: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 56,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  primary: {
    backgroundColor: C.primary,
    experimental_backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.09) 0%, rgba(0, 0, 0, 0.1) 100%)',
  },
  secondary: {
    backgroundColor: C.surface,
    borderColor: Palette.lineStrong,
    borderWidth: 1,
  },
  buttonLabel: {
    fontFamily: Fonts.display,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: -0.16,
  },
});
