import type { GoogleBooksError, IsbnInvalidReason } from '@/hooks/useBookByIsbn'

const INVALID_ISBN_MESSAGES: Record<IsbnInvalidReason, string> = {
  empty: 'Saisis un ISBN.',
  length: 'ISBN invalide : il faut 10 ou 13 chiffres.',
  characters:
    'ISBN invalide : seuls les chiffres sont acceptés (et X en dernière position d’un ISBN-10).',
  prefix: 'ISBN invalide : un ISBN-13 commence par 978 ou 979.',
  checksum: 'ISBN invalide : la clé de contrôle ne correspond pas, vérifie la saisie.',
}

export function invalidIsbnMessage(reason: IsbnInvalidReason): string {
  return INVALID_ISBN_MESSAGES[reason]
}

export function bookLookupErrorTitle(error: GoogleBooksError): string {
  return error.kind === 'network' ? 'Pas de connexion' : 'Une erreur est survenue'
}

export function bookLookupErrorMessage(error: GoogleBooksError): string {
  switch (error.kind) {
    case 'network':
      return 'Impossible de joindre Google Books. Vérifie ta connexion internet.'
    case 'missing-key':
      return 'Clé API manquante : ajoute EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY dans .env puis relance Expo.'
    case 'http':
      if (error.status === 403) return 'Clé API refusée par Google Books (403).'
      if (error.status === 429) return 'Quota Google Books dépassé (429). Réessaie plus tard.'
      return `Google Books a renvoyé une erreur (${error.status ?? 'inconnue'}).`
    case 'invalid-response':
      return 'Réponse inattendue de Google Books.'
  }
}
