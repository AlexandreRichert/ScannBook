/** Points per criterion of the search ranking (ADR-006). Tune here only. */
export const SEARCH_SCORE = {
  authorExact: 100,
  authorPartial: 60,
  titleExact: 90,
  titleContains: 50,
  authorAndTitleBonus: 60,
} as const;

export type SearchScoreCriterion = keyof typeof SEARCH_SCORE;

/** Ignored when comparing: « Le Petit Prince » matches « petit prince ». */
export const SEARCH_IGNORED_WORDS: readonly string[] = ['le', 'la', 'les', 'l', 'un', 'une', 'des', 'the', 'a', 'an'];

/**
 * Ignored in author names, with initials: « de » in a title must not match
 * « Guy de Maupassant », nor « d » match « J. D. Salinger ».
 */
export const SEARCH_NAME_PARTICLES: readonly string[] = [
  'de', 'du', 'd', 'del', 'della', 'da', 'di', 'von', 'van', 'der', 'den', 'of',
];

/** Results shown. */
export const SEARCH_RESULTS_LIMIT = 20;
/** Results requested: the API maximum, since volumes without an ISBN-13 get filtered out. */
export const SEARCH_FETCH_SIZE = 40;

export const SEARCH_CACHE_SIZE = 30;
export const SEARCH_CACHE_TTL_MS = 10 * 60 * 1000;
