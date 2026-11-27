# ADR-005: Reading Dates Follow the Shelf

- **Status**: Accepted
- **Date**: 2026-11-26
- **Updated**: 2026-11-27, the dates can now be edited by hand (US-12, PR #59)

## Decision

Moving a book to a shelf sets its reading dates automatically, in a single pure function, `datesForShelf` in `src/lib/Shelves.ts`. These dates are defaults: the user can correct them afterwards on the book screen.

| Shelf the book lands on | `started_at`            | `finished_at` |
| ----------------------- | ----------------------- | ------------- |
| Wishlist, To read       | cleared                 | cleared       |
| Reading                 | kept, or today if empty | cleared       |
| Read                    | kept                    | today         |
| Abandoned               | kept                    | cleared       |

"Today" is the phone's local calendar day, stored in Postgres `date` columns.

### Editing the dates

The book screen (`ShelfCard`) shows the dates that make sense for the shelf: a start date on Reading, Read and Abandoned, and an end date on Read only. Each one opens the platform date picker.

- The picker only offers valid days: a start date no later than the end date (or today), an end date between the start date and today.
- A change is saved right away by `updateReadingDates` in `src/data/Library.ts`.
- A date can be changed, not removed. Only a shelf move clears it.
- Moving the book again applies the table above: an edited start date is kept on Reading, Read and Abandoned, and an edited end date is replaced by today the next time the book lands on Read.

## Background

The README states that a book is always on exactly one shelf and that moving it updates its reading dates automatically. The database already rejects an end date before the start date (`books_dates_check`).

When this ADR was written, entering dates by hand (US-12, #16) was a _should_ we did not expect to reach, so the first version let the user type no date at all. It shipped the same day in PR #59, built on these rules rather than replacing them.

## Considerations

- **Dates typed by the user on every move**: precise, but adds a step to every move, when today is the right answer most of the time.
- **Dates computed by a Postgres trigger**: impossible to bypass, but the logic would be split between SQL and the app, and harder to read and test within the week.
- **Dates computed in the app, in one function**: a single place to read and test, while the database constraint still guards consistency.

We chose the app function, and added editing on top of it for the cases where today is wrong: a book finished last week, or started before the app was installed.

## Consequences

- A book read over several weeks keeps the day it was started when it moves to Read or Abandoned.
- Moving a book back to Wishlist or To read erases both dates, including dates the user typed. Re-reading a book loses the previous dates, which is acceptable until there is a reading history.
- A book added straight to Read has an end date but no start date, until the user sets one.
- The valid range is enforced twice: by the picker's bounds in the app, and by `books_dates_check` in the database. The database does not know about "not after today", so that rule only holds in the app.
- Any other client writing to `books` (SQL Editor, a future web app) must follow the same rules. The database only checks that the end date is not before the start date.

## Ownership

The development team is responsible for `datesForShelf`, its tests and the date constraint in `supabase/schema.sql`.

## Review

Revisit if we keep a reading history, since a second reading would need its own pair of dates instead of overwriting the first.
