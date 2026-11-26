import type { BookInfo } from '@/types/Book';

/** "L'Étranger" → ["l", "etranger"] */
function toWords(text: string): string[] {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/** Every query word is in the title, or in a single author's name. */
function isStrongMatch(book: BookInfo, queryWords: string[]): boolean {
  const containsAll = (text: string) => {
    const words = toWords(text);
    return queryWords.every((word) => words.includes(word));
  };
  return containsAll(`${book.title} ${book.subtitle ?? ''}`) || book.authors.some(containsAll);
}

function interleave<T>(a: T[], b: T[]): T[] {
  return Array.from({ length: Math.max(a.length, b.length) }, (_, i) => [a[i], b[i]])
    .flat()
    .filter((item) => item !== undefined);
}

/**
 * Merges author and title search results: strong matches first, then author
 * and title results alternate. Deduped by ISBN-13.
 */
export function rankSearchResults(
  byAuthor: BookInfo[],
  byTitle: BookInfo[],
  query: string,
  limit: number,
): BookInfo[] {
  const queryWords = toWords(query);
  const isStrong = (book: BookInfo) => isStrongMatch(book, queryWords);
  const isWeak = (book: BookInfo) => !isStrong(book);
  const ranked = [
    ...interleave(byAuthor.filter(isStrong), byTitle.filter(isStrong)),
    ...interleave(byAuthor.filter(isWeak), byTitle.filter(isWeak)),
  ];

  const seen = new Set<string>();
  return ranked
    .filter((book) => !seen.has(book.isbn13) && seen.add(book.isbn13))
    .slice(0, limit);
}
