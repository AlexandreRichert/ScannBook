import { describe, expect, it } from '@jest/globals';

import {
  InvalidGoogleBooksResponseError,
  pickVolumeFromSearch,
  readVolume,
  toBookInfo,
  toSearchResults,
  type RawVolume,
} from '@/data/GoogleBooksAdapter';
import searchEmpty from './fixtures/search-empty.json';
import searchResults from './fixtures/search-results.json';
import volumeComplete from './fixtures/volume-complete.json';
import volumeMinimal from './fixtures/volume-minimal.json';

const ISBN = '9780306406157';

function volume(volumeInfo: Record<string, unknown>): RawVolume {
  return { id: 'vol-test', volumeInfo };
}

describe('toBookInfo', () => {
  it('maps a complete volume to a book', () => {
    expect(toBookInfo(readVolume(volumeComplete), ISBN)).toEqual({
      isbn13: ISBN,
      title: 'Le Livre de test',
      subtitle: 'Une édition complète',
      authors: ['Jeanne Dupont', 'Paul Martin'],
      publisher: 'Éditions Exemple',
      publishedDate: '2014-10-01',
      pageCount: 320,
      description: 'Premier paragraphe.\n\nSecond & dernier.\nFin.',
      coverUrl: 'https://books.google.com/books/content?id=vol-complete&zoom=2&source=gbs_api',
      language: 'fr',
      googleBooksId: 'vol-complete',
    });
  });

  it('keeps only the title and no authors when optional fields are missing', () => {
    expect(toBookInfo(readVolume(volumeMinimal), ISBN)).toEqual({
      isbn13: ISBN,
      title: 'Un livre sans détails',
      authors: [],
      googleBooksId: 'vol-minimal',
    });
  });

  it.each([
    ['no title', {}],
    ['a blank title', { title: '   ' }],
    ['a title that is not a string', { title: 42 }],
  ])('returns undefined for a volume with %s', (_, volumeInfo) => {
    expect(toBookInfo(volume(volumeInfo), ISBN)).toBeUndefined();
  });

  it('drops optional fields with the wrong type instead of failing', () => {
    const book = toBookInfo(
      volume({
        title: 'Titre',
        subtitle: 12,
        authors: 'Jeanne Dupont',
        pageCount: '320',
        publishedDate: 2014,
        imageLinks: 'http://example.com/cover.jpg',
      }),
      ISBN,
    );

    expect(book).toEqual({ isbn13: ISBN, title: 'Titre', authors: [], googleBooksId: 'vol-test' });
  });

  it('keeps only non-blank string authors', () => {
    const book = toBookInfo(volume({ title: 'Titre', authors: [' Jeanne Dupont ', '', 42, null] }), ISBN);

    expect(book?.authors).toEqual(['Jeanne Dupont']);
  });

  it.each([0, -3, 12.5])('treats a page count of %d as unknown', (pageCount) => {
    expect(toBookInfo(volume({ title: 'Titre', pageCount }), ISBN)?.pageCount).toBeUndefined();
  });
});

describe('cover URL', () => {
  function coverOf(imageLinks: Record<string, unknown>): string | undefined {
    return toBookInfo(volume({ title: 'Titre', imageLinks }), ISBN)?.coverUrl;
  }

  it('forces https on an http thumbnail', () => {
    expect(coverOf({ thumbnail: 'http://books.google.com/cover?id=1' })).toBe(
      'https://books.google.com/cover?id=1',
    );
  });

  it('leaves an https URL unchanged', () => {
    expect(coverOf({ thumbnail: 'https://books.google.com/cover?id=1' })).toBe(
      'https://books.google.com/cover?id=1',
    );
  });

  it('removes the curled-page effect', () => {
    expect(coverOf({ thumbnail: 'https://books.google.com/cover?id=1&edge=curl' })).toBe(
      'https://books.google.com/cover?id=1',
    );
  });

  it('prefers small, then thumbnail, then smallThumbnail', () => {
    const small = 'https://books.google.com/small';
    const thumbnail = 'https://books.google.com/thumbnail';
    const smallThumbnail = 'https://books.google.com/smallThumbnail';

    expect(coverOf({ small, thumbnail, smallThumbnail })).toBe(small);
    expect(coverOf({ thumbnail, smallThumbnail })).toBe(thumbnail);
    expect(coverOf({ smallThumbnail })).toBe(smallThumbnail);
  });
});

describe('readVolume', () => {
  it.each([
    ['null', null],
    ['a string', 'Not found'],
    ['an array', []],
    ['no id', { volumeInfo: { title: 'Titre' } }],
    ['an id that is not a string', { id: 42, volumeInfo: { title: 'Titre' } }],
    ['no volumeInfo', { id: 'vol-test' }],
    ['a volumeInfo that is not an object', { id: 'vol-test', volumeInfo: [] }],
  ])('rejects a response with %s', (_, json) => {
    expect(() => readVolume(json)).toThrow(InvalidGoogleBooksResponseError);
  });
});

describe('search responses', () => {
  it.each([
    ['null', null],
    ['no totalItems', { items: [] }],
    ['a totalItems that is not a number', { totalItems: '5', items: [] }],
    ['items that are not an array', { totalItems: 1, items: { id: 'vol-test' } }],
  ])('rejects a response with %s', (_, json) => {
    expect(() => toSearchResults(json)).toThrow(InvalidGoogleBooksResponseError);
    expect(() => pickVolumeFromSearch(json, ISBN)).toThrow(InvalidGoogleBooksResponseError);
  });

  it('treats a response without items as no result', () => {
    expect(toSearchResults(searchEmpty)).toEqual([]);
    expect(pickVolumeFromSearch(searchEmpty, ISBN)).toBeUndefined();
  });

  it('picks the volume that lists the searched ISBN-13', () => {
    expect(pickVolumeFromSearch(searchResults, ISBN)?.id).toBe('vol-match');
  });

  it('falls back to the first volume when none lists the ISBN-13', () => {
    expect(pickVolumeFromSearch(searchResults, '9782253004226')?.id).toBe('vol-other-edition');
  });

  it('keeps only results with an id, a title and an ISBN-13', () => {
    expect(toSearchResults(searchResults).map((book) => book.googleBooksId)).toEqual([
      'vol-other-edition',
      'vol-match',
    ]);
  });
});
