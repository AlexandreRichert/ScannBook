import { supabase } from '@/data/Supabase';

export type ReadingStats = {
  books: number;
  pages: number;
  /** Read books whose page count Google Books does not know, left out of `pages`. */
  booksWithoutPages: number;
};

/** Books finished during `year`. RLS already limits rows to the signed-in user. */
export async function fetchReadingStats(year: number): Promise<ReadingStats> {
  const { data, error } = await supabase
    .from('books')
    .select('page_count')
    .eq('status', 'read')
    .gte('finished_at', `${year}-01-01`)
    .lte('finished_at', `${year}-12-31`);
  if (error) throw error;

  const stats: ReadingStats = { books: data.length, pages: 0, booksWithoutPages: 0 };
  for (const { page_count } of data) {
    if (page_count === null) stats.booksWithoutPages += 1;
    else stats.pages += page_count;
  }
  return stats;
}