import { SEARCH_IGNORED_WORDS, SEARCH_NAME_PARTICLES } from '@/constants/Search';

/** "L'Étranger" → ["l", "etranger"] */
export function toWords(text: string): string[] {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

/** ["le", "petit", "prince"] → ["petit", "prince"] */
export function withoutIgnoredWords(words: string[]): string[] {
  return words.filter((word) => !SEARCH_IGNORED_WORDS.includes(word));
}

/**
 * ` "The:  Outsider" ` → "the outsider": the same search typed twice gives the
 * same key. Quotes and colons are removed, since Google reads them as operators.
 */
export function normalizeQuery(query: string): string {
  return query.replace(/[":]/g, ' ').trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Significant words of a person's name: "J. D. Salinger" → ["salinger"],
 * "Honoré de Balzac" → ["honore", "balzac"]. Initials and particles are dropped.
 */
export function toNameWords(name: string): string[] {
  return withoutIgnoredWords(toWords(name)).filter(
    (word) => word.length > 1 && !SEARCH_NAME_PARTICLES.includes(word),
  );
}
