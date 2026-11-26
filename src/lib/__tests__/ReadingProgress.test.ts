import { describe, expect, it } from '@jest/globals';

import { parseCurrentPage, progressRatio } from '@/lib/ReadingProgress';

describe('parseCurrentPage', () => {
  it.each([
    ['empty', ''],
    ['blank', '   '],
    ['non-numeric', 'abc'],
    ['negative', '-5'],
    ['decimal', '12.5'],
    ['mixed', '12 pages'],
  ])('asks for a page number when the text is %s', (_, text) => {
    expect(parseCurrentPage(text, 300)).toEqual({ error: 'Indique un numéro de page.' });
  });

  it('refuses a page above the page count and says how many pages the book has', () => {
    expect(parseCurrentPage('301', 300)).toEqual({ error: 'Ce livre a 300 pages.' });
  });

  it.each([
    ['120', 120],
    [' 120 ', 120],
    ['0', 0],
    ['300', 300],
  ])('accepts "%s" as page %i', (text, page) => {
    expect(parseCurrentPage(text, 300)).toEqual({ page });
  });
});

describe('progressRatio', () => {
  it.each([
    ['no current page', null, 0],
    ['page 0', 0, 0],
    ['a page in progress', 75, 0.25],
    ['the last page', 300, 1],
  ])('returns the share read for %s', (_, currentPage, expected) => {
    expect(progressRatio(currentPage, 300)).toBe(expected);
  });

  it('stays between 0 and 1 when the page is out of range', () => {
    expect(progressRatio(450, 300)).toBe(1);
    expect(progressRatio(-10, 300)).toBe(0);
  });
});
