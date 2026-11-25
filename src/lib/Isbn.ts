export type IsbnInvalidReason =
  /** Nothing left once separators are removed. */
  | 'empty'
  /** Neither 10 nor 13 characters. */
  | 'length'
  /** Something other than digits, or an `X` anywhere but at the end of an ISBN-10. */
  | 'characters'
  /** An ISBN-13 that does not start with 978 or 979. */
  | 'prefix'
  /** The shape is right but the check digit is wrong. */
  | 'checksum'

export type IsbnParseResult = { ok: true; isbn13: string } | { ok: false; reason: IsbnInvalidReason }

/**
 * Whitespace (including non-breaking spaces) and every dash found in copied
 * ISBNs: hyphen-minus, Unicode hyphens and dashes (U+2010 to U+2015), minus
 * sign (U+2212) and fullwidth hyphen-minus (U+FF0D).
 */
const SEPARATORS = /[\s\-‐-―−－]/g

/** Removes separators and uppercases a trailing `x`. */
function clean(input: string): string {
  return input.replace(SEPARATORS, '').toUpperCase()
}

function isValidIsbn10(isbn10: string): boolean {
  let sum = 0
  for (let i = 0; i < 10; i++) {
    const char = isbn10[i]
    const value = char === 'X' ? 10 : Number(char)
    sum += value * (10 - i)
  }
  return sum % 11 === 0
}

function computeIsbn13CheckDigit(first12: string): number {
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += Number(first12[i]) * (i % 2 === 0 ? 1 : 3)
  }
  return (10 - (sum % 10)) % 10
}

function isValidIsbn13(isbn13: string): boolean {
  return computeIsbn13CheckDigit(isbn13.slice(0, 12)) === Number(isbn13[12])
}

/** Converts a valid ISBN-10 to its ISBN-13 (978 prefix, recomputed check digit). */
export function isbn10ToIsbn13(isbn10: string): string {
  const first12 = `978${isbn10.slice(0, 9)}`
  return `${first12}${computeIsbn13CheckDigit(first12)}`
}

/**
 * Validates an ISBN-10 or ISBN-13 typed or scanned by the user and normalizes
 * it to an ISBN-13. Spaces and dashes are ignored.
 */
export function parseIsbn(input: string): IsbnParseResult {
  const isbn = clean(input)

  if (isbn === '') return { ok: false, reason: 'empty' }

  if (isbn.length === 10) {
    if (!/^\d{9}[\dX]$/.test(isbn)) return { ok: false, reason: 'characters' }
    return isValidIsbn10(isbn) ? { ok: true, isbn13: isbn10ToIsbn13(isbn) } : { ok: false, reason: 'checksum' }
  }

  if (isbn.length === 13) {
    if (!/^\d{13}$/.test(isbn)) return { ok: false, reason: 'characters' }
    if (!/^97[89]/.test(isbn)) return { ok: false, reason: 'prefix' }
    return isValidIsbn13(isbn) ? { ok: true, isbn13: isbn } : { ok: false, reason: 'checksum' }
  }

  return { ok: false, reason: 'length' }
}
