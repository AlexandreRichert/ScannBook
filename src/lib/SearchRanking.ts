import { SEARCH_SCORE, type SearchScoreCriterion } from '@/constants/Search';
import { toNameWords, toWords, withoutIgnoredWords } from '@/lib/SearchText';
import type { BookInfo } from '@/types/Book';

/** What a book matches, without any points. */
type BookMatch = {
  author: 'exact' | 'partial' | null;
  title: 'exact' | 'contains' | null;
};

/** One rule per weight of `SEARCH_SCORE`: TypeScript fails if one is missing. */
const CRITERIA: Record<SearchScoreCriterion, (match: BookMatch) => boolean> = {
  authorExact: (match) => match.author === 'exact',
  authorPartial: (match) => match.author === 'partial',
  titleExact: (match) => match.title === 'exact',
  titleContains: (match) => match.title === 'contains',
  authorAndTitleBonus: (match) => match.author !== null && match.title !== null,
};

const CRITERION_NAMES = Object.keys(CRITERIA) as SearchScoreCriterion[];

function score(match: BookMatch): number {
  return CRITERION_NAMES.reduce(
    (total, criterion) => total + (CRITERIA[criterion](match) ? SEARCH_SCORE[criterion] : 0),
    0,
  );
}

function sameWords(a: string[], b: string[]): boolean {
  const setA = new Set(a);
  const setB = new Set(b);
  return setA.size === setB.size && [...setA].every((word) => setB.has(word));
}

/**
 * Matches one author's name first, then the words left over against the title:
 * "the outsider stephen king" → author "Stephen King", then title "outsider".
 */
function matchWithAuthor(book: BookInfo, author: string, queryWords: string[]): BookMatch {
  const authorWords = toNameWords(author);
  const found = authorWords.filter((word) => queryWords.includes(word));
  const authorMatch =
    found.length === 0 ? null : found.length === authorWords.length ? 'exact' : 'partial';

  const rest = queryWords.filter((word) => !found.includes(word));
  if (rest.length === 0) return { author: authorMatch, title: null };

  const title = withoutIgnoredWords(toWords(book.title));
  const titleAndSubtitle = withoutIgnoredWords(toWords(`${book.title} ${book.subtitle ?? ''}`));
  const titleMatch = sameWords(title, rest)
    ? 'exact'
    : rest.every((word) => titleAndSubtitle.includes(word))
      ? 'contains'
      : null;

  return { author: authorMatch, title: titleMatch };
}

/** Keeps the first book of each ISBN-13. */
function uniqueByIsbn(books: BookInfo[]): BookInfo[] {
  const seen = new Set<string>();
  const unique: BookInfo[] = [];
  for (const book of books) {
    if (seen.has(book.isbn13)) continue;
    seen.add(book.isbn13);
    unique.push(book);
  }
  return unique;
}

/** Best score among the book's authors. */
export function scoreBook(book: BookInfo, queryWords: string[]): number {
  const authors = book.authors.length > 0 ? book.authors : [''];
  return Math.max(...authors.map((author) => score(matchWithAuthor(book, author, queryWords))));
}

/**
 * Highest score first; equal scores keep Google's order. Deduped by ISBN-13,
 * at most `limit` books.
 */
export function rankSearchResults(books: BookInfo[], query: string, limit: number): BookInfo[] {
  const queryWords = withoutIgnoredWords(toWords(query));

  return uniqueByIsbn(books)
    .map((book, index) => ({ book, index, score: scoreBook(book, queryWords) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ book }) => book);
}
