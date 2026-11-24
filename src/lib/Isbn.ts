export type IsbnParseResult =
  | { ok: true; isbn13: string }
  | { ok: false; reason: 'format' | 'checksum' };

/** Removes spaces and hyphens, and uppercases a trailing `x`. */
function clean(input: string): string {
  return input.replace(/[\s-]/g, '').toUpperCase();
}

function isValidIsbn10(isbn10: string): boolean {
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const char = isbn10[i];
    const value = char === 'X' ? 10 : Number(char);
    sum += value * (10 - i);
  }
  return sum % 11 === 0;
}

function computeIsbn13CheckDigit(first12: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += Number(first12[i]) * (i % 2 === 0 ? 1 : 3);
  }
  return (10 - (sum % 10)) % 10;
}

function isValidIsbn13(isbn13: string): boolean {
  return computeIsbn13CheckDigit(isbn13.slice(0, 12)) === Number(isbn13[12]);
}

/** Converts a valid ISBN-10 to its ISBN-13 (978 prefix, recomputed check digit). */
export function isbn10ToIsbn13(isbn10: string): string {
  const first12 = `978${isbn10.slice(0, 9)}`;
  return `${first12}${computeIsbn13CheckDigit(first12)}`;
}

/**
 * Validates an ISBN-10 or ISBN-13 typed or scanned by the user and normalizes
 * it to an ISBN-13. Spaces and hyphens are accepted.
 *
 * - `format`: not 10 or 13 characters, unexpected characters, or an ISBN-13
 *   that does not start with 978 or 979.
 * - `checksum`: the shape is right but the check digit is wrong.
 */
export function parseIsbn(input: string): IsbnParseResult {
  const isbn = clean(input);

  if (/^\d{9}[\dX]$/.test(isbn)) {
    return isValidIsbn10(isbn)
      ? { ok: true, isbn13: isbn10ToIsbn13(isbn) }
      : { ok: false, reason: 'checksum' };
  }

  if (/^97[89]\d{10}$/.test(isbn)) {
    return isValidIsbn13(isbn) ? { ok: true, isbn13: isbn } : { ok: false, reason: 'checksum' };
  }

  return { ok: false, reason: 'format' };
}
