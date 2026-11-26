import { useCallback, useEffect, useRef, useState } from 'react';

import { GoogleBooksError, searchBooks } from '@/data/GoogleBooks';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import type { BookInfo } from '@/types/Book';

export const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 400;

export type BookSearchState =
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'success'; query: string; results: BookInfo[] }
  | { status: 'empty'; query: string }
  | { status: 'error'; query: string; error: GoogleBooksError };

/**
 * Searches as the user types (400 ms debounce) or right away on `submit`.
 * A new search cancels the one in flight.
 */
export function useBookSearch() {
  const [query, setQueryText] = useState('');
  const [state, setState] = useState<BookSearchState>({ status: 'idle' });
  const controllerRef = useRef<AbortController | null>(null);
  /** Trimmed query of the last search sent, to skip repeats. */
  const sentRef = useRef<string | null>(null);

  const abort = useCallback(() => controllerRef.current?.abort(), []);
  useEffect(() => abort, [abort]);

  const run = useCallback(
    async (trimmed: string) => {
      abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      sentRef.current = trimmed;

      setState({ status: 'loading', query: trimmed });
      try {
        const results = await searchBooks(trimmed, controller.signal);
        if (controller.signal.aborted) return;
        setState(
          results.length > 0
            ? { status: 'success', query: trimmed, results }
            : { status: 'empty', query: trimmed },
        );
      } catch (error) {
        if (controller.signal.aborted) return;
        sentRef.current = null;
        setState({
          status: 'error',
          query: trimmed,
          error: error instanceof GoogleBooksError ? error : new GoogleBooksError('network', String(error)),
        });
      }
    },
    [abort],
  );

  const runIfNew = useCallback(
    (trimmed: string) => {
      if (trimmed !== sentRef.current) void run(trimmed);
    },
    [run],
  );

  const debounced = useDebouncedCallback(runIfNew, DEBOUNCE_MS);

  const setQuery = useCallback(
    (text: string) => {
      setQueryText(text);
      const trimmed = text.trim();
      if (trimmed.length >= MIN_QUERY_LENGTH) {
        debounced.run(trimmed);
        return;
      }
      debounced.cancel();
      abort();
      sentRef.current = null;
      setState({ status: 'idle' });
    },
    [abort, debounced],
  );

  /** Keyboard "Search" key: no need to wait for the debounce. */
  const submit = useCallback(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) return;
    debounced.cancel();
    runIfNew(trimmed);
  }, [debounced, query, runIfNew]);

  const retry = useCallback(() => {
    if (state.status === 'error') void run(state.query);
  }, [run, state]);

  return { query, setQuery, submit, retry, state };
}
