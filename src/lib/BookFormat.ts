export function authorsLabel(authors: string[]): string {
  return authors.length > 0 ? authors.join(', ') : 'Auteur inconnu';
}

/** "2014-10-01" → "2014" */
export function publicationYear(publishedDate?: string): string | undefined {
  return publishedDate?.slice(0, 4);
}

/** Joins the parts that are set with " · ". */
export function joinDetails(...parts: (string | undefined)[]): string {
  return parts.filter(Boolean).join(' · ');
}
