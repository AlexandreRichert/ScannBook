import type { LibraryBook } from '@/data/Library';

export const LIBRARY_SORTS = ['recent', 'title', 'author'] as const;

export type LibrarySort = (typeof LIBRARY_SORTS)[number];

export const LIBRARY_SORT_LABELS: Record<LibrarySort, string> = {
  recent: 'Ajout récent',
  title: 'Titre',
  author: 'Auteur',
};

// Accents and case are ignored, and « Tome 2 » comes before « Tome 10 »
const collator = new Intl.Collator('fr', { sensitivity: 'base', numeric: true });

// Google Books gives « Albert Camus », but readers look for Camus: the last word is the surname in most names
function surname(author: string): string {
  return author.trim().split(/\s+/).at(-1) ?? '';
}

function compareAuthors(a: LibraryBook, b: LibraryBook): number {
  const [authorA, authorB] = [a.authors[0], b.authors[0]];
  if (!authorA || !authorB) return authorA ? -1 : authorB ? 1 : 0;
  return collator.compare(surname(authorA), surname(authorB)) || collator.compare(authorA, authorB);
}

/** `books` must come newest first, as fetchLibrary returns them. Books without an author go last. */
export function sortBooks(books: readonly LibraryBook[], sort: LibrarySort): LibraryBook[] {
  switch (sort) {
    case 'recent':
      return [...books];
    case 'title':
      return [...books].sort((a, b) => collator.compare(a.title, b.title));
    case 'author':
      return [...books].sort((a, b) => compareAuthors(a, b) || collator.compare(a.title, b.title));
  }
}