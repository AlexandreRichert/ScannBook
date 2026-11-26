/**
 * Colors of the book screen mockups (Figma « Maquettes — Pile à lire »,
 * frames 07, 12, 13 and 14).
 *
 * Local to the book screen for now: they will move into the global theme
 * (`Colors` in theme.ts) on a dedicated branch. Light only, like the mockups.
 */
export const BookScreenColors = {
  background: '#FAF7F2',
  surface: '#FFFFFF',
  border: '#E7E2DA',
  text: '#1C1917',
  textSecondary: '#57534E',
  textTertiary: '#78716C',
  textMuted: '#A8A29E',
  primary: '#1F4E46',
  onPrimary: '#FFFFFF',
  coverPlaceholder: '#F3EEE3',
  coverShadow: 'rgba(0, 0, 0, 0.1)',
  skeleton: '#EAE5DD',
  neutralIllustration: '#EFEBE4',
  errorIllustration: '#FEF3F2',
  error: '#B42318',
  /** Search best result card (« Maquettes v2 », frame 06). */
  highlight: '#E9E4DB',
  accent: '#C03D1D',
} as const;
