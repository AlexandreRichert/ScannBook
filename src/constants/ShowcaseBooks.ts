/**
 * Well-known books shown as decoration on the home tabs. Their covers are the
 * ones Google Books serves for these volumes, looked up once through the API:
 * a fixed list costs no API call at run time and never shows an odd title, which
 * a live search does.
 */
export type ShowcaseBook = { isbn13: string; title: string; coverUrl: string };

const cover = (volumeId: string) =>
  `https://books.google.com/books/content?id=${volumeId}&printsec=frontcover&img=1&zoom=1&source=gbs_api`;

export const SHOWCASE_BOOKS: readonly ShowcaseBook[] = [
  { isbn13: '9782070584628', title: 'Harry Potter à l’école des sorciers', coverUrl: cover('hH87swEACAAJ') },
  { isbn13: '9782070612758', title: 'Le Petit Prince', coverUrl: cover('NFWzngEACAAJ') },
  { isbn13: '9782266260770', title: 'Hunger Games', coverUrl: cover('kCIAswEACAAJ') },
  { isbn13: '9782226257017', title: 'Sapiens', coverUrl: cover('VAxFjgEACAAJ') },
  { isbn13: '9782253070443', title: 'Petit pays', coverUrl: cover('dxlftAEACAAJ') },
  { isbn13: '9782070360024', title: 'L’Étranger', coverUrl: cover('o1goAQAAIAAJ') },
  { isbn13: '9782290004449', title: 'L’Alchimiste', coverUrl: cover('e_-JGAAACAAJ') },
  { isbn13: '9782290019436', title: 'Le Trône de fer', coverUrl: cover('xxAX0gEACAAJ') },
  { isbn13: '9782070413119', title: 'Madame Bovary', coverUrl: cover('bzdlAAAAMAAJ') },
  { isbn13: '9782072878497', title: '1984', coverUrl: cover('xaWRzQEACAAJ') },
  { isbn13: '9782253004226', title: 'Germinal', coverUrl: cover('bxddAAAAMAAJ') },
  { isbn13: '9782253096337', title: 'Les Misérables', coverUrl: cover('ilaOjwEACAAJ') },
];
