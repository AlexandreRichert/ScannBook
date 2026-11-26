import { Palette } from '@/constants/theme';

/** Book screen colors, mapped onto the v2 palette. */
export const BookScreenColors = {
  background: Palette.paper,
  surface: Palette.paperRaised,
  border: Palette.line,
  text: Palette.ink,
  textSecondary: Palette.inkSecondary,
  textTertiary: Palette.inkTertiary,
  textMuted: Palette.inkDisabled,
  primary: Palette.ink,
  onPrimary: Palette.inkInverse,
  coverPlaceholder: Palette.paperSunken,
  skeleton: Palette.paperSunken,
  neutralIllustration: Palette.paperSunken,
  errorIllustration: '#FBEAE7',
  error: Palette.danger,
  /** Search best result card (« Maquettes v2 », frame 06). */
  highlight: Palette.paperSunken,
  accent: Palette.accentStrong,
  /** Search result already in the library: background, with a `primary` border. */
  owned: '#E4EEEA',
  ownedBorder: '#B9CFC6',
} as const;
