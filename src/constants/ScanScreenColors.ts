import { Palette } from '@/constants/theme';

/** Scanner colors, mapped onto the v2 palette. The camera overlays stay translucent on purpose. */
export const ScanScreenColors = {
  background: Palette.paper,
  surface: Palette.paperRaised,
  border: Palette.line,
  text: Palette.ink,
  textSecondary: Palette.inkSecondary,
  primary: Palette.ink,
  /** Fill of the main button. */
  action: Palette.accentStrong,
  onPrimary: Palette.inkInverse,
  illustration: Palette.paperSunken,
  shelf: Palette.wood,
  /** Figma « camera/base », behind the feed while it starts. */
  camera: '#141312',
  /** Darkens the camera feed around the viewfinder. */
  veil: 'rgba(20, 19, 18, 0.6)',
  onCamera: Palette.inkInverse,
  /** 4.7:1 on the veil over a white page (WCAG AA). */
  onCameraSecondary: 'rgba(255, 255, 255, 0.9)',
  /** Torch button: an icon, 3.8:1 at worst (3:1 needed). */
  onCameraControl: 'rgba(255, 255, 255, 0.16)',
  /** Text buttons: dark so white text stays at 13:1 even over a bright scene. */
  onCameraButton: 'rgba(28, 25, 23, 0.72)',
  /** Keeps the dark button visible over a dark scene. */
  onCameraButtonBorder: 'rgba(255, 255, 255, 0.45)',
  // Cream rather than the brown accent: the corners must stand out on any scene the camera shows
  viewfinder: Palette.accentSoft,
  scanLine: Palette.accent,
  scanLineGlow: 'rgba(176, 137, 104, 0.9)',
  error: 'rgba(179, 38, 30, 0.92)',
} as const;
