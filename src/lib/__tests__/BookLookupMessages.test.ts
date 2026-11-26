import { describe, expect, it } from '@jest/globals';

import { GoogleBooksError, type GoogleBooksErrorKind } from '@/data/GoogleBooks';
import {
  bookLookupErrorMessage,
  bookLookupErrorTitle,
  invalidIsbnMessage,
} from '@/lib/BookLookupMessages';
import type { IsbnInvalidReason } from '@/lib/Isbn';

// `satisfies` makes TypeScript fail here if a reason or a kind is added
// without being listed, so "every reason" stays true.
const REASONS = Object.keys({
  empty: true,
  length: true,
  characters: true,
  prefix: true,
  checksum: true,
} satisfies Record<IsbnInvalidReason, true>) as IsbnInvalidReason[];

const KINDS = Object.keys({
  network: true,
  http: true,
  'invalid-response': true,
  'missing-key': true,
} satisfies Record<GoogleBooksErrorKind, true>) as GoogleBooksErrorKind[];

function error(kind: GoogleBooksErrorKind, status?: number): GoogleBooksError {
  return new GoogleBooksError(kind, 'test', status);
}

describe('invalidIsbnMessage', () => {
  it.each(REASONS)('has a message for "%s"', (reason) => {
    expect(invalidIsbnMessage(reason)).not.toBe('');
  });

  it('gives a different message for each reason', () => {
    const messages = REASONS.map(invalidIsbnMessage);
    expect(new Set(messages).size).toBe(REASONS.length);
  });
});

describe('bookLookupErrorTitle', () => {
  it('tells the user there is no connection on a network error', () => {
    expect(bookLookupErrorTitle(error('network'))).toBe('Pas de connexion');
  });

  it.each(KINDS.filter((kind) => kind !== 'network'))('uses a generic title for "%s"', (kind) => {
    expect(bookLookupErrorTitle(error(kind, 500))).toBe('Une erreur est survenue');
  });
});

describe('bookLookupErrorMessage', () => {
  it.each(KINDS)('has a message for "%s"', (kind) => {
    expect(bookLookupErrorMessage(error(kind, 500))).not.toBe('');
  });

  it('names the missing environment variable', () => {
    expect(bookLookupErrorMessage(error('missing-key'))).toContain(
      'EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY',
    );
  });

  it.each([
    [403, 'Clé API refusée'],
    [429, 'Quota Google Books dépassé'],
    [500, '(500)'],
  ])('explains an HTTP %i error', (status, expected) => {
    expect(bookLookupErrorMessage(error('http', status))).toContain(expected);
  });

  it('still answers when the HTTP status is unknown', () => {
    expect(bookLookupErrorMessage(error('http'))).toContain('(inconnue)');
  });
});
