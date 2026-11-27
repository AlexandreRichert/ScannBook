# ADR-006: Ranking Search Results Locally from a Single Request

- **Status**: Accepted
- **Date**: 2026-11-26

## Decision

A title or author search sends **one** Google Books request and ranks the results in the app:

```
GET /volumes?q=<text>&maxResults=40&orderBy=relevance&printType=books
```

- **ISBN**: if the text is a valid ISBN (`parseIsbn`), the existing ISBN lookup is used instead, which gives 0 or 1 result.
- **Candidates**: we ask for 40 (the API maximum, same cost as 20) because volumes without an ISBN-13 are dropped: the book screen opens by ISBN-13. At most 20 results are shown.
- **Score** (`src/lib/SearchRanking.ts`): each book gets points, and the highest score comes first. Equal scores keep Google's order. Duplicates (same ISBN-13) are removed.
- **Cache** (`src/lib/LruCache.ts`): the last 30 searches are kept in memory for 10 minutes, keyed by the normalized text. Errors are not cached.

All the values (points, ignored words, limits, cache) live in **`src/constants/Search.ts`**. Tuning the ranking means changing a value there. Adding a criterion means adding a weight there and its rule in `CRITERIA` (`SearchRanking.ts`). TypeScript refuses to compile if a weight has no rule.

### Scoring

Words are compared without accents or case, ignoring articles (le, la, les, l', un, une, des, the, a, an). Author names also ignore particles (de, du, d', von, van, of…) and initials, so "de" in a title never matches "Guy de Maupassant". Quotes and colons are removed from the query, since Google reads them as operators. The author is matched first, then the words left over are matched against the title, so a query can mix both: "the outsider stephen king".

| Criterion | Points | Applies when |
|---|---|---|
| Exact author | 100 | every word of an author's name is in the query |
| Partial author | 60 | otherwise, at least one word of the author's name is in the query |
| Exact title | 90 | the title has exactly the words left over |
| Title contains the terms | 50 | otherwise, every word left over is in the title or subtitle |
| Author and title | +60 | both the author and the title match |

A book keeps its best score among its authors.

## Background

Issue #63. The first version (PR #57) sent two requests, `inauthor:` and `intitle:`, with every word required in the same field. A query mixing author and title found nothing useful: "stephen king the outsider" returned 0 results by author and 2 summaries by title, while plain free text returns *The Outsider* first.

## Considerations

Tested on real Google Books responses for "stephen king the outsider", "the outsider", "stephen king", "camus", "petit prince" and "l'étranger":

- **Two requests, `inauthor:` + `intitle:`** (previous version): good for pure author or title queries, fails on mixed queries. 2 requests per search.
- **`inauthor:` + free text**: fixes mixed queries, but title queries get worse ("the outsider" lost King's book from the top 5). 2 requests.
- **Free text only when the list has fewer than 20 results**: triggered on 4 of the 6 queries, because the ISBN-13 filter often leaves fewer than 20. 2 or 3 requests, the third one sent after the first two.
- **Three requests in parallel** (author, title, free text): good everywhere, but 3 requests per search.
- **One free-text request ranked in the app** (chosen): handles every kind of query, does not depend on Google's order, and costs 1 request.

## Consequences

- A search costs **1 request** instead of 2 against the 1,000 per day of ADR-002, and a repeated search costs nothing while it is cached.
- Results observed on the test queries:

  | Query | First result | Score |
  |---|---|---|
  | the outsider stephen king | *The Outsider*, Stephen King | 250 |
  | king the outsider | *The Outsider*, Stephen King | 210 |
  | stephen king | a book by Stephen King | 100 |
  | petit prince | *Le Petit Prince*, Saint-Exupéry | 90 |
  | l'étranger | *L'étranger*, Albert Camus | 90 |
  | camus | *Camus*, a biography by David Sherman | 90 |

- **Known limit**: a query that is only part of an author's name ("camus") gives that author 60 points, less than a book titled exactly with that word (90). Biographies titled *Camus* come before Camus's own books. "albert camus" does not have this problem.
- We only rank what Google returns in its first 40 results. A book missing from them cannot be found.
- Books without an ISBN-13 can never be found by search.
- The cache lives in memory only and empties when the app restarts.

## Ownership

The development team is responsible for the weights in `src/constants/Search.ts`, the ranking rules and their tests.

## Review

Revisit the weights if testers report a wrong first result. Ideas left aside: detecting an author search from the results (to fix "camus"), grouping editions of the same book, and paginating beyond 20 results.
