import type { Href } from 'expo-router';

// Set right before a sign-in attempt and read once the session exists. A module
// variable rather than a route param read after the fact: the sign-in screen is
// already unmounting when the session arrives.
let pendingIsbn: string | null = null;

/** Remembers the book the guest was on, so signing in lands back on it. */
export function armReturnToBook(isbn13: string | undefined) {
  pendingIsbn = isbn13 && /^\d{13}$/.test(isbn13) ? isbn13 : null;
}

export function disarmReturnToBook() {
  pendingIsbn = null;
}

/** The book screen to go back to, once: a second call returns null. */
export function takeReturnToBook(): Href | null {
  const isbn13 = pendingIsbn;
  pendingIsbn = null;
  return isbn13 ? `/book/${isbn13}` : null;
}
