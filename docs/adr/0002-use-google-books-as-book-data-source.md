# ADR-002: Using Google Books as the Book Data Source

- **Status**: Proposed
- **Date**: 2026-11-24

## Decision

We will use the Google Books API (`https://www.googleapis.com/books/v1`) to retrieve book information from an ISBN. The app calls it directly, with an API key stored in `EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY`.

A lookup takes two requests:

1. `GET /volumes?q=isbn:<isbn13>` finds the volume, or tells us the book is unknown (`totalItems: 0`).
2. `GET /volumes/<id>` returns the full record.

The response is validated by an adapter (`src/data/GoogleBooksAdapter.ts`) and mapped to the shared `BookInfo` type (`src/types/Book.ts`). The rest of the app never sees the raw Google Books format.

## Background

The whole app relies on turning a scanned ISBN into a title, authors and cover. Our books are mostly French editions, so the source must cover them well.

## Considerations

We evaluated three sources:

- **Google Books**: Free with a key (1,000 requests per day by default), good coverage of French editions, a single JSON API.
- **Open Library**: Free, no key, open data. Weaker coverage of recent French editions. Its cover service had no cover for our test book either (`covers.openlibrary.org/b/isbn/9782253249603-M.jpg` returns 404).
- **ISBNdb**: Large catalog and reliable covers, but paid only (subscription, no free tier). That is too expensive for the project at this stage.

### Test results on books we own

| ISBN                                                            | Search `?q=isbn:`                                                  | Volume `/volumes/{id}`                                              | Cover (Google / Open Library) |
| --------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------- | ----------------------------- |
| 9782253249603 (_Les nuits de la peur bleue_, Le Livre de Poche) | Title, authors, date. No publisher, no description, `pageCount: 0` | Adds publisher, description, `pageCount: 448`, accented author name | None / None                   |
| _TODO_                                                          |                                                                    |                                                                     |                               |
| _TODO_                                                          |                                                                    |                                                                     |                               |

What we learned:

- The search result is a partial record. The volume endpoint is needed for the publisher, the description and the page count, which is why a lookup makes two requests.
- Covers are not guaranteed for French paperbacks, on Google Books or on Open Library. The app must always be able to show a placeholder.
- `pageCount` is `0` when unknown and must be treated as missing.
- `description` can contain HTML, which the adapter strips.

### API key management

Every `EXPO_PUBLIC_` variable is inlined in the JavaScript bundle, so the key is public: anyone can extract it from the app. It cannot be hidden, only limited:

- **API restriction**: the key only works for the Books API.
- **Quota cap**: the daily request quota is lowered, so a leaked key cannot be used beyond that limit.
- **No application restriction**: Android and iOS app restrictions rely on headers that only Google SDKs send, not a plain `fetch`, and they can be spoofed. A website restriction would block the app.
- The key stays out of git (`.env` is ignored, `.env.example` documents the variable). EAS builds will get it from EAS environment variables.

## Consequences

- No backend is needed to look books up.
- Each lookup costs two requests: about 500 lookups per day with the default quota.
- Only the title, the authors and the ISBN are guaranteed in `BookInfo`. Every screen must handle a missing cover, page count, publisher or description.
- The key is public. If abuse becomes a problem, calls can move behind a server-side proxy (for example a Supabase Edge Function) without changing the screens, since they only depend on `BookInfo`.
- Changing source later only means writing a new client and adapter that produce `BookInfo`.

## Ownership

The development team is responsible for the Google Books client, the adapter and the key restrictions in the Google Cloud Console.

## Review

This decision will be revisited if Google Books misses too many of our books or covers, if the quota becomes a limit, or if the key is abused.
