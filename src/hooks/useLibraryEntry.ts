import { useCallback, useEffect, useState } from 'react';

import {
    addToLibrary,
    fetchLibraryEntry,
    libraryErrorMessage,
    moveToShelf,
    removeFromLibrary,
    updateReadingDates,
    type LibraryEntry,
} from '@/data/Library';
import type { ReadingDates, Shelf } from '@/lib/Shelves';
import type { BookInfo } from '@/types/Book';

export type LibraryEntryState =
  | { status: 'loading' }
  | { status: 'absent' }
  | { status: 'present'; entry: LibraryEntry }
  | { status: 'error' };

/** Whether a book is in the user's library. Give the calling component `key={isbn13}` so a new book starts fresh. */
export function useLibraryEntry(isbn13: string) {
  const [state, setState] = useState<LibraryEntryState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchLibraryEntry(isbn13).then(
      (entry) => {
        if (!cancelled) setState(entry ? { status: 'present', entry } : { status: 'absent' });
      },
      () => {
        if (!cancelled) setState({ status: 'error' });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [isbn13, attempt]);

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((value) => value + 1);
  }, []);

  /** Resolves to a French error message, or null on success. */
  const add = useCallback(async (book: BookInfo, shelf: Shelf) => {
    try {
      const entry = await addToLibrary(book, shelf);
      setState({ status: 'present', entry });
      return null;
    } catch (error) {
      return libraryErrorMessage(error);
    }
  }, []);

  /** Resolves to a French error message, or null on success. */
  const move = useCallback(
    async (shelf: Shelf) => {
      if (state.status !== 'present') return null;
      try {
        const entry = await moveToShelf(state.entry, shelf);
        setState({ status: 'present', entry });
        return null;
      } catch (error) {
        return libraryErrorMessage(error);
      }
    },
    [state],
  );

    /** Resolves to a French error message, or null on success. */
  const remove = useCallback(async () => {
    if (state.status !== 'present') return null;
    try {
      await removeFromLibrary(state.entry.id);
      setState({ status: 'absent' });
      return null;
    } catch (error) {
      return libraryErrorMessage(error);
    }
  }, [state]);

    /** Resolves to a French error message, or null on success. */
  const setDates = useCallback(
    async (dates: ReadingDates) => {
      if (state.status !== 'present') return null;
      try {
        const entry = await updateReadingDates(state.entry.id, dates);
        setState({ status: 'present', entry });
        return null;
      } catch (error) {
        return libraryErrorMessage(error);
      }
    },
    [state],
  );

  return { state, reload, add, move, remove, setDates };
}