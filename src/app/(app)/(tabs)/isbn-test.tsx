import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type TextInputInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BookDetails } from '@/components/BookDetails';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/Button';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useBookByIsbn, type BookByIsbnState } from '@/hooks/useBookByIsbn';
import { useTheme } from '@/hooks/use-theme';
import { bookLookupErrorMessage, invalidIsbnMessage } from '@/lib/BookLookupMessages';

/** Quick fills for the acceptance criteria. */
const EXAMPLES = [
  { label: 'ISBN-13', value: '9782253249603' },
  { label: 'ISBN-10', value: '2253249602' },
  { label: 'Invalide', value: '9782253249604' },
  { label: 'Tirets typographiques', value: '978–2–253–24960–3' },
];

export default function IsbnTestScreen() {
  const theme = useTheme();
  const inputRef = useRef<TextInputInstance>(null);
  const [input, setInput] = useState('');
  const { state, search, retry } = useBookByIsbn();
  const isLoading = state.status === 'loading';

  const submit = (value = input) => {
    setInput(value);
    search(value);
  };

  /** Not found: the ISBN was valid, so start over with an empty field. */
  const editIsbn = () => {
    setInput('');
    inputRef.current?.focus();
  };

  /** Invalid: keep what was typed so a typo can be fixed. */
  const fixIsbn = () => {
    inputRef.current?.focus();
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <ThemedText type="subtitle">Test ISBN</ThemedText>

          <View style={styles.form}>
            <TextInput
              ref={inputRef}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => submit()}
              placeholder="ISBN-10 ou ISBN-13"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="ISBN"
              style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
            />
            <Button
              label={isLoading ? 'Recherche…' : 'Rechercher'}
              onPress={() => submit()}
              disabled={isLoading}
            />
          </View>

          <View style={styles.examples}>
            {EXAMPLES.map((example) => (
              <Pressable
                key={example.value}
                onPress={() => submit(example.value)}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.chip,
                  { backgroundColor: theme.backgroundElement },
                  (pressed || isLoading) && styles.dimmed,
                ]}>
                <ThemedText type="small">{example.label}</ThemedText>
              </Pressable>
            ))}
          </View>

          <Result state={state} onRetry={retry} onEditIsbn={editIsbn} onFixIsbn={fixIsbn} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

type ResultProps = {
  state: BookByIsbnState;
  onRetry: () => void;
  onEditIsbn: () => void;
  onFixIsbn: () => void;
};

function Result({ state, onRetry, onEditIsbn, onFixIsbn }: ResultProps) {
  const router = useRouter();

  switch (state.status) {
    case 'idle':
      return (
        <ThemedText themeColor="textSecondary">
          Saisis un ISBN (tirets et espaces acceptés).
        </ThemedText>
      );
    case 'invalid':
      return (
        <View style={styles.message}>
          <ThemedText>{invalidIsbnMessage(state.reason)}</ThemedText>
          <Button
            label={state.reason === 'empty' ? 'Saisir un ISBN' : 'Corriger l’ISBN'}
            onPress={onFixIsbn}
          />
        </View>
      );
    case 'loading':
      return <ActivityIndicator style={styles.loader} />;
    case 'not-found':
      return (
        <View style={styles.message}>
          <ThemedText>Aucun livre trouvé pour l’ISBN {state.isbn13}.</ThemedText>
          <Button label="Modifier l’ISBN" onPress={onEditIsbn} />
        </View>
      );
    case 'error':
      return (
        <View style={styles.message}>
          <ThemedText>{bookLookupErrorMessage(state.error)}</ThemedText>
          <Button label="Réessayer" onPress={onRetry} />
        </View>
      );
    case 'success':
      return (
        <View style={styles.message}>
          <BookDetails book={state.book} />
          <Button label="Voir la fiche" onPress={() => router.push(`/book/${state.isbn13}`)} />
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
  },
  content: {
    gap: Spacing.three,
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.four,
    // On web the tab bar floats over the top of the screen.
    paddingTop: Platform.select({ web: Spacing.six + Spacing.three, default: Spacing.four }),
  },
  form: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  examples: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.four,
  },
  dimmed: {
    opacity: 0.6,
  },
  loader: {
    marginTop: Spacing.four,
  },
  message: {
    gap: Spacing.three,
  },
});
