import type { BookInfo } from '@/types/Book'

/**
 * Nothing from the network is trusted: every field is checked before use, and
 * a missing or malformed optional field is dropped instead of failing the
 * whole book.
 */

export class InvalidGoogleBooksResponseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidGoogleBooksResponseError'
  }
}

type UnknownRecord = Record<string, unknown>

/** A volume as returned by the API, with `volumeInfo` not yet validated. */
export type RawVolume = { id: string; volumeInfo: UnknownRecord }

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(record: UnknownRecord, key: string): string | undefined {
  const value = record[key]
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

function readPositiveInteger(record: UnknownRecord, key: string): number | undefined {
  const value = record[key]
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : undefined
}

function readStringArray(record: UnknownRecord, key: string): string[] {
  const value = record[key]
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item !== '')
}

function readRawVolume(value: unknown): RawVolume | undefined {
  if (!isRecord(value)) return undefined
  const id = readString(value, 'id')
  const volumeInfo = value.volumeInfo
  if (id === undefined || !isRecord(volumeInfo)) return undefined
  return { id, volumeInfo }
}

/** ISBN-13 identifiers listed on a volume. */
function readIsbn13s(volumeInfo: UnknownRecord): string[] {
  const identifiers = volumeInfo.industryIdentifiers
  if (!Array.isArray(identifiers)) return []
  return identifiers.flatMap((identifier) => {
    if (!isRecord(identifier) || identifier.type !== 'ISBN_13') return []
    const value = readString(identifier, 'identifier')
    return value === undefined ? [] : [value]
  })
}

/** The volumes of a `GET /volumes?q=...` response; `[]` when nothing was found. */
function readSearchVolumes(json: unknown): RawVolume[] {
  if (!isRecord(json) || typeof json.totalItems !== 'number') {
    throw new InvalidGoogleBooksResponseError('Search response has no totalItems')
  }

  const items = json.items
  if (items === undefined) return []
  if (!Array.isArray(items)) {
    throw new InvalidGoogleBooksResponseError('Search response items is not an array')
  }
  return items.map(readRawVolume).filter((volume) => volume !== undefined)
}

/**
 * Reads a `GET /volumes?q=isbn:...` response and returns the volume that
 * matches `isbn13`, or `undefined` when nothing was found.
 *
 * When several volumes come back, the one listing this exact ISBN-13 wins;
 * otherwise the first one is used.
 */
export function pickVolumeFromSearch(json: unknown, isbn13: string): RawVolume | undefined {
  const volumes = readSearchVolumes(json)
  return volumes.find((volume) => readIsbn13s(volume.volumeInfo).includes(isbn13)) ?? volumes[0]
}

/** Search results the book screen can open: with a title and an ISBN-13. */
export function toSearchResults(json: unknown): BookInfo[] {
  return readSearchVolumes(json).flatMap((volume) => {
    const isbn13 = readIsbn13s(volume.volumeInfo)[0]
    const book = isbn13 === undefined ? undefined : toBookInfo(volume, isbn13)
    return book ? [book] : []
  })
}

/** Reads a `GET /volumes/{id}` response. */
export function readVolume(json: unknown): RawVolume {
  const volume = readRawVolume(json)
  if (volume === undefined) {
    throw new InvalidGoogleBooksResponseError('Volume response has no id or volumeInfo')
  }
  return volume
}

const HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

/** Google Books descriptions sometimes contain `<p>`, `<br>`, `<b>`... */
function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&(#\d+|[a-z]+);/gi, (match, entity: string) => {
      if (entity.startsWith('#')) return String.fromCharCode(Number(entity.slice(1)))
      return HTML_ENTITIES[entity.toLowerCase()] ?? match
    })
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Removes a trailing source note such as "[Source 4e couv.]". */
function stripSourceNote(text: string): string {
  return text.replace(/\s*\[\s*source\b[^\]]*\]\s*$/i, '').trim()
}

function readDescription(volumeInfo: UnknownRecord): string | undefined {
  const description = readString(volumeInfo, 'description')
  if (description === undefined) return undefined
  return stripSourceNote(htmlToText(description)) || undefined
}

/**
 * Keeps only the date part: `YYYY`, `YYYY-MM` or `YYYY-MM-DD`. Google Books
 * also sends full timestamps such as `2025-11-05T00:00:00+01:00`.
 */
function readPublishedDate(volumeInfo: UnknownRecord): string | undefined {
  return readString(volumeInfo, 'publishedDate')?.match(/^\d{4}(-\d{2}(-\d{2})?)?/)?.[0]
}

/**
 * Prefers `small` (about 300 px wide, only on the volume endpoint) over
 * `thumbnail` (about 128 px, blurry on high-density screens). Forces HTTPS
 * and removes the curled-page effect.
 */
function readCoverUrl(volumeInfo: UnknownRecord): string | undefined {
  const imageLinks = volumeInfo.imageLinks
  if (!isRecord(imageLinks)) return undefined
  const url =
    readString(imageLinks, 'small') ??
    readString(imageLinks, 'thumbnail') ??
    readString(imageLinks, 'smallThumbnail')
  return url?.replace(/^http:\/\//, 'https://').replace(/&edge=curl/, '')
}

/** Returns `undefined` when the volume has no title: it is not usable. */
export function toBookInfo(volume: RawVolume, isbn13: string): BookInfo | undefined {
  const info = volume.volumeInfo
  const title = readString(info, 'title')
  if (title === undefined) return undefined

  return {
    isbn13,
    title,
    subtitle: readString(info, 'subtitle'),
    authors: readStringArray(info, 'authors'),
    publisher: readString(info, 'publisher'),
    publishedDate: readPublishedDate(info),
    // The printed count matches the physical book; `pageCount` can be the ebook's.
    pageCount: readPositiveInteger(info, 'printedPageCount') ?? readPositiveInteger(info, 'pageCount'),
    description: readDescription(info),
    coverUrl: readCoverUrl(info),
    language: readString(info, 'language'),
    googleBooksId: volume.id,
  }
}

/**
 * Fills the gaps of `primary` (the detailed volume) with `fallback` (the search
 * result). The detailed volume is richer, but the search result sometimes has
 * a cover the detailed one lacks, or a more precise date (`2014-10-01` instead
 * of `2014`).
 */
export function mergeBookInfo(primary: BookInfo, fallback: BookInfo): BookInfo {
  const merged: BookInfo = { ...fallback }
  for (const key of Object.keys(primary) as (keyof BookInfo)[]) {
    if (primary[key] !== undefined) {
      Object.assign(merged, { [key]: primary[key] })
    }
  }
  if (primary.authors.length === 0) merged.authors = fallback.authors

  // Same date, just more precise: keep the precise one.
  if (
    primary.publishedDate !== undefined &&
    fallback.publishedDate !== undefined &&
    fallback.publishedDate.length > primary.publishedDate.length &&
    fallback.publishedDate.startsWith(primary.publishedDate)
  ) {
    merged.publishedDate = fallback.publishedDate
  }
  return merged
}
