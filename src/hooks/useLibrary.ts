import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { fetchLibrary, type LibraryBook } from '@/data/Library';

export type LibraryState =
  | { status: 'loading' }
  | { status: 'success'; books: LibraryBook[] }
  | { status: 'error' };

/** The user's books, fetched again each time the screen regains focus so changes made on a book screen show up. */
export function useLibrary() {
  const [state, setState] = useState<LibraryState>({ status: 'loading' });

  const load = useCallback(() => {
    let cancelled = false;
    fetchLibrary().then(
      (books) => {
        if (!cancelled) setState({ status: 'success', books });
      },
      () => {
        // A failed refresh keeps the list already on screen rather than hiding it
        if (!cancelled) setState((current) => (current.status === 'success' ? current : { status: 'error' }));
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  useFocusEffect(load);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    load();
  }, [load]);

  return { state, retry };
}