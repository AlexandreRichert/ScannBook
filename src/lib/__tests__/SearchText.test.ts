import { describe, expect, it } from '@jest/globals';

import { normalizeQuery, toNameWords, toWords, withoutIgnoredWords } from '@/lib/SearchText';

describe('toWords', () => {
  it('removes accents and lowercases', () => {
    expect(toWords('Éric-Emmanuel SCHMITT')).toEqual(['eric', 'emmanuel', 'schmitt']);
  });

  it('splits on apostrophes and punctuation', () => {
    expect(toWords("L'Étranger")).toEqual(['l', 'etranger']);
    expect(toWords('Harry Potter : tome 1 !')).toEqual(['harry', 'potter', 'tome', '1']);
  });

  it('returns no words for blank or punctuation-only text', () => {
    expect(toWords('')).toEqual([]);
    expect(toWords(' - : ! ')).toEqual([]);
  });
});

describe('withoutIgnoredWords', () => {
  it('drops French and English articles and keeps the order', () => {
    expect(withoutIgnoredWords(['le', 'petit', 'prince'])).toEqual(['petit', 'prince']);
    expect(withoutIgnoredWords(['the', 'lord', 'of', 'the', 'rings'])).toEqual(['lord', 'of', 'rings']);
  });

  it('keeps name particles, which only matter in author names', () => {
    expect(withoutIgnoredWords(['de', 'balzac'])).toEqual(['de', 'balzac']);
  });
});

describe('normalizeQuery', () => {
  it('removes quotes and colons, which Google reads as operators', () => {
    expect(normalizeQuery(' "The:  Outsider" ')).toBe('the outsider');
  });

  it('gives the same key for the same search typed differently', () => {
    expect(normalizeQuery('  Stephen   KING ')).toBe(normalizeQuery('stephen king'));
  });

  it('keeps accents and apostrophes: Google handles them', () => {
    expect(normalizeQuery("L'Étranger")).toBe("l'étranger");
  });
});

describe('toNameWords', () => {
  it.each([
    ['J. D. Salinger', ['salinger']],
    ['Honoré de Balzac', ['honore', 'balzac']],
    ['Ludwig van Beethoven', ['ludwig', 'beethoven']],
    ['Antoine de Saint-Exupéry', ['antoine', 'saint', 'exupery']],
  ])('keeps the significant words of "%s"', (name, expected) => {
    expect(toNameWords(name)).toEqual(expected);
  });
});
