import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { fetchShelvesByIsbn } from '@/data/Library';
import type { Shelf } from '@/lib/Shelves';

const NO_SHELVES: ReadonlyMap<string, Shelf> = new Map();

/**
 * Shelf of each of these books the user already owns. Reloaded when the list
 * changes and when the screen regains focus (a book added from its screen).
 * On error nothing is marked: the caller keeps working.
 */
export function useLibraryShelves(isbn13s: string[]): ReadonlyMap<string, Shelf> {
  const [shelves, setShelves] = useState(NO_SHELVES);
  // A string, so a new array with the same books does not reload.
  const key = isbn13s.join(',');

  useFocusEffect(
    useCallback(() => {
      if (key === '') return;
      let cancelled = false;
      fetchShelvesByIsbn(key.split(',')).then(
        (found) => {
          if (!cancelled) setShelves(found);
        },
        () => {
          if (!cancelled) setShelves(NO_SHELVES);
        },
      );
      return () => {
        cancelled = true;
      };
    }, [key]),
  );

  return shelves;
}
