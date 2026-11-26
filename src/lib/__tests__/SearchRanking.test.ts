import { describe, expect, it } from '@jest/globals';

import { SEARCH_SCORE } from '@/constants/Search';
import { rankSearchResults, scoreBook } from '@/lib/SearchRanking';
import { toWords, withoutIgnoredWords } from '@/lib/SearchText';
import type { BookInfo } from '@/types/Book';

let nextIsbn = 9780000000000;

function book(title: string, authors: string[], extra: Partial<BookInfo> = {}): BookInfo {
  nextIsbn += 1;
  return { isbn13: String(nextIsbn), title, authors, googleBooksId: title, ...extra };
}

/** Same preparation as `rankSearchResults`. */
function score(target: BookInfo, query: string): number {
  return scoreBook(target, withoutIgnoredWords(toWords(query)));
}

function titles(books: BookInfo[]): string[] {
  return books.map((item) => item.title);
}

const { authorExact, authorPartial, titleExact, titleContains, authorAndTitleBonus } = SEARCH_SCORE;

describe('scoreBook', () => {
  const petitPrince = book('Le Petit Prince', ['Antoine de Saint-Exupéry']);
  const outsider = book('The Outsider', ['Stephen King']);

  it('scores an exact title higher than a title that only contains the words', () => {
    const illustrated = book('Le Petit Prince illustré', ['Antoine de Saint-Exupéry']);

    expect(score(petitPrince, 'petit prince')).toBe(titleExact);
    expect(score(illustrated, 'petit prince')).toBe(titleContains);
    expect(score(petitPrince, 'petit prince')).toBeGreaterThan(score(illustrated, 'petit prince'));
  });

  it('looks for the words in the subtitle too', () => {
    const withSubtitle = book('Dune', ['Frank Herbert'], { subtitle: 'Édition collector' });

    expect(score(withSubtitle, 'dune collector')).toBe(titleContains);
  });

  it('scores a full author name higher than part of it', () => {
    expect(score(outsider, 'stephen king')).toBe(authorExact);
    expect(score(outsider, 'king')).toBe(authorPartial);
  });

  it('adds a bonus when the query matches both the author and the title', () => {
    expect(score(outsider, 'the outsider stephen king')).toBe(
      authorExact + titleExact + authorAndTitleBonus,
    );
    expect(score(outsider, 'king the outsider')).toBe(
      authorPartial + titleExact + authorAndTitleBonus,
    );
  });

  it('ignores initials and name particles in author names', () => {
    const catcher = book('The Catcher in the Rye', ['J. D. Salinger']);
    const belAmi = book('Bel-Ami', ['Guy de Maupassant']);

    expect(score(catcher, 'salinger')).toBe(authorExact);
    expect(score(catcher, 'd')).toBe(0);
    expect(score(belAmi, 'de')).toBe(0);
  });

  it('keeps the best score among several authors', () => {
    const coWritten = book('Good Omens', ['Terry Pratchett', 'Neil Gaiman']);

    expect(score(coWritten, 'neil gaiman')).toBe(authorExact);
  });

  it('still matches the title of a book without authors', () => {
    expect(score(book('Le Petit Prince', []), 'petit prince')).toBe(titleExact);
  });

  it('scores 0 when nothing matches', () => {
    expect(score(petitPrince, 'stephen king')).toBe(0);
  });
});

describe('rankSearchResults', () => {
  it('puts The Outsider first for "stephen king the outsider" (#63)', () => {
    // Google's order: before #63 the app showed summaries and missed King's book.
    const results = [
      book('Summary of The Outsider', ['Readtrepreneur Publishing'], {
        subtitle: 'A Novel by Stephen King',
      }),
      book('It', ['Stephen King']),
      book('The Outsider', ['Stephen King']),
    ];

    expect(titles(rankSearchResults(results, 'stephen king the outsider', 20))).toEqual([
      'The Outsider',
      'It',
      'Summary of The Outsider',
    ]);
  });

  it('matches "l\'étranger" with accents and the article ignored', () => {
    const results = [book('Camus', ['David Sherman']), book("L'Étranger", ['Albert Camus'])];

    expect(titles(rankSearchResults(results, "l'étranger", 20))[0]).toBe("L'Étranger");
  });

  it('keeps the known limit of ADR-006: "camus" ranks a book titled Camus first', () => {
    const results = [book("L'Étranger", ['Albert Camus']), book('Camus', ['David Sherman'])];

    expect(titles(rankSearchResults(results, 'camus', 20))).toEqual(['Camus', "L'Étranger"]);
  });

  it('keeps Google order for equal scores', () => {
    const results = [book('Carrie', ['Stephen King']), book('It', ['Stephen King'])];

    expect(titles(rankSearchResults(results, 'stephen king', 20))).toEqual(['Carrie', 'It']);
  });

  it('keeps only the first book of each ISBN-13', () => {
    const first = book('The Outsider', ['Stephen King']);
    const duplicate = { ...first, title: 'The Outsider (copy)' };

    expect(titles(rankSearchResults([first, duplicate], 'the outsider', 20))).toEqual([
      'The Outsider',
    ]);
  });

  it('returns at most limit books', () => {
    const results = ['A', 'B', 'C', 'D', 'E'].map((title) => book(title, ['Stephen King']));

    expect(rankSearchResults(results, 'stephen king', 3)).toHaveLength(3);
    expect(rankSearchResults(results, 'stephen king', 10)).toHaveLength(5);
  });

  it('does not mutate the input array', () => {
    const results = [book('Summary', ['Someone']), book('The Outsider', ['Stephen King'])];
    const before = [...results];

    rankSearchResults(results, 'the outsider stephen king', 20);

    expect(results).toEqual(before);
  });
});
