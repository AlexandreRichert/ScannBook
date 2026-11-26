import { describe, expect, it } from '@jest/globals';

import { isbn10ToIsbn13, parseIsbn } from '@/lib/Isbn';

describe('parseIsbn', () => {
  describe('valid ISBN-13', () => {
    it.each([
      ['978 prefix', '9780306406157'],
      ['979 prefix', '9791090636071'],
    ])('accepts an ISBN-13 with a %s', (_, isbn) => {
      expect(parseIsbn(isbn)).toEqual({ ok: true, isbn13: isbn });
    });
  });

  describe('valid ISBN-10', () => {
    it('converts it to an ISBN-13', () => {
      expect(parseIsbn('0306406152')).toEqual({ ok: true, isbn13: '9780306406157' });
    });

    it.each(['080442957X', '080442957x'])('accepts a trailing check digit X (%s)', (isbn) => {
      expect(parseIsbn(isbn)).toEqual({ ok: true, isbn13: '9780804429573' });
    });
  });

  describe('separators', () => {
    it.each([
      ['hyphens', '978-0-306-40615-7'],
      ['spaces', ' 978 0 306 40615 7 '],
      ['non-breaking spaces', '978 0306 40615 7'],
      ['Unicode hyphens', '978‐0‐306‐40615‐7'],
      ['minus signs', '978−0−306−40615−7'],
    ])('ignores %s', (_, isbn) => {
      expect(parseIsbn(isbn)).toEqual({ ok: true, isbn13: '9780306406157' });
    });

    it('ignores separators in an ISBN-10', () => {
      expect(parseIsbn('0-306-40615-2')).toEqual({ ok: true, isbn13: '9780306406157' });
    });
  });

  describe('invalid input', () => {
    it.each([
      ['empty', ''],
      ['empty', '   '],
      ['empty', ' - - '],
      ['length', '12345'],
      ['length', '978030640615'],
      ['length', '97803064061570'],
      ['characters', '03064A6152'],
      ['characters', '08044X9572'],
      ['characters', '978030640615A'],
      ['characters', '978030640615X'],
      ['prefix', '1234567890128'],
      ['checksum', '0306406153'],
      ['checksum', '9780306406158'],
    ])('returns "%s" for "%s"', (reason, isbn) => {
      expect(parseIsbn(isbn)).toEqual({ ok: false, reason });
    });
  });
});

describe('isbn10ToIsbn13', () => {
  it('adds the 978 prefix and recomputes the check digit', () => {
    expect(isbn10ToIsbn13('0306406152')).toBe('9780306406157');
  });

  it('drops a check digit X', () => {
    expect(isbn10ToIsbn13('080442957X')).toBe('9780804429573');
  });
});
