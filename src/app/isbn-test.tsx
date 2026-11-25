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
import {
  useBookByIsbn,
  type BookByIsbnState,
  type GoogleBooksError,
  type IsbnInvalidReason,
} from '@/hooks/useBookByIsbn';
import { useTheme } from '@/hooks/use-theme';

/** Quick fills for the acceptance criteria. */
const EXAMPLES = [
  { label: 'ISBN-13', value: '9782253249603' },
  { label: 'ISBN-10', value: '2253249602' },
  { label: 'Invalide', value: '9782253249604' },
  { label: 'Tirets typographiques', value: '978–2–253–24960–3' },
];

const INVALID_ISBN_MESSAGES: Record<IsbnInvalidReason, string> = {
  empty: 'Saisis un ISBN.',
  length: 'ISBN invalide : il faut 10 ou 13 chiffres.',
  characters:
    'ISBN invalide : seuls les chiffres sont acceptés (et X en dernière position d’un ISBN-10).',
  prefix: 'ISBN invalide : un ISBN-13 commence par 978 ou 979.',
  checksum: 'ISBN invalide : la clé de contrôle ne correspond pas, vérifie la saisie.',
};

function errorMessage(error: GoogleBooksError): string {
  switch (error.kind) {
    case 'network':
      return 'Impossible de joindre Google Books. Vérifie ta connexion internet.';
    case 'missing-key':
      return 'Clé API manquante : ajoute EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY dans .env puis relance Expo.';
    case 'http':
      if (error.status === 403) return 'Clé API refusée par Google Books (403).';
      if (error.status === 429) return 'Quota Google Books dépassé (429). Réessaie plus tard.';
      return `Google Books a renvoyé une erreur (${error.status ?? 'inconnue'}).`;
    case 'invalid-response':
      return 'Réponse inattendue de Google Books.';
  }
}

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

  const editIsbn = () => {
    setInput('');
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

          <Result state={state} onRetry={retry} onEditIsbn={editIsbn} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

type ResultProps = {
  state: BookByIsbnState;
  onRetry: () => void;
  onEditIsbn: () => void;
};

function Result({ state, onRetry, onEditIsbn }: ResultProps) {
  switch (state.status) {
    case 'idle':
      return (
        <ThemedText themeColor="textSecondary">
          Saisis un ISBN (tirets et espaces acceptés).
        </ThemedText>
      );
    case 'invalid':
      return <ThemedText>{INVALID_ISBN_MESSAGES[state.reason]}</ThemedText>;
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
          <ThemedText>{errorMessage(state.error)}</ThemedText>
          <Button label="Réessayer" onPress={onRetry} />
        </View>
      );
    case 'success':
      return <BookDetails book={state.book} />;
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
