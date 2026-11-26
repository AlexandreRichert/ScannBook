/**
 * Colors of the manual ISBN entry mockup (Figma « Maquettes — Pile à lire »,
 * frame 05).
 *
 * Local to the screen for now: they will move into the global theme
 * (`Colors` in theme.ts) on a dedicated branch. Light only, like the mockups.
 */
export const IsbnEntryColors = {
  background: '#FAF7F2',
  surface: '#FFFFFF',
  border: '#E7E2DA',
  text: '#1C1917',
  textSecondary: '#57534E',
  textTertiary: '#78716C',
  primary: '#1F4E46',
  onPrimary: '#FFFFFF',
  error: '#B42318',
  illustration: '#E4EEEA',
  /** Sheet grabber and clear icon. */
  muted: '#D6D3D1',
} as const;
