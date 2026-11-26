/**
 * Colors of the scanner mockups (Figma « Maquettes — Pile à lire », frames 03
 * and 04).
 *
 * Local to the scanner screen for now: they will move into the global theme
 * (`Colors` in theme.ts) on a dedicated branch. Light only, like the mockups.
 */
export const ScanScreenColors = {
  background: '#FAF7F2',
  surface: '#FFFFFF',
  text: '#1C1917',
  textSecondary: '#57534E',
  primary: '#1F4E46',
  onPrimary: '#FFFFFF',
  illustration: '#E4EEEA',
  /** Darkens the camera feed around the viewfinder. */
  veil: 'rgba(0, 0, 0, 0.58)',
  onCamera: '#FFFFFF',
  /** 4.7:1 on the veil over a white page (WCAG AA). */
  onCameraSecondary: 'rgba(255, 255, 255, 0.9)',
  /** Torch button: an icon, 3.8:1 at worst (3:1 needed). */
  onCameraControl: 'rgba(255, 255, 255, 0.16)',
  /** Text buttons: dark so white text stays at 13:1 even over a bright scene. */
  onCameraButton: 'rgba(28, 25, 23, 0.72)',
  /** Keeps the dark button visible over a dark scene. */
  onCameraButtonBorder: 'rgba(255, 255, 255, 0.45)',
  scanLine: '#4ADE80',
  error: 'rgba(180, 35, 24, 0.92)',
} as const;
