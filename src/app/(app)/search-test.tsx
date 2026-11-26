// TEMP: manual test of useBookSearch — delete before commit
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, Text, TextInput } from 'react-native';

import { useBookSearch } from '@/hooks/useBookSearch';

export default function SearchTest() {
  const { query, setQuery, submit, retry, state } = useBookSearch();

  useEffect(() => {
    console.log(new Date().toISOString().slice(17, 23), state.status, 'query' in state ? state.query : '');
  }, [state]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }} keyboardShouldPersistTaps="handled">
      <TextInput
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={submit}
        returnKeyType="search"
        placeholder="Titre ou auteur"
        autoFocus
        style={{ borderWidth: 1, padding: 12, borderRadius: 8, backgroundColor: 'white' }}
      />
      <Text style={{ fontWeight: '700' }}>
        {state.status}
        {'query' in state ? ` « ${state.query} »` : ''}
        {state.status === 'success' ? ` — ${state.results.length} résultats` : ''}
        {state.status === 'error' ? ` — ${state.error.kind} ${state.error.status ?? ''}` : ''}
      </Text>
      {state.status === 'error' && (
        <Pressable onPress={retry}>
          <Text style={{ color: 'blue' }}>Réessayer</Text>
        </Pressable>
      )}
      {state.status === 'success' &&
        state.results.map((book) => (
          <Pressable key={book.isbn13} onPress={() => router.push(`/book/${book.isbn13}`)}>
            <Text>
              {book.title} — {book.authors.join(', ')} ({book.isbn13})
            </Text>
          </Pressable>
        ))}
    </ScrollView>
  );
}
