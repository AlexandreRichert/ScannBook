// Spine colors of the Figma « Casier » shelves
const SPINE_COLORS = [
  '#1F3550',
  '#D9A860',
  '#A3462A',
  '#D9A814',
  '#7C9A6A',
  '#B3221C',
  '#1E2A44',
  '#F2D46B',
  '#B8322A',
  '#DAD3C4',
  '#E98C6B',
  '#6C7FD1',
  '#3B2B4A',
];

export type Spine = { key: string; color: string; width: number; height: number };

function hash(text: string): number {
  let value = 0;
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) >>> 0;
  return value;
}

/** Stable spine look for a book, so a shelf keeps the same spines between visits. */
export function spineFor(isbn13: string): Spine {
  const value = hash(isbn13);
  return {
    key: isbn13,
    color: SPINE_COLORS[value % SPINE_COLORS.length],
    width: 8 + (value % 6),
    height: 58 + ((value >> 4) % 17),
  };
}
