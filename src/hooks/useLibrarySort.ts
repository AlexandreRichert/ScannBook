import { useCallback, useState } from 'react';

import type { LibrarySort } from '@/lib/LibrarySort';

// Module scope outlives the screen but not the app: the issue only asks to remember the sort for the session
let sessionSort: LibrarySort = 'recent';

export function useLibrarySort() {
  const [sort, setSortState] = useState(sessionSort);

  const setSort = useCallback((next: LibrarySort) => {
    sessionSort = next;
    setSortState(next);
  }, []);

  return [sort, setSort] as const;
}