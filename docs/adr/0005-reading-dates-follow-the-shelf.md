# ADR-005: Reading Dates Follow the Shelf

- **Status**: Accepted
- **Date**: 2026-11-26

## Decision

Moving a book to a shelf sets its reading dates automatically, in a single pure function, `datesForShelf` in `src/lib/Shelves.ts`. The user does not type any date in this version.

| Shelf the book lands on | `started_at`            | `finished_at` |
| ----------------------- | ----------------------- | ------------- |
| Wishlist, To read       | cleared                 | cleared       |
| Reading                 | kept, or today if empty | cleared       |
| Read                    | kept                    | today         |
| Abandoned               | kept                    | cleared       |

"Today" is the phone's local calendar day, stored in Postgres `date` columns.

## Background

The README states that a book is always on exactly one shelf and that moving it updates its reading dates automatically. Entering dates by hand is US-12 (#16), a _should_ not planned this week. The database already rejects an end date before the start date (`books_dates_check`).

## Considerations

- **Dates typed by the user on every move**: precise, but adds a step to every move, and US-12 will cover it later.
- **Dates computed by a Postgres trigger**: impossible to bypass, but the logic would be split between SQL and the app, and harder to read and test within the week.
- **Dates computed in the app, in one function**: a single place to read and test, while the database constraint still guards consistency.

We chose the app function.

## Consequences

- A book read over several weeks keeps the day it was started when it moves to Read or Abandoned.
- Moving a book back to Wishlist or To read erases both dates. Re-reading a book loses the previous dates, which is acceptable until there is a reading history.
- A book added straight to Read has an end date but no start date.
- Any other client writing to `books` (SQL Editor, a future web app) must follow the same rules. The database only checks that the end date is not before the start date.

## Review

Revisit with US-12 (#16), where these rules become defaults the user can edit, or if we keep a reading history.