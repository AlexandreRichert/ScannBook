import { useRouter } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { BookStatus, LookupErrorStatus, StatusButton, StatusText } from '@/components/book/BookStatus';
import { BookScreenColors as C } from '@/constants/BookScreenColors';
import type { BookSearchState } from '@/hooks/useBookSearch';

type SearchStatusProps = {
  state: Exclude<BookSearchState, { status: 'success' }>;
  onRetry: () => void;
};

/** Everything the search screen shows instead of results. */
export function SearchStatus({ state, onRetry }: SearchStatusProps) {
  const router = useRouter();

  switch (state.status) {
    case 'idle':
      return (
        <BookStatus
          icon={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
          title="Trouve un livre"
          actions={null}>
          <StatusText>Tape un titre ou un auteur.</StatusText>
        </BookStatus>
      );
    case 'loading':
      return <ActivityIndicator color={C.primary} accessibilityLabel="Recherche en cours" />;
    case 'empty':
      return (
        <BookStatus
          icon={{ ios: 'exclamationmark.magnifyingglass', android: 'search_off', web: 'search_off' }}
          title="Aucun résultat"
          actions={
            <StatusButton label="Scanner un livre" variant="secondary" onPress={() => router.navigate('/scan')} />
          }>
          <StatusText>
            Aucun livre pour « <StatusText strong>{state.query}</StatusText> ».{'\n'}Vérifie l’orthographe ou
            essaie un autre mot.
          </StatusText>
        </BookStatus>
      );
    case 'error':
      return <LookupErrorStatus error={state.error} onRetry={onRetry} />;
  }
}
