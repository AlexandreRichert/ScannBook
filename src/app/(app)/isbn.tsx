import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputInstance,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/ui/PressableScale';
import { IsbnEntryColors as C } from '@/constants/IsbnEntryColors';
import { Fonts } from '@/constants/theme';
import { invalidIsbnMessage } from '@/lib/BookLookupMessages';
import { parseIsbn } from '@/lib/Isbn';

/** The number pad has no X: it is offered once the first 9 digits of an ISBN-10 are typed. */
function canAddCheckX(value: string): boolean {
  return value.replace(/\D/g, '').length === 9 && !/x/i.test(value);
}

/** Manual ISBN entry, shown as a modal over the scanner or the book screen (Figma frame 05). */
export default function IsbnEntryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInputInstance>(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const xEnabled = canAddCheckX(value);

  const change = (text: string) => {
    setValue(text);
    setError(null);
  };

  const addX = () => {
    change(`${value}X`);
    inputRef.current?.focus();
  };

  const clear = () => {
    change('');
    inputRef.current?.focus();
  };

  // Validated locally only: no request is sent for an invalid ISBN.
  const submit = () => {
    const parsed = parseIsbn(value);
    if (!parsed.ok) {
      const message = invalidIsbnMessage(parsed.reason);
      setError(message);
      AccessibilityInfo.announceForAccessibility(message);
      return;
    }
    // The modal makes way for the book screen: back then returns to the
    // screen the entry was opened from.
    router.replace(`/book/${parsed.isbn13}`);
  };

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'dark'} />

      <ScrollView
        contentContainerStyle={[styles.content, Platform.OS !== 'ios' && { paddingTop: insets.top + 16 }]}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          {Platform.OS === 'ios' && <View style={styles.grabber} />}
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            hitSlop={8}
            style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}>
            <Text style={styles.cancelLabel}>Annuler</Text>
          </Pressable>
          <Text style={styles.title} accessibilityRole="header">
            Saisir un ISBN
          </Text>
        </View>

        <View style={styles.fieldGroup}>
          {/* The input carries its own accessibilityLabel: the visible label is skipped. */}
          <Text style={styles.label} accessibilityElementsHidden importantForAccessibility="no">
            ISBN
          </Text>
          <View style={styles.fieldRow}>
            <View style={[styles.field, error !== null && styles.fieldError]}>
              <TextInput
                testID="isbn-input"
                ref={inputRef}
                value={value}
                onChangeText={change}
                onSubmitEditing={submit}
                keyboardType="number-pad"
                inputMode="numeric"
                autoFocus
                autoCorrect={false}
                autoComplete="off"
                returnKeyType="search"
                selectionColor={C.primary}
                accessibilityLabel="ISBN"
                accessibilityHint="ISBN-10 ou ISBN-13. Tirets et espaces ignorés."
                style={styles.input}
              />
              {value !== '' && (
                <Pressable onPress={clear} accessibilityRole="button" accessibilityLabel="Effacer" hitSlop={10}>
                  <SymbolView
                    name={{ ios: 'xmark', android: 'close', web: 'close' }}
                    size={18}
                    tintColor={C.textSecondary}
                  />
                </Pressable>
              )}
            </View>
            <PressableScale
              onPress={addX}
              disabled={!xEnabled}
              accessibilityRole="button"
              accessibilityLabel="Ajouter X"
              accessibilityHint="Dernier caractère d’un ISBN-10"
              accessibilityState={{ disabled: !xEnabled }}
              style={[styles.xKey, !xEnabled && styles.disabled]}>
              <Text style={styles.xLabel}>X</Text>
            </PressableScale>
          </View>

          {error !== null && (
            <View style={styles.error} accessibilityLiveRegion="polite">
              <SymbolView
                name={{ ios: 'exclamationmark.circle', android: 'error', web: 'error' }}
                size={16}
                tintColor={C.error}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
          <Text style={styles.help}>ISBN-10 ou ISBN-13. Tirets et espaces ignorés.</Text>
        </View>

        <PressableScale
          testID="isbn-submit"
          onPress={submit}
          accessibilityRole="button"
          style={styles.submit}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            size={20}
            tintColor={C.onPrimary}
          />
          <Text style={styles.submitLabel}>Rechercher le livre</Text>
        </PressableScale>

        <View style={styles.tip}>
          <View style={styles.tipIcon}>
            <SymbolView
              name={{ ios: 'book', android: 'menu_book', web: 'menu_book' }}
              size={18}
              tintColor={C.accent}
            />
          </View>
          <View style={styles.tipText}>
            <Text style={styles.tipTitle}>Où trouver l’ISBN ?</Text>
            <Text style={styles.tipBody}>
              Au dos du livre, au-dessus du code-barres, ou sur la page de copyright.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.background,
  },
  content: {
    gap: 20,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 24,
  },
  header: {
    gap: 12,
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.grabber,
  },
  cancel: {
    alignSelf: 'flex-start',
  },
  cancelLabel: {
    color: C.textSecondary,
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  title: {
    color: C.text,
    fontFamily: Fonts.display,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -1.05,
  },
  fieldGroup: {
    gap: 7,
  },
  label: {
    color: C.textSecondary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 8,
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 58,
    paddingHorizontal: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  fieldError: {
    borderColor: C.error,
  },
  input: {
    flex: 1,
    height: '100%',
    color: C.text,
    fontFamily: Fonts.display,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  xKey: {
    width: 58,
    height: 58,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xLabel: {
    color: C.text,
    fontFamily: Fonts.display,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.35,
  },
  error: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: C.error,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  help: {
    color: C.textSecondary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  submit: {
    flexDirection: 'row',
    gap: 8,
    height: 56,
    paddingHorizontal: 24,
    borderRadius: 4,
    backgroundColor: C.primary,
    experimental_backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.09) 0%, rgba(0, 0, 0, 0.1) 100%)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitLabel: {
    color: C.onPrimary,
    fontFamily: Fonts.display,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: -0.16,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    gap: 2,
  },
  tipTitle: {
    color: C.text,
    fontFamily: Fonts.display,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: -0.07,
  },
  tipBody: {
    color: C.textSecondary,
    fontFamily: Fonts.body,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
  pressed: {
    opacity: 0.7,
  },
});
