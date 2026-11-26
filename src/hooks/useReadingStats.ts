import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { fetchReadingStats, type ReadingStats } from '@/data/ReadingStats';

export type ReadingStatsState =
  | { status: 'loading' }
  | { status: 'success'; stats: ReadingStats }
  | { status: 'error' };

/** This year's stats, fetched again each time the screen regains focus so a book just marked as read counts. */
export function useReadingStats(year: number) {
  const [state, setState] = useState<ReadingStatsState>({ status: 'loading' });

  const load = useCallback(() => {
    let cancelled = false;
    fetchReadingStats(year).then(
      (stats) => {
        if (!cancelled) setState({ status: 'success', stats });
      },
      () => {
        // A failed refresh keeps the numbers already on screen rather than hiding them
        if (!cancelled) setState((current) => (current.status === 'success' ? current : { status: 'error' }));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [year]);

  useFocusEffect(load);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    load();
  }, [load]);

  return { state, retry };
}