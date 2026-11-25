import {
  InvalidGoogleBooksResponseError,
  mergeBookInfo,
  pickVolumeFromSearch,
  readVolume,
  toBookInfo,
} from '@/data/GoogleBooksAdapter'
import type { BookInfo } from '@/types/Book'

const BASE_URL = 'https://www.googleapis.com/books/v1'
const TIMEOUT_MS = 10_000

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY

export type GoogleBooksErrorKind =
  /** No connection, DNS failure, timeout. Retrying may work. */
  | 'network'
  /** The API answered with an error status (403 key refused, 429 quota...). */
  | 'http'
  /** The API answered 200 with an unexpected body. */
  | 'invalid-response'
  /** `EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY` is not set. */
  | 'missing-key'

export class GoogleBooksError extends Error {
  readonly kind: GoogleBooksErrorKind
  readonly status?: number

  constructor(kind: GoogleBooksErrorKind, message: string, status?: number) {
    super(message)
    this.name = 'GoogleBooksError'
    this.kind = kind
    this.status = status
  }
}

export type BookLookupResult = { status: 'found'; book: BookInfo } | { status: 'not-found' }

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

/** GET + JSON, with a timeout, mapping every failure to a `GoogleBooksError`. */
async function getJson(path: string, signal?: AbortSignal): Promise<unknown> {
  if (!API_KEY) {
    throw new GoogleBooksError('missing-key', 'EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY is not set')
  }

  const separator = path.includes('?') ? '&' : '?'
  const url = `${BASE_URL}${path}${separator}key=${encodeURIComponent(API_KEY)}`

  const controller = new AbortController()
  let timedOut = false
  const timeout = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, TIMEOUT_MS)
  const forwardAbort = () => controller.abort()
  signal?.addEventListener('abort', forwardAbort)

  try {
    let response: Response
    try {
      response = await fetch(url, { signal: controller.signal })
    } catch (error) {
      // Aborted by the caller: let the AbortError through so it can be ignored.
      if (isAbortError(error) && !timedOut) throw error
      throw new GoogleBooksError('network', timedOut ? 'Request timed out' : String(error))
    }

    if (!response.ok) {
      throw new GoogleBooksError('http', `Google Books answered ${response.status}`, response.status)
    }

    try {
      return await response.json()
    } catch {
      throw new GoogleBooksError('invalid-response', 'Response body is not JSON')
    }
  } finally {
    clearTimeout(timeout)
    signal?.removeEventListener('abort', forwardAbort)
  }
}

function toGoogleBooksError(error: unknown): unknown {
  return error instanceof InvalidGoogleBooksResponseError
    ? new GoogleBooksError('invalid-response', error.message)
    : error
}

/**
 * Looks a book up by its normalized ISBN-13 (see `parseIsbn`).
 *
 * Two requests: the ISBN search finds the volume, then the volume endpoint
 * returns the full record.
 * Throws a `GoogleBooksError`, or an `AbortError` when `signal` is aborted.
 */
export async function fetchBookByIsbn(isbn13: string, signal?: AbortSignal): Promise<BookLookupResult> {
  try {
    const search = await getJson(`/volumes?q=isbn:${isbn13}`, signal)
    const found = pickVolumeFromSearch(search, isbn13)
    const fromSearch = found && toBookInfo(found, isbn13)
    if (!found || !fromSearch) return { status: 'not-found' }

    try {
      const detail = readVolume(await getJson(`/volumes/${encodeURIComponent(found.id)}`, signal))
      const fromDetail = toBookInfo(detail, isbn13)
      return { status: 'found', book: fromDetail ? mergeBookInfo(fromDetail, fromSearch) : fromSearch }
    } catch (error) {
      if (isAbortError(error)) throw error
      return { status: 'found', book: fromSearch }
    }
  } catch (error) {
    throw toGoogleBooksError(error)
  }
}
