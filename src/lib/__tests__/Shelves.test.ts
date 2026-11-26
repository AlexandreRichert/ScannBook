import { afterEach, describe, expect, it, jest } from '@jest/globals';

import {
  countByShelf,
  datesForShelf,
  formatDay,
  localToday,
  parseDay,
  SHELVES,
  toDay,
  type ReadingDates,
  type Shelf,
} from '@/lib/Shelves';

// Dates are built with `new Date(year, monthIndex, day, ...)`, in local time,
// never from an ISO string (read as UTC): the tests pass in any time zone.

const TODAY = '2026-11-26';
const NO_DATES: ReadingDates = { started_at: null, finished_at: null };
const READ_BEFORE: ReadingDates = { started_at: '2026-11-01', finished_at: '2026-11-20' };

afterEach(() => {
  jest.useRealTimers();
});

describe('countByShelf', () => {
  it('lists every shelf with 0 when there are no books', () => {
    const counts = countByShelf([]);

    expect(Object.keys(counts).sort()).toEqual([...SHELVES].sort());
    expect(Object.values(counts)).toEqual(SHELVES.map(() => 0));
  });

  it('counts the books on each shelf', () => {
    const books: { status: Shelf }[] = [
      { status: 'reading' },
      { status: 'read' },
      { status: 'read' },
      { status: 'wishlist' },
    ];

    expect(countByShelf(books)).toEqual({ wishlist: 1, to_read: 0, reading: 1, read: 2, abandoned: 0 });
  });
});

describe('datesForShelf', () => {
  it.each<Shelf>(['wishlist', 'to_read'])('clears both dates on "%s"', (shelf) => {
    expect(datesForShelf(shelf, READ_BEFORE, TODAY)).toEqual(NO_DATES);
  });

  it('starts the book today when it moves to "reading"', () => {
    expect(datesForShelf('reading', NO_DATES, TODAY)).toEqual({ started_at: TODAY, finished_at: null });
  });

  it('keeps the start date and clears the end date when a book is read again', () => {
    expect(datesForShelf('reading', READ_BEFORE, TODAY)).toEqual({ started_at: '2026-11-01', finished_at: null });
  });

  it('finishes the book today on "read" and keeps its start date', () => {
    expect(datesForShelf('read', READ_BEFORE, TODAY)).toEqual({ started_at: '2026-11-01', finished_at: TODAY });
  });

  it('does not invent a start date for a book read without being started', () => {
    expect(datesForShelf('read', NO_DATES, TODAY)).toEqual({ started_at: null, finished_at: TODAY });
  });

  it('keeps the start date and has no end date on "abandoned"', () => {
    expect(datesForShelf('abandoned', READ_BEFORE, TODAY)).toEqual({ started_at: '2026-11-01', finished_at: null });
  });

  it('uses no previous dates and the local day by default', () => {
    jest.useFakeTimers({ now: new Date(2026, 10, 26, 23, 59) });

    expect(datesForShelf('reading')).toEqual({ started_at: '2026-11-26', finished_at: null });
  });
});

describe('toDay', () => {
  it('formats the local calendar day with zero padding', () => {
    expect(toDay(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('keeps the local day late in the evening, where UTC is already tomorrow in France', () => {
    expect(toDay(new Date(2026, 10, 26, 23, 59))).toBe('2026-11-26');
  });

  it('keeps the local day just after midnight, where UTC is still yesterday in France', () => {
    expect(toDay(new Date(2026, 10, 26, 0, 1))).toBe('2026-11-26');
  });
});

describe('localToday', () => {
  it("returns today's local day", () => {
    jest.useFakeTimers({ now: new Date(2026, 10, 26, 23, 59) });

    expect(localToday()).toBe('2026-11-26');
  });
});

describe('parseDay', () => {
  it('returns that day at local midnight', () => {
    const date = parseDay('2026-11-26');

    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 10, 26]);
    expect([date.getHours(), date.getMinutes()]).toEqual([0, 0]);
  });

  it.each(['2026-01-01', '2026-02-28', '2028-02-29', '2026-12-31'])('gives back %s through toDay', (day) => {
    expect(toDay(parseDay(day))).toBe(day);
  });
});

describe('formatDay', () => {
  it.each([
    ['2026-11-12', '12 nov. 2026'],
    ['2026-01-05', '5 janv. 2026'],
    ['2026-08-31', '31 août 2026'],
    ['2026-12-01', '1 déc. 2026'],
  ])('formats %s as « %s »', (day, expected) => {
    expect(formatDay(day)).toBe(expected);
  });
});
