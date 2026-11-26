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

import { IsbnEntryColors as C } from '@/constants/IsbnEntryColors';
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
      {Platform.OS === 'ios' && <View style={styles.grabber} />}

      <View style={[styles.header, Platform.OS !== 'ios' && { marginTop: insets.top }]}>
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

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* No visible label: the title just above names the only field, and
            screen readers get it from accessibilityLabel. */}
        <View style={styles.fieldRow}>
          <View style={[styles.field, error !== null && styles.fieldError]}>
            <TextInput
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
              accessibilityHint="10 ou 13 chiffres, tirets et espaces ignorés."
              style={styles.input}
            />
            {value !== '' && (
              <Pressable onPress={clear} accessibilityRole="button" accessibilityLabel="Effacer" hitSlop={8}>
                <SymbolView
                  name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }}
                  size={20}
                  tintColor={C.muted}
                />
              </Pressable>
            )}
          </View>
          <Pressable
            onPress={addX}
            disabled={!xEnabled}
            accessibilityRole="button"
            accessibilityLabel="Ajouter X"
            accessibilityHint="Dernier caractère d’un ISBN-10"
            accessibilityState={{ disabled: !xEnabled }}
            style={({ pressed }) => [
              styles.xKey,
              !xEnabled && styles.disabled,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.xLabel}>X</Text>
          </Pressable>
        </View>

        {error !== null && (
          <View style={styles.error} accessibilityLiveRegion="polite">
            <SymbolView
              name={{ ios: 'exclamationmark.circle', android: 'error', web: 'error' }}
              size={14}
              tintColor={C.error}
            />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        <Text style={styles.help}>10 ou 13 chiffres, tirets et espaces ignorés.</Text>

        <Pressable
          onPress={submit}
          accessibilityRole="button"
          style={({ pressed }) => [styles.submit, pressed && styles.pressed]}>
          <Text style={styles.submitLabel}>Rechercher</Text>
        </Pressable>

        <View style={styles.tip}>
          <View style={styles.tipIcon}>
            <SymbolView
              name={{ ios: 'book', android: 'menu_book', web: 'menu_book' }}
              size={18}
              tintColor={C.primary}
            />
          </View>
          <View style={styles.tipText}>
            <Text style={styles.tipTitle}>Où le trouver ?</Text>
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
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 5,
    borderRadius: 3,
    marginTop: 7,
    backgroundColor: C.muted,
  },
  header: {
    height: 52,
    marginTop: 8,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cancel: {
    position: 'absolute',
    left: 20,
  },
  cancelLabel: {
    color: C.primary,
    fontSize: 17,
    lineHeight: 21,
  },
  title: {
    color: C.text,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '700',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 8,
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 54,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
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
    fontSize: 18,
  },
  xKey: {
    width: 54,
    height: 54,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.primary,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xLabel: {
    color: C.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.35,
  },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 12,
  },
  errorText: {
    flex: 1,
    color: C.error,
    fontSize: 13,
    lineHeight: 16,
  },
  help: {
    color: C.textTertiary,
    fontSize: 13,
    lineHeight: 16,
    marginTop: 10,
  },
  submit: {
    minHeight: 52,
    marginTop: 21,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitLabel: {
    color: C.onPrimary,
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '700',
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.illustration,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    gap: 4,
  },
  tipTitle: {
    color: C.text,
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '700',
  },
  tipBody: {
    color: C.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.7,
  },
});
