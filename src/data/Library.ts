import { supabase } from '@/data/Supabase';
import { datesForShelf, type Shelf } from '@/lib/Shelves';
import type { BookInfo } from '@/types/Book';

export type LibraryEntry = {
  id: string;
  status: Shelf;
  started_at: string | null;
  finished_at: string | null;
};

const ENTRY_COLUMNS = 'id, status, started_at, finished_at';

// Postgres unique_violation, raised by books_user_isbn_unique
const DUPLICATE_BOOK = '23505';

/** The current user's copy of this book, or null. RLS already limits rows to the signed-in user. */
export async function fetchLibraryEntry(isbn13: string): Promise<LibraryEntry | null> {
  const { data, error } = await supabase.from('books').select(ENTRY_COLUMNS).eq('isbn13', isbn13).maybeSingle();
  if (error) throw error;
  return data;
}

export type LibraryBook = {
  id: string;
  isbn13: string;
  title: string;
  authors: string[];
  cover_url: string | null;
  status: Shelf;
};

/** Every book of the current user, most recently added first. */
export async function fetchLibrary(): Promise<LibraryBook[]> {
  const { data, error } = await supabase
    .from('books')
    .select('id, isbn13, title, authors, cover_url, status')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}


export async function addToLibrary(book: BookInfo, shelf: Shelf): Promise<LibraryEntry> {
  const { data, error } = await supabase
    .from('books')
    .insert({
      isbn13: book.isbn13,
      title: book.title,
      subtitle: book.subtitle ?? null,
      authors: book.authors,
      publisher: book.publisher ?? null,
      published_date: book.publishedDate ?? null,
      page_count: book.pageCount ?? null,
      description: book.description ?? null,
      cover_url: book.coverUrl ?? null,
      language: book.language ?? null,
      google_books_id: book.googleBooksId,
      status: shelf,
      ...datesForShelf(shelf),
    })
    .select(ENTRY_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}

export async function moveToShelf(entry: LibraryEntry, shelf: Shelf): Promise<LibraryEntry> {
  const { data, error } = await supabase
    .from('books')
    .update({ status: shelf, ...datesForShelf(shelf, entry) })
    .eq('id', entry.id)
    .select(ENTRY_COLUMNS)
    .single();
  if (error) throw error;
  return data;
}

export async function removeFromLibrary(id: string): Promise<void> {
  const { error } = await supabase.from('books').delete().eq('id', id);
  if (error) throw error;
}

export function libraryErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
  if (code === DUPLICATE_BOOK) return 'Ce livre est déjà dans ta bibliothèque.';
  return 'Impossible d’enregistrer. Vérifie ta connexion et réessaie.';
}