import type { LibraryBook } from '@/data/Library';
import { spineFor } from '@/lib/Spines';

export const SHELF_PADDING = 24;
export const COVER_GAP = 16;
export const SPINE_GAP = 1;

const COVERS_PER_ROW = 3;
const MAX_COVER_WIDTH = 150;
// Mockup 16: two rows of covers, then the rest by the spine so a long shelf stays short to scroll
const COVER_LIMIT = 6;
// A third row of covers reads better than a lone handful of spines
const ALL_COVERS_UP_TO = 9;

export type ShelfRow =
  | { kind: 'covers'; key: string; books: LibraryBook[] }
  | { kind: 'spines'; key: string; books: LibraryBook[] };

export type SpineLook = { color: string; thickness: number; length: number; ink: string; fillet: string };

/** How much bigger than the home cubby spines a spine is drawn. */
export type SpineScale = { thickness: number; length: number };

export const FULL_SHELF_SCALE: SpineScale = { thickness: 3.4, length: 1.85 };

/** Spine of a book, scaled up from the home cubby spines (full shelf size by default). */
export function spineLook(isbn13: string, scale: SpineScale = FULL_SHELF_SCALE): SpineLook {
  const spine = spineFor(isbn13);
  const light = luminance(spine.color) > 0.5;
  return {
    color: spine.color,
    thickness: Math.round(spine.width * scale.thickness),
    length: Math.round(spine.height * scale.length),
    ink: light ? '#1E1408' : '#EDEAE2',
    fillet: light ? 'rgba(30, 20, 8, 0.55)' : 'rgba(237, 234, 226, 0.55)',
  };
}

export function coverWidthFor(contentWidth: number): number {
  return Math.min(Math.floor((contentWidth - COVER_GAP * (COVERS_PER_ROW - 1)) / COVERS_PER_ROW), MAX_COVER_WIDTH);
}

/**
 * Splits a shelf into rows of three covers, then rows of spines packed to `contentWidth`.
 * `allCovers` keeps every book as a cover, for the reading shelf whose covers carry the progress.
 */
export function buildShelfRows(
  books: readonly LibraryBook[],
  { contentWidth, allCovers }: { contentWidth: number; allCovers: boolean },
): ShelfRow[] {
  const coverCount = allCovers || books.length <= ALL_COVERS_UP_TO ? books.length : COVER_LIMIT;
  const rows: ShelfRow[] = [];

  for (let start = 0; start < coverCount; start += COVERS_PER_ROW) {
    const slice = books.slice(start, Math.min(start + COVERS_PER_ROW, coverCount));
    rows.push({ kind: 'covers', key: `covers-${slice[0].id}`, books: slice });
  }

  const spines = books.slice(coverCount);
  if (spines.length === 0) return rows;

  let current: LibraryBook[] = [];
  let used = 0;

  const flush = () => {
    rows.push({ kind: 'spines', key: `spines-${current[0].id}`, books: current });
    current = [];
    used = 0;
  };

  for (const book of spines) {
    const { thickness } = spineLook(book.isbn13);
    let needed = current.length > 0 ? used + SPINE_GAP + thickness : thickness;
    if (current.length > 0 && needed > contentWidth) {
      flush();
      needed = thickness;
    }
    used = needed;
    current.push(book);
  }
  flush();

  return rows;
}

function luminance(hex: string): number {
  const value = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
