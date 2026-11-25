import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchBookByIsbn, GoogleBooksError } from '@/data/GoogleBooks';
import { parseIsbn, type IsbnInvalidReason } from '@/lib/Isbn';
import type { BookInfo } from '@/types/Book';

// Re-exported so screens only depend on this hook, not on src/data/.
export type { GoogleBooksError, GoogleBooksErrorKind } from '@/data/GoogleBooks';
export type { IsbnInvalidReason } from '@/lib/Isbn';

export type BookByIsbnState =
  | { status: 'idle' }
  /** Rejected before any network call. */
  | { status: 'invalid'; reason: IsbnInvalidReason }
  | { status: 'loading'; isbn13: string }
  | { status: 'success'; isbn13: string; book: BookInfo }
  | { status: 'not-found'; isbn13: string }
  | { status: 'error'; isbn13: string; error: GoogleBooksError };

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

/**
 * Looks a book up by ISBN on demand.
 *
 * `search` validates and normalizes the input first: an invalid ISBN goes
 * straight to `invalid` without any request. A new search cancels the one in
 * flight, so a slow answer never overwrites a newer one.
 */
export function useBookByIsbn() {
  const [state, setState] = useState<BookByIsbnState>({ status: 'idle' });
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const lookup = useCallback(async (isbn13: string) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setState({ status: 'loading', isbn13 });
    try {
      const result = await fetchBookByIsbn(isbn13, controller.signal);
      setState(
        result.status === 'found'
          ? { status: 'success', isbn13, book: result.book }
          : { status: 'not-found', isbn13 },
      );
    } catch (error) {
      if (isAbortError(error)) return;
      setState({
        status: 'error',
        isbn13,
        error:
          error instanceof GoogleBooksError
            ? error
            : new GoogleBooksError('network', String(error)),
      });
    }
  }, []);

  const search = useCallback(
    (input: string) => {
      const parsed = parseIsbn(input);
      if (!parsed.ok) {
        controllerRef.current?.abort();
        setState({ status: 'invalid', reason: parsed.reason });
        return;
      }
      void lookup(parsed.isbn13);
    },
    [lookup],
  );

  /** Repeats the last lookup, e.g. after an error. */
  const retry = useCallback(() => {
    if (state.status === 'error' || state.status === 'not-found') {
      void lookup(state.isbn13);
    }
  }, [lookup, state]);

  return { state, search, retry };
}
