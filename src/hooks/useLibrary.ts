import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { fetchLibrary, type LibraryBook } from '@/data/Library';
import { useAuth } from '@/hooks/useAuth';

export type LibraryState =
  | { status: 'loading' }
  | { status: 'success'; books: LibraryBook[] }
  | { status: 'error' };

// Last list fetched, shared by every screen so a newly opened one renders at once
// instead of flashing a spinner while its own request runs. Keyed by user so an
// account switch never shows the previous account's books.
let cache: { userId: string; books: LibraryBook[] } | null = null;

/** The user's books, fetched again each time the screen regains focus so changes made on a book screen show up. */
export function useLibrary() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [state, setState] = useState<LibraryState>(() =>
    cache && cache.userId === userId ? { status: 'success', books: cache.books } : { status: 'loading' },
  );

  const load = useCallback(() => {
    let cancelled = false;
    fetchLibrary().then(
      (books) => {
        if (userId) cache = { userId, books };
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
  }, [userId]);

  useFocusEffect(load);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    load();
  }, [load]);

  return { state, retry };
}
