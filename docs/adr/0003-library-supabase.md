# ADR-003: Storing the Library in Supabase

- **Status**: Accepted
- **Date**: 2026-11-25

## Decision

We will use [Supabase](https://supabase.com/) for user accounts and for storing each user's library:

- **Auth**: email and password sign-in. _Confirm email_ is turned off so that a new account can sign in right away during development and the demo. An account is only needed for the library: scanning, search and book pages are open to guests (see ADR-007).
- **Storage**: a Postgres table `books`, where every row belongs to one user (`user_id`). Its schema and security rules are versioned in `supabase/schema.sql`.
- **Security**: Row Level Security is enabled on `books`, with four policies (read, add, update, delete) that only allow a user to touch their own rows.
- **Client**: a single client in `src/data/Supabase.ts`, created with the public anon (publishable) key. The session is persisted with AsyncStorage, so the user stays signed in between launches. AsyncStorage was kept over `expo-sqlite/localStorage` (Expo's current recommendation) because it is bundled in Expo Go and needs no config plugin; switching later only changes the `storage` option.

## Background

Every user must find their shelves in their own space, from any phone. We need a service for authentication and storage, and a table where each book belongs to a user. The project lasts one week, so the setup must be quick and require no server of our own.

## Considerations

We evaluated four approaches:

- **Local SQLite** (`expo-sqlite`): Simple, fast and works offline. But there are no accounts, and the library is lost when the user changes phones or reinstalls the app. It does not meet the "any phone" requirement.
- **SQLite with synchronization** (local database synced to a backend): Works offline and on several phones. But sync, conflict resolution and a backend to sync with are far too much work for one week, and offline mode is out of scope.
- **Firebase** (Auth + Firestore): Comparable features, a generous free tier, and a JavaScript SDK that also works in Expo Go. But data rules (one copy of a book per reader, end date after start date, progress within the page count) would be written in Firestore's own rules language, and the data lives in a proprietary store that is hard to move elsewhere.
- **Supabase** (Auth + Postgres): Auth included, and a standard Postgres database. Our rules are plain SQL constraints and RLS policies that the database enforces whatever client writes to it, and the data can be exported with standard Postgres tools if we ever leave Supabase.

Supabase covers accounts and multi-device storage with the least work, and keeps the schema and its security in a single SQL file we can review in pull requests.

## Consequences

- The app needs no backend of its own: it talks to Supabase directly.
- The anon key is embedded in the app bundle, so it is public by design. Data protection relies entirely on Row Level Security, which must stay enabled on every table we add.
- New tables are no longer exposed to the API automatically. Every table we add needs explicit grants to `authenticated` in `supabase/schema.sql`, in addition to RLS and its policies.
- The `service_role` (or secret) key bypasses RLS. It is never used in the app nor stored in `.env`.
- The app needs a network connection to read or change the library. There is no offline mode, which was already out of scope.
- Turning off email confirmation means anyone can create an account with an address they do not own. This is acceptable for a course project, and can be turned back on before a real release.
- On the free tier, a project is paused after about a week of inactivity. It must be checked before the demo.
- The schema is applied by hand in the SQL Editor. If it changes often, we will move to Supabase CLI migrations.

## Ownership

The development team is responsible for the Supabase project, the schema and its RLS policies, and for keeping the keys out of git.

## Review

This decision will be revisited if we need offline mode, if the free tier limits become a problem, or if the data model outgrows a single table.
