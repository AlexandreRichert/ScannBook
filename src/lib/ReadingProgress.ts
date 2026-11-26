/** `'120'` → 120 when it is a whole page between 0 and `pageCount`, otherwise a French message. */
export function parseCurrentPage(text: string, pageCount: number): { page: number } | { error: string } {
  const trimmed = text.trim();
  if (!/^\d+$/.test(trimmed)) return { error: 'Indique un numéro de page.' };
  const page = Number(trimmed);
  if (page > pageCount) return { error: `Ce livre a ${pageCount} pages.` };
  return { page };
}

/** Share of the book read, between 0 and 1. */
export function progressRatio(currentPage: number | null, pageCount: number): number {
  return Math.min(Math.max((currentPage ?? 0) / pageCount, 0), 1);
}