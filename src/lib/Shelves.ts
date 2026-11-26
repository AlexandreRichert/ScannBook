export const SHELVES = ['wishlist', 'to_read', 'reading', 'read', 'abandoned'] as const;

export type Shelf = (typeof SHELVES)[number];

export const SHELF_LABELS: Record<Shelf, string> = {
  wishlist: 'Envies',
  to_read: 'À lire',
  reading: 'En cours',
  read: 'Lu',
  abandoned: 'Abandonné',
};

/** Number of items on each shelf, zero included. */
export function countByShelf(items: readonly { status: Shelf }[]): Record<Shelf, number> {
  const counts = { wishlist: 0, to_read: 0, reading: 0, read: 0, abandoned: 0 };
  for (const item of items) counts[item.status] += 1;
  return counts;
}


export type ReadingDates = { started_at: string | null; finished_at: string | null };

const NO_DATES: ReadingDates = { started_at: null, finished_at: null };

// Local calendar day: toISOString() is UTC and would give yesterday's date late in the evening in France
export function localToday(now = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Reading dates a book gets when it lands on `shelf`, given the dates it already has. */
export function datesForShelf(shelf: Shelf, current: ReadingDates = NO_DATES, today = localToday()): ReadingDates {
  switch (shelf) {
    case 'wishlist':
    case 'to_read':
      return NO_DATES;
    case 'reading':
      return { started_at: current.started_at ?? today, finished_at: null };
    case 'read':
      return { started_at: current.started_at, finished_at: today };
    case 'abandoned':
      return { started_at: current.started_at, finished_at: null };
  }
}