# ADR-007: Opening the App Without an Account

- **Status**: Accepted
- **Date**: 2026-11-27

## Decision

The app opens on its tabs without asking for an account. A guest can scan a book, type an ISBN, search by title or author and read a book's page. Everything that reads or writes a library needs an account.

- **One flag**: `useAuth` exposes `isSignedIn`, true when a session exists and no password recovery is in progress (ADR-004). Every access rule reads this flag.
- **Routes**: in the root layout, the `(app)` group has no guard, `(auth)` is only reachable while signed out (`Stack.Protected guard={!isSignedIn}`), and `legal` sits outside both. Inside `(app)`, the two screens that only make sense with an account, `shelf/[shelf]` and `edit-name`, are under `Stack.Protected guard={isSignedIn}`.
- **Shared screens**: the four tabs stay visible. Home shows a guest version, Library and Profile show a prompt to sign in, and the book page replaces the shelf picker with a "sign in to keep it" panel.
- **Coming back**: a guest who signs in or signs up from a book page lands back on that book. The ISBN is kept in memory right before the attempt and opened once the sign-in screens are gone (`src/lib/ReturnAfterSignIn.ts`).
- **Nothing is stored for a guest**: no local library, nothing to merge at sign-in. The only thing kept on the device is that the introduction was seen (`useOnboarding`).

## Background

Until PR #90, the root layout sent anyone without a session to the sign-in screen. The scanner, which is the reason to install the app, was behind a form. Yet scanning a book and reading its record uses no personal data: the app calls Google Books directly (ADR-002). Only the shelves belong to a user (ADR-003).

We wanted someone to be able to try the scanner first, and to be asked for an account at the moment they want to keep a book.

## Considerations

- **Account required** (previous version): one guard at the root, nothing else to think about. But the first screen of the app is a form, before the user has seen what the app does.
- **Guest with a local library, merged at sign-in**: a guest could fill shelves right away. It needs a local database, and rules to merge it with an existing account (same book on two shelves, two sets of dates). That is the synchronization work ADR-003 ruled out for the week.
- **Supabase anonymous sign-in**: every guest gets a real user id, so Row Level Security works unchanged and the account can be made permanent later by linking an email. But each install creates a row in `auth.users` that Supabase does not clean up automatically, policies would have to tell anonymous users apart (`is_anonymous` claim), and Supabase strongly recommends a CAPTCHA to prevent abuse. Too much to set up and secure in one day.
- **Read-only guest** (chosen): no data model change and no new Supabase setting. The cost is in the app: each screen has to say what a guest sees.

## Consequences

- A new user reaches the scanner without filling in anything.
- The access rule lives in two places: route guards for whole screens, and an `isSignedIn` branch inside the screens both audiences share. A new screen that reads the library must pick one of the two. Forgetting it shows an empty or broken screen, but leaks nothing: a guest has no session, and Row Level Security returns no rows (ADR-003).
- Google Books requests no longer require an account, so anyone who installs the app draws on the daily quota (ADR-002). The key was already public, so this changes the volume, not the exposure.
- A guest who leaves without signing in keeps nothing, not even the last book scanned.
- The book to come back to is held in memory only. It survives sign-up because email confirmation is off (ADR-003) and a new account gets a session at once. If confirmation is turned back on, the return has to be stored on the device or carried by the confirmation link.
- A password recovery session counts as signed out, so the rule of ADR-004 still holds: the user stays in `(auth)` until the new password is saved.
- The introduction is tracked per device and per account, so a guest who signs in afterwards does not see it twice.
- Guest flows are only covered by a unit test on `ReturnAfterSignIn`. The rest is checked by hand until the end-to-end tests exist (#77).

## Ownership

The development team is responsible for keeping every library screen behind `isSignedIn`, and Row Level Security enabled as the real protection.

## Review

Revisit if guests should be able to keep books before signing up (local list or anonymous accounts), if email confirmation is turned back on, or if guest traffic uses up the Google Books quota.
