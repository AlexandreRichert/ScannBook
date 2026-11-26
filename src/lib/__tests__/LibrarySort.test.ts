import { describe, expect, it } from '@jest/globals';

import type { LibraryBook } from '@/data/Library';
import { LIBRARY_SORTS, sortBooks } from '@/lib/LibrarySort';

function libraryBook(title: string, authors: string[] = []): LibraryBook {
  return {
    id: title,
    isbn13: '9780306406157',
    title,
    authors,
    cover_url: null,
    status: 'to_read',
    current_page: null,
    page_count: null,
  };
}

function titles(books: LibraryBook[]): string[] {
  return books.map((book) => book.title);
}

describe('sortBooks', () => {
  describe('recent', () => {
    it('keeps the order of the library, newest first', () => {
      const books = [libraryBook('Zadig'), libraryBook('Albertine'), libraryBook('Madame Bovary')];

      expect(titles(sortBooks(books, 'recent'))).toEqual(['Zadig', 'Albertine', 'Madame Bovary']);
    });
  });

  describe('title', () => {
    it('ignores accents and case', () => {
      const books = [libraryBook('Zadig'), libraryBook('Éloge de la fuite'), libraryBook('avare')];

      expect(titles(sortBooks(books, 'title'))).toEqual(['avare', 'Éloge de la fuite', 'Zadig']);
    });

    it('puts Tome 2 before Tome 10', () => {
      const books = [libraryBook('Tome 10'), libraryBook('Tome 2'), libraryBook('Tome 1')];

      expect(titles(sortBooks(books, 'title'))).toEqual(['Tome 1', 'Tome 2', 'Tome 10']);
    });
  });

  describe('author', () => {
    it('sorts by surname, the last word of the name', () => {
      const books = [
        libraryBook('Les Misérables', ['Victor Hugo']),
        libraryBook('Germinal', ['Émile Zola']),
        libraryBook("L'Étranger", ['Albert Camus']),
        libraryBook('Le Père Goriot', ['Honoré de Balzac']),
      ];

      expect(titles(sortBooks(books, 'author'))).toEqual([
        'Le Père Goriot',
        "L'Étranger",
        'Les Misérables',
        'Germinal',
      ]);
    });

    it('uses the full name when two authors share a surname', () => {
      const books = [libraryBook('B', ['Paul Martin']), libraryBook('A', ['Jeanne Martin'])];

      expect(titles(sortBooks(books, 'author'))).toEqual(['A', 'B']);
    });

    it('sorts books by the same author by title', () => {
      const books = [libraryBook('La Peste', ['Albert Camus']), libraryBook('La Chute', ['Albert Camus'])];

      expect(titles(sortBooks(books, 'author'))).toEqual(['La Chute', 'La Peste']);
    });

    it('puts books without an author last, sorted by title', () => {
      const books = [
        libraryBook('Sans auteur B'),
        libraryBook('Germinal', ['Émile Zola']),
        libraryBook('Sans auteur A'),
        libraryBook('La Peste', ['Albert Camus']),
      ];

      expect(titles(sortBooks(books, 'author'))).toEqual(['La Peste', 'Germinal', 'Sans auteur A', 'Sans auteur B']);
    });
  });

  it.each(LIBRARY_SORTS)('does not mutate the input array with "%s"', (sort) => {
    const books = [libraryBook('Zadig', ['Voltaire']), libraryBook('Albertine', ['Marcel Proust'])];
    const before = [...books];

    const sorted = sortBooks(books, sort);

    expect(books).toEqual(before);
    expect(sorted).not.toBe(books);
  });
});
