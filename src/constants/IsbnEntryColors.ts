import { Palette } from '@/constants/theme';

/** Manual ISBN entry colors, mapped onto the v2 palette. */
export const IsbnEntryColors = {
  background: Palette.paper,
  surface: Palette.paperRaised,
  border: Palette.lineStrong,
  text: Palette.ink,
  textSecondary: Palette.inkSecondary,
  textTertiary: Palette.inkTertiary,
  primary: Palette.ink,
  onPrimary: Palette.inkInverse,
  accent: Palette.accentStrong,
  error: Palette.danger,
  /** Figma « tint/tomate », behind the help pictogram. Not in Palette yet. */
  tint: '#FBDDD3',
  /** Sheet grabber. */
  grabber: Palette.line,
} as const;
