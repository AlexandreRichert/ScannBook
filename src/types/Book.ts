/**
 * Book information as used across the app, independent of the data source.
 *
 * Only `isbn13`, `title` and `authors` are guaranteed. Every other field is
 * optional: Google Books often has no cover, page count or description for
 * recent French editions (see docs/adr/0002-use-google-books-as-book-data-source.md).
 */
export type BookInfo = {
  /** Normalized ISBN-13, digits only. */
  isbn13: string;
  title: string;
  subtitle?: string;
  /** May be empty when the source does not list any author. */
  authors: string[];
  publisher?: string;
  /** As given by the source: `YYYY`, `YYYY-MM` or `YYYY-MM-DD`. */
  publishedDate?: string;
  /** Undefined when unknown (Google Books returns `0` in that case). */
  pageCount?: number;
  /** Plain text, HTML already stripped. */
  description?: string;
  /** HTTPS URL. */
  coverUrl?: string;
  /** ISO 639-1 code, e.g. `fr`. */
  language?: string;
  /** Google Books volume id, kept to link back to the source. */
  googleBooksId: string;
};
